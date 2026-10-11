# CivicFix Roles and Admin Guide

This guide explains how Citizen, Authority, and Admin accounts work, where their data is stored, and how to create and access the Admin account.

## The three roles

### Citizen

- Register at `http://localhost:5173/register` and sign in at `/citizen/login`.
- Provide name, email, Indian mobile number, area/locality, district, state/union territory, and password.
- Citizens can report issues, choose a map pin or request device GPS, attach a photo, track their own reports, and receive notifications.
- From **Profile**, citizens can edit their name, phone, area/locality, district, and state. Email is read-only.
- Citizen accounts are active immediately.

### Authority

- Request access at `http://localhost:5173/authority/request`.
- New authority accounts are pending and cannot sign in until Admin approval.
- Approved authorities sign in at `/authority/login`.
- Authorities can see who reported issues, review locations, and take responsibility for unassigned reports.
- Only the authority responsible for a report can update its status or add remarks. The citizen is notified about updates.
- Current statuses: `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, and `DUPLICATE`.
- The current app does not support reassigning an issue after it has been claimed.

### Admin

- Sign in at `http://localhost:5173/admin/login`. The login name is the Admin email; there is no separate username.
- Admin can view authority requests and approve or reject them.
- Pending and rejected authority accounts cannot sign in; approved accounts can.
- The current Admin panel does not manage all users or reports and does not provide analytics.

## Default Admin login

Local development defaults:

- **Email:** `admin@civicfix.com`
- **Password:** `admin123`

These are not safe production credentials. Set private values in `backend/.env` before deployment. Passwords are hashed before storage.

The seed script reads `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_PHONE`. If they are not set, it uses the defaults above.

To create the Admin account, make sure MongoDB is running and `backend/.env` contains a valid `MONGO_URI`, then run these commands from the `backend` directory:

```powershell
npm run migrate:roles
npm run seed
```

The first command copies existing accounts into their role-specific collections. The second creates the Admin if the configured email does not already exist. If it already exists, seeding does not reset its password; changing `ADMIN_PASSWORD` and rerunning the seed will not change an existing account.

## Account collections and data integrity

MongoDB uses **collections** rather than SQL tables. CivicFix stores role-specific account data separately:

- `citizens`: citizen details and login data
- `authorities`: authority details, approval status, and login data
- `admins`: admin details and login data
- `accountidentities`: unique email, role, and account ID, used to find the correct role collection during login
- `users`: the old shared collection, kept unchanged as a migration backup

Role-specific schemas restrict each account collection to its own role. The identity collection prevents the same email from being registered in multiple role collections. Reports reference citizens and authorities; status history references authorities; notifications are scoped by account ID and role.

### Existing data migration

Run `npm run migrate:roles` from `backend` before starting the app against a database that still has the old `users` collection. The migration preserves account IDs so existing report, notification, and history references keep working. It is safe to rerun and does not delete or modify the old `users` collection. Keep the old collection until you have verified the migrated data and made a database backup.

## How the workflow fits together

1. A Citizen registers and submits an issue report.
2. An Authority requests access and waits for Admin approval.
3. Admin approves or rejects the Authority account.
4. An approved Authority claims an unassigned report.
5. That Authority updates the status or adds a remark, and the Citizen receives a notification.

## Main code locations

- Routes and role checks: [`frontend/src/App.jsx`](../frontend/src/App.jsx)
- Registration and login API: [`backend/routes/authRoutes.js`](../backend/routes/authRoutes.js)
- Citizen account model: [`backend/models/Citizen.js`](../backend/models/Citizen.js)
- Authority account model: [`backend/models/Authority.js`](../backend/models/Authority.js)
- Admin account model: [`backend/models/Admin.js`](../backend/models/Admin.js)
- Unique account identity: [`backend/models/AccountIdentity.js`](../backend/models/AccountIdentity.js)
- Admin seed script: [`backend/utils/seeder.js`](../backend/utils/seeder.js)
- Existing-account migration: [`backend/utils/migrateRoleCollections.js`](../backend/utils/migrateRoleCollections.js)
- Admin approval API: [`backend/routes/authRoutes.js`](../backend/routes/authRoutes.js)
- Authority issue workflow: [`backend/routes/authorityRoutes.js`](../backend/routes/authorityRoutes.js)