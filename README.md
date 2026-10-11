# CivicFix

CivicFix is a student-built civic issue reporting platform for Indian communities. Citizens can report local problems and follow their progress; approved authorities can take responsibility for reports and update citizens; administrators manage authority access.

## Features

- Citizen accounts with Indian mobile number, area/locality, district, and state details
- Civic reports with category, description, location, and optional photo evidence
- Manual map pin or on-demand device GPS location
- Browser camera capture or photo upload for issue evidence
- Authority access requests, admin approval, and role-protected workspaces
- Report ownership, status history, remarks, and citizen notifications
- Separate MongoDB collections for Citizen, Authority, and Admin accounts

## Technology

- **Frontend:** React, Vite, Tailwind CSS, React Router, Leaflet
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT and bcrypt password hashing

## Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB connection string

## Setup and run

Install the dependencies once, then start both apps together from the project folder.

### 1. Configure the backend

From the project folder, run:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Copy `.env.example` only when creating `.env` for the first time. Open `backend/.env` and set:

- `MONGO_URI` to your MongoDB connection string
- `JWT_SECRET` to a long, private random value
- `CLIENT_URL` to the frontend URL, normally `http://localhost:5173`

Keep `.env` private and never commit production credentials.

Install the root runner and frontend dependencies from the project folder:

```powershell
cd ..
npm install
cd frontend
npm install
cd ..
```

### 2. Prepare account data

From the `backend` folder, run:

```powershell
npm run seed
```

The seed command creates the default Admin only if the configured Admin email does not already exist.

### 3. Start the project

From the project folder, run:

```powershell
npm run dev
```

This starts the API at `http://localhost:5000` and the frontend at `http://localhost:5173`. Check the API at `http://localhost:5000/api/health`. Press `Ctrl+C` to stop both.

## Project layout

```text
CivicFix/
|-- backend/    Express API, MongoDB models, routes, and utilities
|-- frontend/   React application and user interface
|-- docs/       Detailed role and Admin guide
|-- README.md   Project overview and setup instructions
```

## Useful commands

Run each command from its package folder:

| Purpose | Folder | Command |
| --- | --- | --- |
| Start backend for development | `backend` | `npm run dev` |
| Create Admin if missing | `backend` | `npm run seed` |
| Approve an authority from terminal | `backend` | `npm run review-authority -- approve email@example.com` |
| Reject an authority from terminal | `backend` | `npm run review-authority -- reject email@example.com` |
| Start frontend for development | `frontend` | `npm run dev` |
| Build frontend for production | `frontend` | `npm run build` |
| Lint frontend | `frontend` | `npm run lint` |

## Roles and Admin setup

For sign-in routes, account workflows, default local Admin credentials, and collection details, see [docs/ROLES_AND_ADMIN.md](docs/ROLES_AND_ADMIN.md).
