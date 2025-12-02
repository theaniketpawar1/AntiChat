import { useState, useEffect } from 'react';
import { Hero } from '@/components/ui/animated-hero';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { chatAPI, authAPI } from '@/lib/api';
import { Message, Conversation } from '@/types';

export function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [currentModel, setCurrentModel] = useState('nvidia/minimaxai/minimax-m2');
    const [isLoading, setIsLoading] = useState(false);
    const [showHero, setShowHero] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Auto-login for testing
    useEffect(() => {
        const autoLogin = async () => {


            const token = localStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
                return;
            }

            // Try to register/login a test user
            try {
                const testUsername = 'testuser';
                const testPassword = 'test123';
                const testEmail = 'test@example.com';

                try {
                    // Try to login first
                    const loginData = await authAPI.login(testEmail, testPassword);
                    localStorage.setItem('token', loginData.token);
                    setIsAuthenticated(true);
                } catch (loginError) {
                    // If login fails, try to register
                    await authAPI.register(testUsername, testEmail, testPassword);
                    // Then login to get token
                    const loginData = await authAPI.login(testEmail, testPassword);
                    localStorage.setItem('token', loginData.token);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auto-login failed:', error);
            }
        };

        autoLogin();
    }, []);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Hide hero when first message is sent
        if (showHero) {
            setShowHero(false);
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await chatAPI.sendMessage(content, currentModel, activeSessionId || undefined);

            // Add bot response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setActiveSessionId(response.sessionId);

            // Refresh conversations
            const updatedConversations = await chatAPI.getHistory();
            setConversations(updatedConversations);
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, there was an error processing your request. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setActiveSessionId(null);
        setShowHero(true);
    };

    const handleSelectConversation = async (sessionId: string) => {
        try {
            const sessionMessages = await chatAPI.getSession(sessionId);
            const formattedMessages: Message[] = sessionMessages.flatMap((msg: any) => [
                {
                    id: `${msg._id}-user`,
                    role: 'user' as const,
                    content: msg.userMessage,
                    timestamp: new Date(msg.timestamp),
                },
                {
                    id: `${msg._id}-bot`,
                    role: 'assistant' as const,
                    content: msg.botResponse,
                    timestamp: new Date(msg.timestamp),
                },
            ]);
            setMessages(formattedMessages);
            setActiveSessionId(sessionId);
            setShowHero(false);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen dark items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen dark">
            <Sidebar
                conversations={conversations}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
            />

            <main className="flex-1 flex flex-col bg-background overflow-hidden">
                {showHero && messages.length === 0 ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <Hero />
                        </div>
                        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
                    </div>
                ) : (
                    <>
                        <ChatHeader currentModel={currentModel} onModelChange={setCurrentModel} />
                        <MessageList messages={messages} />
                        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
                    </>
                )}
            </main>
        </div>
    );
}
