# Database-backed authentication sample

This sample stores users, roles and hashed API keys in a local SQLite database.
SQLite is embedded, so no database server is required.

## Run

Build the workspace packages from the repository root:

```bash
npm run build
```

Then initialize and run the sample:

```bash
cd sample/auth-db
npm run setup
npm run dev
```

`setup` creates `auth.db`, applies the migrations and inserts two demo users.

## Try the routes

```bash
curl.exe http://localhost:3000/public
curl.exe -H "x-api-key: user-demo-key" http://localhost:3000/profile
curl.exe -H "x-api-key: admin-demo-key" http://localhost:3000/admin
curl.exe -H "x-api-key: user-demo-key" http://localhost:3000/admin
```

The final request returns `403` because the user key does not have the `admin`
role. Raw API keys are never stored in the database; the seed script stores
their SHA-256 hashes.

To remove the auth tables:

```bash
npm run migrate:rollback
```
