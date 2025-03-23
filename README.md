# **Where is My Coach (WimC)**

### **Project Overview**
WimC is a platform that connects coaches with students, providing a flexible and transparent system for booking lessons. This project is fully containerized using **Docker**.

---

## **Prerequisites**
Before starting, ensure you have the following installed:
1. **Docker**: [Download and Install Docker](https://www.docker.com/products/docker-desktop).  
   - Verify Docker installation:
     ```bash
     docker --version
     ```

2. *(Optional but recommended)* **Postman** or any API testing tool to test backend APIs.

---

## **Getting Started**

### **1. Clone the Repository**
Download the project files to your machine:
```bash
git clone <repository_url>
cd wimc-project
```

### **2. Set Up Environment Variables**
1. Create a .env file in the project root:
```touch .env```
2. Add the following environment variables (modify if needed):
```
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=wimc
DB_HOST=database
PORT=5000
```
### 3. Build and Run the Application
Run all the services (frontend, backend, and PostgreSQL) with:
```
docker-compose up --build
```
This will:
- Start the PostgreSQL database.
- Launch the backend server (Node.js) on http://localhost:5000.
- Launch the frontend client (React.js) on http://localhost:3000.

### 4. Verify Setup
- **Frontend**: Open http://localhost:3000 in your browser, and you should see the app running.
- **Backend**: Test the backend API using a browser or curl command:
```
curl http://localhost:5000
```
You should see a response like: `Backend is running!`
- **PostgreSQL**: Connect to the database (e.g., via psql or a database manager). Use the credentials from the .env file.


## Managing the Application
### Start/Stop Services
- Start all services:
```docker-compose up```
- Stop all services:
```docker-compose down```

### Clean Up (Remove Containers, Images, and Volumes)
To reset everything:
```docker-compose down --volumes --rmi all```

## Folder Structure
```
wimc-project/
├── backend/             # Node.js backend service
│   ├── index.js         # Entry point for backend API
│   ├── db.js            # PostgreSQL connection
│   ├── Dockerfile       # Backend Docker configuration
│   └── package.json     # Backend dependencies
├── frontend/            # React.js frontend app
│   ├── src/             # Source code
│   ├── Dockerfile       # Frontend Docker configuration
│   └── package.json     # Frontend dependencies
├── database/            # PostgreSQL initialization
│   └── init.sql         # Optional: Pre-create database tables
├── docker-compose.yml   # Orchestration for all services
├── .env                 # Environment variables
└── README.md            # Project setup guide
```
