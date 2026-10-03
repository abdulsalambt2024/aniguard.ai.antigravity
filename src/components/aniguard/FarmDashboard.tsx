import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturedTipCard } from './FeaturedTipCard';
import { LiveAnimalMonitor } from './LiveAnimalMonitor';
import { UrgentAlertsCard } from './UrgentAlertsCard';
import { QuickGrid } from './QuickGrid';
import { SponsoredBanner } from './SponsoredBanner';
import { Animal, FarmSummary, HealthAlert } from '../../types/aniguard';
import { AniGuardTab } from './AniGuardNavBar';

interface FarmDashboardProps {
  summary: FarmSummary;
  animals: Animal[];
  alerts: HealthAlert[];
  onVoiceEntry: () => void;
  onAICheck: () => void;
  onAddAnimal: () => void;
  onSelectAnimal: (animal: Animal) => void;
  onViewAllAnimals: () => void;
  onScheduleVet: (alert: HealthAlert) => void;
  onAlertAction: (alert: HealthAlert) => void;
  onNavigateTab: (tab: AniGuardTab) => void;
  onQuickLog?: (animalId: string) => void;
  onQuickScan?: (animalId: string) => void;
  onRefresh?: () => void;
}

export const FarmDashboard: React.FC<FarmDashboardProps> = ({
  summary,
  animals,
  alerts,
  onVoiceEntry,
  onAICheck,
  onAddAnimal,
  onSelectAnimal,
  onViewAllAnimals,
  onScheduleVet,
  onAlertAction,
  onNavigateTab,
  onQuickLog,
  onQuickScan,
  onRefresh,
}) => {
  return (
    <div className="space-y-5">
      {/* Top 2 Columns: Hero Section (2/3) + Featured Tip & Campaign (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <HeroSection
            summary={summary}
            onVoiceEntry={onVoiceEntry}
            onAICheck={onAICheck}
            onAddAnimal={onAddAnimal}
            onRefresh={onRefresh}
          />
        </div>

        <div className="lg:col-span-1">
          <FeaturedTipCard onRunAICheck={onAICheck} />
        </div>
      </div>

      {/* Middle 3 Columns: Live Animal Health Monitor + Urgent Alerts & Reminders + Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Left: Live Animal Health Monitor */}
        <div className="h-full">
          <LiveAnimalMonitor
            animals={animals}
            onSelectAnimal={onSelectAnimal}
            onViewAll={onViewAllAnimals}
            onQuickLog={onQuickLog}
            onQuickScan={onQuickScan}
          />
        </div>

        {/* Center: Urgent Alerts & Reminders */}
        <div className="h-full">
          <UrgentAlertsCard
            alerts={alerts}
            onScheduleVet={onScheduleVet}
            onAlertAction={onAlertAction}
          />
        </div>

        {/* Right: Quick Action 8-Grid */}
        <div className="h-full">
          <QuickGrid onNavigate={onNavigateTab} />
        </div>
      </div>

      {/* Bottom: Sponsored Outreach Banner */}
      <div>
        <SponsoredBanner />
      </div>
    </div>
  );
};
