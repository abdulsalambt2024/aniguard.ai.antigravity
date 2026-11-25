/**
 * AniGuard Hybrid Predictive Livestock Health Engine
 * Combines Individual Baseline deviations, Multi-signal anomaly detection,
 * weighted disease knowledge matching (ICAR/WOAH), and Explainable Evidence.
 */

import {
  Animal,
  DailyRecord,
  Disease,
  HealthPrediction,
  PredictionEvidence,
  RiskLevel,
  ConfidenceLevel,
  DataQuality,
  Vaccination,
} from '../types/aniguard';
import { computeAnimalBaselines, evaluateMetricDeviation } from './baselineEngine';

export interface EvaluationResult {
  prediction: HealthPrediction;
  evidence: PredictionEvidence[];
  computedHealthScore: number;
}

const SPECIES_TEMP_THRESHOLDS: Record<
  Animal['species'],
  { baseline: number; elevated: number; highFever: number; subnormal: number }
> = {
  Cow: { baseline: 38.6, elevated: 39.3, highFever: 40.0, subnormal: 37.5 },
  Buffalo: { baseline: 38.3, elevated: 39.1, highFever: 39.8, subnormal: 37.2 },
  Goat: { baseline: 39.1, elevated: 40.0, highFever: 40.6, subnormal: 38.0 },
  Sheep: { baseline: 39.1, elevated: 40.0, highFever: 40.6, subnormal: 38.0 },
};

const PRD_SAFETY_DISCLAIMER =
  'AniGuard provides explainable early-warning risk indicators and observations only. It is NOT a veterinary diagnosis and does NOT prescribe antibiotics or medical treatments. Consult a registered veterinarian for clinical evaluation.';

