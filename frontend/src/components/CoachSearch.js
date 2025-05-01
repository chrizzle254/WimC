import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CoachSearch.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CoachSearch = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    type: '',
    participants: 1
  });

  useEffect(() => {
    fetchCoaches();
  }, [filters]);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/coach-areas');
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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const FilterBar = () => (
    <div className="filter-bar">
      <div className="filter-section">
        <label>Where</label>
        <input
          type="text"
          placeholder="Search locations"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>
      <div className="filter-section">
        <label>When</label>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
        />
      </div>
      <div className="filter-section">
        <label>What</label>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Lessons</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="filter-section">
        <label>How Many</label>
        <select
          value={filters.participants}
          onChange={(e) => handleFilterChange('participants', e.target.value)}
        >
          <option value="1">1 Person</option>
          <option value="2">2 People</option>
          <option value="3">3 People</option>
          <option value="4">4+ People</option>
        </select>
      </div>
    </div>
  );

  const CoachCard = ({ coach }) => (
    <div 
      className={`coach-card ${selectedCoach?.id === coach.id ? 'selected' : ''}`}
      onClick={() => setSelectedCoach(coach)}
    >
      <img src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(coach.coach_name) + '&size=5&background=random'} alt={coach.coach_name} />
      <div className="coach-info">
        <h3>{coach.coach_name}</h3>
        <p className="location">{coach.area_type === 'circle' ? 'Within ' + (coach.radius / 1000).toFixed(1) + 'km radius' : 'Custom area'}</p>
        <p className="availability">Available: {coach.day_of_week}</p>
        <p className="time">{coach.start_time} - {coach.end_time}</p>
      </div>
    </div>
  );

  return (
    <div className="coach-search">
      <FilterBar />
      <div className="search-content">
        <div className="coaches-list">
          <h2>{coaches.length} coaches available</h2>
          <div className="coach-cards">
            {coaches.map(coach => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
        <div className="map-container">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {coaches.map(coach => {
              if (coach.area_type === 'circle') {
                return (
                  <Circle
                    key={coach.id}
                    center={[coach.center_lat, coach.center_lng]}
                    radius={coach.radius}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    eventHandlers={{
                      click: () => setSelectedCoach(coach)
                    }}
                  >
                    <Popup>
                      <h3>{coach.coach_name}</h3>
                      <p>Available: {coach.day_of_week} {coach.start_time} - {coach.end_time}</p>
                      <button onClick={() => window.location.href = `/bookings?coach=${coach.coach_id}`}>
                        Book Now
                      </button>
                    </Popup>
                  </Circle>
                );
              } else if (coach.area_type === 'polygon') {
                return (
                  <Polygon
                    key={coach.id}
                    positions={coach.coordinates}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    eventHandlers={{
                      click: () => setSelectedCoach(coach)
                    }}
                  >
                    <Popup>
                      <h3>{coach.coach_name}</h3>
                      <p>Available: {coach.day_of_week} {coach.start_time} - {coach.end_time}</p>
                      <button onClick={() => window.location.href = `/bookings?coach=${coach.coach_id}`}>
                        Book Now
                      </button>
                    </Popup>
                  </Polygon>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CoachSearch;
