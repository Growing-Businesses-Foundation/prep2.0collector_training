# Collector Training Management System

A role-based Next.js application for recording field training sessions and the collectors registered during those sessions. Training evidence photos are stored in Google Drive, operational data is stored in MongoDB, and important actions are written to an audit log.

## What The Application Does

The application supports this workflow:

1. A user signs in with an active account stored in MongoDB.
2. An authorized user creates a training session with the date, location, facilitator, expected collector count, GPS coordinates, and an evidence photo.
3. The evidence photo is uploaded to the configured Google Drive folder.
4. The training session is stored in MongoDB with an initial status of `Not Started`.
5. Collectors are added to the training session one at a time.
6. The session status is updated automatically:
	- `Not Started` when no collectors have been recorded
	- `In Progress` when some, but not all, expected collectors have been recorded
	- `Completed` when the expected count is reached
7. Dashboard statistics and audit activity reflect the saved records.

The root route redirects authenticated users to `/dashboard` and unauthenticated users to `/login`.

## Main Features

- Dashboard statistics for training sessions and collectors
- Training session creation with image upload and location data
- Collector registration with Nigerian mobile-number validation
- Role-based access control
- Field-officer-scoped views for write users
- Google Drive storage for training evidence photos
- Admin audit-log search, filtering, pagination, and activity statistics
- MongoDB-backed field officer and training data

## Technology

- Next.js 16 with the App Router
- React 19 and TypeScript
- NextAuth credentials authentication with JWT sessions
- MongoDB Node.js driver
- Google Drive API through `googleapis`
- Tailwind CSS 4

## Prerequisites

- Node.js 20 or later
- npm
- A MongoDB deployment and database
- A Google Cloud service account with access to the Drive folder used for uploads

## Configuration

Create a `.env.local` file at the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
MONGODB_DB=prep
NEXTAUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

The Google Drive integration also expects a service-account key file at:

```text
google-drive-service-account.json
```

The file is loaded by `lib/google-drive.ts` from the project root. The service account must have permission to add files to the configured Drive folder. Keep both the JSON key and all environment files private; do not commit credentials.

Training photos must be images smaller than 10 MB. The application stores the returned Drive file ID and link with the MongoDB training-session record.

## Installation And Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript without emitting files |
| `npx tsx scripts/seed-field-officers.ts` | Seed or update the default field officers |

The seed script uses the same `MONGODB_URI` and `MONGODB_DB` values as the application.

## Roles And Permissions

| Role | Access |
| --- | --- |
| `ADMIN` | View all data, create training sessions for any active field officer, add collectors, and view audit logs |
| `WRITE` | Create training sessions for the signed-in field officer, add collectors to that officer's sessions, and view scoped data |
| `READ_ONLY` | View all training sessions and collectors, dashboard statistics, and other read-only screens; cannot create records or view admin audit logs |

Accounts are read from the MongoDB `users` collection. Passwords are compared against bcrypt hashes, and only users with `isActive: true` can sign in. The repository does not include a user-seeding script, so an initial user must be provisioned separately with a correctly generated bcrypt password hash.

## Data Model

The application uses these MongoDB collections:

- `users`: login accounts, roles, active state, and optional field-officer assignment
- `field_officers`: field officer IDs, names, and active state
- `training_sessions`: training details, expected collector count, status, coordinates, and Google Drive photo metadata
- `collectors`: collector details linked to a training session through `trainingSessionId`
- `audit_logs`: authentication, training, and collector activity records

The default field-officer seed data includes `FO 1` through `FO 6`. Run the seed command after the database and environment variables are configured.

## Application Routes

### Pages

- `/login` - sign in
- `/dashboard` - summary statistics and recent training sessions
- `/training` - list training sessions
- `/training/new` - create a training session
- `/training/[trainingSessionId]/collectors` - view collectors for one session
- `/collectors` - list collectors
- `/collectors/new` - add a collector
- `/admin/activity` - admin-only audit activity view

### API routes

- `GET /api/dashboard` - dashboard statistics and recent sessions
- `POST /api/training-sessions` - create a training session and upload its photo
- `POST /api/collectors` - add a collector and update the parent session status
- `GET /api/admin/audit-logs` - retrieve filtered, paginated audit logs for admins
- `/api/auth/[...nextauth]` - NextAuth credentials authentication

Protected API routes return `401` for unauthenticated requests and `403` when the signed-in user's role is not allowed to perform the operation.

## Project Structure

```text
app/                 Next.js pages and API route handlers
components/          Reusable UI and form components
lib/                 Authentication, MongoDB, Google Drive, dashboard, and audit logic
lib/models/          Domain model types
scripts/              Database utility scripts
types/               Shared TypeScript declarations and types
public/               Static assets
```

## Production Notes

- Set `NEXTAUTH_SECRET` to a strong, stable secret in the deployment environment.
- Restrict the Google service-account key and grant it access only to the required Drive folder.
- Use a MongoDB user with only the permissions this application needs.
- Configure environment variables through the hosting platform rather than committing `.env.local`.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment.
