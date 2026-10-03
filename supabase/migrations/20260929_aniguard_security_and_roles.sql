-- ==============================================================================
-- AniGuard Master Backend Security, Protected Super Admins & RBAC Migration
-- Compatible with Supabase PostgreSQL and Row-Level Security (RLS)
-- ==============================================================================

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure Role Hierarchy Enum
-- Checks if app_role exists; if not, creates it.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('viewer', 'member', 'admin', 'super_admin', 'user', 'veterinarian', 'farm_manager');
  ELSE
    -- Add any missing enum values safely
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'veterinarian';
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'farm_manager';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- 3. Dedicated Protected Super Admins Table
CREATE TABLE IF NOT EXISTS public.protected_super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.protected_super_admins ENABLE ROW LEVEL SECURITY;

-- Insert the 3 immutable protected Super Admin identities (Case-Insensitive)
INSERT INTO public.protected_super_admins (email, active)
VALUES
  ('hayatamr9608@gmail.com', true),
  ('abdul.salam.bt.2024@miet.ac.in', true),
  ('ashi.gautam.bt.2024@miet.ac.in', true)
ON CONFLICT (email) DO UPDATE SET active = true;

-- 4. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Index for rapid role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

-- 5. Audit Logs Table (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 6. Application Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  is_security_critical BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Seed Default Settings
INSERT INTO public.app_settings (key, value, category, description, is_security_critical)
VALUES
  ('milk_drop_alert_threshold', '{"percent": 15, "min_days": 2}'::jsonb, 'clinical', 'Threshold for automated milk drop alert generation', false),
  ('fever_threshold_celsius', '{"high_fever": 40.0, "elevated": 39.3}'::jsonb, 'clinical', 'Bovine rectal temperature thresholds', false),
  ('emergency_hotline', '{"phone": "+91 98250 12345", "service": "Anand Mobile Vet Dispatch"}'::jsonb, 'support', 'Veterinary emergency contact', false),
  ('supported_languages', '["en", "hi", "gu", "mr", "bn", "te", "ta", "kn", "pa", "ur"]'::jsonb, 'localization', 'Supported Indian languages', false)
ON CONFLICT (key) DO NOTHING;

-- 7. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

INSERT INTO public.feature_flags (key, enabled, description)
VALUES
  ('AI_HEALTH_CHECK', true, 'Multi-signal computer vision and symptom screening'),
  ('PREDICTIVE_HEALTH', true, 'Individual baseline trend and anomaly detection'),
  ('VOICE_ENTRY', true, 'Voice-first multilingual daily health logging'),
  ('PROFIT_INTELLIGENCE', true, 'Farm dairy economics and feed optimization'),
  ('WHATSAPP_ALERTS', false, 'Direct WhatsApp clinical broadcast notifications'),
  ('REGIONAL_DISEASE_RISK', true, 'ICAR-NIVEDI epidemiological forecast layer')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- SECURITY DEFINER DATABASE FUNCTIONS
-- ==============================================================================

-- Check if user is a protected Super Admin by user_id
CREATE OR REPLACE FUNCTION public.is_protected_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.protected_super_admins p ON LOWER(u.email) = LOWER(p.email)
    WHERE u.id = _user_id AND p.active = true
  );
$$;

-- Check if email is protected Super Admin
CREATE OR REPLACE FUNCTION public.is_protected_super_admin_email(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.protected_super_admins
    WHERE LOWER(email) = LOWER(_email) AND active = true
  );
$$;

-- Role validation helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- If user is a protected Super Admin, they have super_admin, admin, and user privileges always
  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  IF v_email IS NOT NULL AND public.is_protected_super_admin_email(v_email) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role::text = _role
        OR (_role = 'admin' AND role::text = 'super_admin')
        OR (_role = 'user' AND role::text IN ('super_admin', 'admin', 'user', 'member'))
      )
  );
END;
$$;

-- Authoritative role resolver
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_role TEXT;
BEGIN
  -- Check protected identities first
  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  IF v_email IS NOT NULL AND public.is_protected_super_admin_email(v_email) THEN
    RETURN 'super_admin';
  END IF;

  SELECT role::text INTO v_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role::text
      WHEN 'super_admin' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'veterinarian' THEN 2
      WHEN 'farm_manager' THEN 2
      WHEN 'member' THEN 1
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1;

  RETURN COALESCE(v_role, 'user');
END;
$$;

-- ==============================================================================
-- SUPER ADMIN IMMUTABILITY TRIGGERS
-- ==============================================================================

