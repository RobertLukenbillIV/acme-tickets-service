# Deploy to Render + Neon Guide

## 🎯 Purpose

This guide is for deploying **the official demo instance** of the ACME Tickets API. This demo showcases the API's capabilities for developers who will:

- 🔍 **Explore the API** - Test endpoints via the live demo
- 📚 **Reference the architecture** - Learn from this implementation
- 🔧 **Integrate components** - Copy patterns into their own multi-repo projects
- 🎨 **Use as a backend service** - For their own frontends in separate repos

**Note:** This is for the maintainer to deploy a single demo instance, not for individual developers to clone and host.

---

## Step 1: Create Neon Database

1. **Go to [console.neon.tech](https://console.neon.tech)**
2. Click **"Create Project"**
3. Choose your region (pick one close to your Render region)
4. Copy the connection string:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Neon Features You Get:
- ✅ **Connection Pooling** - Built-in (no PgBouncer needed)
- ✅ **Auto-scaling** - Scales to zero when not in use
- ✅ **Branching** - Create database branches for testing
- ✅ **Free Tier** - 0.5 GB storage, 1 branch

---

## Step 2: Deploy API to Render

### Option A: Using Render Dashboard (Easiest)

1. **Go to [render.com](https://render.com/dashboard)**

2. Click **"New +"** → **"Web Service"**

3. **Connect GitHub Repository:**
   - Authorize Render to access your repos
   - Select: `RobertLukenbillIV/acme-tickets-service`
   - Branch: `copilot/add-tickets-service-api` (or `main`)

4. **Configure Service:**
   - **Name:** `acme-tickets-api`
   - **Environment:** `Docker` (or `Node`)
   - **Region:** Choose same as Neon (e.g., Oregon for us-west)
   - **Branch:** Your default branch
   - **Instance Type:** Free tier is fine for demo

5. **Build Settings (if using Node, not Docker):**
   - **Build Command:**
     ```bash
     npm install && npm run build && npx prisma generate
     ```
   - **Start Command:**
     ```bash
     npx prisma migrate deploy && npm start
     ```

6. **Environment Variables** (Click "Add Environment Variable"):
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=your-super-secret-key-change-this
   NODE_ENV=production
   API_PREFIX=/api/v1
   PORT=10000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

7. Click **"Create Web Service"**

### Option B: Using render.yaml (Blueprint)

1. Push `render.yaml` to your repo (already created)
2. Go to Render Dashboard → **"New +"** → **"Blueprint"**
3. Select your repo
4. Render auto-detects `render.yaml`
5. Set environment variables in the dashboard
6. Click **"Apply"**

---

## Step 3: Update CORS for Production

Update `src/app.ts` to allow your Render and Vercel domains:

```typescript
app.use(cors({
  origin: [
    'https://acme-tickets-service.vercel.app',     // Your Vercel frontend
    'https://*.vercel.app',                         // Vercel preview deployments
    'https://acme-tickets-api.onrender.com',       // Your Render API (for testing)
    'http://localhost:8080',                        // Local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

Commit and push this change - Render will auto-redeploy.

---

## Step 4: Create Demo User

After deployment, access Render's **Shell** (click "Shell" tab in dashboard):

```bash
# Connect to your database
npx prisma studio

# Or use psql directly
psql $DATABASE_URL
```

Then create a tenant and user:

```sql
-- Create tenant
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt") 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Company', 'demo-company', NOW(), NOW());

-- Create user (password: SecurePass123!)
-- Hash generated with bcrypt, cost 10
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "tenantId", "isActive", "createdAt", "updatedAt")
VALUES (
  '2fcbb813-1e3f-41cf-b81a-2d404f891e12',
  'admin@demo.com',
  '$2b$10$YourBcryptHashHere',  -- You'll need to generate this
  'Admin',
  'User',
  'ADMIN',
  '550e8400-e29b-41d4-a716-446655440000',
  true,
  NOW(),
  NOW()
);
```

Or use the API to register a user:
```bash
curl -X POST https://your-app.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

## Step 5: Update Vercel Demo

Update `demo-site/config.js`:

```javascript
window.PRODUCTION_API_URL = 'https://acme-tickets-api.onrender.com/api/v1';
```

Commit and push - Vercel will auto-redeploy.

---

## 🎯 Architecture Overview

```
[User's Browser]
      ↓
[Vercel - Frontend Demo]
      ↓ HTTPS API calls
[Render - Backend API]
      ↓ PostgreSQL connection
[Neon - PostgreSQL Database]
```

---

## 💰 Costs

### Free Tier (Perfect for Demo)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Neon** | ✅ Free Forever | 0.5 GB storage, 1 branch |
| **Render** | ✅ 750 hours/month | Spins down after 15 min idle |
| **Vercel** | ✅ Free Forever | 100 GB bandwidth/month |

**Total Cost: $0** for a demo! 🎉

### Paid (Production)

- **Neon Pro:** $19/month - 20 GB storage, unlimited branches
- **Render Starter:** $7/month - Always on, no spin down
- **Vercel Pro:** $20/month - Advanced features

---

## ⚡ Performance Tips

1. **Use Neon's Connection Pooling:**
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   Note the `-pooler` in the hostname.

2. **Set Prisma Connection Pool:**
   ```typescript
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
     previewFeatures = ["postgresqlExtensions"]
   }
   ```

3. **Use Same Region:**
   - Render Oregon → Neon US West
   - Render Ohio → Neon US East

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in Render environment variables
- Verify Neon database is active (it auto-scales to zero)
- Check Prisma connection pool settings

### "Render service won't start"
- Check logs in Render dashboard
- Verify all environment variables are set
- Check if migrations ran successfully

### "CORS error from frontend"
- Update CORS origins in `src/app.ts`
- Redeploy to Render
- Clear browser cache

---

## 🎉 Expected URLs

After deployment:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://acme-tickets-service.vercel.app` | Demo UI |
| **API** | `https://acme-tickets-api.onrender.com` | Backend |
| **API Docs** | `https://acme-tickets-api.onrender.com/api-docs` | Swagger |
| **Health** | `https://acme-tickets-api.onrender.com/health` | Status |
| **Database** | Neon Console | Database management |

---

## 🚀 Deploy Commands

```bash
# Deploy API to Render (via GitHub)
git push origin main

# Deploy Frontend to Vercel
vercel --prod

# Check API health
curl https://acme-tickets-api.onrender.com/health

# Test login
curl -X POST https://acme-tickets-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"SecurePass123!"}'
```

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs/introduction)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/database/neon)
- [Vercel Deployment](https://vercel.com/docs)

---

**Ready to deploy!** The combination of Render + Neon + Vercel gives you a fully hosted, production-ready demo with zero infrastructure management. 🎯
