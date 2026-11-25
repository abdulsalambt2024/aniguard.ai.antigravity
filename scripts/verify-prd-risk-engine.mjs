import assert from 'node:assert/strict';
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

// Bundle predictiveEngine.ts to a temporary ESM file in memory/tmp for direct Node verification
const outFile = path.resolve('.tmp-predictive-engine.mjs');
await esbuild.build({
  entryPoints: ['src/services/predictiveEngine.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: outFile,
});

const { PredictiveHealthEngine } = await import(`file://${outFile.replace(/\\/g, '/')}`);

const baseCow = {
  id: 'cow_1',
  farm_id: 'farm_alpha',
  tag_id: 'IN-GJ-1001',
  name: 'Gauri',
  species: 'Cow',
  breed: 'Gir',
  age_years: 4,
  gender: 'Female',
  pregnancy_status: false,
  lactation_stage: 'Mid Lactation',
  baseline_milk_yield: 16.0,
  current_health_score: 92,
  health_status: 'Healthy',
};

const daysAgo = (n) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString().split('T')[0];

const cleanRecords = [4, 3, 2, 1].map((d, idx) => ({
  id: `r_${idx}`,
  animal_id: 'cow_1',
  farm_id: 'farm_alpha',
  record_date: daysAgo(d),
  milk_morning_liters: 8.5,
  milk_evening_liters: 7.5,
  total_milk_liters: 16.0,
  temperature_celsius: 38.5,
  appetite: 'Normal',
  water_intake: 'Normal',
  rumination_level: 'Normal',
  activity_level: 'Normal',
  feces_status: 'Normal',
  symptoms: [],
}));

// Test 1: Normal observations
{
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, cleanRecords, [], []);
  assert.equal(res.prediction.risk_level, 'Normal', 'Test 1 failed: expected Normal');
  assert.equal(res.prediction.is_calibrated_probability, false);
  assert.ok(res.prediction.disclaimer.includes('NOT a veterinary diagnosis'));
  console.log('PASS [1/11] Normal observations');
}

// Test 2: Milk-production decline
{
  const milkDropRecords = [
    ...cleanRecords.slice(0, 3),
    { ...cleanRecords[3], total_milk_liters: 10.5, milk_morning_liters: 5.5, milk_evening_liters: 5.0 },
  ];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, milkDropRecords, [], []);
  assert.notEqual(res.prediction.risk_level, 'Normal', 'Test 2 failed: expected elevated risk on milk drop');
  assert.ok(res.evidence.some((e) => e.feature_name.includes('Milk Production Drop')));
  console.log('PASS [2/11] Milk-production decline');
}

// Test 3: Fever or abnormal temperature
{
  const feverRecords = [
    ...cleanRecords.slice(0, 3),
    { ...cleanRecords[3], temperature_celsius: 40.3 },
  ];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, feverRecords, [], []);
  assert.ok(['High Risk', 'Critical'].includes(res.prediction.risk_level), 'Test 3 failed: high fever should trigger High/Critical');
  console.log('PASS [3/11] Fever or abnormal temperature');
}

// Test 4: Appetite decline
{
  const appetiteRecords = [
    ...cleanRecords.slice(0, 3),
    { ...cleanRecords[3], appetite: 'Anorexic' },
  ];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, appetiteRecords, [], []);
  assert.notEqual(res.prediction.risk_level, 'Normal');
  assert.ok(res.evidence.some((e) => e.feature_name.includes('Anorexia')));
  console.log('PASS [4/11] Appetite decline');
}

// Test 5: Combined warning signals
{
  const combined = [
    ...cleanRecords.slice(0, 3),
    {
      ...cleanRecords[3],
      total_milk_liters: 9.0,
      temperature_celsius: 40.4,
      appetite: 'Anorexic',
      rumination_level: 'Absent',
      symptoms: ['Swollen hot udder'],
    },
  ];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, combined, [], []);
  assert.equal(res.prediction.risk_level, 'Critical', 'Test 5 failed: combined severe signals should be Critical');
  console.log('PASS [5/11] Combined warning signals');
}

// Test 6: Missing, stale, conflicting and poor-quality data
{
  const staleConflicting = [
    {
      ...cleanRecords[0],
      record_date: daysAgo(10),
      temperature_celsius: 40.5, // High fever yet Normal appetite & activity -> conflict
      appetite: 'Normal',
      activity_level: 'Normal',
    },
  ];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, staleConflicting, [], []);
  assert.ok(res.prediction.missing_data.some((m) => m.includes('stale')));
  assert.ok(res.prediction.conflicting_data.length > 0);
  assert.notEqual(res.prediction.data_quality, 'Good');
  console.log('PASS [6/11] Missing, stale, conflicting and poor-quality data');
}

// Test 7: New animal with no baseline
{
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, [], [], []);
  assert.equal(res.prediction.confidence_level, 'Low');
  assert.ok(res.prediction.missing_data.some((m) => m.includes('baseline')));
  console.log('PASS [7/11] New animal with no baseline');
}

// Test 8: Species-specific handling (Buffalo vs Goat at 39.2°C)
{
  const buffalo = { ...baseCow, id: 'buf_1', species: 'Buffalo', name: 'Shera' };
  const goat = { ...baseCow, id: 'goat_1', species: 'Goat', name: 'Moti' };
  const bufRes = PredictiveHealthEngine.evaluateAnimal(buffalo, [{ ...cleanRecords[3], temperature_celsius: 39.2 }], [], []);
  const goatRes = PredictiveHealthEngine.evaluateAnimal(goat, [{ ...cleanRecords[3], temperature_celsius: 39.2 }], [], []);
  assert.ok(bufRes.evidence.some((e) => e.feature_name.includes('Buffalo')), 'Buffalo 39.2°C should flag elevation');
  assert.ok(!goatRes.evidence.some((e) => e.feature_name.includes('Temperature')), 'Goat 39.2°C is normal');
  console.log('PASS [8/11] Species-specific handling');
}

// Test 9: Farm isolation metadata preservation
{
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, cleanRecords, [], []);
  assert.equal(res.prediction.farm_id, 'farm_alpha');
  console.log('PASS [9/11] Farm isolation metadata');
}

// Test 10: Critical override & safe escalation (Bloody feces)
{
  const bloody = [{ ...cleanRecords[3], feces_status: 'Bloody' }];
  const res = PredictiveHealthEngine.evaluateAnimal(baseCow, bloody, [], []);
  assert.ok(res.prediction.risk_score >= 65);
  assert.ok(res.prediction.escalation_guidance.toLowerCase().includes('veterinarian'));
  assert.ok(!res.prediction.recommended_action.toLowerCase().includes('prescribe'));
  console.log('PASS [10/11] Critical override & safe escalation');
}

// Test 11: Reproducibility & versioned outputs
{
  const fixedNow = new Date('2026-11-25T10:00:00Z');
  const r1 = PredictiveHealthEngine.evaluateAnimal(baseCow, cleanRecords, [], [], fixedNow);
  const r2 = PredictiveHealthEngine.evaluateAnimal(baseCow, cleanRecords, [], [], fixedNow);
  assert.equal(r1.prediction.risk_score, r2.prediction.risk_score);
  assert.equal(r1.prediction.model_version, 'AniGuard-Hybrid-v2.5');
  console.log('PASS [11/11] Reproducibility & versioned outputs');
}

fs.unlinkSync(outFile);
console.log('ALL 11 PRD RISK ENGINE TESTS PASSED');
