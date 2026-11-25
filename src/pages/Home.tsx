import React, { useState, useEffect } from 'react';
import { PdfHeader } from '../components/pdf/PdfHeader';
import { AniGuardPdfNavBar, PdfNavTab } from '../components/pdf/AniGuardPdfNavBar';
import { PdfHomeView } from '../components/pdf/PdfHomeView';
import { PdfHerdView } from '../components/pdf/PdfHerdView';
import { PdfAlertsView } from '../components/pdf/PdfAlertsView';
import { PdfCareHubView, CareSubTab } from '../components/pdf/PdfCareHubView';
import { PdfAskAniGuardView } from '../components/pdf/PdfAskAniGuardView';
import { PdfProfitView } from '../components/pdf/PdfProfitView';

import { AniGuardPaymentModal } from '../components/payment/AniGuardPaymentModal';
import { razorpayService } from '../services/razorpayService';
import { DesktopSidebar, DesktopNavId } from '../components/desktop/DesktopSidebar';

import { AIHealthCheckModal } from '../components/aniguard/AIHealthCheckModal';
import { DailyLoggingModal } from '../components/aniguard/DailyLoggingModal';
import { AddAnimalModal } from '../components/aniguard/AddAnimalModal';
import { AnimalDetailModal } from '../components/aniguard/AnimalDetailModal';
import { VoiceEntryModal } from '../components/aniguard/VoiceEntryModal';
import { AuthModal } from '../components/aniguard/AuthModal';

