import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';
import GoogleButton from 'react-google-button';
import React, { useState, useEffect } from 'react';
import { API_AUTH_BASE_URL } from '../constants/apiEndpoints';
import { AuthService } from '../service/AuthService'; // AuthService import
import {NotificationService} from '../service/NotificationService'; // NotificationService import

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1) Normal username/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log in via AuthService
      const { token, user_id ,is_admin} = await AuthService.login(username, password);

      // Save token & user_id in localStorage
      AuthService.saveToken(token);
      AuthService.saveId(user_id);
      AuthService.saveIsAdmin(is_admin);

      setIsAuthenticated(true);
      NotificationService.handleSuccess('Login successful!');
      navigate('/main');
    } catch (error: any) {
      NotificationService.handleError(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2) Google OAuth via popup
  const handleGoogleLoginClick = () => {
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      'http://127.0.0.1:5000/api/auth/google-redirect',
      'GoogleLoginPopup',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  // Listen for the postMessage from google callback
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'google-auth-success') {
        const tokenFromGoogle = event.data.jwt;
        console.log('Received token from popup:', tokenFromGoogle);
  
        try {
          // Save the token in local storage
          AuthService.saveToken(tokenFromGoogle);
  
          // Fetch user details using the token
          const { user_id, is_admin } = await AuthService.fetchUserDetails();
  
          // Save user details
          AuthService.saveId(user_id);
          AuthService.saveIsAdmin(is_admin);
          setIsAuthenticated(true);

          NotificationService.handleSuccess('Google login successful!');
          navigate('/main');
        } catch (error) {
          NotificationService.handleError('Failed to fetch user details after Google login.');
        }
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
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.Inputcontainer}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.footer}>
            <button type="submit" disabled={isLoading}>
              Login
            </button>
            <p>
              Don't have an account?{' '}
              <span>
                <Link to="/signup">Sign up</Link>
              </span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <GoogleButton
                style={{ transform: 'scale(0.8)' }}
                onClick={handleGoogleLoginClick}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
