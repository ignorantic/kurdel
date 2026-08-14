# Database-backed authentication sample

This sample stores users, roles and hashed API keys in a local SQLite database.
SQLite is embedded, so no database server is required.
It uses the reusable repositories and IoC module from `@kurdel/auth-db`.

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

Set `PORT` to run another instance on a different port, for example
`$env:PORT = 3001` in PowerShell before `npm run dev`.

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
$body = @{
  name = "Ada Lovelace"
  email = "ada@example.test"
  roles = @("user")
} | ConvertTo-Json

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

## Manage users

All user-management routes require an API key with the `admin` role. List the
first page, optionally filtering by `active` or `disabled` status:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/users?limit=20&offset=0&status=active" `
  -Headers $headers
```

Load one user:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/users/$($user.id)" `
  -Headers $headers
```

Update any combination of the user's name, email, status, and roles:

```powershell
$body = @{
  name = "Ada Byron"
  email = "ada.byron@example.test"
  status = "disabled"
  roles = @("user")
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Patch `
  -Uri "http://localhost:3000/users/$($user.id)" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

Email addresses are normalized to lowercase and must be unique. User creation
and role replacement run in database transactions.

To remove the auth tables:

```bash
npm run migrate:rollback
```
