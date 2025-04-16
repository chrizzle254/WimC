import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      
      const response = await fetch(`http://localhost:5050/api/users/${decodedToken.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setErrorMessage('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setErrorMessage('Failed to fetch user data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      
      const response = await fetch(`http://localhost:5050/api/users/${decodedToken.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>

        {errorMessage && (
          <div className="message error">
            <span className="message-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="message success">
            <span className="message-icon">✓</span>
            {successMessage}
          </div>
        )}

        {!isEditing ? (
          <div className="profile-info">
            <div className="info-group">
              <label>Full Name</label>
              <div className="info-value">{userData.name}</div>
            </div>
            <div className="info-group">
              <label>Email</label>
              <div className="info-value">{userData.email}</div>
            </div>
            <div className="info-group">
              <label>Role</label>
              <div className="info-value">{userData.role}</div>
            </div>
            <button
              type="button"
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={userData.role}
                disabled
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  fetchUserData(); // Reset form data
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile; 