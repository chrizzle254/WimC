import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const decodedToken = jwtDecode(data.token);
        localStorage.setItem('token', data.token);
        setSuccessMessage('Login successful! Redirecting...');
        
        // Add a small delay before navigation for better UX
        setTimeout(() => {
          if (decodedToken.role === 'coach') {
            navigate('/dashboard/coach');
          } else if (decodedToken.role === 'student') {
            navigate('/dashboard/student');
          }
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Invalid credentials');
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
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="form-input"
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" id="remember" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign In'
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
          <p>Don't have an account? <a href="#" className="signup-link">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;