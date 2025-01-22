import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/SignUp.module.css';
import GoogleButton from 'react-google-button';
import { NewConversationService } from '../service/NewConversationService';
import { AuthService } from '../service/AuthService';
import { NotificationService } from '../service/NotificationService';
import { APP_CONSTANTS } from '../constants/appConstants';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();

  // Validate the form inputs
  const validateInputs = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Enter a valid email');
      return false;
    }

    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setErrorMsg(
        'Password must be at least 8 characters long and include numbers and letters'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle the form submission
  const handleSubmission = async () => {
    setErrorMsg('');
    if (!validateInputs()) return;

    setSubmitButtonDisabled(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        NotificationService.handleSuccess('Signup successful! Redirecting to login...');
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

  // Handle Google Signup via Popup
  const handleGoogleSignupClick = () => {
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

  // Listen for the Google OAuth callback
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

          NotificationService.handleSuccess('Google signup successful!');
          navigate('/main'); // Redirect to the main page
        } catch (error) {
          NotificationService.handleError('Failed to fetch user details after Google signup.');
          console.error('Google OAuth Error:', error);
        }
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
