# AniGuard 2.0 — Security, Privacy & Clinical Safety

## Clinical Safety Boundaries
- AniGuard **never** claims a confirmed veterinary diagnosis.
- AniGuard **never** prescribes or recommends specific antibiotic dosages.
- Risk scores (`0–100`) are explicitly marked `is_calibrated_probability: false` and presented as heuristic early-warning indicators.

## Data & Access Controls
- Supabase Row-Level Security (RLS) migrations are defined in `supabase/migrations/20260929_aniguard_security_and_roles.sql`.
- Role hierarchy: `user`, `member`, `veterinarian`, `farm_manager`, `admin`, `super_admin`.
- Photo uploads require explicit farmer consent before attaching to an animal's record.
- No secrets, service-role keys, or real farmer PII are committed to source code.
