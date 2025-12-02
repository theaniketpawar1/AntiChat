import { Conversation } from '@/types';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200',
                'hover:bg-accent hover:shadow-md flex items-start gap-3 group',
                isActive && 'bg-accent shadow-md border border-border'
            )}
        >
            <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
            )}>
                <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{conversation.firstMessage}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}
                </p>
            </div>
        </button>
    );
}
