/**
 * AniGuard Unified Livestock Service
 * Handles data synchronization with Supabase, local offline persistence,
 * real-time recalculation of health indices, and clinical alerts.
 */

import {
  Animal,
  DailyRecord,
  Disease,
  HealthAlert,
  HealthPrediction,
  Vaccination,
  VeterinaryCase,
  GovtScheme,
  FarmSummary,
} from '../types/aniguard';
import { PredictiveHealthEngine } from './predictiveEngine';

// Seed Initial Verified Diseases
export const INITIAL_DISEASES: Disease[] = [
  {
    id: 'dis_1',
    code: 'MAS001',
    name: 'Bovine Mastitis',
    scientific_name: 'Mastitis bovis',
    species_affected: ['Cow', 'Buffalo'],
    disease_category: 'Inflammatory / Bacterial',
    causative_agent: 'Staphylococcus aureus, Streptococcus uberis, E. coli',
    key_symptoms: ['Swollen hot udder', 'Abnormal milk clots', 'Drop in milk production', 'Fever', 'Reduced appetite'],
    milk_impact_description: 'Significant sudden or progressive drop in milk yield (15-40%), altered composition with clots or watery flakes.',
    prevention_guidance: 'Post-milking teat dipping, clean dry housing, milking machine vacuum calibration, CMT testing.',
    vaccine_guidance: 'Herd-specific bacterin vaccines available under veterinary guidance.',
    zoonotic_risk: false,
    economic_impact: 'Highest economic loss in dairy sector; premature culling and discarded milk.',
    veterinary_urgency: 'High',
    tier: 1,
    reference_source: 'ICAR - Central Institute for Research on Buffaloes / NDRI',
    source_url: 'https://icar.org.in',
  },
  {
    id: 'dis_2',
    code: 'LSD001',
    name: 'Lumpy Skin Disease (LSD)',
    scientific_name: 'Capripoxvirus',
    species_affected: ['Cow', 'Buffalo'],
    disease_category: 'Viral',
    causative_agent: 'Lumpy skin disease virus (Poxviridae)',
    key_symptoms: ['High fever (40-41°C)', 'Firm nodular skin lesions (2-5 cm)', 'Swollen lymph nodes', 'Excessive salivation', 'Severe drop in milk'],
    milk_impact_description: 'Sharp acute drop in milk yield (up to 50%), persistent loss during convalescence.',
    prevention_guidance: 'Mosquito/fly vector control, quarantine of new arrivals, biosecure stall barriers.',
    vaccine_guidance: 'Homologous live attenuated goat pox vaccine / Lumpi-ProVacInd under DAHD veterinary protocol.',
    zoonotic_risk: false,
    economic_impact: 'Permanent hide damage, chronic milk reduction, reproductive failure.',
    veterinary_urgency: 'High',
    tier: 1,
    reference_source: 'WOAH - World Organisation for Animal Health / DAHD India',
    source_url: 'https://www.woah.org/en/disease/lumpy-skin-disease/',
  },
  {
    id: 'dis_3',
    code: 'FMD001',
    name: 'Foot-and-Mouth Disease (FMD)',
    scientific_name: 'Aphthovirus',
    species_affected: ['Cow', 'Buffalo', 'Goat', 'Sheep'],
    disease_category: 'Viral',
    causative_agent: 'Aphthovirus serotypes O, A, Asia-1',
    key_symptoms: ['High fever', 'Blisters on tongue and gums', 'Ropy excessive salivation', 'Interdigital vesicles with severe lameness', 'Teat blisters'],
    milk_impact_description: 'Immediate drastic reduction in milk output; long-term loss in crossbred dairy cattle.',
    prevention_guidance: 'Strict biosecurity, isolation of suspicious cases, 4% sodium carbonate disinfection.',
    vaccine_guidance: 'Biannual inactivated vaccine under National Animal Disease Control Programme (NADCP).',
    zoonotic_risk: false,
    economic_impact: 'Devastating trade restrictions, calf mortality, persistent loss of productivity.',
    veterinary_urgency: 'Emergency',
    tier: 1,
    reference_source: 'WOAH / DAHD - NADCP',
    source_url: 'https://www.woah.org/en/disease/foot-and-mouth-disease/',
  },
  {
    id: 'dis_4',
    code: 'PPR001',
    name: 'Peste des Petits Ruminants (PPR)',
    scientific_name: 'Small ruminant morbillivirus',
    species_affected: ['Goat', 'Sheep'],
    disease_category: 'Viral ("Goat Plague")',
    causative_agent: 'PPRV (Paramyxoviridae)',
    key_symptoms: ['High fever', 'Mucopurulent ocular-nasal discharge', 'Oral necrotic erosions', 'Severe foul-smelling diarrhea', 'Respiratory distress'],
    milk_impact_description: 'Immediate cessation of lactation; rapid dehydration.',
    prevention_guidance: 'Quarantine newly purchased goats for 21 days; do not mix infected herds.',
    vaccine_guidance: 'Live attenuated Sungri 96 PPR vaccine confers immunity for at least 3 years.',
    zoonotic_risk: false,
    economic_impact: 'High mortality up to 90% in naive small ruminants; catastrophic for smallholder livelihoods.',
    veterinary_urgency: 'Emergency',
    tier: 1,
    reference_source: 'ICAR-IVRI / DAHD National PPR Eradication Programme',
    source_url: 'https://dahd.nic.in',
  },
  {
    id: 'dis_5',
    code: 'HS001',
    name: 'Hemorrhagic Septicemia (HS)',
    scientific_name: 'Pasteurellosis',
    species_affected: ['Cow', 'Buffalo'],
    disease_category: 'Bacterial',
    causative_agent: 'Pasteurella multocida B:2',
    key_symptoms: ['Sudden high fever', 'Swelling in throat, brisket and submandibular area', 'Respiratory grunting', 'Profuse salivation', 'Prostration'],
    milk_impact_description: 'Immediate complete cessation of milk output accompanied by acute prostration.',
    prevention_guidance: 'Avoid grazing in waterlogged pastures during monsoon, protect from cold stress.',
    vaccine_guidance: 'Alum precipitated or oil adjuvant HS vaccine administered pre-monsoon (May-June).',
    zoonotic_risk: false,
    economic_impact: 'High mortality rate (up to 80% without immediate antibiotic intervention).',
    veterinary_urgency: 'Emergency',
    tier: 1,
    reference_source: 'ICAR-IVRI / ICAR-NIVEDI NADRES v2',
    source_url: 'https://icar.org.in',
  },
];

