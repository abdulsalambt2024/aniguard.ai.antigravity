/**
 * AniGuard Backend Administration & Role-Based Access Control Service
 * Handles user management, immutable Super Admin validation, atomic role assignment,
 * append-only audit logging, and system configurations.
 */

import { supabase } from '@/integrations/supabase/client';

export const PROTECTED_SUPER_ADMIN_EMAILS = [
  'hayatamr9608@gmail.com',
  'abdul.salam.bt.2024@miet.ac.in',
  'ashi.gautam.bt.2024@miet.ac.in',
];

export interface AdminUserRecord {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'user' | 'veterinarian';
  is_protected: boolean;
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
  farm_name?: string;
  animal_count?: number;
}

export interface AuditLogEntry {
  id: string;
  actor_user_id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  reason?: string;
  created_at: string;
}

export interface AppSettingItem {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
  is_security_critical: boolean;
  updated_at: string;
}

export interface FeatureFlagItem {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  updated_at: string;
}

// Initial Mock / Seed Users for Immediate Management & Offline Fallback
export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'usr_sa1',
    user_id: 'sa_01',
    email: 'abdul.salam.bt.2024@miet.ac.in',
    full_name: 'Abdul Salam',
    phone: '+91 98765 43210',
    role: 'super_admin',
    is_protected: true,
    status: 'active',
    created_at: '2025-11-01T08:00:00Z',
    last_login: new Date().toISOString(),
    farm_name: 'AniGuard System Core',
    animal_count: 0,
  },
  {
    id: 'usr_sa2',
    user_id: 'sa_02',
    email: 'hayatamr9608@gmail.com',
    full_name: 'Hayat Amr',
    phone: '+91 98111 22334',
    role: 'super_admin',
    is_protected: true,
    status: 'active',
    created_at: '2025-11-01T08:00:00Z',
    last_login: new Date().toISOString(),
    farm_name: 'AniGuard System Core',
    animal_count: 0,
  },
  {
    id: 'usr_sa3',
    user_id: 'sa_03',
    email: 'ashi.gautam.bt.2024@miet.ac.in',
    full_name: 'Ashi Gautam',
    phone: '+91 98222 33445',
    role: 'super_admin',
    is_protected: true,
    status: 'active',
    created_at: '2025-11-01T08:00:00Z',
    last_login: new Date().toISOString(),
    farm_name: 'AniGuard System Core',
    animal_count: 0,
  },
  {
    id: 'usr_adm1',
    user_id: 'adm_01',
    email: 'dr.arvind.patel@aniguard.in',
    full_name: 'Dr. Arvind Patel (B.V.Sc)',
    phone: '+91 98250 12345',
    role: 'admin',
    is_protected: false,
    status: 'active',
    created_at: '2026-01-10T10:00:00Z',
    last_login: new Date(Date.now() - 3600 * 1000).toISOString(),
    farm_name: 'Anand Veterinary Care Hub',
    animal_count: 0,
  },
  {
    id: 'usr_usr1',
    user_id: 'usr_01',
    email: 'ramesh.kumar@dairy.in',
    full_name: 'Ramesh Kumar',
    phone: '+91 98250 88990',
    role: 'user',
    is_protected: false,
    status: 'active',
    created_at: '2026-02-15T11:30:00Z',
    last_login: new Date().toISOString(),
    farm_name: 'GreenPastures Dairy Farm',
    animal_count: 4,
  },
];

