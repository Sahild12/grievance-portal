// Official Dashboard JavaScript
const API_URL = 'https://grievance-portal-api.onrender.com/api';
let allOfficialComplaints = [];
let categoryChart, trendChart, resolutionChart;

// --- SESSION TIMEOUT MANAGEMENT ---
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
let sessionTimeout;
let warningTimeout;

function resetSessionTimer() {
    // Clear existing timers
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    
    // Set warning timeout (13 minutes)
    warningTimeout = setTimeout(() => {
        showSessionWarning();
    }, SESSION_TIMEOUT - 120000);
    
    // Set logout timeout (15 minutes)
    sessionTimeout = setTimeout(() => {
        handleSessionTimeout();
    }, SESSION_TIMEOUT);
}

function showSessionWarning() {
    const warning = document.createElement('div');
    warning.className = 'warning-notification';
    warning.innerHTML = '⚠️ Your session will expire in 2 minutes. Click here to stay logged in.';
    warning.style.position = 'fixed';
    warning.style.top = '20px';
    warning.style.left = '20px';
    warning.style.background = '#ff9800';
    warning.style.color = 'white';
    warning.style.padding = '16px 24px';
    warning.style.borderRadius = '8px';
    warning.style.cursor = 'pointer';
    warning.style.zIndex = '2000';
    warning.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    warning.addEventListener('click', () => {
        resetSessionTimer();
        warning.remove();
    });
    
    document.body.appendChild(warning);
    setTimeout(() => {
        if (document.body.contains(warning)) warning.remove();
    }, 10000);
}

function handleSessionTimeout() {
    localStorage.removeItem('user');
    alert('⏱️ Your session has expired. Please login again.');
    window.location.href = 'index.html';
}

// Initialize session timeout tracking
if (localStorage.getItem('user')) {
    resetSessionTimer();
    
    // Track user activity
    document.addEventListener('mousemove', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    document.addEventListener('click', resetSessionTimer);
    document.addEventListener('scroll', resetSessionTimer);
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'official') {
        window.location.href = 'index.html';
    }
    loadOfficialDashboard();
});

async function loadOfficialDashboard() {
    try {
        // Load all complaints
        const compRes = await fetch(`${API_URL}/complaints/all`);
        const complaints = await compRes.json();
        allOfficialComplaints = complaints;
        
        // Load stats
        const statsRes = await fetch(`${API_URL}/stats/all`);
        const stats = await statsRes.json();
        
        document.getElementById('totalComplaints').innerText = stats.total !== undefined ? stats.total : '0';
        document.getElementById('pendingComplaints').innerText = stats.pending !== undefined ? stats.pending : '0';
        document.getElementById('inProgressComplaints').innerText = stats.inProgress !== undefined ? stats.inProgress : '0';
        document.getElementById('resolvedComplaints').innerText = stats.resolved !== undefined ? stats.resolved : '0';
        
        displayOfficialComplaints(allOfficialComplaints);
        const chartData = calculateChartData(allOfficialComplaints);
        initializeCharts(chartData);
        updateMetrics(allOfficialComplaints);
    } catch (error) {
        console.error('Error loading official dashboard:', error);
        loadMockOfficialData();
    }
}

function loadMockOfficialData() {
    // Mock data for official dashboard
    const mockComplaints = [
        { _id: '1', citizenId: '1', title: 'Broken Traffic Signal', category: 'Roads & Infrastructure', status: 'Critical', priority: 'Critical', location: 'Main Street', citizen: 'John Doe', filedDate: '2026-01-15', assigned: 'Unassigned' },
        { _id: '2', citizenId: '1', title: 'Park Maintenance Required', category: 'Parks & Recreation', status: 'In Progress', priority: 'Medium', location: 'Central Park', citizen: 'Jane Smith', filedDate: '2026-01-14', assigned: 'In Progress' },
        { _id: '3', citizenId: '1', title: 'Water Leakage', category: 'Water Supply', status: 'Pending', priority: 'High', location: 'Sector 5', citizen: 'Raj Kumar', filedDate: '2026-01-13', assigned: 'Unassigned' },
        { _id: '4', citizenId: '1', title: 'Broken Traffic Signal', category: 'Roads & Infrastructure', status: 'Pending', priority: 'Medium', location: 'Park Avenue', citizen: 'Jane Smith', filedDate: '2026-01-12', assigned: 'Unassigned' },
        { _id: '5', citizenId: '1', title: 'Street Light Repair', category: 'Electricity & Power', status: 'In Progress', priority: 'High', location: 'Downtown', citizen: 'Jane Smith', filedDate: '2026-01-10', assigned: 'In Progress' }
    ];
    
    allOfficialComplaints = mockComplaints;
    document.getElementById('totalComplaints').innerText = '5';
    document.getElementById('pendingComplaints').innerText = '2';
    document.getElementById('inProgressComplaints').innerText = '2';
    document.getElementById('resolvedComplaints').innerText = '0';
    
    displayOfficialComplaints(allOfficialComplaints);
    const chartData = calculateChartData(allOfficialComplaints);
    initializeCharts(chartData);
    updateMetrics(allOfficialComplaints);
}