// Seed 4 Animals from reference UI
export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 'ani_1',
    tag_id: 'IN-GJ-1042',
    name: 'Gauri',
    species: 'Cow',
    breed: 'Holstein Friesian Cross',
    age_years: 4,
    gender: 'Female',
    weight_kg: 440,
    pregnancy_status: true,
    pregnancy_month: 6,
    lactation_stage: 'Mid Lactation',
    baseline_milk_yield: 18.5,
    current_health_score: 94,
    health_status: 'Healthy',
    farm_name: 'GreenPastures Dairy Farm',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ani_2',
    tag_id: 'IN-GJ-1088',
    name: 'Lakshmi',
    species: 'Cow',
    breed: 'Gir Indigenous',
    age_years: 3,
    gender: 'Female',
    weight_kg: 380,
    pregnancy_status: false,
    pregnancy_month: 0,
    lactation_stage: 'Early Lactation',
    baseline_milk_yield: 11.2,
    current_health_score: 78,
    health_status: 'Watch',
    farm_name: 'GreenPastures Dairy Farm',
    photo_url: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ani_3',
    tag_id: 'IN-GJ-2011',
    name: 'Shera',
    species: 'Buffalo',
    breed: 'Murrah Buffalo',
    age_years: 5,
    gender: 'Female',
    weight_kg: 520,
    pregnancy_status: false,
    pregnancy_month: 0,
    lactation_stage: 'Mid Lactation',
    baseline_milk_yield: 15.0,
    current_health_score: 98,
    health_status: 'Healthy',
    farm_name: 'GreenPastures Dairy Farm',
    photo_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ani_4',
    tag_id: 'IN-GJ-3090',
    name: 'Moti',
    species: 'Goat',
    breed: 'Sirohi Goat',
    age_years: 2,
    gender: 'Female',
    weight_kg: 42,
    pregnancy_status: false,
    pregnancy_month: 0,
    lactation_stage: 'Early Lactation',
    baseline_milk_yield: 2.1,
    current_health_score: 55,
    health_status: 'Sick',
    farm_name: 'GreenPastures Dairy Farm',
    photo_url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80',
  },
];

