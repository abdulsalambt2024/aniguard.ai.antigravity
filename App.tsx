
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, AppLanguage, BioMaterialListing, Conversation, ConversationMessage, AdminUser } from './types';
import ProfileSetup from './components/ProfileSetup';
import Header from './components/Header';
import LivestockDashboard from './components/LivestockDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import ResearcherDashboard from './components/ResearcherDashboard';
import PetEmergencyTriage from './components/PetEmergencyTriage';
import AdvisorChat from './components/AdvisorChat';
import Messenger from './components/Messenger';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import HomeDashboard from './components/HomeDashboard';
import HerdPage from './components/HerdPage';
import HealthAlerts from './components/HealthAlerts';
import AskPage from './components/AskPage';
import CareHub from './components/CareHub';
import { getCurrentLocation } from './services/locationService';
import { UI_STRINGS } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('aniguard_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAdminGateway, setShowAdminGateway] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('aniguard_theme') === 'dark');
  
  const [listings, setListings] = useState<BioMaterialListing[]>(() => {
    const saved = localStorage.getItem('aniguard_listings');
    return saved ? JSON.parse(saved) : [
      { id: '1', farmerName: 'Rajesh Kumar', materialName: 'Organic Dung', quantity: 500, region: 'Punjab', coords: { lat: 30.901, lng: 75.857 }, contactInfo: 'Chat on AniGuard', availableDate: '2024-05-20' },
      { id: '2', farmerName: 'Venkatesh Rao', materialName: 'Dry Neem Leaves', quantity: 200, region: 'Andhra Pradesh', coords: { lat: 17.385, lng: 78.486 }, contactInfo: 'Chat on AniGuard', availableDate: '2024-05-10' },
    ];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('aniguard_convs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aniguard_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aniguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aniguard_theme', 'light');
    }
  }, [darkMode]);

  const handleProfileComplete = async (newProfile: UserProfile) => {
    try {
      const coords = await getCurrentLocation();
      newProfile.coords = coords;
    } catch (e) {}
    setProfile(newProfile);
    localStorage.setItem('aniguard_profile', JSON.stringify(newProfile));
    setActiveTab('home');
  };

  const handleAdminLogin = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('aniguard_admin', JSON.stringify(user));
    setShowAdminGateway(false);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('aniguard_admin');
  };

  const handleDeleteListing = (id: string) => {
    const updated = listings.filter(l => l.id !== id);
    setListings(updated);
    localStorage.setItem('aniguard_listings', JSON.stringify(updated));
  };

  const handleSendMessage = (chatId: string, text: string) => {
    if (!profile) return;
    setConversations(prev => prev.map(conv => {
      if (conv.id === chatId) {
        const newMsg: ConversationMessage = { id: `msg_${Date.now()}`, senderName: profile.name, text, timestamp: Date.now() };
        return { ...conv, messages: [...conv.messages, newMsg], lastMessage: text };
      }
      return conv;
    }));
  };

  // Admin View takes precedence
  if (adminUser) {
    return (
      <AdminDashboard 
        user={adminUser} 
        onLogout={handleAdminLogout} 
        listings={listings}
        onDeleteListing={handleDeleteListing}
      />
    );
  }

  // Admin Gateway
  if (showAdminGateway) {
    return <AdminLogin onLogin={handleAdminLogin} onClose={() => setShowAdminGateway(false)} />;
  }

  // Regular User Onboarding
  if (!profile) return <ProfileSetup onComplete={handleProfileComplete} />;

  const strings = UI_STRINGS[profile.language] || UI_STRINGS.en;

  const renderContent = () => {
    switch (activeTab) {
      case 'herd': return <HerdPage profile={profile} />;
      case 'alerts': return <HealthAlerts profile={profile} />;
      case 'care': return <CareHub profile={profile} />;
      case 'ask': return <AskPage profile={profile} />;
      default: return <HomeDashboard profile={profile} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 transition-colors duration-300" style={{ backgroundColor: '#f3f2ed' }}>
      {/* Hidden Admin Gateway Trigger */}
      <button 
        onClick={() => setShowAdminGateway(true)}
        className="fixed top-0 right-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-default z-[9999]"
        title="Admin Entry"
      />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-10 pb-4">
        {renderContent()}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]" style={{ width: 'calc(100% - 32px)', maxWidth: '400px' }}>
        <div className="flex justify-around items-center px-3 py-2 rounded-full shadow-xl" style={{ backgroundColor: '#1a3c2b' }}>
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
          <NavBtn active={activeTab === 'herd'} onClick={() => setActiveTab('herd')} label="Herd" />
          <NavBtn active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} label="Alerts" />
          <NavBtn active={activeTab === 'care'} onClick={() => setActiveTab('care')} label="Care" />
          <NavBtn active={activeTab === 'ask'} onClick={() => setActiveTab('ask')} label="Ask" />
        </div>
      </div>
    </div>
  );
};


const NavBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
    style={active
      ? { backgroundColor: '#F5A623', color: '#1a3c2b' }
      : { color: '#a5c9b4' }
    }
  >
    {label}
  </button>
);

export default App;

