import React from 'react';
import { useAnonflyMessages } from '../hooks/useAnonflyMessages';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface MessageListProps {
    roomId: string;
    className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ roomId, className }) => {
    const { messages, loading, error } = useAnonflyMessages(roomId);

    if (loading && messages.length === 0) {
        return <div className="p-4 text-center opacity-50">Loading messages...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className={cn("flex flex-col gap-4 overflow-y-auto p-4", className)}>
            {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold opacity-70">{msg.senderId}</span>
                        <span className="text-[10px] opacity-40">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3 text-sm dark:bg-zinc-800">
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
    );
};
