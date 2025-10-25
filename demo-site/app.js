// API Configuration
// Automatically detect the API URL based on the current host
const getApiBaseUrl = () => {
    // Check for production API URL (can be set via build-time replacement)
    // For Vercel: Set VITE_API_URL in environment variables
    const PRODUCTION_API = typeof window !== 'undefined' && window.PRODUCTION_API_URL;
    
    if (PRODUCTION_API) {
        return PRODUCTION_API;
    }
    
    // If running in Codespaces, use the forwarded port URL
    if (window.location.hostname.includes('app.github.dev')) {
        // Extract the codespace name from the hostname
        const match = window.location.hostname.match(/^([^-]+(?:-[^-]+)*)-\d+\.app\.github\.dev$/);
        if (match) {
            const codespaceName = match[1];
            return `https://${codespaceName}-3000.app.github.dev/api/v1`;
        }
    }
    
    // If deployed to Vercel or other hosting, try to use a production API
    // You can set this to your production API URL
    if (window.location.hostname.includes('vercel.app')) {
        // TODO: Replace with your production API URL
        // return 'https://your-api-production-url.com/api/v1';
        console.warn('Demo is on Vercel but no production API configured. Using Codespaces fallback.');
    }
    
    // Default to localhost for local development
    return 'http://localhost:3000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

// State Management
const state = {
    token: null,
    user: null,
    tickets: [],
    notifications: [],
    webhooks: [],
    currentTicket: null
};

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const options = {
        method,
        headers
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${fullUrl}`);

    try {
        const response = await fetch(fullUrl, options);
        console.log(`[API Response] Status: ${response.status}`);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        console.error('Failed URL:', fullUrl);
        // Add helpful error message for connection issues
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            const errorMsg = `Cannot connect to API at ${API_BASE_URL}. Make sure port 3000 is forwarded and accessible.`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        throw error;
    }
}

// Authentication Functions
async function login(email, password) {
    try {
        const data = await apiRequest('/auth/login', 'POST', { email, password });
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showScreen('login-screen');
}

// UI Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data for the tab
    if (tabName === 'tickets') loadTickets();
    if (tabName === 'notifications') loadNotifications();
    if (tabName === 'webhooks') loadWebhooks();
}

// Tickets Functions
async function loadTickets(filters = {}) {
    try {
        let endpoint = '/tickets?';
        if (filters.status) endpoint += `status=${filters.status}&`;
        if (filters.priority) endpoint += `priority=${filters.priority}&`;
        
        const tickets = await apiRequest(endpoint);
        state.tickets = tickets;
        renderTickets(tickets);
    } catch (error) {
        console.error('Failed to load tickets:', error);
    }
}

function renderTickets(tickets) {
    const container = document.getElementById('tickets-list');
    
    if (tickets.length === 0) {
        container.innerHTML = '<div class="card"><p>No tickets found. Create your first ticket!</p></div>';
        return;
    }

    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-card" onclick="showTicketDetails('${ticket.id}')">
            <div class="ticket-header">
                <div>
                    <div class="ticket-title">${escapeHtml(ticket.title)}</div>
                    <div class="ticket-meta">
                        <span class="status-badge status-${ticket.status}">${ticket.status}</span>
                        <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                    </div>
                </div>
            </div>
            <div class="ticket-description">${escapeHtml(ticket.description.substring(0, 150))}${ticket.description.length > 150 ? '...' : ''}</div>
            <div class="ticket-footer">
                <span>Created by ${escapeHtml(ticket.createdBy.firstName)} ${escapeHtml(ticket.createdBy.lastName)}</span>
                <span>${new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

async function showTicketDetails(ticketId) {
    try {
        const ticket = await apiRequest(`/tickets/${ticketId}`);
        state.currentTicket = ticket;
        
        const modal = document.getElementById('ticket-modal');
        const modalBody = document.getElementById('ticket-modal-body');
        const modalTitle = document.getElementById('modal-title');
        
        modalTitle.textContent = ticket.title;
        
        modalBody.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-meta" style="margin-bottom: 15px;">
                    <span class="status-badge status-${ticket.status}">${ticket.status}</span>
                    <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Description</h4>
                    <p>${escapeHtml(ticket.description)}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h4>Details</h4>
                    <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(ticket.updatedAt).toLocaleString()}</p>
                    <p><strong>Created by:</strong> ${escapeHtml(ticket.createdBy.firstName)} ${escapeHtml(ticket.createdBy.lastName)}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h4>Update Status</h4>
                    <select id="ticket-status-update" style="margin-bottom: 10px;">
                        <option value="OPEN" ${ticket.status === 'OPEN' ? 'selected' : ''}>Open</option>
                        <option value="IN_PROGRESS" ${ticket.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                        <option value="RESOLVED" ${ticket.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                        <option value="CLOSED" ${ticket.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
                    </select>
                    <button class="btn btn-primary" onclick="updateTicketStatus()">Update Status</button>
                </div>

                <div class="comments-section">
                    <h4>Comments (${ticket.comments.length})</h4>
                    <div id="comments-list">
                        ${ticket.comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <span class="comment-author">${escapeHtml(comment.author.firstName)} ${escapeHtml(comment.author.lastName)}</span>
                                    <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <div class="comment-content">${escapeHtml(comment.content)}</div>
                            </div>
                        `).join('') || '<p>No comments yet</p>'}
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <textarea id="new-comment" rows="3" placeholder="Add a comment..."></textarea>
                        <button class="btn btn-primary" onclick="addComment()">Add Comment</button>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4>Attachments (${ticket.attachments.length})</h4>
                    <div id="attachments-list">
                        ${ticket.attachments.map(att => `
                            <div style="padding: 8px; background: var(--bg-color); border-radius: 4px; margin-bottom: 5px;">
                                📎 ${escapeHtml(att.filename)} (${formatBytes(att.fileSize)})
                            </div>
                        `).join('') || '<p style="color: var(--text-muted); font-size: 14px;">No attachments</p>'}
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4>Activity Log</h4>
                    <div id="activities-list">
                        ${ticket.activities.map(activity => `
                            <div style="padding: 8px; font-size: 13px; color: var(--text-muted);">
                                📌 ${activity.type.replace('_', ' ')} - ${new Date(activity.createdAt).toLocaleString()}
                            </div>
                        `).join('') || '<p style="color: var(--text-muted); font-size: 14px;">No activity yet</p>'}
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    } catch (error) {
        alert('Failed to load ticket details: ' + error.message);
    }
}

