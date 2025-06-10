
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './LoginPage.css';

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle successful Google login
  const handleSuccess = (credentialResponse) => {
    try {
      setIsLoading(true);

      // Decode the JWT token to get user information
      const decoded = jwtDecode(credentialResponse.credential);

      console.log('Login successful!', decoded);

      // Set user data
      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        googleId: decoded.sub
      });

    } catch (error) {
      console.error('Error decoding token:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login errors
  const handleError = () => {
    console.error('Google login failed');
    alert('Login failed. Please try again.');
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  // If user is logged in, show profile
  if (user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <img src={user.picture} alt="Profile" className="profile-image" />
          <h2>Welcome, {user.name}!</h2>
          <p>{user.email}</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login page
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to Our App</h2>
          <p>Sign in with your Google account to continue</p>
        </div>

        <div className="login-form">
          {isLoading ? (
            <div className="loading">Signing you in...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          )}
        </div>

        <div className="login-footer">
          <p>By signing in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;