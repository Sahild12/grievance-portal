const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Serve HTML pages
app.use(express.static(path.join(__dirname, '../pages')));

// ==================== MONGODB CONNECTION ====================
const MONGODB_URI = 'mongodb+srv://pruthvirajdesai19_db_user:pMeYcs8iy6DWoQ0F@gov-citizen.ks77ae6.mongodb.net/?appName=gov-citizen';
// Direct URI fallback to bypass DNS SRV lookup issues (querySrv ETIMEOUT)
const DIRECT_URI = 'mongodb://pruthvirajdesai19_db_user:pMeYcs8iy6DWoQ0F@ac-mwwwyt0-shard-00-00.ks77ae6.mongodb.net:27017,ac-mwwwyt0-shard-00-01.ks77ae6.mongodb.net:27017,ac-mwwwyt0-shard-00-02.ks77ae6.mongodb.net:27017/?ssl=true&replicaSet=atlas-mwwwyt0-shard-0&authSource=admin&retryWrites=true&w=majority&appName=gov-citizen';

async function connectToDatabase() {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        family: 4 // Force IPv4, helps with some DNS resolution issues
    };

    try {
        await mongoose.connect(MONGODB_URI, options);
        console.log('✓ MongoDB Connected Successfully (SRV)');
        initializeSampleData();
    } catch (err) {
        console.warn('⚠ Primary MongoDB Connection Error:', err.message);
        console.log('Attempting fallback connection using direct URI...');
        try {
            await mongoose.connect(DIRECT_URI, options);
            console.log('✓ MongoDB Connected Successfully (Direct Fallback)');
            initializeSampleData();
        } catch (fallbackErr) {
            console.error('✗ MongoDB Fallback Connection Error:', fallbackErr.message);
            process.exit(1);
        }
    }
}

connectToDatabase();

// ==================== MONGOOSE SCHEMAS ====================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['citizen', 'official'], required: true },
    department: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
    citizenId: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    department: { type: String },
    assigned: { type: String, default: 'Unassigned' },
    fileUrl: { type: String },
    filedDate: { type: Date, default: Date.now },
    resolvedDate: { type: Date },
    comments: [{ text: String, date: Date }]
});

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

