-- AniGuard Core Database Migration
-- Production Livestock Health Monitoring, Disease Early-Warning & Farm Management

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Animals Table
CREATE TABLE IF NOT EXISTS public.animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL DEFAULT 'Cow', -- Cow, Buffalo, Goat, Sheep
    breed VARCHAR(100) NOT NULL,
    age_years NUMERIC(4, 1) NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'Female',
    weight_kg NUMERIC(6, 1),
    pregnancy_status BOOLEAN DEFAULT FALSE,
    pregnancy_month INTEGER DEFAULT 0,
    lactation_stage VARCHAR(50) DEFAULT 'Mid Lactation', -- Early, Mid, Late, Dry
    baseline_milk_yield NUMERIC(5, 2) DEFAULT 0.0,
    current_health_score INTEGER DEFAULT 90, -- 0 to 100
    health_status VARCHAR(30) DEFAULT 'Healthy', -- Healthy, Watch, Sick, Critical
    photo_url TEXT,
    farm_name VARCHAR(100) DEFAULT 'GreenPastures Dairy Farm',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_animals_owner ON public.animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_tag ON public.animals(tag_id);

-- 2. Daily Health & Milk Records Table
CREATE TABLE IF NOT EXISTS public.daily_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    milk_morning_liters NUMERIC(5, 2) DEFAULT 0.0,
    milk_evening_liters NUMERIC(5, 2) DEFAULT 0.0,
    total_milk_liters NUMERIC(5, 2) GENERATED ALWAYS AS (milk_morning_liters + milk_evening_liters) STORED,
    temperature_celsius NUMERIC(4, 1), -- Normal: 38.3 - 39.2 for cattle
    appetite VARCHAR(30) DEFAULT 'Normal', -- Normal, Reduced, Anorexic
    water_intake VARCHAR(30) DEFAULT 'Normal', -- Normal, Reduced, Excessive
    rumination_level VARCHAR(30) DEFAULT 'Normal', -- Normal, Low, Absent
    activity_level VARCHAR(30) DEFAULT 'Normal', -- Normal, Lethargic, Restless
    feces_status VARCHAR(30) DEFAULT 'Normal', -- Normal, Loose, Diarrhea, Bloody, Constipated
    symptoms TEXT[] DEFAULT '{}',
    farmer_notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_records_animal ON public.daily_records(animal_id, record_date DESC);

-- 3. Verified Disease Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150),
    species_affected TEXT[] NOT NULL,
    disease_category VARCHAR(100) NOT NULL, -- Viral, Bacterial, Parasitic, Metabolic, Inflammatory
    causative_agent VARCHAR(150),
    key_symptoms TEXT[] NOT NULL,
    milk_impact_description TEXT,
    prevention_guidance TEXT,
    vaccine_guidance TEXT,
    zoonotic_risk BOOLEAN DEFAULT FALSE,
    economic_impact TEXT,
    veterinary_urgency VARCHAR(30) DEFAULT 'Moderate', -- Low, Moderate, High, Emergency
    tier INTEGER DEFAULT 1, -- 1: WOAH/ICAR/DAHD, 2: MSD/Univ, 3: Peer-Reviewed
    reference_source VARCHAR(255) NOT NULL,
    source_url TEXT,
    last_verified_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Disease Symptoms Detail Table
CREATE TABLE IF NOT EXISTS public.disease_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID REFERENCES public.diseases(id) ON DELETE CASCADE,
    symptom_name VARCHAR(100) NOT NULL,
    importance_weight NUMERIC(3, 2) DEFAULT 0.5, -- 0.1 to 1.0
    early_indicator BOOLEAN DEFAULT FALSE,
    evidence_level VARCHAR(30) DEFAULT 'Established'
);

