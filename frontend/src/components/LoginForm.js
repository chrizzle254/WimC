import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // Import useNavigate



const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate function


  const handleSubmit = async (e) => {
    e.preventDefault();

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
        const decodedToken = jwtDecode(data.token); // Decode the JWT
        // Save token in localStorage
        localStorage.setItem('token', data.token);
        setSuccessMessage('Login successful!');
        setErrorMessage('');
        console.log('Token:', data.token); // For debugging
        // Redirect based on role
        if (decodedToken.role === 'coach') {
          navigate('/dashboard/coach');
        } else if (decodedToken.role === 'student') {
          navigate('/dashboard/student');
        } 
      }
      else {
        setErrorMessage(data.message || 'Invalid credentials');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Display success or error messages */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginForm;