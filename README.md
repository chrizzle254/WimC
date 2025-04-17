# WimC Application

This is a full-stack application with a React frontend, Node.js backend, and PostgreSQL database, all containerized using Docker.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker
- Docker Compose
- Node.js (optional, for local development)

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd WimC
```

### 2. Environment Setup
Create a `.env` file in the root directory with the following variables:
```
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=wimc
DB_HOST=database
REACT_APP_BACKEND_URL=http://localhost:5050
```

### 3. Running the Application

#### Using Docker Compose (Recommended)
The easiest way to run the entire application is using Docker Compose:

```bash
docker-compose up --build
```

This will:
- Start the PostgreSQL database
- Build and start the backend service
- Build and start the frontend service

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5050
- Database: localhost:5432

#### Running Services Individually

##### Database
```bash
docker-compose up database
```

##### Backend
```bash
docker-compose up backend
```

##### Frontend
```bash
docker-compose up frontend
```

### 4. Stopping the Application
To stop all services:
```bash
docker-compose down
```

To stop and remove volumes (including database data):
```bash
docker-compose down -v
```

## Development

### Local Development
If you prefer to run services locally without Docker:

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Troubleshooting

1. If you encounter port conflicts, ensure no other services are running on ports 3000, 5050, or 5432.
2. If the database connection fails, verify that the database container is running and the credentials in the `.env` file match those in the docker-compose.yml.
3. For frontend-backend communication issues, ensure the `REACT_APP_BACKEND_URL` in your `.env` file points to the correct backend URL.

## Project Structure

- `frontend/`: React application
- `backend/`: Node.js backend service
- `database/`: PostgreSQL database initialization scripts
- `docker-compose.yml`: Docker configuration for all services