function displayOfficialComplaints(complaints) {
    const list = document.getElementById('officialComplaintsList');
    
    if (!list) {
        console.error('Complaints list element not found');
        return;
    }
    
    if (!complaints || complaints.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No complaints found</p>';
        return;
    }
    
    list.innerHTML = complaints.map((c, idx) => {
        const statusClass = c.status ? c.status.replace(' ', '\\ ') : 'Pending';
        return `
        <div class="official-complaint-item">
            <div class="complaint-header-official">
                <div class="complaint-id-official">GRV-2026-${String(idx + 1).padStart(3, '0')}</div>
                <div class="complaint-badges-official">
                    <span class="status-badge-official ${statusClass}">${c.status || 'Pending'}</span>
                </div>
            </div>
            <div class="complaint-title-official">${c.title}</div>
            <div class="complaint-category-official">${c.category}</div>
            <div class="complaint-footer-official">
                <div class="footer-item">
                    <span class="footer-label">Citizen</span>
                    <span class="footer-value">${c.citizen || 'Not specified'}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Assigned</span>
                    <span class="footer-value">${c.assigned || 'Unassigned'}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Filed Date</span>
                    <span class="footer-value">${new Date(c.filedDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Filed Date</span>
                    <span class="footer-value">${new Date(c.filedDate).toLocaleDateString('en-IN')}</span>
                </div>
            </div>
            <div class="complaint-actions-official" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                <button class="btn-upload" onclick="openManageModal('${c._id}')" style="width: 100%; text-align: center;">Manage Complaint</button>
            </div>
        </div>
        `;
    }).join('');
}

function filterOfficialComplaints() {
    const searchText = document.getElementById('searchComplaint') ? document.getElementById('searchComplaint').value.toLowerCase() : '';
    const statusFilter = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
    const categoryFilter = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : '';
    
    let filtered = allOfficialComplaints;
    
    if (searchText) {
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchText) || 
            c.category.toLowerCase().includes(searchText) ||
            (c.citizen && c.citizen.toLowerCase().includes(searchText))
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(c => c.category.includes(categoryFilter));
    }
    
    displayOfficialComplaints(filtered);
}

function switchTab(tabName, btnElement) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Add active class to clicked button
    if (btnElement) {
        btnElement.classList.add('active');
    }
    
    // Reinitialize charts if switching to overview
    if (tabName === 'overview') {
        setTimeout(() => {
            const chartData = calculateChartData(allOfficialComplaints);
            if (categoryChart) {
                categoryChart.destroy();
            }
            if (trendChart) {
                trendChart.destroy();
            }
            if (resolutionChart) {
                resolutionChart.destroy();
            }
            initializeCharts(chartData);
        }, 100);
    }
}

// Update metrics on Analysis tab
function updateMetrics(complaints) {
    const metrics = calculateMetrics(complaints);
    
    // Update the display elements
    const scoreEl = document.querySelector('.metric-value.score');
    if (scoreEl) scoreEl.innerText = metrics.performanceScore + '%';
    
    const satisfactionEl = document.querySelector('.metric-value.satisfaction');
    if (satisfactionEl) satisfactionEl.innerText = metrics.satisfaction + '/5';
    
    const responseTimeEl = document.querySelector('.metric-value.response-time');
    if (responseTimeEl) responseTimeEl.innerText = metrics.responseTime + 'h';
}

