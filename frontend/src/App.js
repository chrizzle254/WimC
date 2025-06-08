import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginForm from './components/LoginForm';
import AuthRoute from './components/AuthRoute';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import Profile from './components/Profile';
import CoachSearch from './components/CoachSearch';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
      } catch (err) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }
  };

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch('http://localhost:5050/api/users', {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/" className="nav-logo">WimC</Link>
          </div>
          <div className="nav-links">
          <Link to="/coaches" className="nav-link">Find Coaches</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/bookings" className="nav-link">Bookings</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="nav-link logout-button">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CoachSearch />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/profile" /> : <LoginForm onLogin={handleLogin} />} 
            />
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/bookings"
              element={
                <AuthRoute>
                  <Bookings />
                </AuthRoute>
              }
            />
            <Route
              path="/coaches"
              element={<CoachSearch />}
            />
            <Route
              path="/profile"
              element={
                <AuthRoute>
                  <Profile />
                </AuthRoute>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 WimC. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;