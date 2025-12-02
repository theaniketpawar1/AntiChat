import { Message as MessageType } from '@/types';
import { Message } from './Message';
import { useEffect, useRef } from 'react';

interface MessageListProps {
    messages: MessageType[];
}

export function MessageList({ messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
