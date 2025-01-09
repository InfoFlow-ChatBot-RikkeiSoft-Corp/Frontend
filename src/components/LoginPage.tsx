import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css'; // Use CSS modules

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic authentication logic
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      navigate('/'); // Redirect to the main page
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleMicrosoftLogin = () => {
    // Redirect to Microsoft's login page
    window.location.href = 'https://login.microsoftonline.com/';
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <img src="/logo.png" alt="Company Logo" className={styles.logo} />
        <h1>Welcome to RikkeiSoft!</h1>
        <p>To continue, kindly log in with your account.</p>
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
        <button onClick={handleMicrosoftLogin} className={styles.microsoftButton}>
          <img src="/microsoft-login.png" alt="Login with Microsoft" className={styles.microsoftImage} />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;