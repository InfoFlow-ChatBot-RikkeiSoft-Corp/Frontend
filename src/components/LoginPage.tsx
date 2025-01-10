import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../service/AuthService'; // AuthService import
import styles from '../styles/LoginPage.module.css';

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void; // 정확한 타입 지정
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 시작
    try {
      const token = await AuthService.login(username, password); // AuthService 호출
      AuthService.saveToken(token); // 토큰 저장
      setIsAuthenticated(true); // 인증 상태 업데이트
      alert('Login successful!'); // 성공 메시지
      navigate('/'); // 메인 페이지로 리디렉션
    } catch (error: any) {
      alert(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://accounts.google.com/signin'; // Google 로그인
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
              disabled={isLoading} // 로딩 중 비활성화
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
              disabled={isLoading} // 로딩 중 비활성화
            />
          </div>
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading} // 로딩 중 비활성화
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          <img src="/google-login.png" alt="Login with Google" className={styles.googleImage} />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
