import { Select } from '@/components/ui/select';
import { Bot } from 'lucide-react';

interface ChatHeaderProps {
    currentModel: string;
    onModelChange: (model: string) => void;
}

export function ChatHeader({ currentModel, onModelChange }: ChatHeaderProps) {
    return (
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="model-select" className="text-sm text-muted-foreground">
                        Model:
                    </label>
                    <Select
                        id="model-select"
                        value={currentModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="w-[200px]"
                    >
                        <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free)</option>
                        <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                        <option value="nvidia/minimaxai/minimax-m2">MiniMax-M2 (NVIDIA)</option>
                        <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                    </Select>
                </div>
            </div>
        </header>
    );
}
