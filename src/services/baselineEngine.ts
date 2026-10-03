/**
 * AniGuard Individual Baseline Engine
 * Computes individual historical baselines using rolling statistics, EWMA,
 * standard deviation, and percentage deviations for livestock health metrics.
 */

import { DailyRecord } from '../types/aniguard';

export interface BaselineStats {
  hasSufficientData: boolean;
  sampleCount: number;
  mean: number;
  median: number;
  stdDev: number;
  ewma: number; // Exponentially Weighted Moving Average (alpha = 0.3)
  min: number;
  max: number;
}

export interface MetricDeviation {
  currentValue: number;
  baselineValue: number;
  absoluteChange: number;
  percentageChange: number; // e.g. -17.5%
  zScore: number;
  isDeviated: boolean;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
}

/**
 * Calculate basic statistical properties of a numeric series
 */
export function calculateSeriesStats(values: number[]): BaselineStats {
  if (!values || values.length < 3) {
    const val = values && values.length > 0 ? values[0] : 0;
    return {
      hasSufficientData: false,
      sampleCount: values ? values.length : 0,
      mean: val,
      median: val,
      stdDev: 0,
      ewma: val,
      min: val,
      max: val,
    };
  }

  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;

  // Median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Standard deviation
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // EWMA (alpha = 0.3 favors recent days without discarding baseline)
  const alpha = 0.3;
  let ewma = values[0];
  for (let i = 1; i < values.length; i++) {
    ewma = alpha * values[i] + (1 - alpha) * ewma;
  }

  return {
    hasSufficientData: true,
    sampleCount: n,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    ewma: Number(ewma.toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

/**
 * Computes deviation between a current observation and an animal's established baseline
 */
export function evaluateMetricDeviation(
  current: number,
  baselineStats: BaselineStats,
  alertThresholdPercent: number = 15 // 15% drop threshold recommended by ICAR
): MetricDeviation {
  const baseline = baselineStats.ewma || baselineStats.mean || current;
  const absoluteChange = current - baseline;
  const percentageChange = baseline > 0 ? (absoluteChange / baseline) * 100 : 0;

  // Calculate robust Z-Score
  const zScore = baselineStats.stdDev > 0 ? (current - baselineStats.mean) / baselineStats.stdDev : 0;

  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  const isDeviated = percentageChange <= -alertThresholdPercent;

  if (percentageChange <= -30) {
    severity = 'severe';
  } else if (percentageChange <= -20) {
    severity = 'moderate';
  } else if (percentageChange <= -12) {
    severity = 'mild';
  }

  return {
    currentValue: Number(current.toFixed(2)),
    baselineValue: Number(baseline.toFixed(2)),
    absoluteChange: Number(absoluteChange.toFixed(2)),
    percentageChange: Number(percentageChange.toFixed(1)),
    zScore: Number(zScore.toFixed(2)),
    isDeviated,
    severity,
  };
}

/**
 * Evaluates individual animal historical baseline across daily records
 */
export function computeAnimalBaselines(records: DailyRecord[], fallbackBaseline: number = 15) {
  if (!records || records.length === 0) {
    return {
      hasData: false,
      milkStats: calculateSeriesStats([fallbackBaseline]),
      tempStats: calculateSeriesStats([38.5]),
      consecutiveDropDays: 0,
    };
  }

  // Sort chronological
  const sorted = [...records].sort(
    (a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
  );

  const milkValues = sorted.map((r) => r.total_milk_liters);
  const tempValues = sorted
    .map((r) => r.temperature_celsius)
    .filter((t): t is number => typeof t === 'number');

  const milkStats = calculateSeriesStats(milkValues.length >= 3 ? milkValues : [fallbackBaseline, fallbackBaseline, fallbackBaseline]);
  const tempStats = calculateSeriesStats(tempValues.length >= 3 ? tempValues : [38.5, 38.6, 38.5]);

  // Count consecutive days of reduced milk production
  let consecutiveDropDays = 0;
  const latestBaseline = milkStats.ewma;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const milk = sorted[i].total_milk_liters;
    if (milk < latestBaseline * 0.88) {
      // > 12% below baseline
      consecutiveDropDays++;
    } else {
      break;
    }
  }

  return {
    hasData: true,
    recordCount: sorted.length,
    milkStats,
    tempStats,
    consecutiveDropDays,
    latestRecord: sorted[sorted.length - 1],
  };
}