async function updateTicketStatus() {
    const newStatus = document.getElementById('ticket-status-update').value;
    try {
        await apiRequest(`/tickets/${state.currentTicket.id}`, 'PUT', { status: newStatus });
        alert('Ticket status updated!');
        closeModal('ticket-modal');
        loadTickets();
    } catch (error) {
        alert('Failed to update ticket: ' + error.message);
    }
}

async function addComment() {
    const content = document.getElementById('new-comment').value.trim();
    if (!content) {
        alert('Please enter a comment');
        return;
    }

    try {
        await apiRequest(`/tickets/${state.currentTicket.id}/comments`, 'POST', { content });
        document.getElementById('new-comment').value = '';
        showTicketDetails(state.currentTicket.id); // Reload ticket details
    } catch (error) {
        alert('Failed to add comment: ' + error.message);
    }
}

function showCreateTicketModal() {
    const modal = document.getElementById('ticket-modal');
    const modalBody = document.getElementById('ticket-modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Create New Ticket';
    
    modalBody.innerHTML = `
        <form id="create-ticket-form">
            <input type="text" id="ticket-title" placeholder="Ticket Title" required>
            <textarea id="ticket-description" rows="4" placeholder="Ticket Description" required></textarea>
            
            <select id="ticket-priority">
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM" selected>Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
            </select>
            
            <button type="submit" class="btn btn-primary">Create Ticket</button>
        </form>
    `;
    
    modal.classList.remove('hidden');
    
    document.getElementById('create-ticket-form').onsubmit = async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('ticket-title').value;
        const description = document.getElementById('ticket-description').value;
        const priority = document.getElementById('ticket-priority').value;
        
        try {
            await apiRequest('/tickets', 'POST', { title, description, priority });
            alert('Ticket created successfully!');
            closeModal('ticket-modal');
            loadTickets();
        } catch (error) {
            alert('Failed to create ticket: ' + error.message);
        }
    };
}

