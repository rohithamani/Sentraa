import mongoose from 'mongoose';

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ['happy', 'calm', 'sad', 'anxious', 'angry', 'tired', 'grateful', 'neutral'],
  },
  tags: [{
    type: String,
  }],
  isPrivate: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mood Entry Schema
const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'calm', 'sad', 'anxious', 'angry', 'tired', 'grateful', 'neutral'],
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  triggers: [{
    type: String,
  }],
  activities: [{
    type: String,
  }],
  location: {
    type: String,
  },
  weather: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Chat Conversation Schema
const chatConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  }],
  topic: {
    type: String,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Voice Recording Schema
const voiceRecordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Voice Note',
  },
  filename: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in seconds
  },
  fileSize: {
    type: Number, // in bytes
  },
  transcription: {
    type: String,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
  },
  emotions: [{
    emotion: String,
    confidence: Number,
  }],
  tags: [{
    type: String,
  }],
  isProcessed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User Settings Schema
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    mood: {
      currentMood: {
        type: String,
        enum: ['calm', 'energetic', 'focused', 'peaceful'],
        default: 'calm',
      },
      moodIntensity: {
        type: String,
        enum: ['subtle', 'medium', 'vibrant'],
        default: 'medium',
      },
      enableParticles: {
        type: Boolean,
        default: true,
      },
      enableSound: {
        type: Boolean,
        default: false,
      },
      autoMoodShift: {
        type: Boolean,
        default: false,
      },
    },
    notifications: {
      dailyReminders: {
        type: Boolean,
        default: true,
      },
      moodCheckins: {
        type: Boolean,
        default: true,
      },
      journalPrompts: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '09:00',
      },
    },
    privacy: {
      shareDataForResearch: {
        type: Boolean,
        default: false,
      },
      allowAnalytics: {
        type: Boolean,
        default: true,
      },
      dataRetentionDays: {
        type: Number,
        default: 365,
      },
    },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Wellness Goals Schema
const wellnessGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['mood', 'journal', 'meditation', 'exercise', 'sleep', 'social', 'other'],
    required: true,
  },
  targetValue: {
    type: Number,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String, // e.g., 'entries', 'minutes', 'days'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Analytics/Insights Schema
const analyticsEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  moodAverage: {
    type: Number,
  },
  journalEntries: {
    type: Number,
    default: 0,
  },
  chatSessions: {
    type: Number,
    default: 0,
  },
  voiceRecordings: {
    type: Number,
    default: 0,
  },
  screenTime: {
    type: Number, // in minutes
    default: 0,
  },
  sentimentScore: {
    type: Number, // -1 to 1
  },
  insights: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update indexes for better performance
journalEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ userId: 1, createdAt: -1 });
chatConversationSchema.index({ userId: 1, sessionId: 1 });
voiceRecordingSchema.index({ userId: 1, createdAt: -1 });
userSettingsSchema.index({ userId: 1 });
wellnessGoalSchema.index({ userId: 1, category: 1 });
analyticsEntrySchema.index({ userId: 1, date: -1 });

// Update timestamps middleware
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

chatConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export models
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
export const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);
export const VoiceRecording = mongoose.model('VoiceRecording', voiceRecordingSchema);
export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
export const WellnessGoal = mongoose.model('WellnessGoal', wellnessGoalSchema);
export const AnalyticsEntry = mongoose.model('AnalyticsEntry', analyticsEntrySchema);