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

`setup` creates `auth.db`, applies the migrations and upserts two demo users.
Running it again preserves users and API keys created through the HTTP API.

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

## Create a user and API key

Create an active user with the `user` role using the admin credential:

```powershell
$headers = @{ "x-api-key" = "admin-demo-key" }
$body = @{ roles = @("user") } | ConvertTo-Json

$user = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/users" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

Use the returned user ID to issue a credential:

```powershell
$body = @{ name = "My API key" } | ConvertTo-Json

$credential = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/users/$($user.id)/api-keys" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body

$credential
```

The second response contains the raw API key. It is returned only once; only
its SHA-256 hash is stored in SQLite.

To remove the auth tables:

```bash
npm run migrate:rollback
```
