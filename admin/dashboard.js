// Admin Dashboard JavaScript

const API_BASE = 'http://192.168.31.208:3000/api';
let currentView = 'pending'; // 'pending' or 'all'
let allOrders = [];
let pendingOrders = [];
let confirmAction = null;

// Check Authentication
if (!localStorage.getItem('admin_authenticated')) {
    window.location.href = '/admin/login.html';
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadPendingOrders();
    setupEventListeners();
    // Refresh orders every 10 seconds
    setInterval(loadPendingOrders, 10000);
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab buttons
    document.getElementById('tab-pending').addEventListener('click', () => {
        currentView = 'pending';
        updateTabUI('pending');
        displayOrders(pendingOrders);
        updateStats(); // Recalculate stats for pending orders only
    });

    document.getElementById('tab-all').addEventListener('click', () => {
        currentView = 'all';
        updateTabUI('all');
        loadAllOrders();
    });

    // Modal
    document.getElementById('modal-cancel').addEventListener('click', closeConfirmModal);
    document.getElementById('modal-confirm').addEventListener('click', executeConfirmAction);
    document.getElementById('details-close').addEventListener('click', closeDetailsModal);

    // Revenue toggle
    const revenueToggle = document.getElementById('revenue-toggle');
    if (revenueToggle) {
        // Load saved preference
        const isHidden = localStorage.getItem('revenue_hidden') === 'true';
        if (isHidden) {
            toggleRevenueVisibility(true);
        }
        
        revenueToggle.addEventListener('click', () => {
            const currentHidden = localStorage.getItem('revenue_hidden') === 'true';
            toggleRevenueVisibility(!currentHidden);
        });
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
}

function updateTabUI(tab) {
    const pendingBtn = document.getElementById('tab-pending');
    const allBtn = document.getElementById('tab-all');

    if (tab === 'pending') {
        pendingBtn.classList.add('text-amber-400', 'border-amber-400');
        pendingBtn.classList.remove('text-gray-400', 'border-transparent');
        allBtn.classList.remove('text-amber-400', 'border-amber-400');
        allBtn.classList.add('text-gray-400', 'border-transparent');
    } else {
        allBtn.classList.add('text-amber-400', 'border-amber-400');
        allBtn.classList.remove('text-gray-400', 'border-transparent');
        pendingBtn.classList.remove('text-amber-400', 'border-amber-400');
        pendingBtn.classList.add('text-gray-400', 'border-transparent');
    }
}

// Toggle Revenue Visibility
function toggleRevenueVisibility(hide = null) {
    const revenueText = document.getElementById('total-revenue');
    const revenueToggle = document.getElementById('revenue-toggle');
    const isCurrentlyHidden = revenueText.textContent === '••••••';
    
    // If hide param not provided, toggle current state
    const shouldHide = hide !== null ? hide : !isCurrentlyHidden;
    
    if (shouldHide) {
        revenueText.textContent = '••••••';
        revenueToggle.innerHTML = '<i class="fas fa-eye-slash text-lg"></i>';
        localStorage.setItem('revenue_hidden', 'true');
    } else {
        // Recalculate and show revenue
        const allOrdersData = [...pendingOrders, ...allOrders.filter(o => !pendingOrders.find(p => p.id === o.id))];
        const revenue = allOrdersData.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        revenueText.textContent = '₹' + revenue.toFixed(0);
        revenueToggle.innerHTML = '<i class="fas fa-eye text-lg"></i>';
        localStorage.setItem('revenue_hidden', 'false');
    }
}

// Fetch Pending Orders
async function loadPendingOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders/pending`);
        const data = await response.json();

        if (data.success) {
            pendingOrders = data.orders;
            if (currentView === 'pending') {
                displayOrders(pendingOrders);
            }
            updateStats();
        }
    } catch (error) {
        console.error('Error loading pending orders:', error);
    }
}

// Fetch All Orders
async function loadAllOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders/all`);
        const data = await response.json();

        if (data.success) {
            allOrders = data.orders;
            displayOrders(allOrders);
            updateStats();
        }
    } catch (error) {
        console.error('Error loading all orders:', error);
    }
}

// Display Orders in Table
function displayOrders(orders) {
    const tbody = document.getElementById('orders-tbody');

    if (orders.length === 0) {
        tbody.innerHTML = `<tr>
            <td class="px-4 py-3 text-center text-gray-400" colspan="7">
                <i class="fas fa-inbox text-2xl mb-2"></i><br>No orders found
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        // Handle items - could be string or object
        let items = order.items;
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }
        
        const itemList = items.map(i => `${i.name} (×${i.quantity})`).join(', ');
        const statusColor = order.status === 'PENDING' ? 'text-yellow-400 bg-yellow-900/20' : 
                           order.status === 'COMPLETED' ? 'text-green-400 bg-green-900/20' :
                           'text-red-400 bg-red-900/20';

        return `<tr class="border-b border-amber-900/20 hover:bg-amber-900/10 transition">
            <td class="px-4 py-3 font-bold text-amber-400">#${order.id}</td>
            <td class="px-4 py-3">${order.customer_name}</td>
            <td class="px-4 py-3 text-sm text-gray-300 cursor-pointer hover:text-amber-400" onclick="showOrderDetails(${order.id})">
                <i class="fas fa-details"></i> ${itemList.substring(0, 40)}${itemList.length > 40 ? '...' : ''}
            </td>
            <td class="px-4 py-3 font-bold text-blue-400">₹${order.total_price}</td>
            <td class="px-4 py-3">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor}">
                    ${order.status}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-400">
                ${new Date(order.created_at).toLocaleString('en-IN')}
            </td>
            <td class="px-4 py-3 space-x-2">
                ${order.status === 'PENDING' ? `
                    <button onclick="completeOrder(${order.id})" class="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm transition">
                        <i class="fas fa-check"></i> Mark Complete
                    </button>
                    <button onclick="cancelOrder(${order.id})" class="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm transition">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : `
                    <span class="text-gray-500 text-sm">—</span>
                `}
            </td>
        </tr>`;
    }).join('');
}

