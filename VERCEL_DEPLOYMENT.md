# Vercel Deployment Guide for ACME Tickets Demo

## 🎯 Purpose

This deployment creates the **official demo frontend** that showcases the ACME Tickets API. The demo allows developers to:

- 🎮 **Interactive API exploration** - Test all endpoints visually
- 📖 **See the API in action** - Real working examples
- 🔗 **Reference implementation** - Learn UI patterns for ticket management
- 🧪 **API testing tool** - Built-in endpoint tester

**This is a single demo instance, not meant for individual developer deployments.**

## 🚀 Deploy the Demo Frontend to Vercel

### Quick Deploy

1. **Install Vercel CLI** (optional, can also use web interface)
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the command line**
   ```bash
   cd /workspaces/acme-tickets-service
   vercel
   ```

   Or deploy via the Vercel dashboard:
   - Go to https://vercel.com
   - Import this GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment** (if needed)
   - No environment variables needed! The demo auto-detects the API URL

### 📋 What Gets Deployed

The `demo-site/` folder will be deployed as a static site:
- `index.html` - Main demo application
- `test.html` - API connection tester
- `app.js` - Application logic
- `styles.css` - Styling
- `README.md` - Documentation

### 🔧 API Configuration

The demo will need to connect to your API. You have two options:

#### Option 1: Keep Using Codespaces API (Development)
The demo auto-detects Codespaces URLs, but Codespaces ports are temporary.

**Problem:** Codespaces URLs change when you restart the Codespace.

#### Option 2: Deploy API to Production (Recommended)

Deploy the backend API to a permanent host:

**Recommended hosts for the API:**
- **Railway** - Easy Docker deployment
- **Render** - Free tier available
- **Fly.io** - Global edge deployment
- **AWS ECS/Fargate** - Production-grade
- **DigitalOcean App Platform** - Simple Docker deployment

Then update the demo to use your production API URL.

### 🔗 Update API URL for Production

If you deploy the API to a permanent URL, update `demo-site/app.js`:

```javascript
const getApiBaseUrl = () => {
    // Use production API if available
    const PRODUCTION_API = 'https://your-api.railway.app/api/v1';
    
    if (PRODUCTION_API && window.location.hostname !== 'localhost') {
        return PRODUCTION_API;
    }
    
    // Fall back to Codespaces detection for development
    if (window.location.hostname.includes('app.github.dev')) {
        const match = window.location.hostname.match(/^([^-]+(?:-[^-]+)*)-\d+\.app\.github\.dev$/);
        if (match) {
            const codespaceName = match[1];
            return `https://${codespaceName}-3000.app.github.dev/api/v1`;
        }
    }
    
    return 'http://localhost:3000/api/v1';
};
```

### 🌐 Custom Domain (Optional)

After deploying to Vercel, you can add a custom domain:
1. Go to your Vercel project settings
2. Add your domain (e.g., `demo.acme-tickets.com`)
3. Update DNS records as instructed

### ⚡ Expected URLs

After deployment:
- **Demo Site:** `https://acme-tickets-service.vercel.app`
- **Test Page:** `https://acme-tickets-service.vercel.app/test.html`

### 🔒 CORS Configuration

Make sure your API allows requests from the Vercel domain. In `src/app.ts`, update the CORS origin:

```typescript
app.use(cors({
  origin: [
    'https://acme-tickets-service.vercel.app',
    'https://*.vercel.app',  // All Vercel preview deployments
    'http://localhost:8080',  // Local development
    '*'  // Or keep wildcard for development
  ],
  // ... rest of config
}));
```

### 📦 Alternative: Deploy Both Frontend and Backend

You could also:

1. **Deploy API to Railway/Render**
   ```bash
   # Example for Railway
   railway login
   railway init
   railway up
   ```

2. **Deploy Frontend to Vercel**
   ```bash
   vercel
   ```

3. **Update demo to point to Railway API**

### 🎯 Deployment Checklist

- [ ] Backend API deployed to permanent hosting
- [ ] Frontend deployed to Vercel
- [ ] API URL updated in demo (if using production API)
- [ ] CORS configured to allow Vercel domain
- [ ] Database migrations run on production database
- [ ] Demo user created in production database
- [ ] Environment variables set correctly
- [ ] SSL/HTTPS enabled on both frontend and backend
- [ ] Custom domain configured (optional)

### 🧪 Test After Deployment

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check the detected API URL
4. Try logging in with demo credentials
5. Test creating a ticket

### 💡 Pro Tips

1. **Preview Deployments:** Vercel automatically creates preview URLs for each Git commit
2. **Automatic Deployments:** Push to GitHub → Auto-deploy to Vercel
3. **Environment Variables:** Use Vercel dashboard to set production API URL
4. **Analytics:** Enable Vercel Analytics to track usage

### 🆘 Troubleshooting

**"Cannot connect to API"**
- Check if API is accessible: `curl https://your-api.com/health`
- Verify CORS is configured correctly
- Check browser console for specific errors

**"Failed to fetch"**
- API might be down or unreachable
- Check if API requires authentication for health endpoint
- Verify the API URL is correct in browser console

**Login fails**
- Check if demo user exists in production database
- Verify JWT_SECRET is set in production environment
- Check API logs for authentication errors

---

## 🚀 Quick Start Commands

```bash
# Deploy to Vercel (from this repo root)
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

**Ready to deploy!** Run `vercel` from the repository root, and Vercel will handle the rest. 🎉
