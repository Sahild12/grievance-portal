const API_URL = 'https://grievance-portal-api.onrender.com/api';
let selectedRole = 'citizen'; // Track selected role
let allComplaints = []; // Store all complaints for filtering

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

// Initialize session timeout tracking on dashboard pages
if (localStorage.getItem('user')) {
    resetSessionTimer();
    
    // Track user activity
    document.addEventListener('mousemove', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    document.addEventListener('click', resetSessionTimer);
    document.addEventListener('scroll', resetSessionTimer);
}

// --- MODAL MANAGEMENT ---
function openRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
}

function openTermsModal() {
    document.getElementById('termsModal').classList.remove('hidden');
}

function closeTermsModal() {
    document.getElementById('termsModal').classList.add('hidden');
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const registerModal = document.getElementById('registerModal');
    const termsModal = document.getElementById('termsModal');
    
    if (e.target === registerModal) {
        closeRegisterModal();
    }
    if (e.target === termsModal) {
        closeTermsModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRegisterModal();
        closeTermsModal();
    }
});

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('regFullName').value.trim();
        const idNumber = document.getElementById('regIdNumber').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const agreeTerms = document.getElementById('regAgreeTerms').checked;
        
        // Validation
        if (!fullName || fullName.length < 3) {
            alert('❌ Full name must be at least 3 characters');
            return;
        }
        if (!idNumber || idNumber.length < 5) {
            alert('❌ Invalid ID number');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('❌ Invalid email address');
            return;
        }
        if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
            alert('❌ Phone number must be 10 digits');
            return;
        }
        if (password.length < 8) {
            alert('❌ Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            alert('❌ Passwords do not match');
            return;
        }
        if (!agreeTerms) {
            alert('❌ You must agree to the Terms & Conditions');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: fullName,
                    idNumber, 
                    email,
                    phone,
                    password,
                    role: 'citizen'
                })
            });
            
            if (!res.ok) {
                throw new Error(`Registration failed: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                alert('✅ Account created successfully! You can now login.');
                closeRegisterModal();
                // Clear login form
                document.getElementById('loginForm').reset();
                // Set role to citizen
                document.getElementById('btn-citizen').click();
            } else {
                alert('❌ Registration failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('❌ Registration error: ' + error.message);
        }
    });
}

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

// --- PASSWORD VISIBILITY TOGGLE ---
function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const togglePassword = document.getElementById(toggleId);

    if (passwordInput && togglePassword) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                togglePassword.style.display = 'block';
            } else {
                togglePassword.style.display = 'none';
            }
        });

        togglePassword.addEventListener('click', () => {
            // Toggle the type attribute
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the icon
            togglePassword.classList.toggle('ri-eye-line');
            togglePassword.classList.toggle('ri-eye-off-line');
        });
    }
}

// Setup for login form
setupPasswordToggle('passwordInput', 'togglePassword');

// Setup for registration form
setupPasswordToggle('regPassword', 'toggleRegPassword');
setupPasswordToggle('regConfirmPassword', 'toggleRegConfirmPassword');


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
        <div class="complaint-item" onclick="showComplaintDetail('${c._id}')" style="cursor: pointer;">
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
                    <span><i class="ri-government-line"></i> Assigned to: ${c.department || 'Public Works Dept.'}</span>
                </div>
                <div class="complaint-meta-item">
                    <span> <i class="ri-calendar-line"></i> Filed: ${new Date(c.filedDate).toLocaleDateString('en-IN')}</span>
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

// Validation functions
function validateForm() {
    const title = document.getElementById('cTitle').value.trim();
    const category = document.getElementById('cCategory').value;
    const description = document.getElementById('cDescription').value.trim();
    const location = document.getElementById('cLocation').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const dateOfIssue = document.getElementById('cDateOfIssue').value;
    
    if (!title || title.length < 5) {
        alert('❌ Title must be at least 5 characters');
        return false;
    }
    if (!category) {
        alert('❌ Please select a category');
        return false;
    }
    if (!description || description.length < 10) {
        alert('❌ Description must be at least 10 characters');
        return false;
    }
    if (!dateOfIssue) {
        alert('❌ Please select the date of issue');
        return false;
    }
    const issueDate = new Date(dateOfIssue);
    const today = new Date();
    if (issueDate > today) {
        alert('❌ Date of issue cannot be in the future');
        return false;
    }
    if (!location || location.length < 5) {
        alert('❌ Location must be at least 5 characters');
        return false;
    }
    if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        alert('❌ Please enter a valid 10-digit phone number');
        return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('❌ Please enter a valid email address');
        return false;
    }
    return true;
}

function clearValidationErrors() {
    // Clear any validation error messages if they exist
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());
    const invalidElements = document.querySelectorAll('.field-invalid');
    invalidElements.forEach(el => el.classList.remove('field-invalid'));
}

const newComplaintForm = document.getElementById('newComplaintForm');
if (newComplaintForm) {
    newComplaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            alert('❌ Please fix the errors in the form before submitting');
            return;
        }
        
        console.log('Submitting new complaint...');
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Prepare file data
        const filesData = uploadedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
        }));
        
        const complaintData = {
            citizenId: user._id,
            title: document.getElementById('cTitle').value.trim(),
            category: document.getElementById('cCategory').value,
            priority: document.getElementById('cPriority').value,
            location: document.getElementById('cLocation').value.trim(),
            description: document.getElementById('cDescription').value.trim(),
            dateOfIssue: document.getElementById('cDateOfIssue').value,
            phone: document.getElementById('cPhone').value.trim(),
            email: document.getElementById('cEmail').value.trim(),
            status: 'Pending',
            department: 'Public Works',
            files: filesData
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
            
            // Reset form and files
            newComplaintForm.reset();
            uploadedFiles = [];
            updateFilePreview();
            clearValidationErrors();
            hideComplaintForm();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-notification';
            successMsg.innerHTML = '✅ Complaint submitted successfully! Your reference ID is: ' + result.complaint._id;
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 5000);
            
            // Reload dashboard
            await loadDashboard();
        } catch (error) {
            console.error('Error submitting complaint:', error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-notification';
            errorMsg.innerHTML = '❌ Error submitting complaint: ' + error.message;
            document.body.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 5000);
        }
    });
}

function useMapLocation() {
    const mapContainer = document.getElementById('mapContainer');
    const locationPreview = mapContainer.parentElement;
    
    // Check if map already initialized
    if (mapContainer.hasOwnProperty('_leaflet_map')) {
        // Map already exists, just show it
        mapContainer.style.display = 'block';
        return;
    }
    
    // Show map container
    mapContainer.style.display = 'block';
    mapContainer.innerHTML = '<div id="map" style="height: 300px; border-radius: 8px;"></div>';
    
    // Load Leaflet library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
        initializeMap();
    };
    document.head.appendChild(script);
}

function initializeMap() {
    // Default location (center of India)
    const defaultLat = 28.6139;
    const defaultLng = 77.2090;
    
    const map = L.map('map').setView([defaultLat, defaultLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    let marker = L.marker([defaultLat, defaultLng]).addTo(map);
    
    // Click on map to set location
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Update marker
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker([lat, lng]).addTo(map);
        
        // Get address from coordinates (reverse geocoding)
        getAddressFromCoordinates(lat, lng);
    });
    
    // Enable location services
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 15);
                marker.setLatLng([lat, lng]);
                getAddressFromCoordinates(lat, lng);
            },
            error => {
                console.log('Geolocation not available:', error);
            }
        );
    }
}

function getAddressFromCoordinates(lat, lng) {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const address = data.address?.road || data.address?.city || 
                          data.address?.town || data.display_name || 
                          `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            document.getElementById('cLocation').value = address;
        })
        .catch(error => {
            console.log('Geocoding error:', error);
            document.getElementById('cLocation').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        });
}

