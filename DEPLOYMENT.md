# Deployment Guide for Warranty Letter Editor

This guide will help you deploy the Warranty Letter Editor application to Render.com, which offers a convenient free tier for web services.

## Prerequisites

Before deploying, make sure you have:

1. A [Render.com](https://render.com/) account
2. Your Firebase service account credentials
3. Your Google API client ID and secret

## Deployment Steps

### 1. Prepare your environment variables

You'll need to set up the following environment variables in your deployment platform:

- `NODE_ENV`: Set to "production"
- `PORT`: The port your server will run on (usually provided by the platform)
- `GOOGLE_CLIENT_ID`: Your Google API client ID
- `GOOGLE_CLIENT_SECRET`: Your Google API client secret
- `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON (stringified)
- `SESSION_SECRET`: A random string for session encryption

### 2. Deploy to Render.com

1. Log in to your Render account
2. Click "New" and select "Web Service"
3. Connect your GitHub or GitLab repository
4. Configure the service:
   - Name: "warranty-letter-editor" (or your preferred name)
   - Environment: Node
   - Build Command: `npm run setup && npm run build`
   - Start Command: `npm start`
5. Add all the environment variables listed above
6. Click "Create Web Service"

### 3. Update Client Configuration (if needed)

If your deployed backend URL is different from what's configured in the client, you may need to update the client code to point to the new URL.

## Alternative Deployment Options

### Deploy to Heroku

1. Install the Heroku CLI
2. Log in to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create warranty-letter-editor`
4. Push to Heroku: `git push heroku main`
5. Set environment variables: `heroku config:set GOOGLE_CLIENT_ID=your_value` (repeat for all variables)

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Follow the prompts and set your environment variables in the Vercel dashboard

## Post-Deployment

After deployment:

1. Test the application thoroughly
2. Ensure Google Drive integration works correctly
3. Verify that Firebase authentication is functioning properly

## Troubleshooting

If you encounter issues:

1. Check the deployment logs for errors
2. Verify that all environment variables are set correctly
3. Ensure the client is connecting to the correct server URL