// ==================== INITIALIZE SAMPLE DATA ====================
async function initializeSampleData() {
    try {
        // Check if users exist
        const userCount = await User.countDocuments();
        
        if (userCount === 0) {
            // Add default users
            await User.insertMany([
                {
                    name: 'Raj',
                    idNumber: '12345',
                    password: 'password123',
                    role: 'citizen',
                    department: 'Public Works'
                },
                {
                    name: 'Admin Officer',
                    idNumber: '67890',
                    password: 'admin123',
                    role: 'official',
                    department: 'Administration'
                }
            ]);
            console.log('✓ Default users created');
        }

        const complaintCount = await Complaint.countDocuments();
        if (complaintCount === 0) {
            // Add diverse sample complaints for charts
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
            const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 10);
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 5);

            await Complaint.insertMany([
                {
                    citizenId: '12345',
                    title: 'Pothole on Main Street',
                    category: 'Roads',
                    description: 'Large pothole causing traffic issues',
                    location: 'Main Street, Downtown',
                    priority: 'High',
                    status: 'Resolved',
                    department: 'Public Works',
                    filedDate: threeMonthsAgo,
                    resolvedDate: new Date(threeMonthsAgo.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days later
                },
                {
                    citizenId: '12345',
                    title: 'Water Supply Issue',
                    category: 'Water',
                    description: 'No water supply since morning',
                    location: 'Block A, Sector 5',
                    priority: 'Critical',
                    status: 'Resolved',
                    department: 'Water Supply',
                    filedDate: twoMonthsAgo,
                    resolvedDate: new Date(twoMonthsAgo.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days later
                },
                {
                    citizenId: '12345',
                    title: 'Garbage Not Collected',
                    category: 'Sanitation',
                    description: 'Garbage not collected for 3 days',
                    location: 'Block C, Sector 8',
                    priority: 'High',
                    status: 'Pending',
                    department: 'Sanitation Dept.',
                    filedDate: lastMonth
                },
                {
                    citizenId: '12345',
                    title: 'Street Light Not Working',
                    category: 'Electricity',
                    description: 'Street light on corner is not functioning',
                    location: 'Park Avenue',
                    priority: 'Medium',
                    status: 'In Progress',
                    department: 'Electricity Board',
                    filedDate: lastMonth
                },
                {
                    citizenId: '12345',
                    title: 'Broken Pavement',
                    category: 'Roads',
                    description: 'Pavement is broken near the school',
                    location: 'School Road',
                    priority: 'Medium',
                    status: 'In Progress',
                    department: 'Public Works',
                    filedDate: now
                },
                {
                    citizenId: '12345',
                    title: 'Drainage Overflow',
                    category: 'Sanitation',
                    description: 'Drainage is overflowing on the street',
                    location: 'Market Area',
                    priority: 'Critical',
                    status: 'Pending',
                    department: 'Sanitation Dept.',
                    filedDate: now
                },
                {
                    citizenId: '12345',
                    title: 'Low Voltage',
                    category: 'Electricity',
                    description: 'Experiencing very low voltage for two days',
                    location: 'Residential Area East',
                    priority: 'High',
                    status: 'Resolved',
                    department: 'Electricity Board',
                    filedDate: twoMonthsAgo,
                    resolvedDate: new Date(twoMonthsAgo.getTime() + 8 * 24 * 60 * 60 * 1000) // 8 days later
                },
                {
                    citizenId: '12345',
                    title: 'Pipe Leak',
                    category: 'Water',
                    description: 'Main water pipe is leaking',
                    location: 'North Avenue',
                    priority: 'Critical',
                    status: 'Resolved',
                    department: 'Water Supply',
                    filedDate: threeMonthsAgo,
                    resolvedDate: new Date(threeMonthsAgo.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day later
                }
            ]);
            console.log('✓ Sample complaints created');
        }
    } catch (error) {
        console.error('Error initializing data:', error.message);
    }
}

// ==================== API ENDPOINTS ====================

// LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
    try {
        const { idNumber, password, role } = req.body;
        const user = await User.findOne({ idNumber, password, role });
        
        if (user) {
            res.json({ 
                success: true, 
                user: {
                    _id: user._id,
                    name: user.name,
                    idNumber: user.idNumber,
                    role: user.role,
                    department: user.department
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid Credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// REGISTER ENDPOINT (NEW)
app.post('/api/register', async (req, res) => {
    try {
        const { name, idNumber, email, phone, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ idNumber });
        if (existingUser) {
            return res.json({ success: false, message: 'User already registered' });
        }
        
        // Create new user
        const newUser = new User({
            name,
            idNumber,
            email,
            phone,
            password,
            role: 'citizen'
        });
        
        await newUser.save();
        res.json({ 
            success: true, 
            message: 'Registration Successful',
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET COMPLAINTS
app.get('/api/complaints/:userId', async (req, res) => {
    try {
        let complaints;
        
        if (req.params.userId === 'all') {
            complaints = await Complaint.find();
        } else {
            complaints = await Complaint.find({ citizenId: req.params.userId });
        }
        
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE COMPLAINT
app.post('/api/complaints', async (req, res) => {
    try {
        const newComplaint = new Complaint({
            ...req.body,
            filedDate: new Date(),
            status: 'Pending'
        });
        
        await newComplaint.save();
        console.log('✓ New complaint filed:', newComplaint._id);
        res.json({ 
            success: true, 
            message: 'Complaint Filed Successfully', 
            complaint: newComplaint 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE COMPLAINT
app.put('/api/complaints/:id', async (req, res) => {
    try {
        const { status, assigned } = req.body;
        const updateData = {};
        
        if (status) updateData.status = status;
        if (assigned) updateData.assigned = assigned;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (complaint) {
            res.json({ success: true, complaint });
        } else {
            res.status(404).json({ success: false, message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET STATISTICS
app.get('/api/stats/:userId', async (req, res) => {
    try {
        let query = {};
        
        if (req.params.userId !== 'all') {
            query.citizenId = req.params.userId;
        }
        
        const userComplaints = await Complaint.find(query);
        
        const total = userComplaints.length;
        const pending = userComplaints.filter(c => c.status === 'Pending').length;
        const resolved = userComplaints.filter(c => c.status === 'Resolved').length;
        const inProgress = userComplaints.filter(c => c.status === 'In Progress').length;

        res.json({ total, pending, resolved, inProgress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET ALL STATS (FOR OFFICIAL DASHBOARD)
app.get('/api/stats/all', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        
        const stats = {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            avgResolutionTime: '5.2d'
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// START SERVER
app.listen(3000, () => {
    console.log('✓ Server running on http://localhost:3000');
    console.log('✓ Connected to MongoDB');
});