export class PredictiveHealthEngine {
  /**
   * Evaluates an individual animal based on historical daily records,
   * current symptoms, vaccination status, species thresholds, and disease knowledge.
   */
  public static evaluateAnimal(
    animal: Animal,
    records: DailyRecord[],
    vaccinations: Vaccination[] = [],
    diseases: Disease[] = [],
    now: Date = new Date()
  ): EvaluationResult {
    const baselines = computeAnimalBaselines(records, animal.baseline_milk_yield || 15);
    const latest = baselines.latestRecord;
    const tempLimits = SPECIES_TEMP_THRESHOLDS[animal.species] || SPECIES_TEMP_THRESHOLDS.Cow;

    const evidence: PredictionEvidence[] = [];
    const missingData: string[] = [];
    const conflictingData: string[] = [];
    let riskScore = 10; // Base baseline healthy score
    let criticalOverride = false;

    // 0. Check data completeness, staleness & new-animal baseline
    if (!latest) {
      missingData.push('No daily health or milk observations recorded yet');
    } else {
      const recordAgeHours =
        (now.getTime() - new Date(latest.record_date).getTime()) / (1000 * 3600);
      if (recordAgeHours > 48) {
        missingData.push(`Latest observation is stale (${Math.round(recordAgeHours / 24)} days old)`);
      }
      if (latest.temperature_celsius === undefined || latest.temperature_celsius === null) {
        missingData.push('Body temperature not recorded');
      } else if (latest.temperature_celsius < 34 || latest.temperature_celsius > 44) {
        conflictingData.push(
          `Implausible temperature reading (${latest.temperature_celsius}°C) — verify thermometer`
        );
      }
    }

    if (!baselines.hasEstablishedBaseline) {
      missingData.push(
        'Insufficient healthy historical baseline (< 3 clean daily records); using breed/profile fallback'
      );
    }

    // 1. Evaluate Milk Production Deviation
    if (latest && latest.total_milk_liters !== undefined && baselines.milkStats.hasSufficientData) {
      const milkDev = evaluateMetricDeviation(latest.total_milk_liters, baselines.milkStats);

      if (milkDev.isDeviated) {
        const duration = Math.max(1, baselines.consecutiveDropDays);
        const importance = Math.min(1.0, 0.4 + duration * 0.15);

        evidence.push({
          feature_name: 'Milk Production Drop',
          baseline_value: milkDev.baselineValue,
          observed_value: milkDev.currentValue,
          change_percentage: milkDev.percentageChange,
          duration_days: duration,
          importance_weight: importance,
          evidence_type: 'baseline_deviation',
        });

        const severityPoints =
          milkDev.severity === 'severe' ? 35 : milkDev.severity === 'moderate' ? 25 : 15;
        riskScore += severityPoints + Math.min(15, duration * 4);
      }
    }

    // 2. Evaluate Species-Specific Body Temperature
    if (
      latest &&
      typeof latest.temperature_celsius === 'number' &&
      latest.temperature_celsius >= 34 &&
      latest.temperature_celsius <= 44
    ) {
      const temp = latest.temperature_celsius;
      if (temp >= tempLimits.elevated) {
        const isHighFever = temp >= tempLimits.highFever;
        if (isHighFever) criticalOverride = true;

        evidence.push({
          feature_name: `Body Temperature Elevation (${animal.species} threshold ≥${tempLimits.elevated}°C)`,
          baseline_value: tempLimits.baseline,
          observed_value: temp,
          change_percentage: Number(
            (((temp - tempLimits.baseline) / tempLimits.baseline) * 100).toFixed(1)
          ),
          duration_days: 1,
          importance_weight: isHighFever ? 0.9 : 0.65,
          evidence_type: 'baseline_deviation',
        });
        riskScore += isHighFever ? 32 : 18;
      } else if (temp <= tempLimits.subnormal) {
        criticalOverride = true;
        evidence.push({
          feature_name: `Subnormal Body Temperature (${animal.species} threshold ≤${tempLimits.subnormal}°C)`,
          baseline_value: tempLimits.baseline,
          observed_value: temp,
          change_percentage: Number(
            (((temp - tempLimits.baseline) / tempLimits.baseline) * 100).toFixed(1)
          ),
          duration_days: 1,
          importance_weight: 0.85,
          evidence_type: 'baseline_deviation',
        });
        riskScore += 28;
      }

      // Check conflicting input: High fever yet Normal appetite & Normal activity
      if (
        temp >= tempLimits.highFever &&
        latest.appetite === 'Normal' &&
        latest.activity_level === 'Normal'
      ) {
        conflictingData.push(
          'High temperature recorded alongside normal appetite and activity — re-measure temperature to confirm'
        );
      }
    }

    // 3. Behavioral and Physiological Vitals
    if (latest) {
      if (latest.appetite === 'Reduced') {
        evidence.push({
          feature_name: 'Reduced Appetite',
          baseline_value: 100,
          observed_value: 50,
          change_percentage: -50,
          duration_days: 1,
          importance_weight: 0.5,
          evidence_type: 'symptom_match',
        });
        riskScore += 12;
      } else if (latest.appetite === 'Anorexic') {
        evidence.push({
          feature_name: 'Complete Anorexia (Off Feed)',
          baseline_value: 100,
          observed_value: 0,
          change_percentage: -100,
          duration_days: 1,
          importance_weight: 0.8,
          evidence_type: 'symptom_match',
        });
        riskScore += 25;
      }

      if (latest.rumination_level === 'Low') {
        evidence.push({
          feature_name: 'Depressed Rumination',
          baseline_value: 100,
          observed_value: 40,
          change_percentage: -60,
          duration_days: 1,
          importance_weight: 0.6,
          evidence_type: 'symptom_match',
        });
        riskScore += 12;
      } else if (latest.rumination_level === 'Absent') {
        evidence.push({
          feature_name: 'Ruminal Stasis (Cessation)',
          baseline_value: 100,
          observed_value: 0,
          change_percentage: -100,
          duration_days: 1,
          importance_weight: 0.85,
          evidence_type: 'symptom_match',
        });
        riskScore += 22;
      }

      if (latest.appetite === 'Anorexic' && latest.rumination_level === 'Absent') {
        criticalOverride = true;
      }

      if (latest.activity_level === 'Lethargic') {
        evidence.push({
          feature_name: 'Lethargy & Reduced Movement',
          baseline_value: 100,
          observed_value: 30,
          change_percentage: -70,
          duration_days: 1,
          importance_weight: 0.5,
          evidence_type: 'symptom_match',
        });
        riskScore += 10;
      }

      if (latest.feces_status && latest.feces_status !== 'Normal') {
        if (latest.feces_status === 'Bloody') {
          criticalOverride = true;
        }
        evidence.push({
          feature_name: `Abnormal Feces: ${latest.feces_status}`,
          baseline_value: 100,
          observed_value: 20,
          change_percentage: -80,
          duration_days: 1,
          importance_weight: latest.feces_status === 'Bloody' ? 0.9 : 0.65,
          evidence_type: 'symptom_match',
        });
        riskScore += latest.feces_status === 'Bloody' ? 30 : 15;
      }

      // Explicit Clinical Symptoms / Visual Observations
      if (latest.symptoms && latest.symptoms.length > 0) {
        latest.symptoms.forEach((s) => {
          evidence.push({
            feature_name: `Observed Sign: ${s}`,
            baseline_value: 0,
            observed_value: 1,
            change_percentage: 100,
            duration_days: 1,
            importance_weight: 0.75,
            evidence_type: 'symptom_match',
          });
          riskScore += 15;
        });
      }
    }

    // 4. Vaccination Gaps & Overdue Boosters
    const overdueVaccines = vaccinations.filter(
      (v) => v.animal_id === animal.id && v.status === 'Overdue'
    );
    if (overdueVaccines.length > 0) {
      overdueVaccines.forEach((v) => {
        evidence.push({
          feature_name: `Vaccination Gap: ${v.vaccine_name} Overdue`,
          baseline_value: 1,
          observed_value: 0,
          change_percentage: -100,
          duration_days: 5,
          importance_weight: 0.6,
          evidence_type: 'vaccine_gap',
        });
        riskScore += 12;
      });
    }

    // Apply Critical Safety Override if severe clinical triggers are present
    if (criticalOverride && riskScore < 65) {
      riskScore = 65;
    }

    // Cap risk score between 5 and 98
    riskScore = Math.min(98, Math.max(5, riskScore));

    // Determine Risk Level & Health Score
    let riskLevel: RiskLevel = 'Normal';
    if (riskScore >= 75) {
      riskLevel = 'Critical';
    } else if (riskScore >= 60) {
      riskLevel = 'High Risk';
    } else if (riskScore >= 40) {
      riskLevel = 'Early Risk';
    } else if (riskScore >= 22) {
      riskLevel = 'Watch';
    }

    // Health Score is inverse of risk
    const computedHealthScore = Math.max(5, 100 - riskScore);

    // Data Quality & Confidence (missing or conflicting data lowers confidence)
    let dataQuality: DataQuality = 'Good';
    if (!latest || missingData.length >= 2 || conflictingData.length >= 1) {
      dataQuality = missingData.length >= 2 && !latest ? 'Poor' : 'Limited';
    }

    let confidence: ConfidenceLevel = 'Low';
    if (dataQuality === 'Good' && baselines.hasEstablishedBaseline && (evidence.length >= 3 || records.length >= 4)) {
      confidence = 'High';
    } else if (dataQuality !== 'Poor' && (evidence.length >= 1 || records.length >= 2)) {
      confidence = 'Moderate';
    }

    // 5. Match with Disease Knowledge Base (Pattern overlap only, non-diagnostic)
    const matchedDifferentials = this.matchDiseases(animal, latest, evidence, diseases);
    const primaryMatch = matchedDifferentials.length > 0 ? matchedDifferentials[0] : null;

    // 6. Formulate Explainable Summary & Safe Next Actions
    const explanation = this.buildExplainableExplanation(
      animal,
      evidence,
      riskLevel,
      missingData,
      conflictingData
    );
    const recommendedAction = this.buildRecommendedAction(riskLevel, primaryMatch?.disease_name);
    const monitoringInterval = this.getMonitoringInterval(riskLevel);
    const escalationGuidance = this.getEscalationGuidance(riskLevel);

    const prediction: HealthPrediction = {
      id: `pred_${animal.id}_${now.getTime()}`,
      animal_id: animal.id,
      farm_id: animal.farm_id,
      prediction_date: now.toISOString(),
      prediction_window: '7d',
      risk_score: riskScore,
      is_calibrated_probability: false,
      risk_level: riskLevel,
      confidence_level: confidence,
      data_quality: dataQuality,
      missing_data: missingData,
      conflicting_data: conflictingData,
      primary_disease_id: primaryMatch ? primaryMatch.disease_code : undefined,
      primary_condition_name: primaryMatch ? primaryMatch.disease_name : undefined,
      differential_conditions: matchedDifferentials,
      evidence_list: evidence,
      explanation,
      recommended_action: recommendedAction,
      suggested_monitoring_interval: monitoringInterval,
      escalation_guidance: escalationGuidance,
      disclaimer: PRD_SAFETY_DISCLAIMER,
      model_version: 'AniGuard-Hybrid-v2.5',
      status: riskScore >= 60 ? 'Escalated' : 'Active',
    };

    return {
      prediction,
      evidence,
      computedHealthScore,
    };
  }

