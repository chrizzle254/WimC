import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CoachAvailability.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CoachAvailability = () => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawnArea, setDrawnArea] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [formData, setFormData] = useState({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '17:00',
    radius: 1000 // Default radius in meters
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/api/coach-areas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAreas(data);
      } else {
        console.error('Error fetching areas:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch areas:', err);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (isDrawing) {
          if (drawingMode === 'circle') {
            setDrawnArea({
              type: 'circle',
              center: [e.latlng.lat, e.latlng.lng],
              radius: 500 // Default 500m radius
            });
          } else if (drawingMode === 'polygon') {
            const newPoints = [...polygonPoints, [e.latlng.lat, e.latlng.lng]];
            setPolygonPoints(newPoints);
            if (newPoints.length >= 3) {
              // Set drawnArea for polygon as soon as we have 3 points
              setDrawnArea({
                type: 'polygon',
                coordinates: newPoints
              });
            }
          }
        }
      },
      dblclick: (e) => {
        if (isDrawing && drawingMode === 'polygon' && polygonPoints.length >= 3) {
          // Complete the polygon and update drawnArea
          const closedPolygon = [...polygonPoints, polygonPoints[0]];
          setDrawnArea({
            type: 'polygon',
            coordinates: closedPolygon
          });
          setPolygonPoints([]); // Clear the points since we're done drawing
        }
      }
    });
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!drawnArea) return;

    try {
      const token = localStorage.getItem('token');
      const areaData = {
        area_type: drawnArea.type,
        ...(drawnArea.type === 'circle' ? {
          center_lat: drawnArea.center[0],
          center_lng: drawnArea.center[1],
          radius: drawnArea.radius
        } : {
          coordinates: drawnArea.coordinates
        }),
        ...formData
      };

      const response = await fetch('http://localhost:5050/api/coach-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(areaData)
      });

      if (response.ok) {
        setDrawnArea(null);
        setIsDrawing(false);
        setDrawingMode(null);
        setPolygonPoints([]);
        fetchAreas();
      } else {
        const data = await response.json();
        console.error('Error creating area:', data.message);
      }
    } catch (err) {
      console.error('Failed to create area:', err);
    }
  };

  const handleDelete = async (areaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/api/coach-areas/${areaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAreas();
      } else {
        const data = await response.json();
        console.error('Error deleting area:', data.message);
      }
    } catch (err) {
      console.error('Failed to delete area:', err);
    }
  };

  const renderAreas = () => {
    return areas.map(area => {
      if (area.area_type === 'circle') {
        return (
          <Circle
            key={area.id}
            center={[area.center_lat, area.center_lng]}
            radius={area.radius}
            pathOptions={{ color: 'blue', fillColor: 'blue' }}
            eventHandlers={{
              click: () => setSelectedArea(area)
            }}
          />
        );
      } else if (area.area_type === 'polygon') {
        return (
          <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{ color: 'blue', fillColor: 'blue' }}
            eventHandlers={{
              click: () => setSelectedArea(area)
            }}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="coach-availability-container">
      <div className="controls-section">
        <h2>Manage Availability Areas</h2>
        
        <div className="drawing-controls">
          <button 
            className={drawingMode === 'circle' ? 'active' : ''}
            onClick={() => {
              setDrawingMode('circle');
              setIsDrawing(true);
              setDrawnArea(null);
              setPolygonPoints([]);
            }}
          >
            Draw Circle
          </button>
          <button 
            className={drawingMode === 'polygon' ? 'active' : ''}
            onClick={() => {
              setDrawingMode('polygon');
              setIsDrawing(true);
              setDrawnArea(null);
              setPolygonPoints([]);
            }}
          >
            Draw Polygon
          </button>
          <button 
            onClick={() => {
              setIsDrawing(false);
              setDrawingMode(null);
              setDrawnArea(null);
              setPolygonPoints([]);
            }}
          >
            Cancel Drawing
          </button>
        </div>

        {isDrawing && (
          <form onSubmit={handleSubmit} className="area-form">
            <div className="form-group">
              <label htmlFor="day_of_week">Day of Week</label>
              <select
                id="day_of_week"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>
              <input
                type="time"
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>

            {drawingMode === 'circle' && (
              <div className="form-group">
                <label htmlFor="radius">Radius (meters)</label>
                <input
                  type="number"
                  id="radius"
                  min="100"
                  max="10000"
                  value={formData.radius}
                  onChange={(e) => {
                    const newRadius = parseInt(e.target.value);
                    setFormData({ ...formData, radius: newRadius });
                    setDrawnArea(prev => ({
                      ...prev,
                      radius: newRadius
                    }));
                  }}
                />
              </div>
            )}

            <button type="submit" disabled={!drawnArea}>
              Save Area
            </button>
          </form>
        )}
      </div>

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
          {renderAreas()}
          {drawnArea && drawnArea.type === 'circle' && (
            <Circle
              center={drawnArea.center}
              radius={drawnArea.radius}
              pathOptions={{ color: 'red', fillColor: 'red' }}
            />
          )}
          {polygonPoints.length > 0 && (
            <Polygon
              positions={[...polygonPoints, polygonPoints[0]]}
              pathOptions={{ color: 'red', fillColor: 'red' }}
            />
          )}
        </MapContainer>
      </div>

      <div className="areas-list">
        <h3>Your Availability Areas</h3>
        {areas.map(area => (
          <div key={area.id} className="area-card">
            <h4>{area.day_of_week} {area.start_time} - {area.end_time}</h4>
            <p>Type: {area.area_type}</p>
            {area.area_type === 'circle' && (
              <p>Center: {area.center_lat}, {area.center_lng}</p>
            )}
            <button onClick={() => handleDelete(area.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachAvailability; 