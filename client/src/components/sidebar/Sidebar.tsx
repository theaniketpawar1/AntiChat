import { MessageSquare } from 'lucide-react';
import { NewChatButton } from './NewChatButton';
import { ConversationList } from './ConversationList';
import { Conversation } from '@/types';

interface SidebarProps {
    conversations: Conversation[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectConversation: (sessionId: string) => void;
}

export function Sidebar({
    conversations,
    activeSessionId,
    onNewChat,
    onSelectConversation
}: SidebarProps) {
    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-screen">
            {/* Header with Logo */}
            <div className="p-4 border-b border-border bg-background/50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        AntiChat
                    </h1>
                </div>
                <NewChatButton onClick={onNewChat} />
            </div>

            {/* Scrollable History */}
            <div className="flex-1 overflow-y-auto p-3">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-3 tracking-wider">
                    Recent Chats
                </h2>
                <ConversationList
                    conversations={conversations}
                    activeSessionId={activeSessionId}
                    onSelectConversation={onSelectConversation}
                />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
                <p>AntiChat Beta v1.0</p>
            </div>
        </aside>
    );
}
