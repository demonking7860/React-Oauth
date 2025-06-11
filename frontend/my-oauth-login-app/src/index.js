import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Debug: Check if environment variable is loaded
console.log('Environment check:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('All REACT_APP variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
