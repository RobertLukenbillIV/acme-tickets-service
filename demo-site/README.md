# ACME Tickets - Demo Frontend

A simple, lightweight demo frontend that showcases all the backend API capabilities of the ACME Tickets Service.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RobertLukenbillIV/acme-tickets-service)

1. Click the button above or run: `vercel` from the repo root
2. Vercel will automatically deploy the `demo-site/` folder
3. Update `config.js` with your production API URL (see below)

### Option 2: GitHub Pages

1. Enable GitHub Pages in repo settings
2. Set source to `main` branch and `/demo-site` folder
3. Access at: `https://yourusername.github.io/acme-tickets-service/`

### Option 3: Netlify

1. Connect your GitHub repo to Netlify
2. Set build settings:
   - Base directory: `demo-site`
   - Publish directory: `demo-site`
3. Deploy!

### Option 4: Local/Codespaces

```bash
cd demo-site
python3 -m http.server 8080
```

## ⚙️ Configure Production API

After deploying, update the API URL:

**Edit `config.js`:**
```javascript
window.PRODUCTION_API_URL = 'https://your-api.railway.app/api/v1';
```

**Or set in `index.html`:**
```html
<meta name="api-url" content="https://your-api.railway.app/api/v1">
```

## Features Demonstrated

### ✅ Implemented & Working
- **Authentication** - Login with JWT tokens
- **Ticket Management** - Create, view, update, and list tickets
- **Comments** - Add and view comments on tickets
- **Notifications** - View and manage user notifications
- **Webhooks** - Create and manage webhooks (requires ADMIN/AGENT role)
- **Status & Priority Filtering** - Filter tickets by status and priority
- **Activity Logging** - View ticket activity history
- **File Attachments** - View attachment metadata (files listed)
- **API Tester** - Interactive tool to test any API endpoint
- **Real-time Badge** - Unread notification counter

## Quick Start

### Option 1: Simple HTTP Server (Python)

```bash
cd demo-site
python3 -m http.server 8080
```

Then open: http://localhost:8080

### Option 2: Node.js HTTP Server

```bash
cd demo-site
npx http-server -p 8080
```

Then open: http://localhost:8080

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Demo Credentials

Make sure the backend API is running with the demo tenant and user:

- **Email:** admin@demo.com
- **Password:** SecurePass123!
- **Tenant:** Demo Company (550e8400-e29b-41d4-a716-446655440000)

## Backend Requirements

The backend API must be running on `http://localhost:3000`. Make sure:

1. Docker Compose services are running: `docker-compose up -d`
2. Database migrations are applied
3. Demo tenant and user are created (see main README)

## API Features Coverage

### Fully Implemented ✅
- User login and authentication
- Ticket CRUD operations
- Comment creation and viewing
- Notification management
- Webhook management (ADMIN/AGENT only)
- Activity tracking
- Status and priority updates
- Multi-tenant isolation (automatic via JWT)

### Partial Implementation ⚠️
- **File Attachments**: Shows attachment metadata but doesn't implement the full S3 upload flow
  - Missing: Pre-signed URL generation UI
  - Missing: Actual file upload to S3
  - Missing: File download/preview

### Frontend API Gaps Identified 🔍

Based on testing this demo, here are features the **backend API** should add for a complete frontend experience:

1. **Pagination Support** ⭐ CRITICAL
   - Current: All tickets/notifications returned at once
   - Needed: `GET /api/v1/tickets?page=1&limit=20`
   - Needed: Response with pagination metadata: `{ data: [], total: 100, page: 1, totalPages: 5 }`

2. **Search Functionality** ⭐ HIGH PRIORITY
   - Needed: `GET /api/v1/tickets?search=keyword`
   - Search across title, description, and ticket ID

3. **User Assignment to Tickets**
   - Current: `assignedToId` field exists but no UI to assign users
   - Needed: `GET /api/v1/users?tenantId={id}` - List users in tenant
   - Needed: Ability to update `assignedToId` via PUT

4. **Ticket Statistics/Dashboard** ⭐ HIGH PRIORITY
   - Needed: `GET /api/v1/tickets/stats` - Return counts by status, priority
   - Example response:
     ```json
     {
       "total": 150,
       "byStatus": { "OPEN": 45, "IN_PROGRESS": 30, "RESOLVED": 50, "CLOSED": 25 },
       "byPriority": { "LOW": 20, "MEDIUM": 80, "HIGH": 40, "URGENT": 10 }
     }
     ```

5. **Bulk Operations**
   - Needed: `POST /api/v1/tickets/bulk-update` - Update multiple tickets at once
   - Example: Close all resolved tickets, assign multiple tickets to a user

6. **Enhanced Filtering**
   - Current: Status and priority only
   - Needed: Filter by date range, assignee, creator
   - Needed: `GET /api/v1/tickets?createdAfter=2025-01-01&assignedTo={userId}`

7. **Real-time Updates (Optional)**
   - Needed: WebSocket support for live ticket/notification updates
   - Alternative: Server-Sent Events (SSE) endpoint

8. **File Download URLs**
   - Current: Attachments show metadata only
   - Needed: Pre-signed download URLs in attachment responses
   - Needed: `GET /api/v1/tickets/{id}/attachments/{attachmentId}/download-url`

9. **User Profile Management**
   - Needed: `PUT /api/v1/auth/me` - Update own profile
   - Needed: `PUT /api/v1/auth/me/password` - Change password

10. **Tenant Settings** (Admin only)
    - Current: Tenants have settings field but no UI
    - Needed: `GET /api/v1/tenants/me/settings`
    - Needed: `PUT /api/v1/tenants/me/settings`

11. **Comment Editing**
    - Current: Comments can only be added and deleted
    - The backend supports `PUT /tickets/:ticketId/comments/:id` but needs testing

12. **Notification Filtering**
    - Needed: `GET /api/v1/notifications?isRead=false` - Filter by read status
    - Current: All notifications returned

## Technology Stack

This demo uses **vanilla JavaScript** (no framework dependencies):
- Pure HTML5, CSS3, JavaScript ES6+
- Fetch API for HTTP requests
- LocalStorage for token persistence
- CSS Grid/Flexbox for responsive layout

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- Requires Fetch API

## CORS Configuration

Make sure the backend API has CORS enabled for your frontend origin. The backend already includes CORS middleware in `src/app.ts`.

## Development Notes

### State Management
The app uses a simple global `state` object to manage:
- Authentication token
- Current user info
- Tickets, notifications, and webhooks data
- Current ticket being viewed

### API Integration
All API calls go through the `apiRequest()` helper function which:
- Automatically includes the JWT token
- Handles JSON parsing
- Provides consistent error handling

### Auto-refresh
Notifications are automatically refreshed every 30 seconds when logged in.

## Extending the Demo

To add more features:

1. **Add a new tab**: Update HTML, add tab content, create load/render functions
2. **Add new API call**: Use the `apiRequest()` helper function
3. **Add filtering**: Update the filter controls and modify the `loadTickets()` parameters
4. **Add forms**: Create modal content and handle form submission

## Known Limitations

- No mobile-optimized layout (responsive but basic)
- No keyboard shortcuts
- No drag-and-drop file upload
- No rich text editor for descriptions/comments
- No export functionality (CSV, PDF)
- No dark mode
- No internationalization (i18n)

## Screenshots

The demo includes:
- Login screen with demo credentials pre-filled
- Ticket list with status/priority badges
- Ticket detail modal with comments and activity
- Notifications panel with unread indicators
- Webhook management interface
- Interactive API testing tool

## License

This demo is provided as-is for demonstration purposes.
