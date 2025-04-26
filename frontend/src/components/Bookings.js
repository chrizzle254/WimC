import React, { useState, useEffect } from 'react';

const Bookings = () => {
  const [coaches, setCoaches] = useState([]); // List of available coaches
  const [bookings, setBookings] = useState([]); // Existing bookings for the user
  const [selectedCoach, setSelectedCoach] = useState(null); // Selected coach for booking
  const [bookingDate, setBookingDate] = useState(''); // Date for the booking
  const [message, setMessage] = useState(''); // Error/Success messages
  const [loading, setLoading] = useState(false); // Loading state for booking creation
  const [userRole, setUserRole] = useState(null); // Store user's role (coach or student)

  const token = localStorage.getItem('token'); // JWT stored in localStorage

  useEffect(() => {
    fetchCoaches();
    fetchBookings();
    // Get user role from JWT payload
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    setUserRole(payload?.role);
  }, [token]);

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

  // Handle booking status update (accept/decline)
  const handleBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5050/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Booking ${status} successfully!`);
        fetchBookings(); // Refresh bookings after update
      } else {
        setMessage(data.message || `Failed to ${status} booking.`);
      }
    } catch (err) {
      console.error(`Error ${status}ing booking:`, err);
      setMessage('Something went wrong. Please try again.');
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

  // Get status color based on booking status
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'green';
      case 'declined': return 'red';
      case 'pending': return 'orange';
      default: return 'black';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a Session</h1>

      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      {userRole === 'student' && (
        /* Booking Form */
        <form onSubmit={handleBooking} className="mb-8 space-y-4">
          <div>
            <label htmlFor="coach" className="block mb-2">Select a Coach:</label>
            <select
              id="coach"
              className="w-full p-2 border rounded"
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
            <label htmlFor="date" className="block mb-2">Booking Date:</label>
            <input
              type="datetime-local"
              id="date"
              className="w-full p-2 border rounded"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Creating Booking...' : 'Book Now'}
          </button>
        </form>
      )}

      {/* Existing Bookings */}
      <h2 className="text-xl font-bold mb-4">My Bookings</h2>
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="border p-4 rounded shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>Student:</strong> {booking.student_name}</p>
                  <p><strong>Coach:</strong> {booking.coach_name}</p>
                  <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: getStatusColor(booking.status) }}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </p>
                </div>
                {userRole === 'coach' && booking.status === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleBookingStatus(booking.id, 'accepted')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingStatus(booking.id, 'declined')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default Bookings;