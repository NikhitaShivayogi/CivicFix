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

Run the backend and frontend in separate terminals.

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

### 2. Prepare account data

From the `backend` folder, run:

```powershell
npm run migrate:roles
npm run seed
```

The migration is safe to rerun, preserves account IDs, and leaves the original `users` collection as a backup. Back up your database before migrating. The seed command creates the default Admin only if the configured Admin email does not already exist.

### 3. Start the backend

In the same `backend` terminal:

```powershell
npm run dev
```

The API runs at `http://localhost:5000`. Check it at `http://localhost:5000/api/health`.

### 4. Start the frontend

Open a second terminal at the project folder and run:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

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
| Migrate existing role accounts | `backend` | `npm run migrate:roles` |
| Create Admin if missing | `backend` | `npm run seed` |
| Approve an authority from terminal | `backend` | `npm run review-authority -- approve email@example.com` |
| Reject an authority from terminal | `backend` | `npm run review-authority -- reject email@example.com` |
| Start frontend for development | `frontend` | `npm run dev` |
| Build frontend for production | `frontend` | `npm run build` |
| Lint frontend | `frontend` | `npm run lint` |

## Roles and Admin setup

For sign-in routes, account workflows, default local Admin credentials, collection details, and migration information, see [docs/ROLES_AND_ADMIN.md](docs/ROLES_AND_ADMIN.md).