// Show Order Details Modal
function showOrderDetails(orderId) {
    let order;

    if (currentView === 'pending') {
        order = pendingOrders.find(o => o.id === orderId);
    } else {
        order = allOrders.find(o => o.id === orderId);
    }

    if (!order) return;

    // Handle items - could be string or object
    let items = order.items;
    if (typeof items === 'string') {
        items = JSON.parse(items);
    }
    
    const itemsHtml = items.map(i => `
        <div class="flex justify-between">
            <span>${i.name} × ${i.quantity}</span>
            <span>₹${i.price * i.quantity}</span>
        </div>
    `).join('');

    const content = document.getElementById('details-content');
    content.innerHTML = `
        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-400 text-sm">Order ID</p>
                    <p class="font-bold text-amber-400">#${order.id}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm">Status</p>
                    <p class="font-bold ${order.status === 'PENDING' ? 'text-yellow-400' : order.status === 'COMPLETED' ? 'text-green-400' : 'text-red-400'}">
                        ${order.status}
                    </p>
                </div>
            </div>
            
            <div>
                <p class="text-gray-400 text-sm mb-2">Customer</p>
                <p class="font-bold">${order.customer_name}</p>
            </div>

            <div>
                <p class="text-gray-400 text-sm mb-2">Items</p>
                <div class="bg-[#2A201E] p-3 rounded space-y-2 text-sm">
                    ${itemsHtml}
                    <div class="border-t border-amber-900/30 pt-2 mt-2">
                        <div class="flex justify-between font-bold">
                            <span>Total</span>
                            <span class="text-blue-400">₹${order.total_price}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-400">Ordered At</p>
                    <p class="font-mono text-amber-300">${new Date(order.created_at).toLocaleString('en-IN')}</p>
                </div>
                ${order.payment_completed_at ? `
                    <div>
                        <p class="text-gray-400">Paid At</p>
                        <p class="font-mono text-green-300">${new Date(order.payment_completed_at).toLocaleString('en-IN')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('details-modal').classList.remove('hidden');
    document.getElementById('details-modal').classList.add('flex');
}

function closeDetailsModal() {
    document.getElementById('details-modal').classList.add('hidden');
    document.getElementById('details-modal').classList.remove('flex');
}

// Complete Order
function completeOrder(orderId) {
    confirmAction = async () => {
        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                alert('Order marked as COMPLETED!');
                loadPendingOrders();
                loadAllOrders();
            }
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Error: ' + error.message);
        }
        closeConfirmModal();
    };

    const order = pendingOrders.find(o => o.id === orderId);
    document.getElementById('modal-title').textContent = 'Confirm Order';
    document.getElementById('modal-message').textContent = `Mark order #${orderId} (${order.customer_name}) as COMPLETED?`;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

// Cancel Order
function cancelOrder(orderId) {
    confirmAction = async () => {
        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                alert('Order CANCELLED!');
                loadPendingOrders();
                loadAllOrders();
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Error: ' + error.message);
        }
        closeConfirmModal();
    };

    const order = pendingOrders.find(o => o.id === orderId);
    document.getElementById('modal-title').textContent = 'Cancel Order';
    document.getElementById('modal-message').textContent = `Cancel order #${orderId} (${order.customer_name})?`;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    confirmAction = null;
}

function executeConfirmAction() {
    if (confirmAction) {
        confirmAction();
    }
}

// Update Statistics
function updateStats() {
    let statsData;
    
    // Show stats based on current tab view
    if (currentView === 'pending') {
        statsData = pendingOrders;
    } else {
        statsData = allOrders;
    }
    
    const completed = statsData.filter(o => o.status === 'COMPLETED');
    const total = statsData.length;
    const revenue = statsData.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    document.getElementById('total-orders').textContent = total;
    document.getElementById('pending-orders').textContent = pendingOrders.length;
    document.getElementById('completed-orders').textContent = completed.length;
    
    // Update revenue only if not hidden
    const isHidden = localStorage.getItem('revenue_hidden') === 'true';
    if (!isHidden) {
        document.getElementById('total-revenue').textContent = '₹' + revenue.toFixed(0);
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_authenticated');
        window.location.href = '/admin/login.html';
    }
}
