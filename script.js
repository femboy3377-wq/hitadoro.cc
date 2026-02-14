const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const KEYS_FILE = path.join(__dirname, 'keys.json');
const ADMIN_SECRET = "hitadoro_admin_secret"; // Change this!

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize Keys DB
if (!fs.existsSync(KEYS_FILE)) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify([]));
}

const getKeys = () => JSON.parse(fs.readFileSync(KEYS_FILE));
const saveKeys = (keys) => fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));

// Generate Key (Admin Only)
app.post('/api/generate_key', (req, res) => {
    const { secret, duration_days } = req.body;

    if (secret !== ADMIN_SECRET) {
        return res.status(403).json({ success: false, message: 'Invalid Admin Secret' });
    }

    const keys = getKeys();
    const key = 'KEY-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const newKey = {
        key,
        duration_days: parseInt(duration_days) || 1,
        created_at: Date.now(),
        hwid: null,
        activated_at: null,
        expires_at: null
    };

    keys.push(newKey);
    saveKeys(keys);

    res.json({ success: true, key, message: `Generated ${duration_days} day(s) key.` });
});

// Verify/Redeem Key (Client)
app.post('/api/verify_key', (req, res) => {
    const { key, hwid } = req.body;

    if (!key || !hwid) {
        return res.json({ success: false, message: 'Missing key or HWID' });
    }

    const keys = getKeys();
    const keyEntry = keys.find(k => k.key === key);

    if (!keyEntry) {
        return res.json({ success: false, message: 'Invalid Key' });
    }

    const now = Date.now();

    // If key is new (not activated)
    if (!keyEntry.activated_at) {
        keyEntry.hwid = hwid;
        keyEntry.activated_at = now;
        keyEntry.expires_at = now + (keyEntry.duration_days * 24 * 60 * 60 * 1000);
        saveKeys(keys);
        return res.json({ success: true, message: 'Key Activated', time_left: keyEntry.expires_at - now });
    }

    // If key is already used
    if (keyEntry.hwid !== hwid) {
        return res.json({ success: false, message: 'Key already used on another machine' });
    }

    if (now > keyEntry.expires_at) {
        return res.json({ success: false, message: 'Key Expired' });
    }

    return res.json({ success: true, message: 'Valid', time_left: keyEntry.expires_at - now });
});

app.listen(PORT, () => {
    console.log(`Key Server running at http://localhost:${PORT}`);
});
