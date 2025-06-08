import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/coach-areas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOfferings(data);
      } else {
        setError('Failed to fetch offerings');
      }
    } catch (err) {
      setError('Error loading offerings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Your Offerings</h1>
        <button
          onClick={() => {/* TODO: Add new offering modal */}}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Offering
        </button>
      </div>

      {offerings.length > 0 ? (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <div key={offering.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Lesson Details</h3>
                  <p className="text-gray-600">
                    <strong>Availability:</strong> {offering.day_of_week} {offering.start_time} - {offering.end_time}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> {offering.area_type === 'circle' ? 
                      `Within ${(offering.radius / 1000).toFixed(1)}km radius` : 
                      'Custom area'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {/* TODO: Edit offering */}}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* TODO: Delete offering */}}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't added any offerings yet.</p>
          <button
            onClick={() => {/* TODO: Add new offering modal */}}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Your First Offering
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;