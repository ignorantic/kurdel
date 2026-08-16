# Database-backed authentication sample

This sample stores users, roles and hashed API keys in a local SQLite database.
SQLite is embedded, so no database server is required.
It uses the reusable repositories and IoC module from `@kurdel/auth-db`.
User and API-key management services also come from that package; the sample
contains only its HTTP API, application policies, schema, and administration
interface.

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

Open [http://localhost:3000](http://localhost:3000) and sign in with
`admin-demo-key`. The React dashboard keeps the credential in
`sessionStorage`, verifies the admin role, and loads the user list from the
same-origin API. It supports user creation, profile inspection and editing,
status filters, pagination, refresh, and logout. Available roles are loaded
from the database, and validation conflicts are reported without leaving the
page. User deletion requires confirmation, removes associated roles and API
keys, and cannot target the administrator performing the request.

The user detail dialog also manages API keys. It lists credential metadata
without exposing stored hashes, can issue keys with an optional expiration,
shows a new secret exactly once, and supports revocation while retaining the
credential history.

Successful API-key authentication updates the credential's `last_used_at`
timestamp. Refreshing the user detail dialog shows the latest recorded use;
rejected, expired, revoked, and orphaned credentials do not update it.

The sample also persists sanitized security events in `auth_events`. Open a
user detail dialog to view and filter their authentication, authorization, key
issue, and key revocation history. The event records contain identifiers and
safe reason codes only; raw API keys, hashes, JWTs, and request bodies are never
stored.

Migration `0005-create-jwt-sessions.js` demonstrates persisted, revocable JWT
session state. A JWT strategy can use `DatabaseJwtSessionRepository` to require
an active database session matching the token's `jti` and subject.

The sample uses SQLite by default. To run it against PostgreSQL, copy
`db.postgres.config.example.json` to `db.config.json`, replace the example
credentials, and run the same migration, seed, and start commands. The CI suite
also runs the auth schema and user/session workflow against a real PostgreSQL
service.

The sample build produces both the server and the browser bundle. During UI
development, rebuild only the client with `npm run build:client:dev` and reload
the page.

Frontend code is isolated under `src/admin`, including the browser entry,
styles, React components, server-rendered views, and the page controller that
serves the administration shell.

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

User-management mutations and collection routes use the sample's
`manage-users` authorization policy. It requires an API-key credential
belonging to a user with the `admin` role. List the first page, optionally
filtering by `active` or `disabled` status:

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

The `GET /users/:id` route uses a separate `view-user` policy. Administrators
may view any user, while a regular user may only request their own ID. For
example, the seeded user with ID `2` can load their own record:

```powershell
$userHeaders = @{ "x-api-key" = "user-demo-key" }

Invoke-RestMethod `
  -Uri "http://localhost:3000/users/2" `
  -Headers $userHeaders
```

Changing the ID to `1` returns `403 Forbidden`. Update, deletion, role, and
API-key management routes continue to require the stricter `manage-users`
policy, preventing self-service privilege escalation.

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
