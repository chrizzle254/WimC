import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import CoachAvailability from './CoachAvailability';
import './Dashboard.css';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  return (
    <div className="dashboard-container">
      {userRole === 'coach' ? (
        <div className="coach-dashboard">
          <h1>Coach Dashboard</h1>
          <div className="dashboard-content">
            <CoachAvailability />
          </div>
        </div>
      ) : (
        <div className="student-dashboard">
          <h1>Student Dashboard</h1>
          <p>Welcome to your dashboard! Here you can view your bookings and manage your profile.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;