import { AniGuardAdminPanel } from '../components/admin/AniGuardAdminPanel';
import { aniguardService } from '../services/aniguardService';
import { Animal, FarmSummary, HealthAlert } from '../types/aniguard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Home() {
  const { user, role: authRole, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<PdfNavTab | 'admin'>('home');
  const [homeSubView, setHomeSubView] = useState<'overview' | 'profit'>('overview');
  const [careSubTab, setCareSubTab] = useState<CareSubTab | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [summary, setSummary] = useState<FarmSummary | null>(null);

  // Authentication & RBAC State (synchronized with live Supabase user)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(user?.email || '');
  const [currentUserRole, setCurrentUserRole] = useState<'super_admin' | 'admin' | 'user'>(
    authRole === 'super_admin' || authRole === 'admin' ? authRole : 'user'
  );

  // Modals state
  const [isAICheckOpen, setIsAICheckOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [isVoiceEntryOpen, setIsVoiceEntryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePlanTier, setActivePlanTier] = useState<'free' | 'pro' | 'enterprise'>(
    razorpayService.getActiveSubscriptionTier()
  );
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState<Animal | null>(null);
  const [preselectedAnimalId, setPreselectedAnimalId] = useState<string | undefined>(undefined);

  const refreshData = () => {
    setAnimals(aniguardService.getAnimals());
    setAlerts(aniguardService.getAlerts());
    setSummary(aniguardService.getFarmSummary());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Synchronize live Supabase Auth session with Home component state
  useEffect(() => {
    if (user) {
      setCurrentUserEmail(user.email || '');
      const resolvedRole = authRole === 'super_admin' || authRole === 'admin' ? authRole : 'user';
      setCurrentUserRole(resolvedRole);
    } else {
      setCurrentUserEmail('');
      setCurrentUserRole('user');
      if (activeTab === 'admin') {
        setActiveTab('home');
      }
    }
  }, [user, authRole]);

  const handleSelectAnimal = (animal: Animal) => {
    setSelectedAnimalForDetail(animal);
  };

  const handleOpenLogModal = (animalId?: string) => {
    setPreselectedAnimalId(animalId);
    setIsDailyLogOpen(true);
  };

  const handleScheduleVet = (alert: HealthAlert) => {
    aniguardService.escalateToVeterinarian(alert.animal_id, undefined, alert.description);
    toast.success(`Veterinary consultation requested for ${alert.animal_name}!`, {
      description: 'Dr. Arvind Patel (+91 98250 12345) has been notified with clinical telemetry.',
    });
    refreshData();
  };

  const handleEmergencyCall = () => {
    toast.error('Emergency Veterinary Hotline: Calling +91 98250 12345...', {
      description: 'Connected to Anand District Mobile Veterinary Emergency Dispatch.',
    });
  };

  const handleAuthSuccess = (identifier: string, roleName: string) => {
    let resolvedRole: 'super_admin' | 'admin' | 'user' = 'user';
    if (roleName.toLowerCase().includes('super')) {
      resolvedRole = 'super_admin';
    } else if (roleName.toLowerCase().includes('admin')) {
      resolvedRole = 'admin';
    }

    setCurrentUserEmail(identifier);
    setCurrentUserRole(resolvedRole);

    if (resolvedRole === 'user' && activeTab === 'admin') {
      setActiveTab('home');
    }

    toast.success(`Authenticated as ${roleName}: ${identifier}`, {
      description: `Active role: ${resolvedRole.toUpperCase()}. Access permissions synchronized.`,
    });
  };

  const urgentAlertCount = alerts.filter((a) => !a.is_resolved).length;
  const currentPrediction = selectedAnimalForDetail
    ? aniguardService.getPredictionForAnimal(selectedAnimalForDetail.id)
    : undefined;
  const currentRecords = selectedAnimalForDetail
    ? aniguardService.getDailyRecords(selectedAnimalForDetail.id)
    : [];

  const displayName =
    user?.user_metadata?.full_name ||
    (currentUserRole === 'super_admin'
      ? currentUserEmail.includes('abdul')
        ? 'Abdul Salam'
        : currentUserEmail.includes('hayat')
        ? 'Hayat Amr'
        : 'Super Admin'
      : currentUserRole === 'admin'
      ? 'Dr. Arvind Patel'
      : summary?.owner_name || 'Ramesh');

  const getDesktopNavId = (): DesktopNavId => {
    if (activeTab === 'home') {
      return homeSubView === 'profit' ? 'profit' : 'overview';
    }
    if (activeTab === 'herd') return 'herd';
    if (activeTab === 'alerts') return 'alerts';
    if (activeTab === 'ask') return 'ask';
    if (activeTab === 'care') {
      if (careSubTab === 'vaccines') return 'vaccines';
      if (careSubTab === 'disease_guide') return 'disease_guide';
      if (careSubTab === 'feed_plan') return 'feed_plan';
      if (careSubTab === 'govt_support') return 'govt_support';
      if (careSubTab === 'plans') return 'subscription';
      return 'disease_guide';
    }
    return 'overview';
  };

  const handleDesktopNavigate = (navId: DesktopNavId) => {
    switch (navId) {
      case 'overview':
        setActiveTab('home');
        setHomeSubView('overview');
        break;
      case 'herd':
        setActiveTab('herd');
        break;
      case 'ai_scan':
        setIsAICheckOpen(true);
        break;
      case 'alerts':
        setActiveTab('alerts');
        break;
      case 'vaccines':
        setActiveTab('care');
        setCareSubTab('vaccines');
        break;
      case 'disease_guide':
        setActiveTab('care');
        setCareSubTab('disease_guide');
        break;
      case 'feed_plan':
        setActiveTab('care');
        setCareSubTab('feed_plan');
        break;
      case 'govt_support':
        setActiveTab('care');
        setCareSubTab('govt_support');
        break;
      case 'ask':
        setActiveTab('ask');
        break;
      case 'profit':
        setActiveTab('home');
        setHomeSubView('profit');
        break;
      case 'subscription':
        setActiveTab('care');
        setCareSubTab('plans');
        break;
      case 'settings':
        setIsAuthOpen(true);
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F5EE] text-[#122B1E] font-sans antialiased selection:bg-[#EFA037] selection:text-[#122B1E] flex flex-row">
      {/* Desktop Sidebar (Persistent 12-item navigation on desktop/large screens) */}
      <div className="hidden lg:block">
        <DesktopSidebar
          currentNav={getDesktopNavId()}
          onNavigate={handleDesktopNavigate}
          urgentAlertCount={urgentAlertCount}
          farmerName={displayName}
          farmName={summary?.farm_name || 'GreenPastures Dairy Farm'}
          activePlanTier={activePlanTier}
          onEmergencyCall={handleEmergencyCall}
          onOpenAdmin={() => setActiveTab('admin')}
          isAdmin={currentUserRole === 'admin' || currentUserRole === 'super_admin'}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-screen">
        <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex-1 flex flex-col justify-between relative">
        {/* Header: On desktop always show top navbar; on mobile show only on Home Overview */}
        {(activeTab === 'home' && homeSubView === 'overview') ? (
          <PdfHeader
            farmerName={displayName}
            farmName={summary?.farm_name || 'GreenPastures Dairy Farm'}
            location={summary?.location || 'Anand'}
            userEmail={user?.email || currentUserEmail || null}
            userRole={currentUserRole}
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'home') setHomeSubView('overview');
              if (tab === 'care') setCareSubTab(null);
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            urgentAlertCount={urgentAlertCount}
            onOpenAdmin={() => setActiveTab('admin')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSignOut={async () => {
              await signOut();
              setCurrentUserEmail('');
              setCurrentUserRole('user');
              setActiveTab('home');
            }}
            onEmergencyCall={handleEmergencyCall}
          />
        ) : (
          <div className="hidden md:block">
            <PdfHeader
              farmerName={displayName}
              farmName={summary?.farm_name || 'GreenPastures Dairy Farm'}
              location={summary?.location || 'Anand'}
              userEmail={user?.email || currentUserEmail || null}
              userRole={currentUserRole}
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (tab === 'home') setHomeSubView('overview');
                if (tab === 'care') setCareSubTab(null);
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              urgentAlertCount={urgentAlertCount}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSignOut={async () => {
                await signOut();
                setCurrentUserEmail('');
                setCurrentUserRole('user');
                setActiveTab('home');
              }}
              onEmergencyCall={handleEmergencyCall}
            />
          </div>
        )}

        {/* Main Body Views */}
        <main className="flex-1 mt-1">
          {/* Page 1: Home View (Overview or Profit) */}
          {activeTab === 'home' && (
            <>
              {homeSubView === 'overview' && summary && (
                <PdfHomeView
                  summary={summary}
                  animals={animals}
                  alerts={alerts}
                  farmerName={displayName}
                  onRunHealthScan={() => setIsAICheckOpen(true)}
                  onCallVet={handleScheduleVet}
                  onSelectAnimal={handleSelectAnimal}
                  onVoiceLog={() => setIsVoiceEntryOpen(true)}
                  onOpenFeedPlan={() => {
                    setCareSubTab('feed_plan');
                    setActiveTab('care');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenSchemes={() => {
                    setCareSubTab('govt_support');
                    setActiveTab('care');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenProfit={() => {
                    setHomeSubView('profit');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenAlerts={() => {
                    setActiveTab('alerts');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {homeSubView === 'profit' && (
                <PdfProfitView
                  onBack={() => {
                    setHomeSubView('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}

          {/* Page 2: Your Herd View */}
          {activeTab === 'herd' && (
            <PdfHerdView
              animals={animals}
              onSelectAnimal={handleSelectAnimal}
              onAddAnimal={() => setIsAddAnimalOpen(true)}
            />
          )}

          {/* Page 3: Health Alerts View */}
          {activeTab === 'alerts' && (
            <PdfAlertsView
              alerts={alerts}
              onScheduleVet={handleScheduleVet}
              onResolveAlert={(id) => {
                aniguardService.resolveAlert(id);
                refreshData();
              }}
              onRefresh={refreshData}
            />
          )}

          {/* Care Hub (Disease Guide, Feed Plan, Govt Support, Plans, Vaccines) */}
          {activeTab === 'care' && (
            <PdfCareHubView
              initialSubTab={careSubTab}
              currentUserEmail={currentUserEmail}
              currentUserName={displayName}
              onBookVet={(animalName) => {
                toast.success(`Veterinary appointment initiated for ${animalName}!`);
                handleEmergencyCall();
              }}
              onAddVaccinationRecord={() => {
                toast.info('Vaccination schedule sync active.');
                refreshData();
              }}
              onUpgradeSuccess={() => setActivePlanTier(razorpayService.getActiveSubscriptionTier())}
            />
          )}

          {/* Page 9: Ask AniGuard View */}
          {activeTab === 'ask' && <PdfAskAniGuardView />}

          {/* Administration Control Panel */}
          {activeTab === 'admin' && (
            <div className="py-2">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7DC]">
                <h2 className="text-base font-bold text-[#142C1F]">Admin Control Center</h2>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-3 py-1 rounded-full bg-[#142C1F] text-white text-xs font-semibold"
                >
                  Back to Farm
                </button>
              </div>
              <AniGuardAdminPanel
                currentUserEmail={currentUserEmail}
                onClose={() => setActiveTab('home')}
              />
            </div>
          )}
        </main>

        {/* Floating Bottom Navigation Bar */}
        {activeTab !== 'admin' && (
          <AniGuardPdfNavBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'home') {
                setHomeSubView('overview');
              }
              if (tab === 'care') {
                setCareSubTab(null);
              }
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            urgentAlertCount={urgentAlertCount}
          />
        )}
        </div>
      </div>

      {/* Global Modals (AI Health Scan, Daily Log, Add Animal, Detail, Voice, Auth, Razorpay Payment) */}
      <AIHealthCheckModal
        isOpen={isAICheckOpen}
        onClose={() => setIsAICheckOpen(false)}
        animals={animals}
        diseases={aniguardService.getDiseases()}
        onAssessmentSaved={refreshData}
        onEscalateVet={(animalId, predId) => {
          const ani = animals.find((a) => a.id === animalId);
          toast.success(`Veterinary escalation created for ${ani?.name || 'animal'}!`);
          aniguardService.escalateToVeterinarian(animalId, predId);
          refreshData();
        }}
      />

      <DailyLoggingModal
        isOpen={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
        animals={animals}
        defaultAnimalId={preselectedAnimalId}
        onSaved={() => {
          toast.success('Daily milk and health vitals recorded successfully!');
          refreshData();
        }}
      />

      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={() => {
          toast.success('New animal successfully registered to herd!');
          refreshData();
        }}
      />

      <AnimalDetailModal
        animal={selectedAnimalForDetail}
        records={currentRecords}
        prediction={currentPrediction}
        isOpen={!!selectedAnimalForDetail}
        onClose={() => setSelectedAnimalForDetail(null)}
        onOpenLogModal={(aniId) => {
          setSelectedAnimalForDetail(null);
          handleOpenLogModal(aniId);
        }}
        onOpenAICheck={(aniId) => {
          setSelectedAnimalForDetail(null);
          setIsAICheckOpen(true);
        }}
        onEscalateVet={(aniId) => {
          const ani = animals.find((a) => a.id === aniId);
          aniguardService.escalateToVeterinarian(aniId);
          toast.success(`Emergency veterinary consult scheduled for ${ani?.name}!`);
          setSelectedAnimalForDetail(null);
          refreshData();
        }}
      />

      <VoiceEntryModal
        isOpen={isVoiceEntryOpen}
        onClose={() => setIsVoiceEntryOpen(false)}
        animals={animals}
        onSaved={() => {
          toast.success('Voice record processed and stored in database!');
          refreshData();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleAuthSuccess}
      />

      <AniGuardPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentUserEmail={currentUserEmail}
        currentUserName={displayName}
        onPlanActivated={(tier) => setActivePlanTier(tier)}
      />
    </div>
  );
}
