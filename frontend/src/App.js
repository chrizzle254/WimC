import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AuthRoute from './components/AuthRoute';
import Dashboard from './components/Dashboard'; 
import Bookings from './components/Bookings';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5050/users') // Backend service
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>WimC - Users List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route path="/bookings" element={<AuthRoute><Bookings /></AuthRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;