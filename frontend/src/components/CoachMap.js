import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CoachMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CoachMap = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnArea, setDrawnArea] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    fetchCoaches();
  }, []);

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

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (isDrawing) {
          setDrawnArea(prev => {
            if (!prev) {
              return {
                type: 'circle',
                center: [e.latlng.lat, e.latlng.lng],
                radius: 1000 // Default 1km radius
              };
            }
            return prev;
          });
        }
      }
    });
    return null;
  };

  const handleAreaTypeChange = (type) => {
    setDrawnArea(null);
    setIsDrawing(type !== null);
  };

  const renderCoachAreas = () => {
    return coaches.map(coach => {
      if (coach.area_type === 'circle') {
        return (
          <Circle
            key={coach.id}
            center={[coach.center_lat, coach.center_lng]}
            radius={coach.radius}
            pathOptions={{ color: 'blue', fillColor: 'blue' }}
            eventHandlers={{
              click: () => setSelectedCoach(coach)
            }}
          />
        );
      } else if (coach.area_type === 'polygon') {
        return (
          <Polygon
            key={coach.id}
            positions={coach.coordinates}
            pathOptions={{ color: 'blue', fillColor: 'blue' }}
            eventHandlers={{
              click: () => setSelectedCoach(coach)
            }}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="coach-map-container">
      <div className="view-toggle">
        <button 
          className={viewMode === 'map' ? 'active' : ''} 
          onClick={() => setViewMode('map')}
        >
          Map View
        </button>
        <button 
          className={viewMode === 'list' ? 'active' : ''} 
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
      </div>

      <div className="content-container">
        {viewMode === 'map' ? (
          <div className="map-section">
            <MapContainer 
              center={[51.505, -0.09]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEvents />
              {renderCoachAreas()}
              {drawnArea && drawnArea.type === 'circle' && (
                <Circle
                  center={drawnArea.center}
                  radius={drawnArea.radius}
                  pathOptions={{ color: 'red', fillColor: 'red' }}
                />
              )}
            </MapContainer>
          </div>
        ) : (
          <div className="list-section">
            <h2>Available Coaches</h2>
            <div className="coach-list">
              {coaches.map(coach => (
                <div 
                  key={coach.id} 
                  className="coach-card"
                  onClick={() => setSelectedCoach(coach)}
                >
                  <h3>{coach.coach_name}</h3>
                  <p>{coach.coach_email}</p>
                  <p>Available: {coach.day_of_week} {coach.start_time} - {coach.end_time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="coach-details">
          {selectedCoach && (
            <div className="selected-coach">
              <h2>{selectedCoach.coach_name}</h2>
              <p>Email: {selectedCoach.coach_email}</p>
              <p>Availability: {selectedCoach.day_of_week} {selectedCoach.start_time} - {selectedCoach.end_time}</p>
              <button 
                className="book-button"
                onClick={() => window.location.href = `/bookings?coach=${selectedCoach.coach_id}`}
              >
                Book Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachMap; 