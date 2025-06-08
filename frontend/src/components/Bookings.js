import React, { useState, useEffect } from 'react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    setUserRole(payload?.role);
  }, [token]);

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
        setMessage('Failed to fetch bookings');
      }
    } catch (err) {
      setMessage('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

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
        fetchBookings();
      } else {
        setMessage(data.message || `Failed to ${status} booking.`);
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5050/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Booking cancelled successfully!');
        fetchBookings();
      } else {
        setMessage(data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600';
      case 'declined': return 'text-red-600';
      case 'pending': return 'text-orange-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const confirmedBookings = bookings.filter(booking => 
    booking.status === 'accepted' && new Date(booking.booking_date) > new Date()
  );

  const pendingBookings = bookings.filter(booking => 
    booking.status === 'pending' && new Date(booking.booking_date) > new Date()
  );

  if (loading) {
    return <div className="container mx-auto p-4">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Pending Bookings Section */}
      {userRole === 'coach' && pendingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Pending Bookings</h2>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-lg shadow border border-orange-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-medium">{booking.student_name}</p>
                    <p className="text-gray-600">{formatDateTime(booking.booking_date)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.participants} {booking.participants === 1 ? 'person' : 'people'}
                    </p>
                    {booking.location && (
                      <p className="text-sm text-gray-500">
                        Location: {booking.location}
                      </p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleBookingStatus(booking.id, 'accepted')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingStatus(booking.id, 'declined')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Upcoming Bookings Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-600">Upcoming Bookings</h2>
        {confirmedBookings.length > 0 ? (
          <div className="space-y-4">
            {confirmedBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-lg shadow border border-green-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-medium">{booking.student_name}</p>
                    <p className="text-gray-600">{formatDateTime(booking.booking_date)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.participants} {booking.participants === 1 ? 'person' : 'people'}
                    </p>
                    {booking.location && (
                      <p className="text-sm text-gray-500">
                        Location: {booking.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default Bookings;