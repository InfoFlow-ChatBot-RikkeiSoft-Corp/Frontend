import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';
import GoogleButton from 'react-google-button';
import React, { useState, useEffect } from 'react';
import { API_AUTH_BASE_URL } from '../constants/apiEndpoints';

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

  // ------------------------------
  // 1) Normal username/password login
  // ------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/login`, {
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
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Login</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.Inputcontainer}>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange= {(e) => setUsername(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className={styles.Inputcontainer}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange= {(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
          </div>
          <div className={styles.footer}>
            <button
              type="submit"
            >
              Login
            </button>
            <p>
              Don't have an account?{' '}
              <span>
                <Link to="/signup">Sign up</Link>
              </span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0%' }}>
                <GoogleButton
                    style={{ transform: 'scale(0.8)' }}
                    onClick = {handleGoogleLoginClick} 
                />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
