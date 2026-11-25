# AniGuard 2.0 — AI & Risk Models Scope

## Hybrid Early-Warning Engine (`AniGuard-Hybrid-v2.5`)
- **Baseline Engine (`src/services/baselineEngine.ts`):** Computes rolling mean, median, standard deviation, and EWMA (`alpha = 0.3`). Excludes clearly abnormal illness records (high fever, anorexia, ruminal stasis, >28% acute milk drop) so illness does not normalize the baseline.
- **Species-Specific Thresholds (`src/services/predictiveEngine.ts`):** Separate normal/elevated/high-fever/subnormal temperature limits for `Cow`, `Buffalo`, `Goat`, and `Sheep`.
- **Uncertainty & Data Quality:** Evaluates stale records (>48h), missing temperature, implausible readings, conflicting inputs, and new animals (<3 clean baseline records), lowering `confidence_level` and `data_quality` accordingly.
- **Image Quality Gate (`src/utils/imageQuality.ts`):** Verifies MIME type, file size (15 KB – 10 MB), minimum resolution (320×240), edge-gradient sharpness, brightness/exposure, glare ratio, and duplicate file fingerprints.
