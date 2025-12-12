import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Parivartan</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationsPanel />
        </div>
      </div>
    </header>
  );
}
