// Official Dashboard JavaScript
const API_URL = 'http://localhost:3000/api';
let allOfficialComplaints = [];
let categoryChart, trendChart, resolutionChart;

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
        
        document.getElementById('totalComplaints').innerText = stats.total || '88';
        document.getElementById('pendingComplaints').innerText = stats.pending || '15';
        document.getElementById('inProgressComplaints').innerText = stats.inProgress || '28';
        document.getElementById('resolvedComplaints').innerText = stats.resolved || '45';
        
        displayOfficialComplaints(allOfficialComplaints);
        initializeCharts();
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
    document.getElementById('totalComplaints').innerText = '88';
    document.getElementById('pendingComplaints').innerText = '15';
    document.getElementById('inProgressComplaints').innerText = '28';
    document.getElementById('resolvedComplaints').innerText = '45';
    
    displayOfficialComplaints(allOfficialComplaints);
    initializeCharts();
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
            if (categoryChart && typeof categoryChart.resize === 'function') {
                categoryChart.resize();
            }
            if (trendChart && typeof trendChart.resize === 'function') {
                trendChart.resize();
            }
            if (resolutionChart && typeof resolutionChart.resize === 'function') {
                resolutionChart.resize();
            }
        }, 100);
    }
}

function initializeCharts() {
    // Pie Chart - Complaints by Category
    const pieCtx = document.getElementById('categoryChart');
    if (pieCtx) {
        categoryChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Roads', 'Water', 'Electricity', 'Other'],
                datasets: [{
                    data: [38, 34, 12, 16],
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
                labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [
                    {
                        label: 'Received',
                        data: [65, 75, 70, 80, 85],
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
                        data: [60, 68, 65, 75, 80],
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
                labels: ['Roads', 'Water', 'Electricity', 'Parks'],
                datasets: [{
                    label: 'Days to Resolve',
                    data: [7, 5, 10, 4],
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

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function initializeCharts() {
    // Pie Chart - Complaints by Category
    const pieCtx = document.getElementById('categoryChart');
    if (pieCtx) {
        categoryChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Roads', 'Water', 'Electricity', 'Other'],
                datasets: [{
                    data: [38, 34, 12, 16],
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
                labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [
                    {
                        label: 'Received',
                        data: [65, 75, 70, 80, 85],
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
                        data: [60, 68, 65, 75, 80],
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
                labels: ['Roads', 'Water', 'Electricity', 'Parks'],
                datasets: [{
                    label: 'Days to Resolve',
                    data: [7, 5, 10, 4],
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

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Manage Modal Functions
function openManageModal(complaintId) {
    const complaint = allOfficialComplaints.find(c => c._id === complaintId);
    if (!complaint) return;

    document.getElementById('manageComplaintId').value = complaint._id;
    document.getElementById('assigneeInput').value = complaint.assigned !== 'Unassigned' ? complaint.assigned : '';
    document.getElementById('updateStatusInput').value = complaint.status || 'Pending';
    
    document.getElementById('manageModal').classList.remove('hidden');
}

function closeManageModal() {
    document.getElementById('manageModal').classList.add('hidden');
}

async function updateComplaint() {
    const id = document.getElementById('manageComplaintId').value;
    const assigned = document.getElementById('assigneeInput').value;
    const status = document.getElementById('updateStatusInput').value;

    try {
        const response = await fetch(`${API_URL}/complaints/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assigned, status })
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