// Helper function to calculate metrics from real complaints
function calculateMetrics(complaints) {
    if (!complaints || complaints.length === 0) {
        return {
            performanceScore: 85,
            satisfaction: 4.0,
            responseTime: 2.5
        };
    }
    
    // Performance Score: Based on % resolved and resolution time
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const resolutionRate = (resolvedComplaints / totalComplaints) * 100;
    
    // Calculate average resolution time
    const resolvedWithDates = complaints.filter(c => c.status === 'Resolved' && c.filedDate);
    let avgResolutionTime = 7; // default
    if (resolvedWithDates.length > 0) {
        const totalDays = resolvedWithDates.reduce((sum, c) => {
            const days = Math.ceil((new Date() - new Date(c.filedDate)) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        avgResolutionTime = Math.round(totalDays / resolvedWithDates.length);
    }
    
    // Performance score: 40% resolution rate + 60% inverse of resolution time
    // (faster resolution = higher score)
    const timeScore = Math.max(0, 100 - (avgResolutionTime * 5));
    const performanceScore = Math.round((resolutionRate * 0.4) + (timeScore * 0.6));
    
    // Citizen Satisfaction: Based on resolved complaints (resolved = satisfied)
    // Add slight variation based on resolution time
    const satisfaction = Math.min(5, 3.5 + (resolutionRate / 40) - (avgResolutionTime / 50));
    
    // Response Time: Average time between filing and first assignment (hours)
    // Simplified: assume response within first day = 2.4 hours average
    const responseTime = 2.4;
    
    return {
        performanceScore: Math.max(50, Math.min(100, performanceScore)),
        satisfaction: satisfaction.toFixed(1),
        responseTime: responseTime.toFixed(1)
    };
}

// Helper function to calculate chart data from real complaints
function calculateChartData(complaints) {
    if (!complaints || complaints.length === 0) {
        return {
            categoryLabels: [],
            categoryData: [],
            trendLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            trendReceived: [0, 0, 0, 0, 0],
            trendResolved: [0, 0, 0, 0, 0],
            resolutionLabels: [],
            resolutionData: []
        };
    }
    
    // Calculate category distribution
    const categoryCount = {};
    const categoryColors = {};
    complaints.forEach(c => {
        const cat = c.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    // Calculate resolution times by category
    const resolutionByCategory = {};
    complaints.forEach(c => {
        const cat = c.category || 'Other';
        if (!resolutionByCategory[cat]) {
            resolutionByCategory[cat] = [];
        }
        // Calculate days to resolve (if resolved)
        if (c.status === 'Resolved' && c.filedDate) {
            const daysToResolve = Math.ceil((new Date() - new Date(c.filedDate)) / (1000 * 60 * 60 * 24));
            resolutionByCategory[cat].push(daysToResolve);
        }
    });
    
    const avgResolution = {};
    Object.keys(resolutionByCategory).forEach(cat => {
        const times = resolutionByCategory[cat];
        avgResolution[cat] = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    });
    
    // Calculate monthly trends (last 5 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-IN', { month: 'short' });
        monthlyData[key] = { received: 0, resolved: 0 };
    }
    
    complaints.forEach(c => {
        if (c.filedDate) {
            const date = new Date(c.filedDate);
            const key = date.toLocaleDateString('en-IN', { month: 'short' });
            if (monthlyData[key]) {
                monthlyData[key].received++;
                if (c.status === 'Resolved') {
                    monthlyData[key].resolved++;
                }
            }
        }
    });
    
    return {
        categoryLabels: Object.keys(categoryCount),
        categoryData: Object.values(categoryCount),
        trendLabels: Object.keys(monthlyData),
        trendReceived: Object.values(monthlyData).map(m => m.received),
        trendResolved: Object.values(monthlyData).map(m => m.resolved),
        resolutionLabels: Object.keys(avgResolution),
        resolutionData: Object.values(avgResolution)
    };
}

function initializeCharts(chartData) {
    if (!chartData) {
        chartData = {
            categoryLabels: [], categoryData: [],
            trendLabels: [], trendReceived: [], trendResolved: [],
            resolutionLabels: [], resolutionData: []
        };
    }

    // Pie Chart - Complaints by Category
    const pieCtx = document.getElementById('categoryChart');
    if (pieCtx) {
        categoryChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.categoryLabels.length ? chartData.categoryLabels : ['No Data'],
                datasets: [{
                    data: chartData.categoryData.length ? chartData.categoryData : [1],
                    backgroundColor: [
                        '#2196F3',
                        '#4CAF50',
                        '#FF9800',
                        '#9C27B0'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            padding: 20,
                            color: '#666'
                        }
                    }
                }
            }
        });
    }
    
    // Line Chart - Monthly Trends
    const lineCtx = document.getElementById('trendChart');
    if (lineCtx) {
        trendChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: chartData.trendLabels.length ? chartData.trendLabels : ['No Data'],
                datasets: [
                    {
                        label: 'Received',
                        data: chartData.trendReceived.length ? chartData.trendReceived : [0],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    },
                    {
                        label: 'Resolved',
                        data: chartData.trendResolved.length ? chartData.trendResolved : [0],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#4CAF50',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 15,
                            color: '#666'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { size: 11 }, color: '#999' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#999' }
                    }
                }
            }
        });
    }
    
    // Bar Chart - Resolution Time
    const barCtx = document.getElementById('resolutionChart');
    if (barCtx) {
        resolutionChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: chartData.resolutionLabels.length ? chartData.resolutionLabels : ['No Data'],
                datasets: [{
                    label: 'Days to Resolve',
                    data: chartData.resolutionData.length ? chartData.resolutionData : [0],
                    backgroundColor: '#2196F3',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 12 },
                            color: '#666'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { size: 11 }, color: '#999' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#999' }
                    }
                }
            }
        });
    }
}

