
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, AppLanguage, BioMaterialListing, Conversation, ConversationMessage, AdminUser } from './types';
import ProfileSetup from './components/ProfileSetup';
import Header from './components/Header';
import LivestockDashboard from './components/LivestockDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import ResearcherDashboard from './components/ResearcherDashboard';
import PetEmergencyTriage from './components/PetEmergencyTriage';
import DecisionEngine from './components/DecisionEngine';
import AdvisorChat from './components/AdvisorChat';
import ProfitAnalyzer from './components/ProfitAnalyzer';
import Messenger from './components/Messenger';
import SuccessStories from './components/SuccessStories';
import VoiceAssistant from './components/VoiceAssistant';
import VetFinder from './components/VetFinder';
import VideoLab from './components/VideoLab';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
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
      case 'health': return <PetEmergencyTriage profile={profile} />;
      case 'market': return <DecisionEngine profile={profile} />;
      case 'voice': return <VoiceAssistant profile={profile} />;
      case 'chat': return <AdvisorChat profile={profile} />;
      case 'finance': return <ProfitAnalyzer profile={profile} />;
      case 'vets': return <VetFinder profile={profile} />;
      case 'lab': return <VideoLab profile={profile} />;
      case 'messages': return (
        <Messenger 
          profile={profile} 
          conversations={conversations} 
          onSendMessage={handleSendMessage} 
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
        />
      );
      case 'listing': return <FarmerDashboard profile={profile} onNavigate={setActiveTab} onPostListing={() => {}} isListingMode={true} />;
      case 'stories': return <SuccessStories profile={profile} />;
      case 'radar': return (
        <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
           <i className="fa-solid fa-satellite-dish text-6xl text-emerald-500 mb-6 animate-pulse"></i>
           <h2 className="text-3xl font-black uppercase tracking-tight">Active Disease Monitoring</h2>
           <p className="mt-4 text-slate-400 max-w-sm">Aggregating thousands of health scans to predict the next outbreak in your district on AniGuard AI.</p>
           <button onClick={() => setActiveTab('vets')} className="mt-8 px-8 py-4 bg-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition">Find Emergency Vet</button>
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid.png')]"></div>
        </div>
      );
      default: 
        if (profile.role === UserRole.RESEARCHER) return <ResearcherDashboard profile={profile} listings={listings} />;
        if (profile.role === UserRole.FARMER) return <FarmerDashboard profile={profile} onNavigate={setActiveTab} onPostListing={() => {}} conversations={conversations} />;
        return <LivestockDashboard profile={profile} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 pb-28 transition-colors duration-300">
      <Header 
        profile={profile} 
        onReset={() => { setProfile(null); localStorage.removeItem('aniguard_profile'); }}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLanguageChange={(l) => {
          const up = {...profile, language: l};
          setProfile(up);
          localStorage.setItem('aniguard_profile', JSON.stringify(up));
        }}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Hidden Admin Gateway Trigger */}
      <button 
        onClick={() => setShowAdminGateway(true)}
        className="fixed top-0 right-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-default z-[9999]"
        title="Admin Entry"
      />

      <footer className="fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 dark:border-slate-800 z-[100] px-4 pb-safe-area shadow-[0_-4px_10px_rgba(0,0,0,0.03)] transition-colors">
        <div className="max-w-7xl mx-auto flex justify-around items-center h-20">
          <FooterLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} label={strings.home} icon="fa-house" />
          <FooterLink active={activeTab === 'health'} onClick={() => setActiveTab('health')} label={strings.health} icon="fa-stethoscope" />
          <FooterLink active={activeTab === 'vets'} onClick={() => setActiveTab('vets')} label="Vets" icon="fa-map-location-dot" />
          <FooterLink active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} label="Video" icon="fa-clapperboard" />
          <FooterLink active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} label="Live" icon="fa-microphone" />
        </div>
      </footer>
    </div>
  );
};

const FooterLink = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all group ${active ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-400'}`}>
    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-900/30 scale-105' : 'bg-transparent'}`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default App;
