import React, { useState, useEffect } from 'react';
import { AniGuardHeader } from '../components/aniguard/AniGuardHeader';
import { AniGuardNavBar, AniGuardTab } from '../components/aniguard/AniGuardNavBar';
import { FarmDashboard } from '../components/aniguard/FarmDashboard';
import { AnimalsListView } from '../components/aniguard/AnimalsListView';
import { HealthAlertsView } from '../components/aniguard/HealthAlertsView';
import { FarmAIAssistant } from '../components/aniguard/FarmAIAssistant';
import { AIRationCalculatorView } from '../components/aniguard/AIRationCalculatorView';
import { ProfitIntelligenceView } from '../components/aniguard/ProfitIntelligenceView';
import { VaccinationCalendarView } from '../components/aniguard/VaccinationCalendarView';
import { GovtSchemesView } from '../components/aniguard/GovtSchemesView';
import { DiseaseLibraryView } from '../components/aniguard/DiseaseLibraryView';
import { LearningCenterView } from '../components/aniguard/LearningCenterView';
import { AniGuardFooter } from '../components/aniguard/AniGuardFooter';

import { AIHealthCheckModal } from '../components/aniguard/AIHealthCheckModal';
import { DailyLoggingModal } from '../components/aniguard/DailyLoggingModal';
import { AddAnimalModal } from '../components/aniguard/AddAnimalModal';
import { AnimalDetailModal } from '../components/aniguard/AnimalDetailModal';
import { VoiceEntryModal } from '../components/aniguard/VoiceEntryModal';
import { AuthModal } from '../components/aniguard/AuthModal';

import { AniGuardAdminPanel } from '../components/admin/AniGuardAdminPanel';
import { adminService } from '../services/adminService';
import { aniguardService } from '../services/aniguardService';
import { Animal, FarmSummary, HealthAlert, HealthPrediction } from '../types/aniguard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Home() {
  const { user, role: authRole, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AniGuardTab>('home');
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
      const resolvedRole = (authRole === 'super_admin' || authRole === 'admin') ? authRole : 'user';
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

  const displayName = user?.user_metadata?.full_name || (
    currentUserRole === 'super_admin'
      ? (currentUserEmail.includes('abdul') ? 'Abdul Salam' : currentUserEmail.includes('hayat') ? 'Hayat Amr' : 'Super Admin')
      : currentUserRole === 'admin'
      ? 'Dr. Arvind Patel'
      : summary?.owner_name || 'Ramesh Kumar'
  );

  return (
    <div className="min-h-screen bg-[#070E17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <AniGuardHeader
        onEmergencyCall={handleEmergencyCall}
        onAuthClick={() => setIsAuthOpen(true)}
        farmerName={displayName}
        userEmail={user?.email || currentUserEmail || null}
        userRole={currentUserRole}
        onSignOut={async () => {
          await signOut();
          setCurrentUserEmail('');
          setCurrentUserRole('user');
          setActiveTab('home');
        }}
      />

      {/* Sub Navigation Bar */}
      <AniGuardNavBar
        activeTab={activeTab}
        showAdminTab={currentUserRole === 'super_admin' || currentUserRole === 'admin'}
        onTabChange={(tab) => {
          if (tab === 'ai_check') {
            setIsAICheckOpen(true);
          } else if (tab === 'admin' && currentUserRole === 'user') {
            toast.error('Unauthorized Access', {
              description: 'Administrative privileges required to access the AniGuard Control Center.',
            });
            setActiveTab('home');
          } else {
            setActiveTab(tab);
          }
        }}
        urgentAlertCount={urgentAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {summary && activeTab === 'home' && (
          <FarmDashboard
            summary={summary}
            animals={animals}
            alerts={alerts}
            onVoiceEntry={() => setIsVoiceEntryOpen(true)}
            onAICheck={() => setIsAICheckOpen(true)}
            onAddAnimal={() => setIsAddAnimalOpen(true)}
            onSelectAnimal={handleSelectAnimal}
            onViewAllAnimals={() => setActiveTab('animals')}
            onScheduleVet={handleScheduleVet}
            onAlertAction={handleScheduleVet}
            onQuickLog={(aniId) => handleOpenLogModal(aniId)}
            onQuickScan={(aniId) => {
              setPreselectedAnimalId(aniId);
              setIsAICheckOpen(true);
            }}
            onRefresh={refreshData}
            onNavigateTab={(tab) => {
              if (tab === 'ai_check') {
                setIsAICheckOpen(true);
              } else {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {activeTab === 'animals' && (
          <AnimalsListView
            animals={animals}
            onSelectAnimal={handleSelectAnimal}
            onAddAnimal={() => setIsAddAnimalOpen(true)}
          />
        )}

        {activeTab === 'alerts' && (
          <HealthAlertsView
            alerts={alerts}
            onScheduleVet={handleScheduleVet}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'farm_ai' && <FarmAIAssistant animals={animals} />}

        {activeTab === 'ration' && <AIRationCalculatorView animals={animals} />}

        {activeTab === 'profit' && <ProfitIntelligenceView />}

        {activeTab === 'vaccinations' && (
          <VaccinationCalendarView
            vaccinations={aniguardService.getVaccinations()}
            animals={animals}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'schemes' && (
          <GovtSchemesView schemes={aniguardService.getGovtSchemes()} />
        )}

        {activeTab === 'disease_library' && (
          <DiseaseLibraryView diseases={aniguardService.getDiseases()} />
        )}

        {activeTab === 'learning' && <LearningCenterView />}

        {activeTab === 'admin' && (
          <AniGuardAdminPanel
            currentUserEmail={currentUserEmail}
            onClose={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Enterprise Production Footer */}
      <AniGuardFooter
        onNavigateTab={(tab) => {
          if (tab === 'ai_check') {
            setIsAICheckOpen(true);
          } else {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onEmergencyCall={handleEmergencyCall}
      />

      {/* Global Modals */}
      <AIHealthCheckModal
        isOpen={isAICheckOpen}
        onClose={() => setIsAICheckOpen(false)}
        animals={animals}
        diseases={aniguardService.getDiseases()}
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
    </div>
  );
}
