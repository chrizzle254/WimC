import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation class to form container
    const formContainer = document.querySelector('.login-container');
    if (formContainer) {
      formContainer.classList.add('animate-in');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRegistration = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (mode === 'register' && !formData.name) {
      setErrorMessage('Please enter your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register' && !validateRegistration()) {
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const response = await fetch(`http://localhost:5050/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mode === 'login' 
          ? { email: formData.email, password: formData.password }
          : { name: formData.name, email: formData.email, password: formData.password, role: formData.role }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'login') {
          const decodedToken = jwtDecode(data.token);
          localStorage.setItem('token', data.token);
          setSuccessMessage('Login successful! Redirecting...');
          onLogin(decodedToken.role);
          setTimeout(() => {
            if (decodedToken.role === 'coach') {
              navigate('/dashboard/coach');
            } else if (decodedToken.role === 'student') {
              navigate('/dashboard/student');
            }
          }, 1500);
        } else {
          setSuccessMessage('Registration successful! Please login.');
          setMode('login');
        }
      } else {
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{mode === 'login' ? 'Please enter your credentials to login' : 'Join our community today'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="form-input"
                />
                <span className="input-icon">👤</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="form-input"
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                className="form-input"
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="form-input"
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">I want to register as</label>
                <div className="input-wrapper">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="student">Student</option>
                    <option value="coach">Coach</option>
                  </select>
                  <span className="input-icon">👥</span>
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" id="remember" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {successMessage && (
            <div className="message success">
              <span className="message-icon">✓</span>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="message error">
              <span className="message-icon">⚠️</span>
              {errorMessage}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="mode-toggle"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;