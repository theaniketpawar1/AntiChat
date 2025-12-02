export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface Conversation {
    _id: string;
    firstMessage: string;
    lastTimestamp: Date;
    messageCount: number;
}

export interface User {
    userId: string;
    username: string;
    email: string;
}

export interface ChatResponse {
    response: string;
    sessionId: string;
}
