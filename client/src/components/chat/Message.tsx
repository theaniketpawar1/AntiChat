import { Message as MessageType } from '@/types';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageProps {
    message: MessageType;
}

export function Message({ message }: MessageProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={cn(
                'group w-full border-b border-border/40 py-6',
                isUser ? 'bg-background' : 'bg-muted/30'
            )}
        >
            <div className="container max-w-4xl mx-auto px-4 flex gap-4">
                <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{message.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
