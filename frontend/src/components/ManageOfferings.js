import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ManageOfferings.css';

const ManageOfferings = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingOffering, setIsAddingOffering] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null); // 'circle' or 'polygon'
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(5000); // Default 5km
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [newOffering, setNewOffering] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    area_type: 'circle',
  });
  const mapRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOfferings();
  }, []);

  useEffect(() => {
    // Fix for default marker icons in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
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

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (!isAddingOffering) return;

        if (drawingMode === 'circle') {
          setCircleCenter([e.latlng.lat, e.latlng.lng]);
        } else if (drawingMode === 'polygon') {
          setPolygonPoints([...polygonPoints, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  };

  const handleStartDrawing = (mode) => {
    setIsAddingOffering(true);
    setDrawingMode(mode);
    setCircleCenter(null);
    setPolygonPoints([]);
  };

  const handleCancelDrawing = () => {
    setIsAddingOffering(false);
    setDrawingMode(null);
    setCircleCenter(null);
    setPolygonPoints([]);
    setNewOffering({
      day_of_week: '',
      start_time: '',
      end_time: '',
      area_type: 'circle',
    });
  };

  const handleSaveOffering = async () => {
    if (!newOffering.day_of_week || !newOffering.start_time || !newOffering.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    if (drawingMode === 'circle' && !circleCenter) {
      setError('Please select a location on the map');
      return;
    }

    if (drawingMode === 'polygon' && polygonPoints.length < 3) {
      setError('Please draw a polygon with at least 3 points');
      return;
    }

    const offeringData = {
      ...newOffering,
      area_type: drawingMode,
      ...(drawingMode === 'circle' ? {
        center_lat: circleCenter[0],
        center_lng: circleCenter[1],
        radius: circleRadius,
      } : {
        coordinates: polygonPoints,
      }),
    };

    try {
      const response = await fetch('http://localhost:5050/api/coach-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offeringData),
      });

      if (!response.ok) {
        throw new Error('Failed to save offering');
      }

      await fetchOfferings();
      handleCancelDrawing();
    } catch (err) {
      setError('Failed to save offering. Please try again.');
    }
  };

  const handleDeleteOffering = async (offeringId) => {
    if (!window.confirm('Are you sure you want to delete this offering?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5050/api/coach-areas/${offeringId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete offering');
      }

      await fetchOfferings();
    } catch (err) {
      setError('Failed to delete offering. Please try again.');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Your Offerings</h1>
        {!isAddingOffering && (
          <div className="space-x-2">
            <button
              onClick={() => handleStartDrawing('circle')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Circle Area
            </button>
            <button
              onClick={() => handleStartDrawing('polygon')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Custom Area
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isAddingOffering && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {drawingMode === 'circle' ? 'Add Circle Area' : 'Add Custom Area'}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={newOffering.day_of_week}
                onChange={(e) => setNewOffering({ ...newOffering, day_of_week: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newOffering.start_time}
                  onChange={(e) => setNewOffering({ ...newOffering, start_time: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={newOffering.end_time}
                  onChange={(e) => setNewOffering({ ...newOffering, end_time: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>

          {drawingMode === 'circle' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (in meters)
              </label>
              <input
                type="number"
                value={circleRadius}
                onChange={(e) => setCircleRadius(Number(e.target.value))}
                min="1000"
                max="50000"
                step="1000"
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          <div className="map-container">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEvents />
              {circleCenter && (
                <Circle
                  center={circleCenter}
                  radius={circleRadius}
                  pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                />
              )}
              {polygonPoints.length > 0 && (
                <Polygon
                  positions={polygonPoints}
                  pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
                />
              )}
            </MapContainer>
            {drawingMode === 'circle' && (
              <div className="drawing-instructions">
                Click on the map to set the center of your circle
              </div>
            )}
            {drawingMode === 'polygon' && (
              <div className="drawing-instructions">
                Click on the map to add points to your custom area
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleCancelDrawing}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOffering}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Offering
            </button>
          </div>
        </div>
      )}

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
                <button
                  onClick={() => handleDeleteOffering(offering.id)}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't added any offerings yet.</p>
          <div className="space-x-2">
            <button
              onClick={() => handleStartDrawing('circle')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Circle Area
            </button>
            <button
              onClick={() => handleStartDrawing('polygon')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Custom Area
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOfferings;