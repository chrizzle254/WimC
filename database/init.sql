-- Initialize users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('coach', 'student')) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    coach_id INT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (coach_id) REFERENCES users(id)
);

CREATE TABLE coach_availability_areas (
    id SERIAL PRIMARY KEY,
    coach_id INT NOT NULL,
    area_type VARCHAR(20) CHECK (area_type IN ('circle', 'polygon')) NOT NULL,
    -- For circle: center_lat and center_lng are the center coordinates, radius is in meters
    -- For polygon: coordinates is a JSON array of {lat, lng} points
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    radius DECIMAL(10, 2),
    coordinates JSONB,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);

CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    coach_id INT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL, -- e.g., "Monday"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);