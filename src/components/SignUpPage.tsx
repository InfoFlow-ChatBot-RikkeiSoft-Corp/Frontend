import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/SignUp.module.css';
import GoogleButton from 'react-google-button';
import { NewConversationService } from '../service/NewConversationService';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();

  const handleSubmission = async () => {
    setErrorMsg(''); // Clear error message before processing
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Enter a valid email');
      return;
    }

    if (password.length < 8) {
      setErrorMsg(
        'Password must be at least 8 characters long and include numbers and letters'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSubmitButtonDisabled(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.status === 201) {
        navigate('/login'); // Redirect to login on successful signup
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to sign up. Please try again.');
      }
    } catch (error) {
      setErrorMsg('An error occurred while signing up. Please try again.');
      console.error('Signup Error:', error);
    } finally {
      setSubmitButtonDisabled(false);
    }
  };

  // Google OAuth via Popup
  const handleGoogleSignupClick = () => {
    const width = 600,
      height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      'http://127.0.0.1:5000/api/auth/google-redirect',
      'GoogleSignupPopup',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-auth-success') {
        localStorage.setItem('token', event.data.jwt);
        navigate('/main'); // Redirect to home after Google signup
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Signup</h1>
        <div className={styles.Inputcontainer}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className={styles.Inputcontainer}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className={styles.Inputcontainer}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
          />
        </div>
        <div className={styles.footer}>
          {errorMsg && <b className={styles.error}>{errorMsg}</b>}
          <button
            onClick={handleSubmission}
            disabled={submitButtonDisabled}
            className={styles.signupButton}
          >
            Signup
          </button>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginLink} style={{ color: '#046cf1' }}>
              Login
            </Link>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '10px',
            }}
          >
            <GoogleButton
              style={{ transform: 'scale(0.9)' }}
              onClick={handleGoogleSignupClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
