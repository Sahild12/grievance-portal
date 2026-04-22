const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Serve HTML pages
app.use(express.static(path.join(__dirname, '../pages')));

// Mock Data Storage
const users = [
    {
        _id: '1',
        name: 'Raj Kumar',
        idNumber: '12345',
        password: 'password123',
        role: 'citizen',
        department: 'Public Works'
    },
    {
        _id: '2',
        name: 'Admin Officer',
        idNumber: '67890',
        password: 'admin123',
        role: 'official',
        department: 'Administration'
    }
];

const complaints = [
    {
        _id: '1',
        citizenId: '1',
        title: 'Pothole on Main Street',
        category: 'Roads',
        description: 'Large pothole causing traffic issues',
        location: 'Main Street, Downtown',
        priority: 'High',
        status: 'Resolved',
        department: 'Public Works',
        filedDate: new Date('2026-01-20')
    },
    {
        _id: '2',
        citizenId: '1',
        title: 'Water Supply Issue',
        category: 'Water',
        description: 'No water supply since morning',
        location: 'Block A, Sector 5',
        priority: 'Critical',
        status: 'In Progress',
        department: 'Water Supply',
        filedDate: new Date('2026-01-26')
    },
    {
        _id: '3',
        citizenId: '1',
        title: 'Garbage Not Collected',
        category: 'Sanitation',
        description: 'Garbage not collected for 3 days',
        location: 'Block C, Sector 8',
        priority: 'High',
        status: 'Pending',
        department: 'Sanitation Dept.',
        filedDate: new Date('2026-01-14')
    },
    {
        _id: '4',
        citizenId: '1',
        title: 'Street Light Not Working',
        category: 'Electricity',
        description: 'Street light on corner is not functioning',
        location: 'Park Avenue',
        priority: 'Medium',
        status: 'In Progress',
        department: 'Electricity Board',
        filedDate: new Date('2026-01-14')
    }
];

console.log('✓ Mock Data Initialized - Database Ready');

app.post('/api/login', (req, res) => {
    const { idNumber, password, role } = req.body;
    const user = users.find(u => u.idNumber === idNumber && u.password === password && u.role === role);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: 'Invalid Credentials' });
    }
});

app.get('/api/complaints/:userId', (req, res) => {
    if (req.params.userId === 'all') {
        res.json(complaints);
    } else {
        const userComplaints = complaints.filter(c => c.citizenId === req.params.userId);
        res.json(userComplaints);
    }
});

app.post('/api/complaints', (req, res) => {
    const newComplaint = {
        _id: Date.now().toString(),
        ...req.body,
        filedDate: new Date(),
        status: 'Pending'
    };
    complaints.push(newComplaint);
    console.log('✓ New complaint filed:', newComplaint._id);
    res.json({ success: true, message: 'Complaint Filed Successfully', complaint: newComplaint });
});

app.put('/api/complaints/:id', (req, res) => {
    const { status, assigned } = req.body;
    const complaint = complaints.find(c => c._id === req.params.id);
    
    if (complaint) {
        if (status) complaint.status = status;
        if (assigned) complaint.assigned = assigned; // Note: 'assigned' field might be new for some mock data but that's fine
        res.json({ success: true, complaint });
    } else {
        res.status(404).json({ success: false, message: 'Complaint not found' });
    }
});

app.get('/api/stats/:userId', (req, res) => {
    let userComplaints;
    
    if (req.params.userId === 'all') {
        userComplaints = complaints;
    } else {
        userComplaints = complaints.filter(c => c.citizenId === req.params.userId);
    }
    
    const total = userComplaints.length;
    const pending = userComplaints.filter(c => c.status === 'Pending').length;
    const resolved = userComplaints.filter(c => c.status === 'Resolved').length;
    const inProgress = userComplaints.filter(c => c.status === 'In Progress').length;

    res.json({ total, pending, resolved, inProgress });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
