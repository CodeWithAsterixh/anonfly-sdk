import React, { useState } from 'react';
import { useAnonflyMessages } from '../hooks/useAnonflyMessages';
import { Send } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ChatInputProps {
    roomId: string;
    className?: string;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ roomId, className, placeholder = "Type a message..." }) => {
    const { sendMessage } = useAnonflyMessages(roomId);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || sending) return;

        try {
            setSending(true);
            await sendMessage(content);
            setContent('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex items-center gap-2 border-t p-4 dark:border-zinc-800", className)}
        >
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={sending}
                className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            />
            <button
                type="submit"
                disabled={sending || !content.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                <Send className="h-4 w-4" />
            </button>
        </form>
    );
};
