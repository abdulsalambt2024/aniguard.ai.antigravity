import { useAuth } from '@/contexts/AuthContext';
import { Home, FileText, Calendar, MessageCircle, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { role } = useAuth();
  
  // Chat is only visible to members, admins, and super admins
  const canSeeChat = role && ['member', 'admin', 'super_admin'].includes(role);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/posts', icon: FileText, label: 'Posts' },
    { to: '/events', icon: Calendar, label: 'Events' },
    ...(canSeeChat ? [{ to: '/chat', icon: MessageCircle, label: 'Chat' }] : []),
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <div className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}>
                <item.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
