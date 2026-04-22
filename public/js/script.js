const API_URL = 'http://localhost:3000/api';
let selectedRole = 'citizen'; // Track selected role
let allComplaints = []; // Store all complaints for filtering

// --- ROLE TOGGLE ---
const roleBtns = document.querySelectorAll('.role-btn');
roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        roleBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedRole = e.target.dataset.role;
        
        // Update button text
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.innerText = `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`;
        }
    });
});

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idNumber = document.getElementById('idInput').value;
        const password = document.getElementById('passwordInput').value;
        
        console.log('Login attempt:', { idNumber, role: selectedRole });

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idNumber, password, role: selectedRole })
            });
            
            if (!res.ok) {
                throw new Error(`Login API error: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Login response:', data);
            
            if (data.success) {
                console.log('Login successful for:', data.user.name);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Route based on role
                if (data.user.role === 'official') {
                    window.location.href = 'official-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                console.warn('Login failed:', data.message);
                alert('❌ Login Failed - Invalid Credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('❌ Login Error: ' + error.message);
        }
    });
}

// --- DASHBOARD LOGIC ---
async function loadDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    console.log('Loading dashboard for user:', user.name);
    
    // Update greeting
    const greeting = document.getElementById('userGreeting');
    if (greeting) {
        greeting.innerText = `Welcome back, ${user.name}`;
    }

    try {
        // Load stats
        console.log('Fetching stats from:', `${API_URL}/stats/${user._id}`);
        const statsRes = await fetch(`${API_URL}/stats/${user._id}`);
        
        if (!statsRes.ok) {
            throw new Error(`Stats API error: ${statsRes.status}`);
        }
        
        const stats = await statsRes.json();
        console.log('Stats loaded:', stats);
        
        document.getElementById('statTotal').innerText = stats.total;
        document.getElementById('statPending').innerText = stats.pending;
        document.getElementById('statInProgress').innerText = stats.inProgress;
        document.getElementById('statResolved').innerText = stats.resolved;

        // Load complaints
        console.log('Fetching complaints from:', `${API_URL}/complaints/${user._id}`);
        const compRes = await fetch(`${API_URL}/complaints/${user._id}`);
        
        if (!compRes.ok) {
            throw new Error(`Complaints API error: ${compRes.status}`);
        }
        
        allComplaints = await compRes.json();
        console.log('Complaints loaded:', allComplaints.length, 'complaints');
        displayComplaints(allComplaints);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

function displayComplaints(complaints) {
    const list = document.getElementById('complaintsList');
    
    if (complaints.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No complaints filed yet</p>';
        return;
    }
    
    list.innerHTML = complaints.map((c, idx) => `
        <div class="complaint-item">
            <div class="complaint-item-header">
                <div class="complaint-id">GRV-2026-${String(idx + 1).padStart(3, '0')}</div>
                <div class="complaint-badges">
                    <span class="status-badge ${c.status}">${c.status}</span>
                    <span class="priority-badge ${c.priority}">${c.priority}</span>
                </div>
            </div>
            <div class="complaint-title">${c.title}</div>
            <div class="complaint-category">${c.category}</div>
            <div class="complaint-meta">
                <div class="complaint-meta-item">
                    <span>🏢 Assigned to: ${c.department || 'Public Works Dept.'}</span>
                </div>
                <div class="complaint-meta-item">
                    <span>📅 Filed: ${new Date(c.filedDate).toLocaleDateString('en-IN')}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterComplaints() {
    const searchText = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allComplaints;
    
    if (searchText) {
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchText) || 
            c.category.toLowerCase().includes(searchText)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    displayComplaints(filtered);
}

function showComplaintForm() { 
    document.getElementById('complaintModal').classList.remove('hidden'); 
}

function hideComplaintForm() { 
    document.getElementById('complaintModal').classList.add('hidden'); 
}

const newComplaintForm = document.getElementById('newComplaintForm');
if (newComplaintForm) {
    newComplaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submitting new complaint...');
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const complaintData = {
            citizenId: user._id,
            title: document.getElementById('cTitle').value,
            category: document.getElementById('cCategory').value,
            priority: document.getElementById('cPriority').value,
            location: document.getElementById('cLocation').value,
            description: document.getElementById('cDescription').value,
            phone: document.getElementById('cPhone').value,
            email: document.getElementById('cEmail').value,
            status: 'Pending',
            department: 'Public Works'
        };
        
        console.log('Complaint data:', complaintData);

        try {
            const res = await fetch(`${API_URL}/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData)
            });
            
            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }
            
            const result = await res.json();
            console.log('Complaint submitted successfully:', result);
            
            // Reset form
            newComplaintForm.reset();
            hideComplaintForm();
            
            // Show success message
            alert('✅ Complaint submitted successfully! Refresh to see it in your list.');
            
            // Reload dashboard
            await loadDashboard();
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert('❌ Error submitting complaint: ' + error.message);
        }
    });
}

function useMapLocation() {
    alert('Map integration feature coming soon!');
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Load dashboard on page load
if (document.getElementById('complaintsList')) {
    loadDashboard();
}
