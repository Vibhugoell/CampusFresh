// --- DOM ELEMENT CACHING ---
const firstNameEl = document.getElementById('firstname');
const activeItemsCountEl = document.getElementById('active-items-count');
const activeStatusTextEl = document.getElementById('active-status-text');
const activeStatusDateEl = document.getElementById('active-status-date');
const activeStatusIconEl = document.getElementById('active-status-icon');
const historyListEl = document.getElementById('submission-history-list');

// --- UTILITY FUNCTIONS ---

// Assume this function exists in your main JS file for mobile navigation
function myMenuFunction() {
    // ... (Your mobile menu function logic) ...
}

// Assume this function exists in your main JS file for logging out
function logout() {
    localStorage.removeItem('userEmail'); // Example: clear user data
    localStorage.removeItem('firstname');
    window.location.href = 'login.html';
}

/**
 * Formats a date string for display.
 * @param {string} dateString 
 * @returns {string} Formatted date.
 */
function formatDate(dateString) {
    if (!dateString) return '--';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Maps status text to CSS classes for styling.
 * @param {string} status 
 * @returns {string} CSS class name.
 */
function getStatusClass(status) {
    if (status.toLowerCase().includes('process')) return 'processing-status';
    if (status.toLowerCase().includes('ready')) return 'ready-status'; // Need to define 'ready-status' in CSS
    if (status.toLowerCase().includes('pickup')) return 'ready-status';
    if (status.toLowerCase().includes('delivered')) return 'success-status'; // Need to define 'success-status'
    return '';
}

// --- FETCHING & RENDERING LOGIC ---

/**
 * Fetches user data and updates the dashboard.
 */
async function loadDashboardData() {
    const userEmail = localStorage.getItem('userEmail');
    const firstName = localStorage.getItem('firstname') || 'User';

    if (!userEmail) {
        // Redirect if not logged in
        window.location.href = 'login.html';
        return;
    }

    // 1. Update Welcome Message
    firstNameEl.textContent = firstName;

    // 2. Fetch data (MOCK API CALL)
    // Replace this MOCK fetch with a real endpoint that returns the user's laundry data
    try {
        // MOCK DATA structure you expect from the server:
        const mockResponse = {
            activeOrder: {
                id: 101,
                status: "In Process",
                totalItems: 4,
                lastUpdate: "2025-06-18T10:00:00Z"
            },
            history: [
                { id: 100, status: "Ready for Pickup", totalItems: 6, date: "2025-06-16T09:30:00Z" },
                { id: 99, status: "Delivered", totalItems: 8, date: "2025-06-12T15:00:00Z" },
            ]
        };
        
        // For a real app, use: 
        // const response = await fetch(`/api/dashboard?email=${userEmail}`);
        // const data = await response.json();
        const data = mockResponse; // Using mock data for immediate functionality

        renderActiveStatus(data.activeOrder);
        renderSubmissionHistory(data.history);

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Display an error message to the user
    }
}

/**
 * Renders the active order status card.
 * @param {Object} order - The active order data or null.
 */
function renderActiveStatus(order) {
    if (order && order.status !== 'Delivered') {
        const statusClass = getStatusClass(order.status);
        
        activeItemsCountEl.textContent = `${order.totalItems} items`;
        activeStatusTextEl.textContent = order.status;
        activeStatusDateEl.textContent = formatDate(order.lastUpdate);
        
        // Apply styling class
        activeStatusTextEl.className = `data-status ${statusClass}`;
        activeStatusIconEl.className = `bx bx-loader-circle status-icon ${statusClass}`;
    } else {
        // No active order or already delivered
        activeItemsCountEl.textContent = '--';
        activeStatusTextEl.textContent = 'No Active Order';
        activeStatusDateEl.textContent = '--';
        activeStatusTextEl.className = 'data-status';
        activeStatusIconEl.className = 'bx bx-loader-circle status-icon';
    }
}

/**
 * Renders the recent submission history list.
 * @param {Array<Object>} history - List of past orders.
 */
function renderSubmissionHistory(history) {
    historyListEl.innerHTML = ''; // Clear existing list
    
    if (history && history.length > 0) {
        // Show only the last 3 items for "Recent Updates"
        const recentHistory = history.slice(0, 3); 

        recentHistory.forEach(order => {
            const statusClass = getStatusClass(order.status);
            const statusIcon = statusClass.includes('ready') ? 'bx bxs-check-circle' : 'bx bxs-check-shield';
            const li = document.createElement('li');
            li.className = statusClass.includes('ready') ? 'success' : 'resolved';
            
            li.innerHTML = `
                <i class='${statusIcon}'></i> 
                Order #${order.id} (${order.totalItems} items) - Status: ${order.status}
            `;
            historyListEl.appendChild(li);
        });
    } else {
        historyListEl.innerHTML = `
            <li class="info">
                <i class='bx bxs-info-circle'></i> No previous submission history found.
            </li>`;
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', loadDashboardData);