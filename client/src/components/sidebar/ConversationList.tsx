import { Conversation } from '@/types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
    conversations: Conversation[];
    activeSessionId: string | null;
    onSelectConversation: (sessionId: string) => void;
}

export function ConversationList({
    conversations,
    activeSessionId,
    onSelectConversation
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="text-sm text-muted-foreground text-center py-8">
                No conversations yet
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={conversation._id === activeSessionId}
                    onClick={() => onSelectConversation(conversation._id)}
                />
            ))}
        </div>
    );
}
