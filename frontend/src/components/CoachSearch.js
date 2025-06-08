import React, { useState, useEffect, memo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, useMapEvents } from 'react-leaflet';
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

// Memoized FilterBar component
const FilterBar = memo(({ filters, onFilterChange, onSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
  <div className="filter-bar">
    <div className="filter-section">
      <label>Where</label>
      <input
        type="text"
        onKeyPress={handleKeyPress}
        placeholder="Search locations"
        value={filters.location}
        onChange={(e) => onFilterChange('location', e.target.value)}
      />
    </div>
    <div className="filter-section">
      <label>When</label>
      <input
        type="date"
        value={filters.date}
        onChange={(e) => onFilterChange('date', e.target.value)}
      />
    </div>
    <div className="filter-section">
      <label>What</label>
      <select
        value={filters.type}
        onChange={(e) => onFilterChange('type', e.target.value)}
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
        onChange={(e) => onFilterChange('participants', e.target.value)}
      >
        <option value="1">1 Person</option>
        <option value="2">2 People</option>
        <option value="3">3 People</option>
        <option value="4">4+ People</option>
      </select>
    </div>
    <div className="filter-section search-button-container">
      <button className="search-button" onClick={onSearch}>Search</button>
    </div>
  </div>
  );
});

// Map event handler component
const MapEventHandler = ({ onBoundsChange }) => {
  const map = useMapEvents({
    load: () => {
      // Initial bounds
      const bounds = map.getBounds();
      console.log('Initial map bounds:', bounds);
      onBoundsChange(bounds);
    },
    moveend: () => {
      const bounds = map.getBounds();
      console.log('Map moved, new bounds:', bounds);
      onBoundsChange(bounds);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      console.log('Map zoomed, new bounds:', bounds);
      onBoundsChange(bounds);
    }
  });
  return null;
};

