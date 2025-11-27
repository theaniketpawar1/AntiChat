require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Chat = require('./models/Chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes

// Get Chat History
app.get('/api/history', async (req, res) => {
    try {
        const history = await Chat.find().sort({ timestamp: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Send Message
app.post('/api/chat', async (req, res) => {
    const { message, model } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Image Generation Command
    if (message.toLowerCase().startsWith('/image')) {
        const prompt = message.replace(/^\/image\s*/i, '').trim();
        if (!prompt) {
        });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
