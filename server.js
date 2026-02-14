const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper to read users
const getUsers = () => {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Helper to save users
const saveUsers = (users) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

// Register Endpoint
app.post('/api/register', (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const users = getUsers();

    // Check if user exists
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const newUser = {
        id: Date.now(),
        email,
        username,
        password, // In a real app, hash this!
        subscription: null // '1_day', '7_days', etc.
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ success: true, message: 'Registration successful!' });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ 
            success: true, 
            message: 'Login successful!', 
            user: { 
                username: user.username, 
                email: user.email,
                subscription: user.subscription 
            } 
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