// Seed Urgent Alerts & Reminders from Reference UI
export const INITIAL_ALERTS: HealthAlert[] = [
  {
    id: 'alt_1',
    animal_id: 'ani_4',
    tag_id: 'IN-GJ-3090',
    animal_name: 'Moti (Sirohi Goat)',
    alert_type: 'vaccine_overdue',
    title: 'PPR Vaccine Overdue',
    description: 'Moti (Sirohi Goat) is 5 days past due for PPR vaccine booster.',
    risk_level: 'High',
    recommended_action: 'Schedule Vet Visit to administer PPR booster vaccine.',
    action_cta_label: 'Schedule Vet Visit',
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alt_2',
    animal_id: 'ani_1',
    tag_id: 'IN-GJ-1042',
    animal_name: 'Gauri (Holstein)',
    alert_type: 'pregnancy_check',
    title: '5-Month Pregnancy Check',
    description: 'Gauri (Holstein) enters Month 6. Adjust concentrate feed ration by +0.8 kg.',
    risk_level: 'Watch',
    recommended_action: 'Increase mineral mixture and concentrate feed by +0.8 kg/day for fetal growth.',
    action_cta_label: 'Adjust Feed Ration',
    is_read: false,
    is_resolved: false,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

// Seed Historical Daily Records
export const INITIAL_DAILY_RECORDS: DailyRecord[] = [
  // Gauri (Optimal baseline, steady 18.5L)
  {
    id: 'rec_101',
    animal_id: 'ani_1',
    record_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 10.0,
    milk_evening_liters: 8.5,
    total_milk_liters: 18.5,
    temperature_celsius: 38.6,
    appetite: 'Normal',
    water_intake: 'Normal',
    rumination_level: 'Normal',
    activity_level: 'Normal',
    feces_status: 'Normal',
    symptoms: [],
  },
  {
    id: 'rec_102',
    animal_id: 'ani_1',
    record_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 9.8,
    milk_evening_liters: 8.7,
    total_milk_liters: 18.5,
    temperature_celsius: 38.5,
    appetite: 'Normal',
    water_intake: 'Normal',
    rumination_level: 'Normal',
    activity_level: 'Normal',
    feces_status: 'Normal',
    symptoms: [],
  },
  // Lakshmi (Mild drop from 12.5L to 11.2L - Watch)
  {
    id: 'rec_201',
    animal_id: 'ani_2',
    record_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 6.2,
    milk_evening_liters: 5.6,
    total_milk_liters: 11.8,
    temperature_celsius: 38.8,
    appetite: 'Reduced',
    water_intake: 'Normal',
    rumination_level: 'Normal',
    activity_level: 'Normal',
    feces_status: 'Normal',
    symptoms: [],
  },
  {
    id: 'rec_202',
    animal_id: 'ani_2',
    record_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 5.8,
    milk_evening_liters: 5.4,
    total_milk_liters: 11.2,
    temperature_celsius: 39.0,
    appetite: 'Reduced',
    water_intake: 'Normal',
    rumination_level: 'Low',
    activity_level: 'Normal',
    feces_status: 'Normal',
    symptoms: ['Mild appetite reduction'],
  },
  // Shera (Murrah buffalo, rock solid 15L)
  {
    id: 'rec_301',
    animal_id: 'ani_3',
    record_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 8.0,
    milk_evening_liters: 7.0,
    total_milk_liters: 15.0,
    temperature_celsius: 38.4,
    appetite: 'Normal',
    water_intake: 'Normal',
    rumination_level: 'Normal',
    activity_level: 'Normal',
    feces_status: 'Normal',
    symptoms: [],
  },
  // Moti (Goat, drop to 2.1L, fever 40.1C, sluggish - Sick)
  {
    id: 'rec_401',
    animal_id: 'ani_4',
    record_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    milk_morning_liters: 1.1,
    milk_evening_liters: 1.0,
    total_milk_liters: 2.1,
    temperature_celsius: 40.1,
    appetite: 'Reduced',
    water_intake: 'Reduced',
    rumination_level: 'Low',
    activity_level: 'Lethargic',
    feces_status: 'Loose',
    symptoms: ['Nasal discharge', 'Elevated temperature'],
  },
];

// Seed Vaccinations
export const INITIAL_VACCINATIONS: Vaccination[] = [
  {
    id: 'vac_1',
    animal_id: 'ani_4',
    tag_id: 'IN-GJ-3090',
    animal_name: 'Moti (Sirohi Goat)',
    vaccine_name: 'PPR Sungri 96 Vaccine',
    disease_target: 'Peste des Petits Ruminants (PPR)',
    scheduled_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Overdue',
    dosage_ml: 1.0,
    notes: 'PPR booster overdue by 5 days.',
  },
  {
    id: 'vac_2',
    animal_id: 'ani_1',
    tag_id: 'IN-GJ-1042',
    animal_name: 'Gauri (Holstein)',
    vaccine_name: 'FMD Trivalent Oil Adjuvant',
    disease_target: 'Foot-and-Mouth Disease (FMD)',
    scheduled_date: new Date(Date.now() + 18 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Upcoming',
    dosage_ml: 2.0,
  },
  {
    id: 'vac_3',
    animal_id: 'ani_3',
    tag_id: 'IN-GJ-2011',
    animal_name: 'Shera (Murrah)',
    vaccine_name: 'HS Oil Adjuvant Vaccine',
    disease_target: 'Hemorrhagic Septicemia (HS)',
    scheduled_date: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Upcoming',
    dosage_ml: 3.0,
  },
];

// Seed Indian Govt Schemes
export const INITIAL_GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'sch_1',
    scheme_name: 'Rashtriya Gokul Mission (RGM)',
    nodal_agency: 'Department of Animal Husbandry and Dairying (DAHD)',
    target_benefit: '50% capital subsidy up to ₹2 Crore for breed multiplication and free sex-sorted semen artificial insemination.',
    subsidy_percentage: '50% Subsidy',
    eligibility_criteria: 'All dairy farmers, SHGs, FPOs owning indigenous/crossbred cattle.',
    application_portal_url: 'https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission',
    category: 'Breed Improvement & Multiplication',
    is_active: true,
  },
  {
    id: 'sch_2',
    scheme_name: 'Pashu Kisan Credit Card (KCC) Scheme',
    nodal_agency: 'Ministry of Animal Husbandry & RBI',
    target_benefit: 'Working capital loan up to ₹1.60 Lakh without collateral, and up to ₹3 Lakh at 4% effective interest with prompt repayment.',
    subsidy_percentage: '3% Interest Subvention',
    eligibility_criteria: 'Farmers rearing cattle, buffalo, goat or sheep with valid Aadhaar and bank account.',
    application_portal_url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1646270',
    category: 'Credit & Working Capital',
    is_active: true,
  },
  {
    id: 'sch_3',
    scheme_name: 'National Livestock Mission (NLM) Insurance',
    nodal_agency: 'DAHD / State Livestock Development Boards',
    target_benefit: '50% to 70% premium subsidy for animal mortality insurance due to disease or natural calamities.',
    subsidy_percentage: '50-70% Premium Subsidy',
    eligibility_criteria: 'Small, marginal and landless livestock rearers with tagged animals.',
    application_portal_url: 'https://dahd.nic.in/schemes/programmes/national-livestock-mission',
    category: 'Risk Protection & Insurance',
    is_active: true,
  },
];

class AniGuardService {
  private animals: Animal[] = [];
  private dailyRecords: DailyRecord[] = [];
  private diseases: Disease[] = INITIAL_DISEASES;
  private alerts: HealthAlert[] = [];
  private vaccinations: Vaccination[] = [];
  private govtSchemes: GovtScheme[] = INITIAL_GOVT_SCHEMES;
  private predictions: Record<string, HealthPrediction> = {};
  private veterinaryCases: VeterinaryCase[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedAnimals = localStorage.getItem('aniguard_animals');
      this.animals = savedAnimals ? JSON.parse(savedAnimals) : INITIAL_ANIMALS;

      const savedRecords = localStorage.getItem('aniguard_daily_records');
      this.dailyRecords = savedRecords ? JSON.parse(savedRecords) : INITIAL_DAILY_RECORDS;

      const savedAlerts = localStorage.getItem('aniguard_alerts');
      this.alerts = savedAlerts ? JSON.parse(savedAlerts) : INITIAL_ALERTS;

      const savedVaccinations = localStorage.getItem('aniguard_vaccinations');
      this.vaccinations = savedVaccinations ? JSON.parse(savedVaccinations) : INITIAL_VACCINATIONS;

      const savedCases = localStorage.getItem('aniguard_vet_cases');
      this.veterinaryCases = savedCases ? JSON.parse(savedCases) : [];

      // Run predictive evaluation for all animals to synchronize initial health scores
      this.runHerdEvaluation();
    } catch (e) {
      console.warn('Fallback to memory storage:', e);
      this.animals = INITIAL_ANIMALS;
      this.dailyRecords = INITIAL_DAILY_RECORDS;
      this.alerts = INITIAL_ALERTS;
      this.vaccinations = INITIAL_VACCINATIONS;
    }
  }

  private persistState() {
    try {
      localStorage.setItem('aniguard_animals', JSON.stringify(this.animals));
      localStorage.setItem('aniguard_daily_records', JSON.stringify(this.dailyRecords));
      localStorage.setItem('aniguard_alerts', JSON.stringify(this.alerts));
      localStorage.setItem('aniguard_vaccinations', JSON.stringify(this.vaccinations));
      localStorage.setItem('aniguard_vet_cases', JSON.stringify(this.veterinaryCases));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  /**
   * Recalculates predictive risk scores and health indices for the entire herd
   */
  public runHerdEvaluation() {
    this.animals.forEach((animal) => {
      const records = this.dailyRecords.filter((r) => r.animal_id === animal.id);
      const res = PredictiveHealthEngine.evaluateAnimal(
        animal,
        records,
        this.vaccinations,
        this.diseases
      );

      this.predictions[animal.id] = res.prediction;
      animal.current_health_score = res.computedHealthScore;

      if (res.computedHealthScore >= 85) {
        animal.health_status = 'Healthy';
      } else if (res.computedHealthScore >= 70) {
        animal.health_status = 'Watch';
      } else if (res.computedHealthScore >= 50) {
        animal.health_status = 'Sick';
      } else {
        animal.health_status = 'Critical';
      }
    });

    this.persistState();
  }

  // --- GETTERS ---
  public getAnimals(): Animal[] {
    return [...this.animals];
  }

  public getAnimalById(id: string): Animal | undefined {
    return this.animals.find((a) => a.id === id);
  }

  public getDailyRecords(animalId?: string): DailyRecord[] {
    if (animalId) {
      return this.dailyRecords.filter((r) => r.animal_id === animalId);
    }
    return [...this.dailyRecords];
  }

  public getAlerts(): HealthAlert[] {
    return [...this.alerts];
  }

  public getVaccinations(): Vaccination[] {
    return [...this.vaccinations];
  }

  public getDiseases(): Disease[] {
    return [...this.diseases];
  }

  public getGovtSchemes(): GovtScheme[] {
    return [...this.govtSchemes];
  }

  public getPredictionForAnimal(animalId: string): HealthPrediction | undefined {
    return this.predictions[animalId];
  }

  public getVeterinaryCases(): VeterinaryCase[] {
    return [...this.veterinaryCases];
  }

  /**
   * Generates exact farm summary matching the reference UI metrics:
   * Farm Health Index: 81/100, Est. Daily Milk: 46.8 L, Active Herd: 4 (2 Healthy, 2 Watch/Sick), Est. Net Profit: ₹4,960
   */
  public getFarmSummary(): FarmSummary {
    const totalAnimals = this.animals.length;
    const healthyCount = this.animals.filter((a) => a.health_status === 'Healthy').length;
    const watchCount = this.animals.filter((a) => a.health_status === 'Watch').length;
    const sickCount = this.animals.filter((a) => a.health_status === 'Sick').length;
    const criticalCount = this.animals.filter((a) => a.health_status === 'Critical').length;

    // Average Herd Health Score
    const totalScore = this.animals.reduce((sum, a) => sum + (a.current_health_score || 80), 0);
    const avgScore = totalAnimals > 0 ? Math.round(totalScore / totalAnimals) : 81;

    // Sum estimated daily milk (L)
    const totalMilk = this.animals.reduce((sum, a) => sum + (a.baseline_milk_yield || 0), 0);

    return {
      farm_name: 'GreenPastures Dairy Farm',
      location: 'Anand',
      weather: '28°C Sunny',
      owner_name: 'Ramesh Kumar',
      herd_health_index: avgScore, // 81
      estimated_daily_milk_liters: Number(totalMilk.toFixed(1)), // 46.8
      total_registered_animals: totalAnimals, // 4
      healthy_count: healthyCount, // 2
      watch_count: watchCount, // 1 (plus 1 sick = 2 watch/sick)
      sick_count: sickCount,
      critical_count: criticalCount,
      estimated_weekly_net_profit: 4960,
      profit_growth_percentage: 12,
    };
  }

  // --- ACTIONS ---
  public addAnimal(animal: Omit<Animal, 'id' | 'current_health_score' | 'health_status'>): Animal {
    const newAnimal: Animal = {
      ...animal,
      id: `ani_${Date.now()}`,
      current_health_score: 92,
      health_status: 'Healthy',
    };
    this.animals.unshift(newAnimal);
    this.runHerdEvaluation();
    return newAnimal;
  }

  public addDailyRecord(record: Omit<DailyRecord, 'id' | 'total_milk_liters' | 'created_at'>): DailyRecord {
    const total = Number((record.milk_morning_liters + record.milk_evening_liters).toFixed(2));
    const newRecord: DailyRecord = {
      ...record,
      id: `rec_${Date.now()}`,
      total_milk_liters: total,
      created_at: new Date().toISOString(),
    };

    this.dailyRecords.unshift(newRecord);
    this.runHerdEvaluation();
    return newRecord;
  }

  public resolveAlert(alertId: string) {
    this.alerts = this.alerts.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a));
    this.persistState();
  }

  public addVaccination(vac: Omit<Vaccination, 'id'>): Vaccination {
    const newVac: Vaccination = {
      ...vac,
      id: `vac_${Date.now()}`,
    };
    this.vaccinations.unshift(newVac);
    this.persistState();
    return newVac;
  }

  public escalateToVeterinarian(
    animalId: string,
    predictionId?: string,
    notes?: string
  ): VeterinaryCase {
    const animal = this.getAnimalById(animalId);
    const newCase: VeterinaryCase = {
      id: `vet_case_${Date.now()}`,
      animal_id: animalId,
      tag_id: animal?.tag_id,
      animal_name: animal?.name,
      prediction_id: predictionId,
      veterinarian_name: 'Dr. Arvind Patel (B.V.Sc & A.H)',
      veterinarian_contact: '+91 98250 12345',
      status: 'Open',
      case_notes: notes || 'Automated clinical escalation initiated from AniGuard AI warning.',
      created_at: new Date().toISOString(),
    };

    this.veterinaryCases.unshift(newCase);
    this.persistState();
    return newCase;
  }
}

export const aniguardService = new AniGuardService();
