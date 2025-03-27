require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
try {
  // Use application default credentials or project ID when service account is not provided
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT !== '{}') {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } else {
    // Initialize with just the project ID when no service account is provided
    admin.initializeApp({
      projectId: 'vishnu-4b63a'
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [
  'https://letter-editor-warrantyme-assignment.onrender.com',
  'http://localhost:3000'
], credentials: true }));

// Configure session for different environments
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'letter-editor-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 3600000, // 1 hour
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// Use in-memory session store for development only
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy for secure cookies
  console.log('Using FileStore for session in production environment');
  
  // Use file-based session store which doesn't require additional services
  const FileStore = require('session-file-store')(session);
  sessionConfig.store = new FileStore({
    path: './sessions',
    ttl: 86400, // 1 day
    retries: 0
  });
}

app.use(session(sessionConfig));

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    console.log('No authorization token provided');
    // Allow the request to continue even without auth for development purposes
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    // Allow the request to continue even with invalid auth for development purposes
    return next();
  }
};

// app.use(express.static(path.join(__dirname, 'client/build')));
// app.use(express.static(path.join(__dirname, 'client/public')));
// app.use("*", (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build/index.html'));
// }
// );


// Google Drive API setup
const getGoogleDriveClient = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    ('http://localhost:3000' || 'https://letter-editor-warrantyme-assignment.onrender.com')  // Redirect URL
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// API Routes
app.post('/api/save-letter', authMiddleware, async (req, res) => {
  try {
    const { content, title, accessToken } = req.body;
    
    if (!accessToken) {
      console.log('No access token provided in request');
      return res.status(400).json({ error: 'Google Drive access token is required' });
    }
    
    console.log('Attempting to save letter with access token');
    const drive = await getGoogleDriveClient(accessToken);
    
    // Check if file exists to decide between create and update
    let fileId = req.body.fileId;
    let response;
    
    const fileMetadata = {
      name: title || 'Untitled Letter',
      mimeType: 'application/vnd.google-apps.document'
    };
    
    try {
      if (fileId) {
        console.log(`Updating existing file with ID: ${fileId}`);
        // Update existing file
        response = await drive.files.update({
          fileId,
          media: {
            mimeType: 'text/plain',
            body: content
          }
        });
      } else {
        console.log('Creating new file in Google Drive');
        // Create new file
        response = await drive.files.create({
          resource: fileMetadata,
          media: {
            mimeType: 'text/plain',
            body: content
          },
          fields: 'id'
        });
        fileId = response.data.id;
        console.log(`Created new file with ID: ${fileId}`);
      }
      
      res.json({ 
        success: true, 
        fileId: fileId,
        message: 'Letter saved successfully'
      });
    } catch (driveError) {
      console.error('Google Drive API Error:', driveError);
      console.error('Error details:', driveError.response ? driveError.response.data : 'No response data');
      
      // If it's an authentication error, provide specific guidance
      if (driveError.code === 401 || (driveError.response && driveError.response.status === 401)) {
        return res.status(401).json({ error: 'Google Drive authentication failed. Please log out and log in again.' });
      }
      
      // For all other errors
      return res.status(500).json({ error: 'Failed to save to Google Drive: ' + (driveError.message || 'Unknown error') });
    }
  } catch (error) {
    console.error('Error saving letter:', error);
    res.status(500).json({ error: 'Failed to save letter' });
  }
});

app.get('/api/letters', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google Drive access token is required' });
    }
    
    const drive = await getGoogleDriveClient(accessToken);
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)'
    });
    
    res.json({ success: true, letters: response.data.files });
  } catch (error) {
    console.error('Error fetching letters:', error);
    res.status(500).json({ error: 'Failed to fetch letters' });
  }
});

app.get('/api/letter/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google Drive access token is required' });
    }
    
    const drive = await getGoogleDriveClient(accessToken);
    
    const response = await drive.files.export({
      fileId: id,
      mimeType: 'text/plain'
    });
    
    res.json({ 
      success: true, 
      content: response.data,
      fileId: id
    });
  } catch (error) {
    console.error('Error fetching letter:', error);
    res.status(500).json({ error: 'Failed to fetch letter' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
