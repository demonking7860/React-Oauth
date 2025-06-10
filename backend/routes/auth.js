const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// @route   GET /auth/google
// @desc    Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user._id,
        email: req.user.email 
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('http://localhost:3000/dashboard');
  }
);

// @route   GET /auth/logout
// @desc    Logout user (FIXED VERSION)
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      console.error('Logout error:', err);
      return next(err); 
    }
    res.clearCookie('token');
    console.log('User logged out successfully');
    res.redirect('http://localhost:3000');
  });
});

// @route   GET /auth/user
// @desc    Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ success: false });
  }
});

module.exports = router;