class AdminService {
  private users: AdminUserRecord[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private settings: AppSettingItem[] = [];
  private featureFlags: FeatureFlagItem[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedUsers = localStorage.getItem('aniguard_admin_users');
      this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_ADMIN_USERS;

      // Ensure protected Super Admins are always present and cannot be tampered with
      this.enforceSuperAdminIntegrity();

      const savedLogs = localStorage.getItem('aniguard_audit_logs');
      this.auditLogs = savedLogs ? JSON.parse(savedLogs) : [];

      const savedFlags = localStorage.getItem('aniguard_feature_flags');
      this.featureFlags = savedFlags
        ? JSON.parse(savedFlags)
        : [
            { id: 'ff_1', key: 'AI_HEALTH_CHECK', enabled: true, description: 'Multi-signal computer vision and symptom screening', updated_at: new Date().toISOString() },
            { id: 'ff_2', key: 'PREDICTIVE_HEALTH', enabled: true, description: 'Individual baseline trend and anomaly detection', updated_at: new Date().toISOString() },
            { id: 'ff_3', key: 'VOICE_ENTRY', enabled: true, description: 'Voice-first multilingual daily health logging', updated_at: new Date().toISOString() },
            { id: 'ff_4', key: 'PROFIT_INTELLIGENCE', enabled: true, description: 'Farm dairy economics and feed optimization', updated_at: new Date().toISOString() },
            { id: 'ff_5', key: 'WHATSAPP_ALERTS', enabled: false, description: 'Direct WhatsApp clinical broadcast notifications', updated_at: new Date().toISOString() },
            { id: 'ff_6', key: 'REGIONAL_DISEASE_RISK', enabled: true, description: 'ICAR-NIVEDI epidemiological forecast layer', updated_at: new Date().toISOString() },
          ];

      const savedSettings = localStorage.getItem('aniguard_app_settings');
      this.settings = savedSettings
        ? JSON.parse(savedSettings)
        : [
            { id: 'st_1', key: 'milk_drop_alert_threshold', value: { percent: 15, min_days: 2 }, category: 'clinical', description: 'Threshold for automated milk drop alert generation', is_security_critical: false, updated_at: new Date().toISOString() },
            { id: 'st_2', key: 'fever_threshold_celsius', value: { high_fever: 40.0, elevated: 39.3 }, category: 'clinical', description: 'Bovine rectal temperature thresholds', is_security_critical: false, updated_at: new Date().toISOString() },
            { id: 'st_3', key: 'emergency_hotline', value: { phone: '+91 98250 12345', service: 'Anand Mobile Vet Dispatch' }, category: 'support', description: 'Veterinary emergency contact', is_security_critical: false, updated_at: new Date().toISOString() },
            { id: 'st_4', key: 'supported_languages', value: ['en', 'hi', 'gu', 'mr', 'bn', 'te', 'ta', 'kn', 'pa', 'ur'], category: 'localization', description: 'Supported Indian languages', is_security_critical: false, updated_at: new Date().toISOString() },
          ];
    } catch (e) {
      console.warn('AdminService load error:', e);
      this.users = INITIAL_ADMIN_USERS;
    }
  }

