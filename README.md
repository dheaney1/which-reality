# CampusLog

Family college visit tracker — rate, compare, and organize campus visits.

## Setup

### Prerequisites
- Node.js 18+
- Supabase project (free at supabase.com)
- College Scorecard API key (free at api.data.gov/signup)

### Install
```bash
npm install
```

### Environment variables

**`server/.env`**
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SCORECARD_API_KEY=...
PORT=3001
```

**`client/.env.local`**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Database
Run `supabase/migrations/001_initial_schema.sql` then `002_seed.sql` in the Supabase SQL editor.

### Development
```bash
npm run dev:client   # React app on :5173
npm run dev:server   # Express API on :3001
```

## Deployment
- **Frontend:** Vercel — set root directory to `client/`
- **Backend:** Railway — set root directory to `server/`
