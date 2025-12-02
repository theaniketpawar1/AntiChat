import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewChatButtonProps {
    onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
    return (
        <Button
            onClick={onClick}
            className="w-full justify-center gap-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
        >
            <Plus className="w-5 h-5" />
            New Chat
        </Button>
    );
}
