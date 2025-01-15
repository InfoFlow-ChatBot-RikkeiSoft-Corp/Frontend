import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css'; // Use CSS modules

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [values, setValues] = useState({ email: '', pass: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.email || !values.pass) {
      setErrorMsg('Please fill all fields');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return;
    } else if (!regex.test(values.email)) {
      setErrorMsg('Enter a valid email');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return;
    } else if (values.pass.length < 6) {
      setErrorMsg('Password should have minimum six characters');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return;
    }

    setErrorMsg('');
    setSubmitButtonDisabled(true);

    // Simulate authentication logic
    setTimeout(() => {
      if (values.email === 'admin@example.com' && values.pass === 'password') {
        setSubmitButtonDisabled(false);
        setIsAuthenticated(true);
        navigate('/main');
      } else {
        setSubmitButtonDisabled(false);
        setErrorMsg('Invalid credentials. Please try again.');
        setValues({ email: '', pass: '' });
        setTimeout(() => {
          setErrorMsg('');
        }, 3000);
      }
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Login</h1>
        <form onSubmit={handleSubmission}>
          <div className={styles.Inputcontainer}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className={styles.Inputcontainer}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="pass"
              value={values.pass}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </div>
          <div className={styles.footer}>
            <b className={styles.error}>{errorMsg}</b>
            <button
              type="submit"
              disabled={submitButtonDisabled}
            >
              Login
            </button>
            <p>
              Don't have an account?{' '}
              <span>
                <Link to="/signup">Sign up</Link>
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;