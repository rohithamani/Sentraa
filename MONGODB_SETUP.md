# MongoDB Setup Guide

The signup is failing because MongoDB is not connected. Here are your options:

## Quick Solution: MongoDB Atlas (Cloud Database)

1. **Create Free MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account
   - Create a new cluster (free tier available)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/sentraa`)

3. **Update Environment Variables**
   - Open `server/.env` file
   - Replace the MONGODB_URI with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sentraa?retryWrites=true&w=majority
   ```

4. **Restart the Server**
   - The server will automatically restart and connect to MongoDB Atlas

## Alternative: Local MongoDB Installation

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Download and install for Windows
   - Start MongoDB service

2. **Verify Installation**
   - MongoDB should run on `mongodb://localhost:27017`
   - The server will automatically connect

## Current Status

- ✅ Frontend: Running on http://localhost:8081
- ✅ Backend: Running on http://localhost:5000  
- ❌ Database: Not connected (causing signup/login errors)

## Test Connection

Once MongoDB is connected, test the API:
```
curl http://localhost:5000/api/health
```

You should see `"mongodb": {"status": "connected"}` in the response.

## Temporary Solution (For Testing Only)

If you want to test the UI without setting up MongoDB, you can modify the signup to work without a database temporarily.