-- Trigger to PREVENT updating or deleting protected Super Admins in user_roles
CREATE OR REPLACE FUNCTION public.prevent_super_admin_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email TEXT;
BEGIN
  -- Lookup target user's email
  SELECT email INTO v_target_email FROM auth.users WHERE id = OLD.user_id;

  IF v_target_email IS NOT NULL AND public.is_protected_super_admin_email(v_target_email) THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Cannot modify, demote, or delete permanent AniGuard Super Admin: %', v_target_email;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_super_admin_mod ON public.user_roles;
CREATE TRIGGER trg_prevent_super_admin_mod
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_super_admin_modification();

-- Trigger to AUTOMATICALLY ensure protected Super Admin on user signup or sync
CREATE OR REPLACE FUNCTION public.sync_protected_super_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_protected BOOLEAN;
BEGIN
  v_is_protected := public.is_protected_super_admin_email(NEW.email);

  IF v_is_protected THEN
    -- Update protected_super_admins user_id linkage
    UPDATE public.protected_super_admins
    SET user_id = NEW.id
    WHERE LOWER(email) = LOWER(NEW.email);

    -- Ensure super_admin role is registered
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default role for new users is 'user'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_protected_super_admin ON auth.users;
CREATE TRIGGER trg_sync_protected_super_admin
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_protected_super_admin_role();

-- ==============================================================================
-- ATOMIC ROLE ASSIGNMENT PROCEDURE WITH AUDIT LOGGING
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.assign_user_role(
  _actor_id UUID,
  _target_user_id UUID,
  _new_role TEXT,
  _reason TEXT DEFAULT 'Administrative role assignment'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_email TEXT;
  v_target_email TEXT;
  v_old_role TEXT;
  v_is_actor_super_admin BOOLEAN;
  v_is_target_protected BOOLEAN;
BEGIN
  -- 1. Verify Actor permissions
  SELECT email INTO v_actor_email FROM auth.users WHERE id = _actor_id;
  v_is_actor_super_admin := public.has_role(_actor_id, 'super_admin');

  IF NOT v_is_actor_super_admin THEN
    RAISE EXCEPTION 'PERMISSION DENIED: Only Super Admins may assign or revoke roles.';
  END IF;

  -- 2. Verify Target status
  SELECT email INTO v_target_email FROM auth.users WHERE id = _target_user_id;
  IF v_target_email IS NULL THEN
    RAISE EXCEPTION 'TARGET NOT FOUND: User ID does not exist in authentication store.';
  END IF;

  v_is_target_protected := public.is_protected_super_admin_email(v_target_email);
  IF v_is_target_protected THEN
    RAISE EXCEPTION 'SECURITY REJECTION: Target user % is an immutable permanent Super Admin.', v_target_email;
  END IF;

  -- 3. Prevent self-demotion of Super Admin
  IF _actor_id = _target_user_id AND _new_role != 'super_admin' THEN
    RAISE EXCEPTION 'OPERATION FORBIDDEN: Super Admins cannot demote their own account.';
  END IF;

  -- 4. Get old role
  v_old_role := public.get_user_role(_target_user_id);

  -- 5. Atomic Update
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (_target_user_id, _new_role::app_role, _actor_id);

  -- 6. Atomic Audit Log Entry
  INSERT INTO public.audit_logs (
    actor_user_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    reason
  )
  VALUES (
    _actor_id,
    v_actor_email,
    'ROLE_CHANGE',
    'user_roles',
    _target_user_id::text,
    jsonb_build_object('role', v_old_role),
    jsonb_build_object('role', _new_role),
    _reason
  );

  RETURN jsonb_build_object(
    'success', true,
    'target_email', v_target_email,
    'old_role', v_old_role,
    'new_role', _new_role
  );
END;
$$;

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Protected Super Admins RLS
CREATE POLICY "Public read on protected super admin list" ON public.protected_super_admins
  FOR SELECT USING (true);

-- User Roles RLS
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Audit Logs RLS (Super Admin Read Only, System Append)
DROP POLICY IF EXISTS "Super admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- App Settings RLS
DROP POLICY IF EXISTS "Everyone can read settings" ON public.app_settings;
CREATE POLICY "Everyone can read settings" ON public.app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can modify settings" ON public.app_settings;
CREATE POLICY "Super admins can modify settings" ON public.app_settings
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Feature Flags RLS
DROP POLICY IF EXISTS "Everyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Everyone can read feature flags" ON public.feature_flags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can modify feature flags" ON public.feature_flags;
CREATE POLICY "Super admins can modify feature flags" ON public.feature_flags
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Disease Knowledge Base Management RLS
DROP POLICY IF EXISTS "Admins can modify diseases" ON public.diseases;
CREATE POLICY "Admins can modify diseases" ON public.diseases
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
