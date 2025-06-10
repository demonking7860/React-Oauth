const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport')(passport);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);


// Route to save user data to MongoDB Atlas
app.post('/auth/google/save', async (req, res) => {
  try {
    const { googleId, name, email, picture } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ googleId });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      console.log('👤 Existing user logged in:', email);
    } else {
      // Create new user
      user = new User({ googleId, name, email, picture });
      await user.save();
      console.log('🆕 New user created:', email);
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save user'
    });
  }
});
