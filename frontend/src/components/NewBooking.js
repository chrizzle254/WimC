import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './NewBooking.css';

const NewBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const coachId = searchParams.get('coach');
    if (!coachId) {
      setError('No coach selected');
      setLoading(false);
      return;
    }

    fetchCoachDetails(coachId);
  }, [searchParams]);

  const fetchCoachDetails = async (coachId) => {
    try {
      const response = await fetch(`http://localhost:5050/api/coach-areas/${coachId}`);
      const data = await response.json();
      if (response.ok) {
        setCoach(data);
      } else {
        setError('Failed to fetch coach details');
      }
    } catch (err) {
      setError('Error loading coach details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setError('Please select a date and time');
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coach_id: coach.coach_id,
          booking_date: bookingDate,
          participants: participants
        }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/bookings', { state: { message: 'Booking request sent successfully!' } });
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-600">{error}</div>;
  }

  if (!coach) {
    return <div className="container mx-auto p-4">Coach not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Book a Lesson</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Coach Details</h2>
        <p className="mb-2"><strong>Name:</strong> {coach.coach_name}</p>
        <p className="mb-2"><strong>Availability:</strong> {coach.day_of_week} {coach.start_time} - {coach.end_time}</p>
        <p className="mb-2"><strong>Location:</strong> {coach.area_type === 'circle' ? 
          `Within ${(coach.radius / 1000).toFixed(1)}km radius` : 
          'Custom area'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date and Time
          </label>
          <input
            type="datetime-local"
            id="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Participants
          </label>
          <select
            id="participants"
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 Person</option>
            <option value="2">2 People</option>
            <option value="3">3 People</option>
            <option value="4">4+ People</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/coaches')}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Request Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBooking; 