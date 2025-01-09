import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/SideBar';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
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
          {/* Login Page */}
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
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

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;