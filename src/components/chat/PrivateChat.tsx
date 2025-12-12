import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, MessageCircle, ArrowLeft, Send, Check, CheckCheck, Image as ImageIcon, Paperclip, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { format } from 'date-fns';
import { chatMessageSchema } from '@/lib/validation';
import { toast as sonnerToast } from 'sonner';

interface User {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string | null;
  message_type?: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface PrivateChatProps {
  onSelectRoom?: (roomId: string) => void;
}

export function PrivateChat({ onSelectRoom }: PrivateChatProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only members, admins, super_admins can use chat
  const canChat = role !== 'viewer';

  const { data: privateChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['private-chats'],
    queryFn: async () => {
      if (!user) return [];

      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id, name, is_private, updated_at,
          chat_participants!inner(user_id)
        `)
        .eq('is_private', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get the other participant for each room
      const otherUserIds = rooms?.flatMap(r => 
        r.chat_participants
          .filter((p: { user_id: string }) => p.user_id !== user.id)
          .map((p: { user_id: string }) => p.user_id)
      ) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', otherUserIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return rooms?.map(room => {
        const otherUserId = room.chat_participants.find((p: { user_id: string }) => p.user_id !== user?.id)?.user_id;
        const otherUser = profileMap.get(otherUserId);
        return {
          ...room,
          otherUser,
          otherUserId
        };
      }) || [];
    },
    enabled: canChat && !!user
  });

  // Fetch messages for selected room
  const { data: messages } = useQuery({
    queryKey: ['private-messages', selectedRoom],
    queryFn: async () => {
      if (!selectedRoom) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', selectedRoom)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      return data.map(msg => ({
        ...msg,
        user: profiles?.find(p => p.user_id === msg.user_id)
      })) as Message[];
    },
    enabled: !!selectedRoom
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel(`private-messages-${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${selectedRoom}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['private-messages', selectedRoom] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { data: allUsers } = useQuery({
    queryKey: ['all-users-for-chat'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .neq('role', 'viewer');

      const userIds = roles?.map(r => r.user_id) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds)
        .neq('user_id', user?.id || '');

      return profiles || [];
    },
    enabled: dialogOpen && canChat
  });

  const createPrivateChat = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if chat already exists
      const { data: existingRooms } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          chat_participants!inner(user_id)
        `)
        .eq('is_private', true);

      const existingRoom = existingRooms?.find(room => {
        const participants = room.chat_participants.map((p: { user_id: string }) => p.user_id);
        return participants.includes(user.id) && participants.includes(otherUserId);
      });

      if (existingRoom) {
        return existingRoom.id;
      }

      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          is_private: true,
          is_group: false,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: room.id, user_id: user.id },
          { room_id: room.id, user_id: otherUserId }
        ]);

      if (participantsError) throw participantsError;

      return room.id;
    },
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: ['private-chats'] });
      setDialogOpen(false);
      handleSelectRoom(roomId);
      toast({ title: 'Chat created', description: 'Start your conversation!' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create chat', variant: 'destructive' });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedRoom || !user) throw new Error('No room selected');

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom,
          user_id: user.id,
          content,
          message_type: 'text'
        });

      if (error) throw error;

      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedRoom);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['private-messages', selectedRoom] });
      queryClient.invalidateQueries({ queryKey: ['private-chats'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  });

  const handleSelectRoom = (roomId: string) => {
    const chat = privateChats?.find(c => c.id === roomId);
    if (chat?.otherUser) {
      setSelectedUser(chat.otherUser);
    }
    setSelectedRoom(roomId);
    onSelectRoom?.(roomId);
  };

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const validation = chatMessageSchema.safeParse({ content: trimmed });
    if (!validation.success) {
      toast({ 
        title: 'Error', 
        description: validation.error.errors[0].message, 
        variant: 'destructive' 
      });
      return;
    }

    sendMessageMutation.mutate(trimmed);
  };

  const filteredUsers = allUsers?.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canChat) {
    return (
      <Card className="h-full">
        <CardContent className="py-8 text-center text-muted-foreground">
          Chat is only available for Members, Admins, and Super Admins.
        </CardContent>
      </Card>
    );
  }

  // Chat room view
  if (selectedRoom && selectedUser) {
    return (
      <Card className="h-full flex flex-col">
        {/* Chat Header */}
        <CardHeader className="pb-2 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedRoom(null);
                setSelectedUser(null);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser.avatar_url || undefined} />
              <AvatarFallback>{selectedUser.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold">{selectedUser.full_name}</span>
                <VerifiedBadge userId={selectedUser.user_id} size="sm" />
              </div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages?.map((msg) => {
              const isMe = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {msg.media_url && msg.message_type === 'image' && (
                      <img 
                        src={msg.media_url} 
                        alt="Shared" 
                        className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(msg.media_url!, '_blank')}
                      />
                    )}
                    {msg.media_url && msg.message_type === 'document' && (
                      <a 
                        href={msg.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-background/20 rounded mb-2 hover:bg-background/30"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="text-xs">Download</span>
                      </a>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] opacity-70">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                      {isMe && (
                        <CheckCheck className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-3 border-t flex-shrink-0 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="private-image-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !selectedRoom) return;
              
              try {
                const fileName = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                  .from('chat-media')
                  .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage
                  .from('chat-media')
                  .getPublicUrl(fileName);
                
                await supabase.from('messages').insert({
                  room_id: selectedRoom,
                  user_id: user?.id,
                  content: '📷 Image',
                  media_url: urlData.publicUrl,
                  message_type: 'image'
                });
                
                queryClient.invalidateQueries({ queryKey: ['private-messages', selectedRoom] });
                sonnerToast.success('Image sent');
              } catch (error) {
                sonnerToast.error('Failed to upload image');
              }
            }}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={() => document.getElementById('private-image-upload')?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            id="private-file-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !selectedRoom) return;
              
              try {
                const fileName = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                  .from('chat-media')
                  .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage
                  .from('chat-media')
                  .getPublicUrl(fileName);
                
                await supabase.from('messages').insert({
                  room_id: selectedRoom,
                  user_id: user?.id,
                  content: `📎 ${file.name}`,
                  media_url: urlData.publicUrl,
                  message_type: 'document'
                });
                
                queryClient.invalidateQueries({ queryKey: ['private-messages', selectedRoom] });
                sonnerToast.success('File sent');
              } catch (error) {
                sonnerToast.error('Failed to upload file');
              }
            }}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={() => document.getElementById('private-file-upload')?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-0"
            />
            {message.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="rounded-full"
                disabled={sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </form>
        </div>
      </Card>
    );
  }

  // Chat list view
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Private Messages</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default" className="gap-1">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {filteredUsers?.map((u) => (
                      <Button
                        key={u.user_id}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-14"
                        onClick={() => createPrivateChat.mutate(u.user_id)}
                        disabled={createPrivateChat.isPending}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1">
                          <span>{u.full_name}</span>
                          <VerifiedBadge userId={u.user_id} size="sm" />
                        </div>
                      </Button>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="divide-y">
            {privateChats?.map((chat) => (
              <button
                key={chat.id}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                onClick={() => handleSelectRoom(chat.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.otherUser?.avatar_url || undefined} />
                  <AvatarFallback>{chat.otherUser?.full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium truncate">{chat.otherUser?.full_name || 'Unknown'}</span>
                    {chat.otherUserId && <VerifiedBadge userId={chat.otherUserId} size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">Tap to chat</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(chat.updated_at), 'HH:mm')}
                </span>
              </button>
            ))}
            {(!privateChats || privateChats.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm">Start a new chat to connect with others</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}