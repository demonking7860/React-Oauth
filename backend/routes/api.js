const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/profile
// @desc    Get user profile (protected)
router.get('/profile', auth, (req, res) => {
  res.json(req.user);
});

// @route   GET /api/dashboard
// @desc    Get dashboard data (protected)
router.get('/dashboard', auth, (req, res) => {
  res.json({
    message: `Welcome to your dashboard, ${req.user.name}!`,
    userData: req.user
  });
});

module.exports = router;
