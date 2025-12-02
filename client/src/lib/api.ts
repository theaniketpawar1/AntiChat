import axios from 'axios';
import type { ChatResponse, Conversation, Message } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },
    register: async (username: string, email: string, password: string) => {
        const response = await api.post('/api/auth/register', { username, email, password });
        return response.data;
    },
};

export const chatAPI = {
    sendMessage: async (message: string, model: string, sessionId?: string): Promise<ChatResponse> => {
        const response = await api.post('/api/chat', { message, model, sessionId });
        return response.data;
    },
    getHistory: async (): Promise<Conversation[]> => {
        const response = await api.get('/api/history');
        return response.data;
    },
    getSession: async (sessionId: string): Promise<Message[]> => {
        const response = await api.get(`/api/session/${sessionId}`);
        return response.data;
    },
};

export default api;
