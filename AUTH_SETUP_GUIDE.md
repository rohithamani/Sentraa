# SENTRAA - Authentication Setup Guide

This guide explains how to set up the authentication system with MongoDB integration for the SENTRAA mental wellness application.

## Features Implemented

### 🔐 Authentication System
- **User Registration**: Multi-step signup with personal information
- **User Login**: Secure login with JWT tokens
- **Form Validation**: Client-side and server-side validation
- **Password Security**: Bcrypt hashing with salt rounds
- **Protected Routes**: Authentication required for app features

### 📝 Form Validation
- **Email Validation**: Valid email format checking
- **Password Requirements**: 
  - Minimum 6 characters
  - At least one uppercase letter
  - At least one lowercase letter  
  - At least one number
- **Password Confirmation**: Ensures passwords match
- **Real-time Error Display**: Visual feedback for validation errors

### 🗄️ MongoDB Integration
- **User Schema**: Stores user credentials and profile information
- **Secure Storage**: Passwords are hashed using bcryptjs
- **Profile Data**: Gender, age group, study stream, work type, shift, health conditions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **npm** or **yarn** package manager

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database will be created automatically at `mongodb://localhost:27017/sentraa`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file in server directory

### 3. Environment Configuration
Create/update `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sentraa
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sentraa?retryWrites=true&w=majority
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend development server  
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (protected)

### Example API Usage

#### Signup
```javascript
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "profile": {
    "gender": "prefer-not",
    "ageGroup": "25-34",
    "studyStream": "Computer Science",
    "workType": "full-time",
    "shift": "day",
    "healthConditions": ["Anxiety"]
  }
}
```

#### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

## Frontend Features

### Protected Routes
All main app routes require authentication:
- `/dashboard` - Main dashboard
- `/journal` - Journal feature
- `/chat` - Chat feature  
- `/voice` - Voice feature
- `/mood` - Mood tracking

### Authentication Context
The `AuthContext` provides:
- `user` - Current user data
- `token` - JWT authentication token
- `login(email, password)` - Login function
- `signup(userData)` - Signup function
- `logout()` - Logout function
- `isLoading` - Loading state

### Form Validation
Real-time validation with visual feedback:
- Input field highlighting for errors
- Error message display
- Password strength requirements
- Email format validation

## Security Features

### Password Security
- Minimum complexity requirements
- Bcrypt hashing with 12 salt rounds
- No plain text storage

### JWT Tokens
- 7-day expiration
- Secure secret key
- Authorization header authentication

### Input Validation
- Server-side validation using express-validator
- Client-side validation for better UX
- SQL injection prevention through Mongoose

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **CORS Errors**
   - Backend includes CORS middleware
   - Frontend runs on port 8080, backend on 5000

3. **Authentication Errors**
   - Check if JWT_SECRET is set
   - Verify token is being sent in Authorization header
   - Check token expiration

4. **Validation Errors**
   - Review password requirements
   - Ensure email format is correct
   - Check that passwords match

### Development Tips

1. **Clear Browser Storage**
   ```javascript
   localStorage.removeItem('sentraa_token');
   ```

2. **Check API Response**
   ```bash
   curl -X GET http://localhost:5000/api/health
   ```

3. **Monitor Server Logs**
   - Server logs authentication attempts
   - Check console for validation errors
   - MongoDB connection status displayed on startup

## Next Steps

The authentication system is now fully functional. You can:

1. **Add Password Reset**: Implement forgot password functionality
2. **Social Login**: Add Google/Facebook OAuth
3. **Email Verification**: Add email confirmation on signup
4. **Profile Updates**: Allow users to update their profile
5. **Session Management**: Add session timeout and refresh tokens

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  profile: {
    gender: String,
    ageGroup: String,
    studyStream: String,
    workType: String,
    shift: String,
    healthConditions: [String]
  },
  createdAt: Date
}
```

The system is now ready for production use with proper security measures and user experience considerations.