import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/hooks/useChat';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => {
        const isOwn = message.user_id === user?.id;
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.user?.avatar_url || ''} />
              <AvatarFallback>
                {message.user?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
              <div className="flex items-center gap-2 mb-1">
                {!isOwn && (
                  <>
                    <span className="text-sm font-medium">
                      {message.user?.full_name || 'Unknown User'}
                    </span>
                    <VerifiedBadge userId={message.user_id} />
                  </>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="space-y-2">
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                {message.media_url && (
                  <img
                    src={message.media_url}
                    alt="Attachment"
                    className="max-w-xs rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
