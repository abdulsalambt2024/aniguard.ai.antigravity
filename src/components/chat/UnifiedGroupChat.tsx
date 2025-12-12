import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image as ImageIcon, Paperclip, Mic, Reply, Pin, Trash2, Check, CheckCheck, MoreVertical, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { chatMessageSchema } from '@/lib/validation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url: string | null;
  message_type: string | null;
  is_deleted: boolean;
  is_pinned: boolean;
  reply_to_message_id: string | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  reactions: any[];
  read_status: { user_id: string; read_at: string }[];
}

const UNIFIED_ROOM_ID = 'unified-group-chat';

export function UnifiedGroupChat() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['unified-chat-messages'],
    queryFn: async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', UNIFIED_ROOM_ID)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const userIds = messagesData?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      const { data: readStatus } = await supabase
        .from('message_read_status')
        .select('*')
        .in('message_id', messageIds);

      return messagesData?.map(msg => ({
        ...msg,
        profiles: profiles?.find(p => p.user_id === msg.user_id) || { full_name: '', avatar_url: '' },
        reactions: reactions?.filter(r => r.message_id === msg.id) || [],
        read_status: readStatus?.filter(r => r.message_id === msg.id) || []
      })) as Message[];
    }
  });

  // Real-time subscriptions
  useEffect(() => {
    const messagesChannel = supabase
      .channel('unified-chat-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${UNIFIED_ROOM_ID}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
      })
      .subscribe();

    const typingChannel = supabase
      .channel('unified-chat-typing')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `room_id=eq.${UNIFIED_ROOM_ID}`
      }, (payload: any) => {
        if (payload.new?.is_typing && payload.new.user_id !== user?.id) {
          setTypingUsers(prev => new Set(prev).add(payload.new.user_id));
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(payload.new.user_id);
              return next;
            });
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [user?.id, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      // Validate message
      const validation = chatMessageSchema.safeParse({ content });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: UNIFIED_ROOM_ID,
          user_id: user?.id,
          content: validation.data.content,
          reply_to_message_id: replyingTo?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
      toast.success('Message deleted');
    }
  });

  const pinMutation = useMutation({
    mutationFn: async ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('messages')
        .update({
          is_pinned: !isPinned,
          pinned_by: !isPinned ? user?.id : null,
          pinned_at: !isPinned ? new Date().toISOString() : null
        })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
    }
  });

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('message_read_status')
      .upsert({ message_id: messageId, user_id: user?.id });
  };

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.user_id !== user?.id && !msg.read_status.some(r => r.user_id === user?.id)) {
        markAsRead(msg.id);
      }
    });
  }, [messages, user?.id]);

  const handleTyping = async () => {
    await supabase
      .from('typing_indicators')
      .upsert({ room_id: UNIFIED_ROOM_ID, user_id: user?.id, is_typing: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  };

  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20">
      {/* Header */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">PARIVARTAN Community</h2>
          <p className="text-xs text-emerald-100">{messages.length} messages</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-500">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Group Info</DropdownMenuItem>
            <DropdownMenuItem>Search Messages</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading messages...</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              const readCount = msg.read_status.length;
              
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.profiles.avatar_url} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {msg.profiles.full_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-card shadow-sm'} ${msg.is_pinned ? 'ring-2 ring-amber-400' : ''}`}>
                      {!isOwn && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {msg.profiles.full_name}
                          </span>
                          <VerifiedBadge userId={msg.user_id} className="h-3 w-3" />
                        </div>
                      )}
                      
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
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded mb-2 hover:bg-muted"
                        >
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs">Download attachment</span>
                        </a>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${isOwn ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                        {isOwn && (
                          readCount > 0 ? <CheckCheck className="h-3 w-3 text-blue-300" /> : <Check className="h-3 w-3 text-emerald-200" />
                        )}
                        {msg.is_pinned && <Pin className="h-3 w-3 text-amber-400" />}
                      </div>
                    </div>

                    {/* Message Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-muted">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                        <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                          <Reply className="h-3 w-3 mr-2" /> Reply
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => pinMutation.mutate({ messageId: msg.id, isPinned: msg.is_pinned })}>
                            <Pin className="h-3 w-3 mr-2" /> {msg.is_pinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                        )}
                        {(isOwn || isAdmin) && (
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(msg.id)} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-1 text-xs text-muted-foreground italic">
          Someone is typing...
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <div className="mx-4 mb-2 px-3 py-2 bg-muted rounded-lg flex items-center justify-between border-l-4 border-emerald-500">
          <div>
            <span className="text-xs text-emerald-600 font-medium">{replyingTo.profiles.full_name}</span>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 w-6 p-0">×</Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-background border-t flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="group-image-upload"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
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
                room_id: UNIFIED_ROOM_ID,
                user_id: user?.id,
                content: '📷 Image',
                media_url: urlData.publicUrl,
                message_type: 'image'
              });
              
              queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
              toast.success('Image sent');
            } catch (error) {
              toast.error('Failed to upload image');
            }
          }}
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground"
          onClick={() => document.getElementById('group-image-upload')?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          id="group-file-upload"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
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
                room_id: UNIFIED_ROOM_ID,
                user_id: user?.id,
                content: `📎 ${file.name}`,
                media_url: urlData.publicUrl,
                message_type: 'document'
              });
              
              queryClient.invalidateQueries({ queryKey: ['unified-chat-messages'] });
              toast.success('File sent');
            } catch (error) {
              toast.error('Failed to upload file');
            }
          }}
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground"
          onClick={() => document.getElementById('group-file-upload')?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-muted border-0"
        />
        {message.trim() ? (
          <Button type="submit" size="icon" className="rounded-full bg-emerald-500 hover:bg-emerald-600" disabled={sendMutation.isPending}>
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  );
}
