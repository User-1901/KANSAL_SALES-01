# Deployment Guide - Render.com

Deploy **Zenith Atelier** to Render.com in minutes. Render is simpler than Railway with better free tier support.

## Prerequisites

- GitHub account (with your Zenith Atelier repo pushed)
- Credit card (for productions service, but free PostgreSQL tier available)

## Step 1: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

## Step 2: Deploy Backend

### Option A: Using Web Service (Recommended)

1. Click **"New +"** → **"Web Service"**
2. Search for and select your **Zenith Atelier** repo
3. Configure as follows:
   - **Name:** `zenith-atelier-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm install --workspace=backend && npm run build:backend`
   - **Start Command:** `cd backend && node dist/index.js`
   - **Instance Type:** Free (or Starter for production)

4. Click **"Create Web Service"**

### Step 3: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `zenith-atelier-db`
   - **Database:** `zenith_atelier`
   - **Region:** Same as your web service
   - **Instance Type:** Free (or Standard for production)

4. Click **"Create database"** and wait for it to initialize (5-10 minutes)

## Step 4: Create Redis (Optional but Recommended)

1. Click **"New +"** → **"Redis"**
2. Configure:
   - **Name:** `zenith-atelier-redis`
   - **Region:** Same as others
   - **Instance Type:** Free

## Step 5: Link Database to Backend Service

1. Go to your **Backend Web Service** → **Environment**
2. Add environment variables:

```
DATABASE_URL={Your PostgreSQL connection string - copy from PostgreSQL service page}
REDIS_URL={Your Redis URL - copy from Redis service page}
PORT=3000
NODE_ENV=production
CLIENT_ORIGIN=https://your-backend.onrender.com
JWT_SECRET=your_random_secret_key_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
ADMIN_EMAIL=admin@zenith-atelier.com
ADMIN_PASSWORD=your_admin_password
```

3. Save and redeploy

## Step 6: Run Database Migrations

After backend is online:

1. Get your backend URL (appears in web service dashboard, usually `https://your-app.onrender.com`)
2. Via curl or Postman, trigger your seed endpoint:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/admin/seed
   ```

Or connect via PostgreSQL client and run migrations manually:
```bash
psql {DATABASE_URL}
```

Then run SQL files from `backend/migrations/` in order.

## Step 7: Deploy Frontend

### Option A: Deploy to Render too

1. Click **"New +"** → **"Static Site"**
2. Configre:
   - **Name:** `zenith-atelier-frontend`
   - **Build Command:** `npm install && npm install --workspace=frontend && npm run build:frontend`
   - **Publish Directory:** `frontend/dist`

### Option B: Deploy to Vercel (Easier)

If you want the easiest frontend hosting:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set build command: `npm run build:frontend`
4. Set output directory: `frontend/dist`
5. Add any env variables and deploy

## Step 8: Update Frontend API URL

Update your frontend API configuration to use your Render backend URL:

**File:** `frontend/src/api/client.ts` (or similar):
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.onrender.com';

const client = axios.create({
  baseURL: API_BASE_URL,
});
```

Or create `.env.production`:
```
VITE_API_URL=https://your-backend.onrender.com
```

## Step 9: Enable Auto-Deploys

1. Both services should auto-deploy on GitHub push
2. Check **Render Dashboard** → Each service → **Deploys** tab to see build logs

---

## Render URLs You'll Get

- **Backend:** `https://your-backend.onrender.com`
- **Frontend (on Render):** `https://your-frontend.onrender.com`
- **Frontend (on Vercel):** `https://your-project.vercel.app`
- **PostgreSQL:** Auto-connection via `DATABASE_URL` env var

---

## Troubleshooting

### Backend Won't Deploy
- Check **Logs** tab in service dashboard
- Ensure all dependencies in `package.json`
- Verify Build & Start commands match your project structure

### Database Connection Fails
- Copy exact `DATABASE_URL` from PostgreSQL service (not just partial)
- Ensure PostgreSQL service is in "Available" status
- Check firewall/IP whitelist (Render auto-allows)

### CORS Errors
- Update `CLIENT_ORIGIN` environment variable to match frontend URL
- Restart backend service after changing env vars

### Frontend Can't Reach Backend
- Set correct `API_URL` in frontend `.env`
- Ensure backend is running (check service logs)
- Check CORS headers in backend

### Free Tier Limitations
- Free Web Service spins down after 15 mins of inactivity
- Free Database has 1GB storage limit
- For production: upgrade to Starter ($7/month) or Standard tiers

---

## Cost Comparison

| Service | Cost |
|---------|------|
| Backend (Free) | $0 (spins down) |
| Backend (Starter) | $7/month |
| PostgreSQL (Free) | $0 (1GB) |
| PostgreSQL (Standard) | $15/month |
| Redis (Free) | $0 (100MB) |
| **Frontend on Render** | Free |
| **Frontend on Vercel** | Free |

---

## Next Steps

1. Push your repo to GitHub
2. Create Render account and connect
3. Follow steps 2-5 above
4. Test your API and frontend integration
5. Upgrade to paid tiers when ready for production

Have questions? Check [Render Docs](https://render.com/docs)
