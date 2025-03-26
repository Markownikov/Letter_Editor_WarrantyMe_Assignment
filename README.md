# Letter Editor App

A full-stack web application that allows users to create, edit, and save text-based letters to Google Drive.

## Features

- Google OAuth authentication
- Text editor with formatting options
- Save and retrieve letters from Google Drive
- Dashboard to manage all letters

## Technology Stack

- **Frontend**: React, React Router, ReactQuill
- **Backend**: Node.js, Express
- **Authentication**: Firebase Auth (Google OAuth)
- **Storage**: Google Drive API

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase account with Google authentication enabled
- Google Cloud Platform account with Google Drive API enabled

### Configuration

1. Create a Firebase project and enable Google authentication
2. Create a Google Cloud Platform project and enable the Google Drive API
3. Configure the `.env` files:

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-session-secret
FIREBASE_SERVICE_ACCOUNT={"your-firebase-service-account-json"}
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Frontend (client/.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
```

### Installation

1. Install backend dependencies:
   ```
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd client && npm install
   ```

### Running the Application

Run the backend and frontend concurrently:
```
npm run dev
```

Or run them separately:
```
# Backend only
npm run server

# Frontend only
npm run client
```

## Usage

1. Open your browser and go to http://localhost:3000
2. Sign in with your Google account
3. Create new letters or view and edit existing ones
4. All letters are automatically saved to your Google Drive
