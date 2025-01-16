import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';
import GoogleButton from 'react-google-button';
import React, { useState, useEffect } from 'react';
import { API_AUTH_BASE_URL } from '../constants/apiEndpoints';
import { AuthService } from '../service/AuthService'; // AuthService import
import {NotificationService} from '../service/NotificationService'; // NotificationService import

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void; // 정확한 타입 지정
}

declare global {
  interface Window {
    google?: any; // to avoid TypeScript errors when referencing window.google
  }
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();

  // ------------------------------
  // 1) Normal username/password login
  // ------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 시작
    try {
      const {token,user_id } = await AuthService.login(username, password); // AuthService 호출
      AuthService.saveToken(token); // 토큰 저장
      AuthService.saveId(user_id);
      setIsAuthenticated(true); // 인증 상태 업데이트
      console.log(user_id)
      NotificationService.handleSuccess('Login successful!'); // Display success notification
      navigate('/main'); // 메인 페이지로 리디렉션

    } catch (error: any) {
      NotificationService.handleError(error.response?.data?.error || 'Login failed. Please try again.'); // Display error notification
    } finally {
      setIsLoading(false); // 로딩 종료
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
        navigate('/main');
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
              disabled={isLoading} // 로딩 중 비활성화
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
              disabled={isLoading} // 로딩 중 비활성화
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
