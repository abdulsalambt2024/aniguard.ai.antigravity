# AniGuard 2.0 — Phased Roadmap & Dependencies

- **P0 (Reliable Core):** Supabase Auth + RLS farm isolation, animal CRUD, daily milk/health logging, live dashboard persistence.
- **P1 (Early-Warning MVP — Active):**
  - `AniGuard-Hybrid-v2.5` baseline & multi-signal risk engine (`Normal`, `Watch`, `Early Risk`, `High Risk`, `Critical`).
  - Automated deduplicated `HealthAlert` generation, acknowledgement, and resolution outcomes.
  - Client-side image quality verification (`imageQuality.ts`) with consent before observation logging.
- **P2 (Connected Care):** Server-side FastAPI `/v1/risk/*` endpoints, verified veterinarian portal, FCM push notifications, weather adapter.
- **P3 (Farm Intelligence):** Long-term lactation curve comparisons, RAG assistant grounded in ICAR/DAHD/WOAH documents.
- **P4 (Scale & Governance):** Server-side Razorpay webhook verification, audit log viewer, 10–20 farmer pilot evaluation.
