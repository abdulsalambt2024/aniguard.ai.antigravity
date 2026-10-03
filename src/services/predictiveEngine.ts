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
  Vaccination,
} from '../types/aniguard';
import { computeAnimalBaselines, evaluateMetricDeviation } from './baselineEngine';

export interface EvaluationResult {
  prediction: HealthPrediction;
  evidence: PredictionEvidence[];
  computedHealthScore: number;
}

export class PredictiveHealthEngine {
  /**
   * Evaluates an individual animal based on historical daily records,
   * current symptoms, vaccination status, and disease knowledge.
   */
  public static evaluateAnimal(
    animal: Animal,
    records: DailyRecord[],
    vaccinations: Vaccination[] = [],
    diseases: Disease[] = []
  ): EvaluationResult {
    const baselines = computeAnimalBaselines(records, animal.baseline_milk_yield || 15);
    const latest = baselines.latestRecord;

    const evidence: PredictionEvidence[] = [];
    let riskScore = 10; // Base baseline healthy score
    let confidence: ConfidenceLevel = 'Low';

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

        // Add risk points based on severity and duration
        const severityPoints =
          milkDev.severity === 'severe' ? 35 : milkDev.severity === 'moderate' ? 25 : 15;
        riskScore += severityPoints + Math.min(15, duration * 4);
      }
    }

    // 2. Evaluate Body Temperature (Normal: 38.3°C - 39.2°C for cattle/buffalo)
    if (latest && latest.temperature_celsius) {
      const temp = latest.temperature_celsius;
      if (temp >= 39.3) {
        const isHighFever = temp >= 40.0;
        evidence.push({
          feature_name: 'Body Temperature Elevation (Fever)',
          baseline_value: 38.6,
          observed_value: temp,
          change_percentage: Number((((temp - 38.6) / 38.6) * 100).toFixed(1)),
          duration_days: 1,
          importance_weight: isHighFever ? 0.9 : 0.6,
          evidence_type: 'baseline_deviation',
        });
        riskScore += isHighFever ? 30 : 18;
      } else if (temp <= 37.5) {
        // Hypothermia in shock/toxemia
        evidence.push({
          feature_name: 'Subnormal Body Temperature',
          baseline_value: 38.6,
          observed_value: temp,
          change_percentage: Number((((temp - 38.6) / 38.6) * 100).toFixed(1)),
          duration_days: 1,
          importance_weight: 0.85,
          evidence_type: 'baseline_deviation',
        });
        riskScore += 25;
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
        evidence.push({
          feature_name: `Abnormal Feces: ${latest.feces_status}`,
          baseline_value: 100,
          observed_value: 20,
          change_percentage: -80,
          duration_days: 1,
          importance_weight: 0.65,
          evidence_type: 'symptom_match',
        });
        riskScore += 15;
      }

      // Explicit Clinical Symptoms
      if (latest.symptoms && latest.symptoms.length > 0) {
        latest.symptoms.forEach((s) => {
          evidence.push({
            feature_name: `Clinical Sign: ${s}`,
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

    // Set Confidence based on evidence density
    if (evidence.length >= 4 && records.length >= 5) {
      confidence = 'High';
    } else if (evidence.length >= 2 || records.length >= 3) {
      confidence = 'Moderate';
    } else {
      confidence = 'Low';
    }

    // 5. Match with Disease Knowledge Base
    const matchedDifferentials = this.matchDiseases(animal, latest, evidence, diseases);
    const primaryMatch = matchedDifferentials.length > 0 ? matchedDifferentials[0] : null;

    // 6. Formulate Explainable Summary
    const explanation = this.buildExplainableExplanation(animal, evidence, riskLevel);
    const recommendedAction = this.buildRecommendedAction(riskLevel, primaryMatch?.disease_name);

    const prediction: HealthPrediction = {
      id: `pred_${animal.id}_${Date.now()}`,
      animal_id: animal.id,
      prediction_date: new Date().toISOString(),
      prediction_window: '7d',
      risk_score: riskScore,
      risk_level: riskLevel,
      confidence_level: confidence,
      primary_disease_id: primaryMatch ? primaryMatch.disease_code : undefined,
      primary_condition_name: primaryMatch ? primaryMatch.disease_name : undefined,
      differential_conditions: matchedDifferentials,
      evidence_list: evidence,
      explanation,
      recommended_action: recommendedAction,
      model_version: 'AniGuard-Hybrid-v2.4',
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
    riskLevel: RiskLevel
  ): string {
    if (evidence.length === 0) {
      return `${animal.name} (${animal.tag_id}) has maintained consistent daily milk production, normal vitals, and good rumination. Baseline health parameters are optimal.`;
    }

    const reasons = evidence.map((e) => {
      if (e.evidence_type === 'baseline_deviation') {
        return `${e.feature_name} is ${Math.abs(e.change_percentage)}% below historical baseline (Observed: ${e.observed_value}, Baseline: ${e.baseline_value})`;
      }
      return `${e.feature_name}`;
    });

    return `Why AniGuard Warned Me: ${animal.name} exhibits ${evidence.length} abnormal physiological indicator(s). Key factors: ${reasons.join('; ')}. Multi-signal pattern indicates an emerging ${riskLevel.toLowerCase()} condition.`;
  }

  /**
   * Generates safe, non-prescriptive actionable next steps
   */
  private static buildRecommendedAction(riskLevel: RiskLevel, candidateCondition?: string): string {
    const baseAction = candidateCondition ? `Precautionary watch for ${candidateCondition}. ` : '';

    switch (riskLevel) {
      case 'Critical':
        return `${baseAction}Immediate veterinary attention required. Isolate animal in clean dry stall, verify clean water supply, do not administer unprescribed antibiotics, and contact veterinarian.`;
      case 'High Risk':
        return `${baseAction}Perform complete AI Health Check, measure body temperature twice daily, monitor rumination cycles, and schedule veterinary consultation if signs persist over 24 hours.`;
      case 'Early Risk':
        return `${baseAction}Log evening milk yield and check feed intake. Inspect udder for heat or hardness and check mouth/hooves for lesions.`;
      case 'Watch':
        return `Monitor tomorrow morning's milk yield and verify consistent concentrate feeding.`;
      default:
        return `Continue routine daily record logging and hygienic milking practices.`;
    }
  }
}
