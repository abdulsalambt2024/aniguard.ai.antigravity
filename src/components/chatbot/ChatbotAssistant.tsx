import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { chatbotMessageSchema } from '@/lib/validation';

export function ChatbotAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const { data: faqData } = useQuery({
    queryKey: ['chatbot-faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_faq')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Validate message
      const validation = chatbotMessageSchema.safeParse({
        message: userMessage.trim()
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Save conversation
      await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: user?.id,
          message: validation.data.message,
          response: 'Pending...'
        });

      // Call AI chatbot edge function
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: {
          message: validation.data.message,
          faqContext: faqData,
          conversationHistory: conversation
        }
      });

      if (error) throw error;
      return data.response;
    },
    onSuccess: (response) => {
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
    },
    onError: () => {
      toast.error('Failed to get response');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    setConversation(prev => [...prev, { role: 'user', content: message }]);
    chatMutation.mutate(message);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-2xl z-50">
      <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">PARIVARTAN Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 && (
          <div className="text-center text-muted-foreground">
            <p>Hi! I'm your PARIVARTAN assistant.</p>
            <p className="text-sm mt-2">Ask me about:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• How to create posts</li>
              <li>• Managing events</li>
              <li>• Donation campaigns</li>
              <li>• Using AI Studio</li>
              <li>• And more!</li>
            </ul>
          </div>
        )}
        
        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question..."
        />
        <Button onClick={handleSend} size="icon" disabled={chatMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