const CoachSearch = () => {
  const mapRef = React.useRef();
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(13);
  const [currentBounds, setCurrentBounds] = useState(null);
  const [allCoaches, setAllCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);


  const [selectedCoach, setSelectedCoach] = useState(null);
  const [hoveredCoach, setHoveredCoach] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    type: '',
    participants: 1
  });

  // Fetch all coaches on initial load
  useEffect(() => {
    fetchCoaches();
  }, []);

  const isAreaInBounds = useCallback((coach, bounds) => {
    if (!bounds || !bounds.isValid()) return true;

    try {
      if (coach.area_type === 'circle') {
        // For circles, check if any part of the circle intersects with the bounds
        console.log('Coach asdasdasdasdas:', coach);
        console.log('Bounds asdasdasdasdas:', bounds);
        const center = L.latLng(coach.center_lat, coach.center_lng);
        const circleBounds = center.toBounds(coach.radius);
        return bounds.intersects(circleBounds); 
      } else if (coach.area_type === 'polygon') {
        // For polygons, check if any part of the polygon intersects with the bounds
        const polygon = L.polygon(coach.coordinates);
        return bounds.intersects(polygon.getBounds());
      }
      return true; // If we can't determine the area type, show the coach
    } catch (error) {
      console.error('Error checking area bounds:', error, coach);
      return true; // Show coach if there's an error
    }
  }, []);

  const filterCoaches = useCallback((coaches, bounds) => {
    console.log('Filtering coaches:', {
      totalCoaches: coaches.length,
      hasBounds: bounds,
      boundsString: bounds?.toString()
    });

    let filtered = [...coaches];

    // Filter by map bounds
    if (bounds && bounds.isValid()) {
      console.log('Before bounds filter:', filtered.length, 'coaches');
      filtered = filtered.filter(coach => {
        try {
          const isInBounds = isAreaInBounds(coach, bounds);
          console.log('Coach bounds check:', { 
            coach: coach.coach_name, 
            isInBounds,
            bounds: bounds.toString()
          });
          return isInBounds;
        } catch (error) {
          console.error('Error filtering coach:', error, coach);
          return true; // Show coach if there's an error
        }
      });
      console.log('After bounds filter:', filtered.length, 'coaches');
    }

    return filtered;
  }, [isAreaInBounds]);

  // Update filtered coaches when bounds change
  useEffect(() => {
    if (allCoaches.length > 0) {
      console.log('Updating filtered coaches:', {
        allCoachesCount: allCoaches.length,
        hasBounds: !!currentBounds,
        boundsString: currentBounds?.toString()
      });
      const filtered = filterCoaches(allCoaches, currentBounds);
      console.log('Setting filtered coaches:', filtered.length);
      setFilteredCoaches(filtered);
    }
  }, [currentBounds, allCoaches, filterCoaches, filters]);

  const handleSearch = async () => {
    if (filters.location) {
      await geocodeLocation(filters.location);
    }
    filterCoaches(allCoaches, currentBounds);
  };



  const geocodeLocation = async (location) => {
    if (!location.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setMapZoom(13);
        
        // Use the ref to update map view without triggering bounds change
        if (mapRef.current) {
          mapRef.current.setView(newCenter, 13, { animate: true });
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

  };
  
  const handleMapBoundsChange = useCallback((bounds) => {
    if (!bounds || !bounds.isValid()) {
      console.log('Invalid bounds:', bounds);
      return;
    }
    console.log('Map bounds changed:', bounds.toString());
    setCurrentBounds(bounds);
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/coach-areas');
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched coaches:', data);
        setAllCoaches(data);
        setFilteredCoaches(data);
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



  // Calculate the center point of a polygon
  const calculatePolygonCenter = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return null;
    
    try {
      let lat = 0;
      let lng = 0;
      const validCoords = coordinates.filter(coord => 
        Array.isArray(coord) && coord.length === 2 &&
        typeof coord[0] === 'number' && typeof coord[1] === 'number'
      );
      
      if (validCoords.length === 0) return null;
      
      validCoords.forEach(coord => {
        lat += coord[0];
        lng += coord[1];
      });
      
      return [lat / validCoords.length, lng / validCoords.length];
    } catch (error) {
      console.error('Error calculating polygon center:', error);
      return null;
    }
  };

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
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      <div className="search-content">
        <div className="coaches-list">
          <h2>{filteredCoaches.length} coaches available</h2>
          <div className="coach-cards">
            {filteredCoaches.map(coach => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
        <div className="map-container">
          <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <MapEventHandler onBoundsChange={handleMapBoundsChange} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredCoaches.map(coach => {
              const center = coach.area_type === 'circle' 
                ? [coach.center_lat, coach.center_lng]
                : calculatePolygonCenter(coach.coordinates);

              const isSelected = selectedCoach?.id === coach.id;
              const isHovered = hoveredCoach?.id === coach.id;

              return (
                <React.Fragment key={coach.id}>
                  <Marker
                    position={center}
                    eventHandlers={{
                      click: () => setSelectedCoach(coach),
                      mouseover: () => setHoveredCoach(coach),
                      mouseout: () => setHoveredCoach(null)
                    }}
                  >
                    <Popup>
                      <h3>{coach.coach_name}</h3>
                      <p>Available: {coach.day_of_week} {coach.start_time} - {coach.end_time}</p>
                      <button 
                        onClick={() => window.location.href = `/bookings?coach=${coach.coach_id}`}
                        className="book-now-btn"
                      >
                        Book Now
                      </button>
                    </Popup>
                  </Marker>

                  {(isSelected || isHovered) && (
                    coach.area_type === 'circle' ? (
                      <Circle
                        center={center}
                        radius={coach.radius}
                        pathOptions={{ 
                          color: isSelected ? '#2563eb' : '#4A90E2',
                          fillColor: isSelected ? '#2563eb' : '#4A90E2',
                          fillOpacity: isSelected ? 0.3 : 0.2,
                          weight: isSelected ? 2 : 1
                        }}
                      />
                    ) : (
                      <Polygon
                        positions={coach.coordinates}
                        pathOptions={{ 
                          color: isSelected ? '#2563eb' : '#4A90E2',
                          fillColor: isSelected ? '#2563eb' : '#4A90E2',
                          fillOpacity: isSelected ? 0.3 : 0.2,
                          weight: isSelected ? 2 : 1
                        }}
                      />
                    )
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CoachSearch;