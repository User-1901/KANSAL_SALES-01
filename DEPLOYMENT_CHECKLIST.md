# 🚀 Zenith Atelier - Deployment Checklist

## Pre-Deployment Checklist

- [ ] All code is working locally (`npm run dev:backend` & `npm run dev:frontend`)
- [ ] No console errors or warnings
- [ ] All tests pass (`npm test`)
- [ ] Code is pushed to GitHub repository
- [ ] You have a GitHub account with this repo

## Railway Setup Checklist

### Account & Project Setup
- [ ] Create Railway.app account (connect via GitHub)
- [ ] Create new Railway project from your GitHub repo
- [ ] Railroad will detect monorepo structure automatically

### Database Setup
- [ ] Add PostgreSQL plugin/service in Railway
- [ ] Copy the auto-generated `DATABASE_URL`
- [ ] Paste `DATABASE_URL` into Railway project variables

### Environment Variables
Set these in Railway Dashboard → Variables:

**Required:**
- [ ] `DATABASE_URL` (auto-set by Railway)
- [ ] `PORT=3000`
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_ORIGIN` (your Railway domain, e.g., `https://app-prod-xxxxxxx.up.railway.app`)
- [ ] `JWT_SECRET` (random string: generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

**Optional (but important for features):**
- [ ] `RAZORPAY_KEY_ID` (Razorpay payment integration)
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `EMAIL_SERVICE=gmail`
- [ ] `EMAIL_USER` (for password resets)
- [ ] `EMAIL_PASSWORD` (app-specific password for Gmail)

### Deployment
- [ ] Click "Deploy" in Railway dashboard
- [ ] Watch deployment logs (should show build progress)
- [ ] Wait for "Build successful"
- [ ] Check health endpoint: `https://your-app.up.railway.app/health`

### Post-Deployment
- [ ] Run admin seeding: `railway run npm run seed:admin --workspace=backend`
- [ ] Test API endpoints from browser: `https://your-app.up.railway.app/api/products`
- [ ] Verify frontend loads: `https://your-app.up.railway.app`
- [ ] Update frontend API URLs to use production domain

## File Changes Made

✅ Files created/modified for deployment:

1. **`.env.example`** - Template for environment variables
2. **`DEPLOYMENT_GUIDE.md`** - Step-by-step deployment instructions
3. **`Procfile`** - Tells Railway how to run the app
4. **`vercel.json`** - Configuration for various deployment platforms
5. **`.github/workflows/deploy.yml`** - Automated CI/CD pipeline
6. **`backend/src/app.ts`** - Modified to serve frontend build in production

## After GitHub Push

Push all your code to GitHub:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## Monitoring & Logs

In Railway dashboard:
- **Deployments tab** → View build logs
- **Monitoring tab** → See CPU/Memory usage
- **Logs** → Real-time application output

## Common Issues & Solutions

### Build Fails
→ Check error in Railway Logs tab (usually missing env variables)

### CORS Error
→ Update `CLIENT_ORIGIN` in Railway variables to match your domain

### Database Connection Fails
→ Verify `DATABASE_URL` is set and PostgreSQL service is running

### Frontend Not Loading
→ Check that frontend build is being copied to backend/dist

## Rollback

If deployment breaks:
1. Go to Railway → Deployments
2. Click previous working deployment
3. Click "Rollback" button

## Support

- Railway Docs: https://docs.railway.app
- Issues? Check Railway dashboard logs for error details
