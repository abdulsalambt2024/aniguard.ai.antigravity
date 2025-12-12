import { useAuth } from '@/contexts/AuthContext';
import { UnifiedGroupChat } from '@/components/chat/UnifiedGroupChat';
import { PrivateChat } from '@/components/chat/PrivateChat';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle } from 'lucide-react';

export default function Chat() {
  const { role } = useAuth();

  // Only members, admins, super_admins can access chat
  if (role === 'viewer') {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="p-12 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chat Access Restricted</h2>
          <p className="text-muted-foreground">
            Chat is only available for Members, Admins, and Super Admins.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 h-[calc(100vh-8rem)]">
      <Tabs defaultValue="group" className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="group" className="gap-2 px-4">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-2 px-4">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Private</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="group" className="flex-1 mt-0 h-[calc(100%-4rem)]">
          <Card className="h-full overflow-hidden">
            <UnifiedGroupChat />
          </Card>
        </TabsContent>

        <TabsContent value="private" className="flex-1 mt-0 h-[calc(100%-4rem)]">
          <PrivateChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}