import React, { useState, useEffect } from 'react';

const Bookings = () => {
  const [coaches, setCoaches] = useState([]); // List of available coaches
  const [bookings, setBookings] = useState([]); // Existing bookings for the user
  const [selectedCoach, setSelectedCoach] = useState(null); // Selected coach for booking
  const [bookingDate, setBookingDate] = useState(''); // Date for the booking
  const [message, setMessage] = useState(''); // Error/Success messages
  const [loading, setLoading] = useState(false); // Loading state for booking creation

  const token = localStorage.getItem('token'); // JWT stored in localStorage

  useEffect(() => {
    fetchCoaches();
    fetchBookings();
  }, []);

  // Fetch list of available coaches
  const fetchCoaches = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/coaches', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCoaches(data);
      } else {
        console.error('Error fetching coaches:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
    }
  };

  // Fetch current user's bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      } else {
        console.error('Error fetching bookings:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedCoach || !bookingDate) {
      setMessage('Please select a coach and a date.');
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch('http://localhost:5050/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coach_id: selectedCoach,
          booking_date: bookingDate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Booking created successfully!');
        setSelectedCoach(null);
        setBookingDate('');
        fetchBookings(); // Refresh bookings after creating
      } else {
        setMessage(data.message || 'Failed to create booking.');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h1>Book a Session</h1>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {/* Booking Form */}
      <form onSubmit={handleBooking}>
        <div>
          <label htmlFor="coach">Select a Coach:</label>
          <select
            id="coach"
            value={selectedCoach || ''}
            onChange={(e) => setSelectedCoach(e.target.value)}
          >
            <option value="" disabled>
              -- Choose a Coach --
            </option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name} ({coach.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date">Booking Date:</label>
          <input
            type="datetime-local"
            id="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Booking...' : 'Book Now'}
        </button>
      </form>

      {/* Existing Bookings */}
      <h2>My Bookings</h2>
      {bookings.length > 0 ? (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              Coach: {booking.coach_id}, Date: {new Date(booking.booking_date).toLocaleString()}, Status:{' '}
              {booking.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default Bookings;