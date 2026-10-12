# CivicFix Roles and Admin Guide

CivicFix connects residents who report civic issues, the authorities who handle them, and an Admin who oversees platform activity. The responsibilities below describe the current implementation; limitations are called out where the app does not yet provide a workflow.

## Citizen: the public

- Register at `http://localhost:5173/register` and sign in at `/citizen/login`.
- Registration collects contact details and area/locality. Select a state or union territory first; the district list updates to match it.
- Report issues such as potholes, broken streetlights, waste, water leakage, drainage, public property, traffic/safety, and fallen trees.
- Add a description, choose a map location or use device GPS, and attach up to five JPG, PNG, or WEBP photos (5 MB per photo).
- Track personal reports, current status, authority remarks, and notifications.
- Edit name, phone, and location from **Profile**. Email is read-only. Citizen accounts are active immediately.

## Authority: departments and personnel

- Request access at `http://localhost:5173/authority/request`.
- New requests require Admin approval. Pending and rejected accounts cannot sign in; approved accounts sign in at `/authority/login`.
- Review reports, reporter details, locations, and evidence photos. **All Issues** supports category and status filters; **Pending Issues** lists reports awaiting review.
- Take responsibility for an unassigned report. Only the responsible authority account can update its status or remarks; citizens receive notifications about updates.
- Record progress using `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, or `DUPLICATE`. Updates appear in report history.

The current Authority account has a name, but no separate department/category assignment. Category filtering helps staff find relevant reports; it does not restrict an authority to only one category. The app does not support assigning work to individual personnel or reassigning a claimed report.

## Admin: platform oversight

- Sign in at `http://localhost:5173/admin/login` using the Admin email; there is no separate username.
- View platform totals and recent reports, including the citizen's area, issue location, status, latest remarks, and responsible authority. Dashboard data refreshes every 30 seconds and can be refreshed manually.
- Search and review the citizen directory and authority accounts. Approve or reject pending authority access requests.
- Search and filter reports by status to monitor pending and resolved work across the platform.

The citizen directory is currently read-only. Admin cannot deactivate/delete accounts, edit report status, reassign reports, or create a separate escalation workflow. Approved authority accounts represent participating departments or authorized personnel, but department ownership is not enforced by the data model.

## Workflow

1. A Citizen registers and submits a report with its category, location, and optional evidence photos.
2. An Authority requests access and waits for Admin approval.
3. Admin approves or rejects the Authority request.
4. An approved Authority filters reports, claims an unassigned report, and records progress or resolution remarks.
5. The Citizen receives notifications as the report is updated; Admin monitors platform-wide progress.

## Default Admin login

Local development defaults:

- **Email:** `admin@civicfix.com`
- **Password:** `admin123`

These are not safe production credentials. Set private values in `backend/.env` before deployment. Passwords are hashed before storage.

The seed script reads `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_PHONE`. If they are not set, it uses the defaults above.

To create the Admin account, make sure MongoDB is running and `backend/.env` contains a valid `MONGO_URI`, then run this command from the `backend` directory:

```powershell
npm run seed
```

The seed script creates the Admin if the configured email does not already exist. If it already exists, seeding does not reset its password; changing `ADMIN_PASSWORD` and rerunning the seed will not change an existing account.

## Account collections and data integrity

MongoDB uses **collections** rather than SQL tables. CivicFix stores role-specific account data separately:

- `citizens`: citizen details and login data
- `authorities`: authority details, approval status, and login data
- `admins`: admin details and login data
- `accountidentities`: unique email, role, and account ID, used to find the correct role collection during login

Role-specific schemas restrict each account collection to its own role. The identity collection prevents the same email from being registered in multiple role collections. Reports reference citizens and authorities; status history references authorities; notifications are scoped by account ID and role.

## Main code locations

- Routes and role checks: [`frontend/src/App.jsx`](../frontend/src/App.jsx)
- Registration and login API: [`backend/routes/authRoutes.js`](../backend/routes/authRoutes.js)
- State and district data: [`backend/data/indianLocations.json`](../backend/data/indianLocations.json)
- Citizen account model: [`backend/models/Citizen.js`](../backend/models/Citizen.js)
- Authority account model: [`backend/models/Authority.js`](../backend/models/Authority.js)
- Admin account model: [`backend/models/Admin.js`](../backend/models/Admin.js)
- Unique account identity: [`backend/models/AccountIdentity.js`](../backend/models/AccountIdentity.js)
- Admin seed script: [`backend/utils/seeder.js`](../backend/utils/seeder.js)
- Admin approval API: [`backend/routes/authRoutes.js`](../backend/routes/authRoutes.js)
- Authority issue workflow: [`backend/routes/authorityRoutes.js`](../backend/routes/authorityRoutes.js)
- Authority issue category filter: [`frontend/src/pages/authority/AllIssuesPage.jsx`](../frontend/src/pages/authority/AllIssuesPage.jsx)