-- 5. Predictive Health Assessments Table
CREATE TABLE IF NOT EXISTS public.health_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction_date TIMESTAMPTZ DEFAULT NOW(),
    prediction_window VARCHAR(20) DEFAULT '7d',
    risk_score INTEGER NOT NULL, -- 0 to 100
    risk_level VARCHAR(30) NOT NULL, -- Normal, Watch, Early Risk, High Risk, Critical
    confidence_level VARCHAR(30) NOT NULL, -- Low, Moderate, High
    primary_disease_id UUID REFERENCES public.diseases(id),
    differential_conditions JSONB DEFAULT '[]'::jsonb,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    model_version VARCHAR(50) DEFAULT 'AniGuard-Hybrid-v2.4',
    status VARCHAR(30) DEFAULT 'Active', -- Active, Acknowledged, Escalated, Resolved, Dismissed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Explainability Evidence Table
CREATE TABLE IF NOT EXISTS public.prediction_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES public.health_predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    baseline_value NUMERIC(8, 2),
    observed_value NUMERIC(8, 2),
    change_percentage NUMERIC(6, 2),
    duration_days INTEGER DEFAULT 1,
    importance_weight NUMERIC(3, 2) DEFAULT 0.5,
    evidence_type VARCHAR(50) DEFAULT 'baseline_deviation', -- baseline_deviation, symptom_match, trend_persistence
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Urgent Alerts & Clinical Reminders Table
CREATE TABLE IF NOT EXISTS public.health_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- vaccine_overdue, milk_drop, pregnancy_check, fever, multi_symptom
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    risk_level VARCHAR(30) NOT NULL DEFAULT 'Watch', -- Normal, Watch, High, Critical
    recommended_action TEXT,
    action_cta_label VARCHAR(100) DEFAULT 'Check Details',
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vaccinations & Deworming Table
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(150) NOT NULL,
    disease_target VARCHAR(150) NOT NULL,
    scheduled_date DATE NOT NULL,
    administered_date DATE,
    status VARCHAR(30) DEFAULT 'Upcoming', -- Upcoming, Completed, Overdue
    booster_due_date DATE,
    dosage_ml NUMERIC(4, 1),
    administered_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Veterinary Escalation & Outcomes Table
CREATE TABLE IF NOT EXISTS public.veterinary_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.health_predictions(id),
    veterinarian_name VARCHAR(150) DEFAULT 'Dr. Arvind Patel (B.V.Sc)',
    veterinarian_contact VARCHAR(50) DEFAULT '+91 98250 12345',
    status VARCHAR(30) DEFAULT 'Open', -- Open, In Review, Diagnosed, Resolved
    veterinary_diagnosis TEXT,
    prescribed_treatment TEXT,
    actual_outcome VARCHAR(50), -- Recovered, Chronic, Culled, Ongoing
    case_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Indian Government Livestock Schemes Table
CREATE TABLE IF NOT EXISTS public.govt_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_name VARCHAR(200) NOT NULL,
    nodal_agency VARCHAR(150) NOT NULL,
    target_benefit TEXT NOT NULL,
    subsidy_percentage VARCHAR(50),
    eligibility_criteria TEXT,
    application_portal_url TEXT,
    category VARCHAR(100) DEFAULT 'Breed Improvement & Credit',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinary_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.govt_schemes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Animals: Owners can CRUD their own animals
CREATE POLICY "Users can manage their own animals" ON public.animals
    FOR ALL USING (auth.uid() = owner_id);

-- Daily Records: Owners can CRUD their own animal logs
CREATE POLICY "Users can manage daily records" ON public.daily_records
    FOR ALL USING (auth.uid() = owner_id);

-- Predictions: Owners can view and manage their predictions
CREATE POLICY "Users can view health predictions" ON public.health_predictions
    FOR ALL USING (auth.uid() = owner_id);

-- Alerts: Owners can manage their alerts
CREATE POLICY "Users can manage alerts" ON public.health_alerts
    FOR ALL USING (auth.uid() = owner_id);

-- Vaccinations: Owners can manage their vaccinations
CREATE POLICY "Users can manage vaccinations" ON public.vaccinations
    FOR ALL USING (auth.uid() = owner_id);

-- Public Knowledge: Everyone can read diseases and govt schemes
CREATE POLICY "Allow public read on diseases" ON public.diseases
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on govt schemes" ON public.govt_schemes
    FOR SELECT USING (true);
