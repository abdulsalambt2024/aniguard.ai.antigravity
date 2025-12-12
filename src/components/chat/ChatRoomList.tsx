import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import type { ChatRoom } from '@/hooks/useChat';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatRoomList({ rooms, selectedRoomId, onSelectRoom }: ChatRoomListProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm">Start a new chat to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
            selectedRoomId === room.id ? 'bg-accent border-primary' : ''
          }`}
          onClick={() => onSelectRoom(room.id)}
        >
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {room.name ? room.name[0].toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold truncate">
                  {room.name || 'Direct Message'}
                </h3>
                {room.last_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(room.last_message.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              {room.last_message && (
                <p className="text-sm text-muted-foreground truncate">
                  {room.last_message.content}
                </p>
              )}
            </div>
            {room.unread_count && room.unread_count > 0 && (
              <Badge variant="default" className="ml-2">
                {room.unread_count}
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