  private persistState() {
    try {
      localStorage.setItem('aniguard_admin_users', JSON.stringify(this.users));
      localStorage.setItem('aniguard_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('aniguard_feature_flags', JSON.stringify(this.featureFlags));
      localStorage.setItem('aniguard_app_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('AdminService persist error:', e);
    }
  }

  /**
   * Enforces that the 3 immutable accounts cannot be removed or demoted
   */
  private enforceSuperAdminIntegrity() {
    PROTECTED_SUPER_ADMIN_EMAILS.forEach((email, idx) => {
      const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        this.users.unshift({
          id: `usr_sa_${idx + 1}`,
          user_id: `sa_0${idx + 1}`,
          email: email.toLowerCase(),
          full_name: email.split('@')[0].replace('.', ' '),
          role: 'super_admin',
          is_protected: true,
          status: 'active',
          created_at: '2025-11-01T08:00:00Z',
          last_login: new Date().toISOString(),
          farm_name: 'AniGuard System Core',
        });
      } else {
        // Force protected parameters
        existing.role = 'super_admin';
        existing.is_protected = true;
        existing.status = 'active';
      }
    });
  }

  /**
   * Checks if an email is an immutable permanent Super Admin
   */
  public isProtectedSuperAdmin(email?: string): boolean {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    return PROTECTED_SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
  }

  /**
   * Resolves the authoritative role for a given user identity
   */
  public resolveRole(email?: string, currentRole?: string): 'super_admin' | 'admin' | 'user' {
    if (this.isProtectedSuperAdmin(email)) {
      return 'super_admin';
    }
    if (currentRole === 'super_admin' || currentRole === 'admin') {
      return currentRole;
    }
    return 'user';
  }

  public getUsers(): AdminUserRecord[] {
    this.enforceSuperAdminIntegrity();
    return [...this.users];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getFeatureFlags(): FeatureFlagItem[] {
    return [...this.featureFlags];
  }

  public getSettings(): AppSettingItem[] {
    return [...this.settings];
  }

  /**
   * Atomic role assignment with Super Admin permission check and immutable protection
   */
  public assignUserRole(
    actorEmail: string,
    targetUserId: string,
    newRole: 'admin' | 'user',
    reason: string = 'Administrative role modification'
  ): { success: boolean; message: string } {
    // 1. Check actor is Super Admin
    if (!this.isProtectedSuperAdmin(actorEmail)) {
      const actor = this.users.find((u) => u.email.toLowerCase() === actorEmail.toLowerCase());
      if (!actor || actor.role !== 'super_admin') {
        return {
          success: false,
          message: 'PERMISSION DENIED: Only AniGuard Super Admins can assign or revoke roles.',
        };
      }
    }

    // 2. Check target user
    const target = this.users.find((u) => u.user_id === targetUserId || u.id === targetUserId);
    if (!target) {
      return { success: false, message: 'Target user not found in directory.' };
    }

    // 3. Prohibit modifying protected Super Admins
    if (target.is_protected || this.isProtectedSuperAdmin(target.email)) {
      return {
        success: false,
        message: `SECURITY VIOLATION: Cannot modify or revoke permanent Super Admin (${target.email}).`,
      };
    }

    const oldRole = target.role;
    target.role = newRole;

    // 4. Record Audit Log
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}`,
      actor_user_id: 'actor',
      actor_email: actorEmail,
      action: 'ROLE_CHANGE',
      entity_type: 'user_roles',
      entity_id: target.user_id,
      old_value: { role: oldRole },
      new_value: { role: newRole },
      reason,
      created_at: new Date().toISOString(),
    };

    this.auditLogs.unshift(newLog);
    this.persistState();

    return {
      success: true,
      message: `Successfully changed role for ${target.email} from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}.`,
    };
  }

  /**
   * Toggle user account status (suspend/activate)
   */
  public toggleUserStatus(actorEmail: string, targetUserId: string): { success: boolean; message: string } {
    const target = this.users.find((u) => u.user_id === targetUserId || u.id === targetUserId);
    if (!target) return { success: false, message: 'User not found.' };

    if (target.is_protected || this.isProtectedSuperAdmin(target.email)) {
      return { success: false, message: 'Cannot suspend a protected Super Admin.' };
    }

    const oldStatus = target.status;
    target.status = oldStatus === 'active' ? 'suspended' : 'active';

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      actor_user_id: 'actor',
      actor_email: actorEmail,
      action: target.status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      entity_type: 'profiles',
      entity_id: target.user_id,
      old_value: { status: oldStatus },
      new_value: { status: target.status },
      reason: `Account status updated to ${target.status}`,
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return { success: true, message: `User status changed to ${target.status}.` };
  }

  /**
   * Toggle Feature Flag
   */
  public toggleFeatureFlag(actorEmail: string, key: string): { success: boolean; message: string } {
    if (!this.isProtectedSuperAdmin(actorEmail)) {
      const actor = this.users.find((u) => u.email.toLowerCase() === actorEmail.toLowerCase());
      if (!actor || actor.role !== 'super_admin') {
        return { success: false, message: 'Only Super Admins can toggle system feature flags.' };
      }
    }

    const flag = this.featureFlags.find((f) => f.key === key);
    if (!flag) return { success: false, message: 'Feature flag not found.' };

    flag.enabled = !flag.enabled;
    flag.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      actor_user_id: 'actor',
      actor_email: actorEmail,
      action: 'FEATURE_FLAG_TOGGLE',
      entity_type: 'feature_flags',
      entity_id: key,
      old_value: { enabled: !flag.enabled },
      new_value: { enabled: flag.enabled },
      reason: `Feature flag ${key} set to ${flag.enabled}`,
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return { success: true, message: `Feature ${key} is now ${flag.enabled ? 'ENABLED' : 'DISABLED'}.` };
  }
}

export const adminService = new AdminService();
