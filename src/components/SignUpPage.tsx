import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/SignUp.module.css';
import GoogleButton from 'react-google-button';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();

  const handleSubmission = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Enter a valid email');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should have minimum six characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSubmitButtonDisabled(true);

    // Simulate an API call to check if the user is already registered
    const isRegistered = false; // Replace with actual API call
    if (isRegistered) {
      setErrorMsg('User already registered. Please login.');
      setSubmitButtonDisabled(false);
      return;
    }

    // Simulate an API call to register the user
    const isSuccess = true; // Replace with actual API call
    if (isSuccess) {
      navigate('/login');
    } else {
      setErrorMsg('Failed to sign up. Please try again.');
      setSubmitButtonDisabled(false);
    }
  };

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
          <b className={styles.error}>{errorMsg}</b>
          <button
            onClick={handleSubmission}
            disabled={submitButtonDisabled}
          >
            Signup
          </button>
          <p>
            Already have an account?{" "}
            <span>
              <Link to="/login">Login</Link>
            </span>
          </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0%' }}>
                <GoogleButton
                    style={{ transform: 'scale(0.8)' }}
                    onClick={() => { console.log('Google button clicked') }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;