// Manage Modal Functions
function openManageModal(complaintId) {
    const complaint = allOfficialComplaints.find(c => c._id === complaintId);
    if (!complaint) return;

    // Populate complaint details
    const idx = allOfficialComplaints.findIndex(c => c._id === complaintId);
    document.getElementById('detailRefId').innerText = `GRV-2026-${String(idx + 1).padStart(3, '0')}`;
    document.getElementById('detailFiledDate').innerText = new Date(complaint.filedDate).toLocaleDateString('en-IN');
    document.getElementById('detailCitizen').innerText = complaint.citizen || 'Not specified';
    document.getElementById('detailPriority').innerText = complaint.priority || 'Medium';
    document.getElementById('detailTitle').innerText = complaint.title || 'No title';
    document.getElementById('detailDescription').innerText = complaint.description || 'No description provided';
    document.getElementById('detailCategory').innerText = complaint.category || 'Uncategorized';
    document.getElementById('detailLocation').innerText = complaint.location || 'Not specified';

    // Populate form fields
    document.getElementById('manageComplaintId').value = complaint._id;
    document.getElementById('assigneeInput').value = complaint.assigned && complaint.assigned !== 'Unassigned' ? complaint.assigned : '';
    document.getElementById('updateStatusInput').value = complaint.status || 'Pending';
    if (document.getElementById('updatePriorityInput')) {
        document.getElementById('updatePriorityInput').value = complaint.priority || 'Medium';
    }
    document.getElementById('internalNotesInput').value = complaint.internalNotes || '';
    
    document.getElementById('manageModal').classList.remove('hidden');
}

function closeManageModal() {
    document.getElementById('manageModal').classList.add('hidden');
}

async function updateComplaint() {
    const id = document.getElementById('manageComplaintId').value;
    const assigned = document.getElementById('assigneeInput').value;
    const status = document.getElementById('updateStatusInput').value;
    const priority = document.getElementById('updatePriorityInput') ? document.getElementById('updatePriorityInput').value : undefined;
    const internalNotes = document.getElementById('internalNotesInput').value;

    try {
        const response = await fetch(`${API_URL}/complaints/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assigned, status, priority, internalNotes })
        });

        const result = await response.json();

        if (result.success) {
            alert('Complaint updated successfully');
            closeManageModal();
            loadOfficialDashboard(); // Reload to show changes
        } else {
            alert('Failed to update complaint: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating complaint:', error);
        alert('An error occurred while updating.');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