// Notifications Functions
async function loadNotifications() {
    try {
        const notifications = await apiRequest('/notifications');
        state.notifications = notifications;
        renderNotifications(notifications);
        updateNotificationBadge();
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="card"><p>No notifications</p></div>';
        return;
    }

    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${!notif.isRead ? 'unread' : ''}" onclick="markNotificationAsRead('${notif.id}')">
            <div class="notification-content">
                <h4>${escapeHtml(notif.title)}</h4>
                <p>${escapeHtml(notif.message)}</p>
                <span class="notification-time">${new Date(notif.createdAt).toLocaleString()}</span>
            </div>
            ${!notif.isRead ? '<div style="color: var(--primary-color); font-weight: bold;">●</div>' : ''}
        </div>
    `).join('');
}

async function markNotificationAsRead(id) {
    try {
        await apiRequest(`/notifications/${id}/read`, 'PUT');
        loadNotifications();
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

async function markAllNotificationsAsRead() {
    try {
        await apiRequest('/notifications/read-all', 'PUT');
        loadNotifications();
    } catch (error) {
        alert('Failed to mark all as read: ' + error.message);
    }
}

function updateNotificationBadge() {
    const unreadCount = state.notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notification-count');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

// Webhooks Functions
async function loadWebhooks() {
    try {
        const webhooks = await apiRequest('/webhooks');
        state.webhooks = webhooks;
        renderWebhooks(webhooks);
    } catch (error) {
        console.error('Failed to load webhooks:', error);
        document.getElementById('webhooks-list').innerHTML = 
            '<div class="card"><p>⚠️ Webhooks require ADMIN or AGENT role. Current user role: ' + state.user.role + '</p></div>';
    }
}

function renderWebhooks(webhooks) {
    const container = document.getElementById('webhooks-list');
    
    if (webhooks.length === 0) {
        container.innerHTML = '<div class="card"><p>No webhooks configured</p></div>';
        return;
    }

    container.innerHTML = webhooks.map(webhook => `
        <div class="webhook-item">
            <div class="webhook-header">
                <div style="flex: 1;">
                    <div class="webhook-url">${escapeHtml(webhook.url)}</div>
                    <div class="webhook-events">
                        ${webhook.events.map(e => `<span class="event-badge">${e}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="${webhook.isActive ? 'active-badge' : 'inactive-badge'}">
                        ${webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button class="btn btn-danger btn-sm" onclick="deleteWebhook('${webhook.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showCreateWebhookModal() {
    document.getElementById('webhook-modal').classList.remove('hidden');
}

async function deleteWebhook(id) {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
        await apiRequest(`/webhooks/${id}`, 'DELETE');
        loadWebhooks();
    } catch (error) {
        alert('Failed to delete webhook: ' + error.message);
    }
}

// API Tester Functions
async function testApiEndpoint() {
    const method = document.getElementById('api-method').value;
    const endpoint = document.getElementById('api-endpoint').value;
    const bodyText = document.getElementById('api-body').value;
    const output = document.getElementById('api-response-output');
    
    let body = null;
    if (bodyText && method !== 'GET') {
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            output.textContent = 'Error: Invalid JSON in request body';
            return;
        }
    }
    
    try {
        output.textContent = 'Loading...';
        const result = await apiRequest(endpoint, method, body);
        output.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Display the API URL being used
    const apiUrlInfo = document.getElementById('api-url-info');
    if (apiUrlInfo) {
        apiUrlInfo.textContent = `API: ${API_BASE_URL}`;
    }

    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        state.token = savedToken;
        state.user = JSON.parse(savedUser);
        showScreen('dashboard-screen');
        updateUserInfo();
        loadTickets();
        loadNotifications();
    }

    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        try {
            await login(email, password);
            errorDiv.classList.add('hidden');
            showScreen('dashboard-screen');
            updateUserInfo();
            loadTickets();
            loadNotifications();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            showTab(tab.dataset.tab);
        });
    });

    // Filter controls
    document.getElementById('status-filter').addEventListener('change', (e) => {
        loadTickets({ status: e.target.value, priority: document.getElementById('priority-filter').value });
    });

    document.getElementById('priority-filter').addEventListener('change', (e) => {
        loadTickets({ status: document.getElementById('status-filter').value, priority: e.target.value });
    });

    // Create ticket button
    document.getElementById('create-ticket-btn').addEventListener('click', showCreateTicketModal);

    // Close modal buttons
    document.getElementById('close-ticket-modal').addEventListener('click', () => closeModal('ticket-modal'));
    document.getElementById('close-webhook-modal').addEventListener('click', () => closeModal('webhook-modal'));

    // Notifications button
    document.getElementById('notifications-btn').addEventListener('click', () => {
        showTab('notifications');
    });

    // Mark all as read button
    document.getElementById('mark-all-read-btn').addEventListener('click', markAllNotificationsAsRead);

    // Create webhook button
    document.getElementById('create-webhook-btn').addEventListener('click', showCreateWebhookModal);

    // Webhook form
    document.getElementById('webhook-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = document.getElementById('webhook-url').value;
        const secret = document.getElementById('webhook-secret').value;
        const eventCheckboxes = document.querySelectorAll('input[name="events"]:checked');
        const events = Array.from(eventCheckboxes).map(cb => cb.value);
        
        if (events.length === 0) {
            alert('Please select at least one event');
            return;
        }
        
        try {
            await apiRequest('/webhooks', 'POST', { url, secret, events });
            alert('Webhook created successfully!');
            closeModal('webhook-modal');
            document.getElementById('webhook-form').reset();
            loadWebhooks();
        } catch (error) {
            alert('Failed to create webhook: ' + error.message);
        }
    });

    // API test button
    document.getElementById('api-test-btn').addEventListener('click', testApiEndpoint);

    // Auto-refresh notifications every 30 seconds
    setInterval(() => {
        if (state.token) {
            loadNotifications();
        }
    }, 30000);
});

function updateUserInfo() {
    document.getElementById('user-name').textContent = 
        `${state.user.firstName} ${state.user.lastName}`;
    document.getElementById('user-role').textContent = state.user.role;
}
