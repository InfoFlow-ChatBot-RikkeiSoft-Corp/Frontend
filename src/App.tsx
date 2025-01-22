import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/SideBar';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Homepage from './components/homepage';
import './App.css';
import { ToastContainer } from 'react-toastify';
import { AuthService } from './service/AuthService';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check localStorage on initialization
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Update localStorage when isAuthenticated changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    async function initializeUser() {
      if (AuthService.getToken() && !AuthService.getUsername()) {
        try {
          const { username } = await AuthService.fetchUserDetails();
          AuthService.username = username;
        } catch (error) {
          // Handle error, maybe logout user or show a message
          console.error("Failed to initialize user:", error);
          // Optionally, handle logout or error messaging here.
        }
      }
    }
    initializeUser();
  }, []);

  return (
    <BrowserRouter>
      <div className="App dark:bg-gray-900 dark:text-gray-100">
        <ToastContainer />
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Homepage />} />

          {/* Login Page */}
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Sign Up Page */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route
            path="/main"
            element={
              isAuthenticated ? (
                <div className="flex">
                  <Sidebar
                    className="sidebar-container flex-shrink-0"
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                  />
                  <MainPage
                    className="main-content"
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/c/:id"
            element={
              isAuthenticated ? (
                <div className="flex">
                  <Sidebar
                    className="sidebar-container flex-shrink-0"
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                  />
                  <MainPage
                    className="main-content"
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
