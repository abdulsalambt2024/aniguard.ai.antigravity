import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { HamburgerMenu } from './HamburgerMenu';
import { EnhancedChatbot } from '@/components/chatbot/EnhancedChatbot';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Only show chatbot on home page
  const showChatbot = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setMenuOpen(true)} />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="pb-20 md:pb-8">
        {children}
      </main>
      
      <BottomNavigation />
      {showChatbot && <EnhancedChatbot />}
    </div>
  );
}
