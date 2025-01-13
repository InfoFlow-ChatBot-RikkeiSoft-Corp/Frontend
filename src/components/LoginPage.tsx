import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css'; // Use CSS modules

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

declare global {
  interface Window {
    google?: any; // to avoid TypeScript errors when referencing window.google
  }
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Your backend URL
  const API_BASE_URL = 'http://127.0.0.1:5000/api/auth';

  // ------------------------------
  // 1) Normal username/password login
  // ------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful. Token:', data.token);
        localStorage.setItem('token', data.token); // Save JWT token
        setIsAuthenticated(true);
        navigate('/'); // Redirect to main page
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while trying to log in. Please try again.');
    }
  };

  // ------------------------------
  // 2) Google OAuth via Popup
  // ------------------------------
  // a) Open popup pointing to /google-redirect
  const handleGoogleLoginClick = () => {
    const width = 600, height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      'http://127.0.0.1:5000/api/auth/google-redirect',
      'GoogleLoginPopup',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  // b) Listen for postMessage from the popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Optional: verify event.origin if you want domain security
      if (event.data?.type === 'google-auth-success') {
        // event.data.jwt contains the token your backend sent
        console.log('Received tokens from popup:', event.data.jwt);

        // Store the JWT in localStorage
        localStorage.setItem('token', event.data.jwt);

        // Mark user as authenticated & redirect
        setIsAuthenticated(true);
        navigate('/');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, setIsAuthenticated]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <img src="/logo.png" alt="Company Logo" className={styles.logo} />
        <h1>Welcome to RikkeiSoft!</h1>
        <p>To continue, kindly log in with your account.</p>

        {/* Normal username/password login form */}
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Log In
          </button>
        </form>

        {/* Google login in a popup window */}
        <button onClick={handleGoogleLoginClick} className={styles.googleButton}>
          <img
            src="/google-login.png"
            alt="Login with Google"
            className={styles.googleImage}
          />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
