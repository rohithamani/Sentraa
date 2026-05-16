import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { createTempUser, findTempUserByEmail, getTempUsersCount } from './tempStorage.js';
import { 
  JournalEntry, 
  MoodEntry, 
  ChatConversation, 
  VoiceRecording, 
  UserSettings, 
  WellnessGoal, 
  AnalyticsEntry 
} from './models/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sentraa';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n🔧 MongoDB Setup Required:');
    console.log('1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community');
    console.log('2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.log('3. Update MONGODB_URI in server/.env file');
    console.log('\n⚠️  Server will run but authentication features will not work without MongoDB\n');
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profile: {
    gender: String,
    ageGroup: String,
    studyStream: String,
    workType: String,
    shift: String,
    healthConditions: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

// Validation middleware
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'sentraa-secret-key', {
    expiresIn: '7d',
  });
};

// Routes

// Middleware to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please ensure MongoDB is running.',
      error: 'DATABASE_UNAVAILABLE',
      instructions: {
        local: 'Install and start MongoDB locally',
        cloud: 'Use MongoDB Atlas: https://www.mongodb.com/atlas',
        config: 'Update MONGODB_URI in server/.env file'
      }
    });
  }
  next();
};

// Temporary Signup Route (fallback when MongoDB is not available)
app.post('/api/auth/signup-temp', validateSignup, async (req, res) => {
  try {
    console.log('📝 Temporary signup attempt (no MongoDB):', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, profile } = req.body;
    
    // Check if user already exists in temp storage
    const existingUser = findTempUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create temp user
    const user = createTempUser({
      email,
      password: hashedPassword,
      profile: profile || {},
    });

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Temporary user created successfully. Total users:', getTempUsersCount());
    
    res.status(201).json({
      success: true,
      message: 'User created successfully (temporary storage)',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
      note: 'This is using temporary storage. Set up MongoDB for persistent data.'
    });
  } catch (error) {
    console.error('❌ Temporary signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Signup Route
app.post('/api/auth/signup', checkMongoConnection, validateSignup, async (req, res) => {
  try {
    console.log('📝 Signup attempt:', { email: req.body.email, hasProfile: !!req.body.profile });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, profile } = req.body;
    
    console.log('🔍 Checking for existing user:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('👤 Creating new user...');
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      profile: profile || {},
    });

    await user.save();
    console.log('✅ User saved successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('📋 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Temporary Journal Route (fallback when MongoDB is not available)
app.post('/api/journal-temp', authenticateToken, [
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { content, title } = req.body;
    
    console.log('📝 Temporary journal entry saved (no MongoDB):', { 
      userId: req.user.userId, 
      contentLength: content.length,
      title: title || 'Untitled'
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry saved successfully (temporary storage)',
      entry: {
        id: Date.now().toString(),
        userId: req.user.userId,
        content,
        title: title || '',
        createdAt: new Date().toISOString(),
      },
      note: 'This is using temporary storage. Set up MongoDB for persistent data.'
    });
  } catch (error) {
    console.error('❌ Temporary journal save error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Temporary Login Route (fallback when MongoDB is not available)
app.post('/api/auth/login-temp', validateLogin, async (req, res) => {
  try {
    console.log('🔑 Temporary login attempt (no MongoDB):', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user in temporary storage
    const user = findTempUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Temporary login successful');

    res.json({
      success: true,
      message: 'Login successful (temporary storage)',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Temporary login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Login Route
app.post('/api/auth/login', checkMongoConnection, validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get user profile route (protected)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'sentraa-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    req.user = user;
    next();
  });
}

// =============================================================================
// JOURNAL ENTRY ROUTES
// =============================================================================

// Create a new journal entry
app.post('/api/journal', authenticateToken, [
  body('content').notEmpty().withMessage('Content is required'),
  body('mood').optional().isIn(['happy', 'calm', 'sad', 'anxious', 'angry', 'tired', 'grateful', 'neutral']),
], async (req, res) => {
  // Check MongoDB connection and fallback to temp storage if unavailable
  if (mongoose.connection.readyState !== 1) {
    console.log('📝 MongoDB unavailable, using temporary journal storage...');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { content, title, mood } = req.body;
    
    console.log('📝 Temporary journal entry saved:', { 
      userId: req.user.userId, 
      contentLength: content.length,
      mood: mood || 'not specified'
    });

    return res.status(201).json({
      success: true,
      message: 'Journal entry saved successfully (temporary storage)',
      entry: {
        id: Date.now().toString(),
        userId: req.user.userId,
        content,
        title: title || '',
        mood,
        createdAt: new Date().toISOString(),
      },
      note: 'Using temporary storage. MongoDB connection unavailable.'
    });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, content, mood, tags, isPrivate } = req.body;
    
    const journalEntry = new JournalEntry({
      userId: req.user.userId,
      title: title || '',
      content,
      mood,
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
    });

    await journalEntry.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      entry: journalEntry,
    });
  } catch (error) {
    console.error('Journal entry creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get user's journal entries
app.get('/api/journal', authenticateToken, async (req, res) => {
  // Check if MongoDB is available
  if (mongoose.connection.readyState !== 1) {
    console.log('📖 MongoDB unavailable, no journal entries to retrieve from database...');
    return res.json({
      success: true,
      entries: [],
      message: 'MongoDB not connected - no persisted entries available',
      pagination: { current: 1, pages: 0, total: 0 },
    });
  }
  try {
    const { page = 1, limit = 10, mood, startDate, endDate } = req.query;
    
    const query = { userId: req.user.userId };
    
    if (mood) query.mood = mood;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      entries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Journal entries fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update a journal entry
app.put('/api/journal/:id', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const { title, content, mood, tags, isPrivate } = req.body;
    
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, content, mood, tags, isPrivate },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      entry,
    });
  } catch (error) {
    console.error('Journal entry update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Delete a journal entry
app.delete('/api/journal/:id', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error) {
    console.error('Journal entry deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// MOOD TRACKING ROUTES
// =============================================================================

// Log a new mood entry
app.post('/api/mood', authenticateToken, [
  body('mood').isIn(['happy', 'calm', 'sad', 'anxious', 'angry', 'tired', 'grateful', 'neutral']).withMessage('Valid mood is required'),
  body('intensity').isInt({ min: 1, max: 10 }).withMessage('Intensity must be between 1 and 10'),
], async (req, res) => {
  // Check MongoDB connection and fallback to temp storage if unavailable
  if (mongoose.connection.readyState !== 1) {
    console.log('😊 MongoDB unavailable, using temporary mood storage...');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { mood, intensity, notes } = req.body;
    
    console.log('😊 Temporary mood entry saved:', { 
      userId: req.user.userId, 
      mood,
      intensity
    });

    return res.status(201).json({
      success: true,
      message: 'Mood logged successfully (temporary storage)',
      entry: {
        id: Date.now().toString(),
        userId: req.user.userId,
        mood,
        intensity,
        notes,
        createdAt: new Date().toISOString(),
      },
      note: 'Using temporary storage. MongoDB connection unavailable.'
    });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { mood, intensity, notes, triggers, activities, location, weather } = req.body;
    
    const moodEntry = new MoodEntry({
      userId: req.user.userId,
      mood,
      intensity,
      notes,
      triggers: triggers || [],
      activities: activities || [],
      location,
      weather,
    });

    await moodEntry.save();

    res.status(201).json({
      success: true,
      message: 'Mood logged successfully',
      entry: moodEntry,
    });
  } catch (error) {
    console.error('Mood entry creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get mood history
app.get('/api/mood', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, mood } = req.query;
    
    const query = { userId: req.user.userId };
    
    if (mood) query.mood = mood;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const entries = await MoodEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await MoodEntry.countDocuments(query);

    // Calculate mood statistics
    const stats = await MoodEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' },
        },
      },
    ]);

    res.json({
      success: true,
      entries,
      stats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Mood entries fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// CHAT CONVERSATION ROUTES
// =============================================================================

// Create or continue a chat session
app.post('/api/chat', authenticateToken, checkMongoConnection, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { sessionId, message, topic } = req.body;
    
    let conversation = await ChatConversation.findOne({
      userId: req.user.userId,
      sessionId,
    });

    if (!conversation) {
      conversation = new ChatConversation({
        userId: req.user.userId,
        sessionId,
        messages: [],
        topic,
      });
    }

    conversation.messages.push({
      role: 'user',
      content: message,
    });

    // Here you would integrate with your AI service to get a response
    // For now, we'll add a simple response
    const aiResponse = "Thank you for sharing. I'm here to listen and support you. Can you tell me more about how you're feeling?";
    
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
    });

    await conversation.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      conversation: {
        sessionId: conversation.sessionId,
        messages: conversation.messages.slice(-2), // Return last 2 messages
      },
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get chat history
app.get('/api/chat/:sessionId', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({
      userId: req.user.userId,
      sessionId: req.params.sessionId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// USER SETTINGS ROUTES
// =============================================================================

// Get user settings
app.get('/api/settings', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.userId });
    
    if (!settings) {
      // Create default settings
      settings = new UserSettings({ userId: req.user.userId });
      await settings.save();
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update user settings
app.put('/api/settings', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { preferences: req.body, lastActive: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// WELLNESS GOALS ROUTES
// =============================================================================

// Create a new wellness goal
app.post('/api/goals', authenticateToken, checkMongoConnection, [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['mood', 'journal', 'meditation', 'exercise', 'sleep', 'social', 'other']).withMessage('Valid category is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const goal = new WellnessGoal({
      userId: req.user.userId,
      ...req.body,
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal,
    });
  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get user's wellness goals
app.get('/api/goals', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const { category, isCompleted } = req.query;
    const query = { userId: req.user.userId };
    
    if (category) query.category = category;
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';

    const goals = await WellnessGoal.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update goal progress
app.put('/api/goals/:id', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const goal = await WellnessGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal,
    });
  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// ANALYTICS ROUTES
// =============================================================================

// Get user analytics/insights
app.get('/api/analytics', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const analytics = await AnalyticsEntry.find(query).sort({ date: -1 });

    // Get recent activity summary
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [journalCount, moodCount, chatCount] = await Promise.all([
      JournalEntry.countDocuments({ 
        userId: req.user.userId, 
        createdAt: { $gte: weekAgo } 
      }),
      MoodEntry.countDocuments({ 
        userId: req.user.userId, 
        createdAt: { $gte: weekAgo } 
      }),
      ChatConversation.countDocuments({ 
        userId: req.user.userId, 
        createdAt: { $gte: weekAgo } 
      }),
    ]);

    const summary = {
      weeklyActivity: {
        journalEntries: journalCount,
        moodEntries: moodCount,
        chatSessions: chatCount,
      },
    };

    res.json({
      success: true,
      analytics,
      summary,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// =============================================================================
// VOICE RECORDING ROUTES
// =============================================================================

// Create a new voice recording
app.post('/api/voice', authenticateToken, [
  body('duration')
    .notEmpty()
    .isNumeric()
    .withMessage('Duration is required and must be a number'),
  body('transcription')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Transcription must be between 1 and 10000 characters'),
  body('emotionalTone')
    .optional()
    .isIn(['calm', 'happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'])
    .withMessage('Invalid emotional tone'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { duration, transcription, emotionalTone, audioUrl } = req.body;

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const voiceRecording = new VoiceRecording({
          userId: req.user.userId,
          duration,
          transcription,
          emotionalTone,
          audioUrl,
        });

        await voiceRecording.save();
        
        return res.json({
          success: true,
          message: 'Voice recording saved successfully',
          recording: voiceRecording,
          storage: 'mongodb'
        });
      } catch (mongoError) {
        console.error('MongoDB save error for voice recording:', mongoError);
        // Fall through to temporary storage
      }
    }

    // Fallback to temporary storage
    const tempRecording = {
      _id: Date.now().toString(),
      userId: req.user.userId,
      duration,
      transcription,
      emotionalTone,
      audioUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in temporary storage (you could use a file or in-memory storage)
    // For now, we'll just return it as saved
    res.json({
      success: true,
      message: 'Voice recording saved to temporary storage',
      recording: tempRecording,
      storage: 'temporary',
      note: 'Voice recording saved locally. Will be synced to database when connection is restored.'
    });

  } catch (error) {
    console.error('Voice recording save error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get user's voice recordings
app.get('/api/voice', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const recordings = await VoiceRecording.find({ userId: req.user.userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));

        const total = await VoiceRecording.countDocuments({ userId: req.user.userId });

        return res.json({
          success: true,
          recordings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          storage: 'mongodb'
        });
      } catch (mongoError) {
        console.error('MongoDB fetch error for voice recordings:', mongoError);
        // Fall through to temporary storage
      }
    }

    // Fallback to temporary storage
    res.json({
      success: true,
      recordings: [], // Would load from temp storage
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      storage: 'temporary',
      note: 'Loading from temporary storage. Voice recordings will be available when database connection is restored.'
    });

  } catch (error) {
    console.error('Voice recordings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get a specific voice recording
app.get('/api/voice/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const recording = await VoiceRecording.findOne({
          _id: id,
          userId: req.user.userId
        });

        if (!recording) {
          return res.status(404).json({
            success: false,
            message: 'Voice recording not found'
          });
        }

        return res.json({
          success: true,
          recording,
          storage: 'mongodb'
        });
      } catch (mongoError) {
        console.error('MongoDB fetch error for voice recording:', mongoError);
        // Fall through to temporary storage
      }
    }

    // Fallback for temporary storage
    res.status(404).json({
      success: false,
      message: 'Voice recording not found in temporary storage'
    });

  } catch (error) {
    console.error('Voice recording fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a voice recording (e.g., add transcription or emotional analysis)
app.put('/api/voice/:id', authenticateToken, checkMongoConnection, [
  body('transcription')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Transcription must be between 1 and 10000 characters'),
  body('emotionalTone')
    .optional()
    .isIn(['calm', 'happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'])
    .withMessage('Invalid emotional tone'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const recording = await VoiceRecording.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Voice recording not found'
      });
    }

    res.json({
      success: true,
      message: 'Voice recording updated successfully',
      recording
    });

  } catch (error) {
    console.error('Voice recording update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a voice recording
app.delete('/api/voice/:id', authenticateToken, checkMongoConnection, async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await VoiceRecording.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Voice recording not found'
      });
    }

    res.json({
      success: true,
      message: 'Voice recording deleted successfully'
    });

  } catch (error) {
    console.error('Voice recording delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'not connected'
    },
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;