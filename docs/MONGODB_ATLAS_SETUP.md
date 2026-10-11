# MongoDB Atlas Setup for CivicFix

## 1. Create a cluster

1. In your Atlas project, open **Database > Clusters** and select **Build a Cluster**.
2. Choose the free **M0** option if available, select a region, and create the cluster.
3. Wait until the cluster is ready.

## 2. Create a database user

1. Open **Security > Database Access** and select **Add New Database User**.
2. Choose password authentication and create a username with a strong, unique password.
3. Grant the user the built-in **readWrite** role for the `civicfix` database, if available.
4. Save the credentials in a password manager. Atlas does not show an existing password again; reset it if forgotten.

Use a separate database user for each application. Database users belong to an Atlas project, so limit each user to its app's database where possible.

## 3. Allow the app to connect

1. Open **Security > Network Access** and select **Add IP Address**.
2. Add the app host's outbound IP address if it is fixed.
3. If the host has changing IP addresses, Atlas may require `0.0.0.0/0` (allow access from anywhere). This is broader access, so use a strong database password and least-privilege database role.

## 4. Copy the connection string

1. Go to **Database > Clusters**, select **Connect**, then **Drivers**.
2. Copy the connection string Atlas provides.
3. Replace the username and `<db_password>` placeholders with the database user's credentials. Add `/civicfix` after the cluster hostname and before `?` if no database name is present.

The URI should have this general shape:

```text
mongodb+srv://<USERNAME>:<URL_ENCODED_PASSWORD>@<CLUSTER_HOST>/civicfix?retryWrites=true&w=majority&appName=<APP_NAME>
```

Do not include the angle brackets. URL-encode reserved characters in the password, such as `@`, `/`, or `:`. Keep any query parameters Atlas supplied.

## 5. Keep the URI private

CivicFix reads the URI from the `MONGO_URI` environment variable. For deployment, add it as a secret environment variable in the hosting provider. Do not commit it to Git or share it publicly. The database is created automatically when the app first writes data.
