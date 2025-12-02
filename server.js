require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.log('MONGODB_URI not set. Running in memory-only mode.');
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error creating user: ' + error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get Chat History (Protected) - Returns grouped sessions
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        // Get unique sessions with their first message
        const sessions = await Chat.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(req.user.userId) } },
            { $sort: { timestamp: 1 } },
            {
                $group: {
                    _id: '$sessionId',
                    firstMessage: { $first: '$userMessage' },
                    lastTimestamp: { $last: '$timestamp' },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { lastTimestamp: -1 } },
            { $limit: 20 }
        ]);
        res.json(sessions);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get messages for a specific session
app.get('/api/session/:sessionId', authenticateToken, async (req, res) => {
    try {
        const messages = await Chat.find({
            userId: req.user.userId,
            sessionId: req.params.sessionId
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// Send Message (Protected)
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { message, model, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = sessionId || Date.now().toString();

    // Image Generation Command
    if (message.toLowerCase().startsWith('/image')) {
        const prompt = message.replace(/^\/image\s*/i, '').trim();
        if (!prompt) {
            return res.json({ response: 'Please provide a description for the image. Usage: /image <description>' });
        }

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const botResponse = `![Generated Image](${imageUrl})`;

        // Save to MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const chat = new Chat({
                    userMessage: message,
                    botResponse: botResponse,
                    model: 'pollinations-image',
                    userId: req.user.userId,
                    sessionId: currentSessionId
                });
                await chat.save();
            } catch (dbError) {
                console.error('Failed to save to MongoDB:', dbError.message);
            }
        }
        return res.json({ response: botResponse, sessionId: currentSessionId });
    }

    try {
        let response;
        let botResponse;

        // Check if model uses NVIDIA API
        if (model && model.startsWith('nvidia/')) {
            // NVIDIA API call
            const nvidiaModel = model.replace('nvidia/', '');
            response = await axios.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                {
                    model: nvidiaModel,
                    messages: [
                        { role: 'user', content: message }
                    ],
                    temperature: 1,
                    top_p: 0.7,
                    max_tokens: 4096
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            botResponse = response.data.choices[0].message.content;
        } else {
            // OpenRouter API call
            response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model || 'meta-llama/llama-3.2-3b-instruct:free',
                    messages: [
                        { role: 'user', content: message }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'AntiChat',
                        'Content-Type': 'application/json'
                    }
                }
            );
            botResponse = response.data.choices[0].message.content;
        }

        // Save to MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const chat = new Chat({
                    userMessage: message,
                    botResponse: botResponse,
                    model: model || 'meta-llama/llama-3.2-3b-instruct:free',
                    userId: req.user.userId,
                    sessionId: currentSessionId
                });
                await chat.save();
            } catch (dbError) {
                console.error('Failed to save to MongoDB:', dbError.message);
            }
        }

        res.json({ response: botResponse, sessionId: currentSessionId });

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to get response from AI';
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
