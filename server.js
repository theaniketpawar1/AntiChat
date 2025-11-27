require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
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
                    model: 'pollinations-image'
                });
                await chat.save();
            } catch (dbError) {
                console.error('Failed to save to MongoDB:', dbError.message);
            }
        }
        return res.json({ response: botResponse });
    }

    try {
        const response = await axios.post(
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
                    'HTTP-Referer': 'http://localhost:3000', // Optional
                    'X-Title': 'AntiChat', // Optional
                    'Content-Type': 'application/json'
                }
            }
        );

        const botResponse = response.data.choices[0].message.content;

        // Save to MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const chat = new Chat({
                    userMessage: message,
                    botResponse: botResponse,
                    model: model || 'meta-llama/llama-3.2-3b-instruct:free'
                });
                await chat.save();
            } catch (dbError) {
                console.error('Failed to save to MongoDB:', dbError.message);
            }
        }

        res.json({ response: botResponse });

    } catch (error) {
        console.error('OpenRouter API Error:', error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to get response from AI';
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
