import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './LoginPage.css';

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status from backend
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        console.log('User already authenticated:', data.user);
      }
    } catch (error) {
      console.log('No existing session found');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful Google login
  const handleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Decode the JWT token to get user information
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Login successful!', decoded);
      
      // Send user data to backend to save in MongoDB Atlas
      const response = await fetch('http://localhost:5000/auth/google/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        console.log('User saved to MongoDB Atlas:', result.user);
      } else {
        throw new Error(result.message || 'Failed to save user data');
      }
      
    } catch (error) {
      console.error('Error during login:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login errors
  const handleError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
  };

  // Handle logout - redirect to backend logout route
  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // If user is logged in, show profile
  if (user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <img 
            src={user.picture || user.avatar} 
            alt="Profile" 
            className="profile-image" 
          />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          
          {/* Display additional user info */}
          <div className="user-details">
            <p><strong>User ID:</strong> {user.id}</p>
            {user.createdAt && (
              <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            )}
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to PandaInUniv</h2>
          <p>Sign in with your Google account to continue</p>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="login-form">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            size="large"
            theme="outline"
            text="signin_with"
          />
        </div>
        
        <div className="login-footer">
          <p>By signing in, you agree to our Terms of Service</p>
          <p className="demo-note">
            Demo: Data will be saved to MongoDB Atlas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