  /**
   * Matches observed symptoms and vitals against verified diseases in knowledge base
   */
  private static matchDiseases(
    animal: Animal,
    latestRecord: DailyRecord | undefined,
    evidence: PredictionEvidence[],
    diseases: Disease[]
  ) {
    if (!diseases || diseases.length === 0) return [];

    const activeFeatures = evidence.map((e) => e.feature_name.toLowerCase());
    const symptomStrings = latestRecord?.symptoms?.map((s) => s.toLowerCase()) || [];

    const scores = diseases
      .filter((d) => d.species_affected.includes(animal.species))
      .map((disease) => {
        let matchCount = 0;
        const matchedSymptoms: string[] = [];

        disease.key_symptoms.forEach((sym) => {
          const symLower = sym.toLowerCase();
          const isDirectMatch = symptomStrings.some((s) => s.includes(symLower) || symLower.includes(s));
          const isFeatureMatch = activeFeatures.some((f) => f.includes(symLower) || symLower.includes(f));

          // Clinical synonyms
          const isMilkMatch = symLower.includes('milk') && activeFeatures.some((f) => f.includes('milk'));
          const isFeverMatch = symLower.includes('fever') && activeFeatures.some((f) => f.includes('temperature') || f.includes('fever'));
          const isAppetiteMatch = symLower.includes('appetite') && activeFeatures.some((f) => f.includes('appetite'));

          if (isDirectMatch || isFeatureMatch || isMilkMatch || isFeverMatch || isAppetiteMatch) {
            matchCount++;
            matchedSymptoms.push(sym);
          }
        });

        const compatibilityScore = Math.min(
          95,
          Math.round((matchCount / Math.max(3, disease.key_symptoms.length)) * 100)
        );

        return {
          disease_code: disease.code,
          disease_name: disease.name,
          compatibility_score: compatibilityScore,
          matching_symptoms: matchedSymptoms,
        };
      })
      .filter((res) => res.matching_symptoms.length > 0)
      .sort((a, b) => b.compatibility_score - a.compatibility_score);

    return scores;
  }

