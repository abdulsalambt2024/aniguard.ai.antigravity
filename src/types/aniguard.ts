export type HealthStatus = 'Healthy' | 'Watch' | 'Sick' | 'Critical';
export type RiskLevel = 'Normal' | 'Watch' | 'Early Risk' | 'High Risk' | 'Critical';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
export type DataQuality = 'Good' | 'Limited' | 'Poor';
export type UrgencyLevel = 'Low' | 'Moderate' | 'High' | 'Emergency';

export interface Animal {
  id: string;
  farm_id?: string;
  tag_id: string;
  name: string;
  species: 'Cow' | 'Buffalo' | 'Goat' | 'Sheep';
  breed: string;
  age_years: number;
  gender: string;
  weight_kg?: number;
  pregnancy_status: boolean;
  pregnancy_month?: number;
  lactation_stage: string;
  baseline_milk_yield: number; // L/day
  current_health_score: number; // 0 - 100
  health_status: HealthStatus;
  photo_url?: string;
  farm_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyRecord {
  id: string;
  animal_id: string;
  record_date: string;
  milk_morning_liters: number;
  milk_evening_liters: number;
  total_milk_liters: number;
  temperature_celsius?: number;
  appetite: 'Normal' | 'Reduced' | 'Anorexic';
  water_intake: 'Normal' | 'Reduced' | 'Excessive';
  rumination_level: 'Normal' | 'Low' | 'Absent';
  activity_level: 'Normal' | 'Lethargic' | 'Restless';
  feces_status: 'Normal' | 'Loose' | 'Diarrhea' | 'Bloody' | 'Constipated';
  symptoms: string[];
  farmer_notes?: string;
  photo_url?: string;
  created_at?: string;
}

export interface Disease {
  id: string;
  code: string;
  name: string;
  scientific_name?: string;
  species_affected: string[];
  disease_category: string;
  causative_agent?: string;
  key_symptoms: string[];
  milk_impact_description?: string;
  prevention_guidance?: string;
  vaccine_guidance?: string;
  zoonotic_risk: boolean;
  economic_impact?: string;
  veterinary_urgency: UrgencyLevel;
  tier: number;
  reference_source: string;
  source_url?: string;
  last_verified_at?: string;
}

export interface PredictionEvidence {
  feature_name: string;
  baseline_value: number;
  observed_value: number;
  change_percentage: number;
  duration_days: number;
  importance_weight: number;
  evidence_type: 'baseline_deviation' | 'symptom_match' | 'trend_persistence' | 'vaccine_gap';
}

export interface HealthPrediction {
  id: string;
  animal_id: string;
  farm_id?: string;
  prediction_date: string;
  prediction_window: '3d' | '7d' | '14d';
  risk_score: number; // 0 - 100 (heuristic early-warning index, NOT calibrated disease probability)
  is_calibrated_probability?: false;
  risk_level: RiskLevel;
  confidence_level: ConfidenceLevel;
  data_quality?: DataQuality;
  missing_data?: string[];
  conflicting_data?: string[];
  primary_disease_id?: string;
  primary_condition_name?: string;
  differential_conditions?: Array<{
    disease_code: string;
    disease_name: string;
    compatibility_score: number; // Pattern overlap % (non-diagnostic)
    matching_symptoms: string[];
  }>;
  evidence_list: PredictionEvidence[];
  explanation: string;
  recommended_action: string;
  suggested_monitoring_interval?: string;
  escalation_guidance?: string;
  disclaimer?: string;
  model_version: string;
  status: 'Active' | 'Acknowledged' | 'Escalated' | 'Resolved' | 'Dismissed';
}

export interface HealthAlert {
  id: string;
  animal_id: string;
  farm_id?: string;
  tag_id: string;
  animal_name: string;
  alert_type: 'vaccine_overdue' | 'milk_drop' | 'pregnancy_check' | 'fever' | 'multi_symptom';
  title: string;
  description: string;
  risk_level: 'Watch' | 'Early Risk' | 'High' | 'High Risk' | 'Critical';
  recommended_action: string;
  action_cta_label?: string;
  is_read: boolean;
  is_acknowledged?: boolean;
  acknowledged_at?: string;
  is_resolved: boolean;
  resolved_at?: string;
  outcome_notes?: string;
  model_version?: string;
  created_at: string;
}

export interface ImageQualityReport {
  is_usable: boolean;
  width: number;
  height: number;
  file_size_kb: number;
  sharpness_score: number; // 0 - 100
  brightness_score: number; // 0 - 255
  glare_ratio: number; // 0 - 1
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  }>;
  guidance: string;
}

export interface Vaccination {
  id: string;
  animal_id: string;
  tag_id?: string;
  animal_name?: string;
  vaccine_name: string;
  disease_target: string;
  scheduled_date: string;
  administered_date?: string;
  status: 'Upcoming' | 'Completed' | 'Overdue';
  booster_due_date?: string;
  dosage_ml?: number;
  administered_by?: string;
  notes?: string;
}

export interface VeterinaryCase {
  id: string;
  animal_id: string;
  tag_id?: string;
  animal_name?: string;
  prediction_id?: string;
  veterinarian_name: string;
  veterinarian_contact: string;
  status: 'Open' | 'In Review' | 'Diagnosed' | 'Resolved';
  veterinary_diagnosis?: string;
  prescribed_treatment?: string;
  actual_outcome?: 'Recovered' | 'Chronic' | 'Culled' | 'Ongoing';
  case_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface GovtScheme {
  id: string;
  scheme_name: string;
  nodal_agency: string;
  target_benefit: string;
  subsidy_percentage?: string;
  eligibility_criteria?: string;
  application_portal_url?: string;
  category: string;
  is_active: boolean;
}

export interface FarmSummary {
  farm_name: string;
  location: string;
  weather: string;
  owner_name: string;
  herd_health_index: number; // 0 - 100
  estimated_daily_milk_liters: number;
  total_registered_animals: number;
  healthy_count: number;
  watch_count: number;
  sick_count: number;
  critical_count: number;
  estimated_weekly_net_profit: number; // INR ₹
  profit_growth_percentage: number;
}
