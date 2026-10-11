# CivicFix

A student-built civic issue reporting app for Indian communities.

## Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB connection string

## Setup

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` and a private `JWT_SECRET` in `backend/.env`. For an existing database, migrate accounts before starting the backend:

```powershell
npm run migrate:roles
npm run seed
npm run dev
```

### Frontend

In a second terminal, from the project folder:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

## More information

See [docs/ROLES_AND_ADMIN.md](docs/ROLES_AND_ADMIN.md) for Citizen, Authority, and Admin workflows, the default Admin account, data collections, and migration details.