// --- FILE UPLOAD HANDLING ---
let uploadedFiles = [];
const fileInput = document.getElementById('cDocuments');
const fileUploadBox = document.getElementById('fileUploadBox');

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });
}

function handleFileSelect(files) {
    for (let file of files) {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert(`❌ File "${file.name}" exceeds 10MB limit`);
            continue;
        }
        
        // Check if file already uploaded
        if (uploadedFiles.find(f => f.name === file.name)) {
            alert(`⚠️ File "${file.name}" already uploaded`);
            continue;
        }
        
        uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        });
    }
    updateFilePreview();
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBox.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBox.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBox.classList.remove('dragover');
    handleFileSelect(e.dataTransfer.files);
}

function updateFilePreview() {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    uploadedFiles.forEach((fileObj, index) => {
        const isImage = fileObj.type.startsWith('image/');
        const div = document.createElement('div');
        div.className = `file-preview-item ${isImage ? 'image' : 'document'}`;
        
        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                div.innerHTML = `
                    <img src="${e.target.result}" alt="${fileObj.name}">
                    <button class="remove-file" onclick="removeFile(${index})">×</button>
                `;
            };
            reader.readAsDataURL(fileObj.file);
        } else {
            const icon = getFileIcon(fileObj.type);
            div.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${fileObj.name}</div>
                <div class="file-size">${formatFileSize(fileObj.size)}</div>
                <button class="remove-file" onclick="removeFile(${index})">×</button>
            `;
        }
        preview.appendChild(div);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilePreview();
}

function getFileIcon(type) {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet')) return '📊';
    return '📎';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

let currentOpenComplaintId = null;

// --- COMPLAINT DETAIL VIEW ---
function showComplaintDetail(complaintId) {
    currentOpenComplaintId = complaintId;
    const complaint = allComplaints.find(c => c._id === complaintId);
    if (!complaint) return;
    
    // Populate detail modal with complaint data
    document.getElementById('complaintId').innerText = `Reference ID: GRV-2026-${allComplaints.indexOf(complaint) + 1}`;
    document.getElementById('detailTitle').innerText = complaint.title;
    document.getElementById('detailStatus').innerText = complaint.status;
    document.getElementById('detailPriority').innerText = complaint.priority;
    document.getElementById('detailCategory').innerText = complaint.category;
    document.getElementById('detailLocation').innerText = complaint.location;
    document.getElementById('detailDescription').innerText = complaint.description;
    document.getElementById('detailDate').innerText = new Date(complaint.filedDate).toLocaleDateString('en-IN');
    document.getElementById('detailDept').innerText = complaint.department || 'Not Assigned';
    document.getElementById('detailPhone').innerText = complaint.phone || 'Not provided';
    document.getElementById('detailEmail').innerText = complaint.email || 'Not provided';
    
    // Show attached files if any
    const filesDiv = document.getElementById('attachedFiles');
    if (complaint.files && complaint.files.length > 0) {
        filesDiv.innerHTML = complaint.files.map(f => `
            <div class="attached-file-item">
                <div class="attached-file-info">
                    <div class="attached-file-icon">${getFileIcon(f.type)}</div>
                    <div class="attached-file-details">
                        <div class="attached-file-name">${f.name}</div>
                        <div class="attached-file-size">${formatFileSize(f.size)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        filesDiv.innerHTML = '<p style="color: #999;">No documents attached</p>';
    }
    
    // Show detail modal
    const modal = document.getElementById('complaintDetailModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideComplaintDetail() {
    currentOpenComplaintId = null;
    const modal = document.getElementById('complaintDetailModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close detail modal when clicking outside
const detailModal = document.getElementById('complaintDetailModal');
if (detailModal) {
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            hideComplaintDetail();
        }
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function pollDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const statsRes = await fetch(`${API_URL}/stats/${user._id}`);
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('statTotal').innerText = stats.total;
            document.getElementById('statPending').innerText = stats.pending;
            document.getElementById('statInProgress').innerText = stats.inProgress;
            document.getElementById('statResolved').innerText = stats.resolved;
        }

        const compRes = await fetch(`${API_URL}/complaints/${user._id}`);
        if (compRes.ok) {
            const newComplaints = await compRes.json();
            // Check if there are changes to avoid unnecessary re-rendering
            if (JSON.stringify(newComplaints) !== JSON.stringify(allComplaints)) {
                allComplaints = newComplaints;
                filterComplaints(); // Update the view applying current filters
                
                // If a modal is currently open, update its content
                if (currentOpenComplaintId) {
                    showComplaintDetail(currentOpenComplaintId);
                }
            }
        }
    } catch (error) {
        console.error('Polling error:', error);
    }
}

// Load dashboard on page load
if (document.getElementById('complaintsList')) {
    loadDashboard();
    setInterval(pollDashboard, 5000); // Poll every 5 seconds for dynamic updates
}
