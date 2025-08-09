
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface IRCChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function IRCChatInput({ 
  onSendMessage, 
  isLoading, 
  disabled = false,
  placeholder = "Type your message..."
}: IRCChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        rows={1}
      />
      <Button
        type="submit"
        disabled={!message.trim() || isLoading || disabled}
        size="sm"
        className="bg-red-600 hover:bg-red-700 self-end"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
