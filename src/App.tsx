import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/SideBar';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Homepage from './components/homepage';
import './App.css';
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
          <Route
            path="/signup"
            element={<SignUpPage />}
          />

          {/* Protected Routes */}
          <Route
            path="/main"
            element={
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
            }
          />

          <Route
            path="/c/:id"
            element={
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
            }
          />

          {/* Default Route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