  /**
   * Builds an honest, evidence-based explainable summary
   */
  private static buildExplainableExplanation(
    animal: Animal,
    evidence: PredictionEvidence[],
    riskLevel: RiskLevel,
    missingData: string[] = [],
    conflictingData: string[] = []
  ): string {
    if (evidence.length === 0) {
      const caveat =
        missingData.length > 0
          ? ` Note: ${missingData[0]}.`
          : '';
      return `${animal.name} (${animal.tag_id}) shows no abnormal deviations from available baseline observations.${caveat}`;
    }

    const reasons = evidence.map((e) => {
      if (e.evidence_type === 'baseline_deviation') {
        return `${e.feature_name} (${e.change_percentage > 0 ? '+' : ''}${e.change_percentage}% vs baseline ${e.baseline_value}, observed ${e.observed_value})`;
      }
      return `${e.feature_name}`;
    });

    const dataNote =
      conflictingData.length > 0
        ? ` Data verification needed: ${conflictingData[0]}.`
        : missingData.length > 0
        ? ` Data limitation: ${missingData[0]}.`
        : '';

    return `Why AniGuard Flagged ${animal.name}: ${evidence.length} risk indicator(s) observed — ${reasons.join('; ')}. Overall early-warning risk tier: ${riskLevel}.${dataNote}`;
  }

  /**
   * Generates safe, non-prescriptive actionable next steps
   */
  private static buildRecommendedAction(riskLevel: RiskLevel, candidateCondition?: string): string {
    const baseAction = candidateCondition
      ? `Observed signs overlap with ${candidateCondition} risk patterns (not a confirmed diagnosis). `
      : '';

    switch (riskLevel) {
      case 'Critical':
        return `${baseAction}Urgent veterinary evaluation recommended immediately. Separate animal into a clean, shaded, well-ventilated stall with fresh drinking water, do not administer unprescribed antibiotics, and contact a registered veterinarian.`;
      case 'High Risk':
        return `${baseAction}Contact a veterinarian for timely assessment. Re-check rectal temperature twice daily, monitor rumination and water intake, and isolate if contagious signs (blisters, nasal discharge, nodules) are visible.`;
      case 'Early Risk':
        return `${baseAction}Log morning and evening milk yields and temperature for the next 24 hours. Inspect udder, mouth, hooves, and skin for visible changes.`;
      case 'Watch':
        return `Monitor tomorrow's milk yield, appetite, and cud-chewing activity; ensure clean water and balanced mineral feed.`;
      default:
        return `Continue routine daily milk and health logging with standard hygiene.`;
    }
  }

  private static getMonitoringInterval(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'Critical':
        return 'Continuous / every 2 hours until veterinarian arrives';
      case 'High Risk':
        return 'Every 4–6 hours';
      case 'Early Risk':
        return 'Every 12 hours (morning & evening)';
      case 'Watch':
        return 'Next 24 hours';
      default:
        return 'Routine daily check';
    }
  }

  private static getEscalationGuidance(riskLevel: RiskLevel): string {
    if (riskLevel === 'Critical' || riskLevel === 'High Risk') {
      return 'Escalate immediately to your registered veterinarian with exported vitals and milk trend history.';
    }
    if (riskLevel === 'Early Risk') {
      return 'Consult a veterinarian if signs persist beyond 24 hours or if fever/appetite loss worsens.';
    }
    return 'No immediate veterinary escalation required unless new signs appear.';
  }
}
