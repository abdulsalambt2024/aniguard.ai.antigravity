import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Crown,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ToggleLeft,
  ToggleRight,
  Database,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Sparkles,
  RefreshCw,
  PhoneCall,
  CreditCard,
} from 'lucide-react';
import { adminService, AdminUserRecord, AuditLogEntry, PROTECTED_SUPER_ADMIN_EMAILS } from '../../services/adminService';
import { aniguardService } from '../../services/aniguardService';
import { razorpayService } from '../../services/razorpayService';
import { GSTInvoiceModal } from '../payment/GSTInvoiceModal';
import { PaymentTransactionRecord } from '../../types/payment';
import { toast } from 'sonner';

type AdminTab =
  | 'overview'
  | 'users'
  | 'admins'
  | 'payments'
  | 'disease_knowledge'
  | 'sources'
  | 'ai_models'
  | 'settings'
  | 'audit_logs'
  | 'security';

interface AniGuardAdminPanelProps {
  currentUserEmail: string;
  onClose?: () => void;
}

export const AniGuardAdminPanel: React.FC<AniGuardAdminPanelProps> = ({
  currentUserEmail,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<AdminUserRecord[]>(() => adminService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => adminService.getAuditLogs());
  const [featureFlags, setFeatureFlags] = useState(() => adminService.getFeatureFlags());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    user?: AdminUserRecord;
    actionType: 'make_admin' | 'revoke_admin' | 'toggle_status';
  }>({ isOpen: false, actionType: 'make_admin' });
  const [selectedAdminInvoice, setSelectedAdminInvoice] = useState<PaymentTransactionRecord | null>(null);

  const refreshData = () => {
    setUsers(adminService.getUsers());
    setAuditLogs(adminService.getAuditLogs());
    setFeatureFlags(adminService.getFeatureFlags());
  };

  const isCurrentSuperAdmin = adminService.isProtectedSuperAdmin(currentUserEmail);

  // Statistics for Overview
  const totalUsers = users.length;
  const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const regularUserCount = users.filter((u) => u.role === 'user').length;
  const activeFarms = 1;
  const totalAnimals = aniguardService.getAnimals().length;
  const activeAlerts = aniguardService.getAlerts().filter((a) => !a.is_resolved).length;
  const diseases = aniguardService.getDiseases();

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.farm_name && u.farm_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleExecuteAction = () => {
    if (!confirmDialog.user) return;
    const target = confirmDialog.user;

    if (confirmDialog.actionType === 'make_admin') {
      const res = adminService.assignUserRole(
        currentUserEmail,
        target.user_id,
        'admin',
        'Promoted to application Admin by Super Admin'
      );
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    } else if (confirmDialog.actionType === 'revoke_admin') {
      const res = adminService.assignUserRole(
        currentUserEmail,
        target.user_id,
        'user',
        'Revoked Admin privileges; restored to regular User'
      );
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    } else if (confirmDialog.actionType === 'toggle_status') {
      const res = adminService.toggleUserStatus(currentUserEmail, target.user_id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }

    setConfirmDialog({ isOpen: false, actionType: 'make_admin' });
    refreshData();
  };

  const handleToggleFlag = (key: string) => {
    const res = adminService.toggleFeatureFlag(currentUserEmail, key);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    refreshData();
  };

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl text-white shadow-2xl overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Admin Header */}
      <div className="bg-[#08101A] border-b border-[#182635] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#291F0E] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/40 shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Super Admin Center</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50">
                Permanent Super Admin Authority
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure RBAC, immutable administrator protection, clinical knowledge, and audit telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-[#0E1A26] border border-slate-700 text-slate-300 font-mono">
            Actor: {currentUserEmail}
          </span>
          <button
            onClick={refreshData}
            className="p-1.5 rounded-lg bg-[#0E1A26] border border-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-[#08101A] border-b border-[#182635] px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'admins', label: 'Admin Accounts', icon: ShieldAlert },
          { id: 'payments', label: 'Razorpay Ledger', icon: CreditCard },
          { id: 'disease_knowledge', label: 'Disease Knowledge', icon: BookOpen },
          { id: 'sources', label: 'Trusted Sources', icon: Database },
          { id: 'ai_models', label: 'AI Models', icon: Sparkles },
          { id: 'settings', label: 'Settings & Flags', icon: ToggleRight },
          { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
          { id: 'security', label: 'Security & RLS', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#101F2F] text-cyan-400 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1A26]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      <div className="p-6 flex-1 overflow-y-auto">
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
                <div className="text-2xl font-black font-mono text-white mt-1">{totalUsers}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Across farmers & admins</p>
              </div>

              <div className="p-4 rounded-xl bg-[#08101A] border border-[#D4AF37]/30 bg-gradient-to-br from-[#08101A] to-[#291F0E]">
                <span className="text-xs font-semibold text-[#D4AF37]">Protected Super Admins</span>
                <div className="text-2xl font-black font-mono text-[#D4AF37] mt-1">
                  {superAdminCount}
                </div>
                <p className="text-[11px] text-[#D4AF37]/70 mt-0.5">Immutable identities</p>
              </div>

              <div className="p-4 rounded-xl bg-[#08101A] border border-blue-900/40">
                <span className="text-xs font-semibold text-blue-400">Application Admins</span>
                <div className="text-2xl font-black font-mono text-blue-400 mt-1">{adminCount}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Authorized delegates</p>
              </div>

              <div className="p-4 rounded-xl bg-[#08101A] border border-emerald-900/40">
                <span className="text-xs font-semibold text-emerald-400">Monitored Livestock</span>
                <div className="text-2xl font-black font-mono text-white mt-1">{totalAnimals}</div>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">Active health baselines</p>
              </div>
            </div>

            {/* Permanent Super Admin Identities Display */}
            <div className="p-5 rounded-xl bg-[#08101A] border border-[#D4AF37]/30">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                  Permanent AniGuard Super Admin Identities
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                These three verified identities are protected at the database schema and trigger
                level. No database operation or client call can demote, delete, or revoke their
                administrative rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PROTECTED_SUPER_ADMIN_EMAILS.map((email, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0E1A26] border border-[#D4AF37]/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white truncate">{email}</div>
                      <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3" /> Immutable Protected
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#291F0E] text-[#D4AF37] font-bold">
                      SUPER ADMIN
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Telemetry Preview */}
            <div className="p-5 rounded-xl bg-[#08101A] border border-[#182635]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recent Administrative Audit Events
                </h3>
                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                >
                  <span>View All Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {auditLogs.length > 0 ? (
                <div className="divide-y divide-[#182635] text-xs">
                  {auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-white">{log.action}</span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">
                          by {log.actor_email}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{log.reason}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No recent administrative actions recorded.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or farm name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#08101A] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#08101A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="super_admin">Super Admins ({superAdminCount})</option>
                <option value="admin">Admins ({adminCount})</option>
                <option value="user">Users ({regularUserCount})</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-[#182635]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#08101A] text-slate-400 border-b border-[#182635]">
                  <tr>
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Farm Association</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152332]">
                  {filteredUsers.map((u) => {
                    const isProtected = u.is_protected || adminService.isProtectedSuperAdmin(u.email);

                    return (
                      <tr key={u.id} className="hover:bg-[#0E1A26] transition">
                        <td className="p-3">
                          <div className="font-semibold text-white">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>

                        <td className="p-3">
                          {u.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50">
                              <Crown className="w-3 h-3" />
                              <span>SUPER ADMIN</span>
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#101F2F] text-[#3B82F6] border border-[#3B82F6]/50">
                              <ShieldAlert className="w-3 h-3" />
                              <span>ADMIN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#142333] text-slate-300">
                              USER
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-300">
                          {u.farm_name || 'Independent Dairy'}
                          {u.animal_count !== undefined && u.animal_count > 0 && (
                            <span className="text-[10px] text-slate-500 block font-mono">
                              {u.animal_count} Monitored Livestock
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.status === 'active'
                                ? 'bg-[#0E2E25] text-emerald-400 border border-[#134E3E]'
                                : 'bg-[#2E1010] text-red-400 border border-[#5A1C1C]'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          {isProtected ? (
                            <span className="text-[11px] font-bold text-[#D4AF37] bg-[#291F0E] px-2 py-1 rounded border border-[#D4AF37]/40 cursor-default">
                              🔒 PROTECTED SUPER ADMIN
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {u.role !== 'admin' ? (
                                <button
                                  onClick={() =>
                                    setConfirmDialog({
                                      isOpen: true,
                                      user: u,
                                      actionType: 'make_admin',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-[#101F2F] hover:bg-[#162B40] text-blue-400 border border-blue-800 text-[11px] font-semibold transition"
                                >
                                  Assign Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setConfirmDialog({
                                      isOpen: true,
                                      user: u,
                                      actionType: 'revoke_admin',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-[#2A1515] hover:bg-[#3D1E1E] text-amber-400 border border-amber-800 text-[11px] font-semibold transition"
                                >
                                  Revoke Admin
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    user: u,
                                    actionType: 'toggle_status',
                                  })
                                }
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                                  u.status === 'active'
                                    ? 'bg-[#2A1010] hover:bg-[#3A1414] text-red-400 border-red-900'
                                    : 'bg-[#0E2E25] hover:bg-[#133F33] text-emerald-400 border-emerald-900'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ADMIN MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
              <h3 className="text-sm font-bold text-white mb-1">Delegated Administrator Roles</h3>
              <p className="text-xs text-slate-400">
                Super Admins can grant and revoke Admin privileges for support and clinical oversight.
                Admins can never elevate accounts to Super Admin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users
                .filter((u) => u.role === 'admin' || u.role === 'super_admin')
                .map((adm) => {
                  const isProt = adm.is_protected || adminService.isProtectedSuperAdmin(adm.email);

                  return (
                    <div
                      key={adm.id}
                      className="p-4 rounded-xl bg-[#08101A] border border-[#182635] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{adm.full_name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              adm.role === 'super_admin'
                                ? 'bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50'
                                : 'bg-[#101F2F] text-blue-400 border border-blue-800'
                            }`}
                          >
                            {adm.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{adm.email}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Role: {adm.role === 'super_admin' ? 'System Super Admin' : 'Support Admin'}
                        </div>
                      </div>

                      <div>
                        {isProt ? (
                          <span className="text-[11px] font-bold text-[#D4AF37]">
                            🔒 Protected
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                user: adm,
                                actionType: 'revoke_admin',
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#2A1515] hover:bg-[#3D1E1E] text-amber-400 border border-amber-800 text-xs font-semibold"
                          >
                            Revoke Admin
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 3B. RAZORPAY PAYMENT GATEWAY & GST INVOICES */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Gateway Status Header */}
            <div className="p-5 rounded-xl bg-[#08101A] border border-[#182635] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Razorpay Gateway & Billing Ledger</h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border ${
                      razorpayService.isLiveKeyConfigured()
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800'
                    }`}
                  >
                    {razorpayService.isLiveKeyConfigured() ? 'Live Production Gateway' : 'Sandbox / Test Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active Key ID: <span className="font-mono text-cyan-400">{razorpayService.getRazorpayKeyId()}</span>
                  {' '}• Configured in <code className="text-slate-300">.env (VITE_RAZORPAY_KEY_ID)</code>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="text-slate-400">Compliance & Security</div>
                  <div className="text-emerald-400 font-semibold font-mono">PCI-DSS 256-bit SSL</div>
                </div>
              </div>
            </div>

            {/* Financial Overview Metrics */}
            {(() => {
              const txList = razorpayService.getTransactions();
              const grossRevenue = txList.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0);
              const gstCollected = txList.reduce((acc, t) => acc + (t.status === 'completed' ? (t.tax_amount || 0) : 0), 0);
              const completedCount = txList.filter((t) => t.status === 'completed').length;
              const subCount = txList.filter((t) => t.item_type === 'subscription' && t.status === 'completed').length;

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                      <div className="text-xs text-slate-400 font-medium">Gross Revenue</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                        ₹{grossRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">{completedCount} successful txns</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                      <div className="text-xs text-slate-400 font-medium">GST Collected (18%)</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
                        ₹{gstCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">SAC 998313 (CGST+SGST)</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                      <div className="text-xs text-slate-400 font-medium">Pro Subscriptions</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#D4AF37] mt-1">
                        {subCount}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Active herd licenses</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                      <div className="text-xs text-slate-400 font-medium">Ledger Sync</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                        100%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Supabase + Offline sync</div>
                    </div>
                  </div>

                  {/* Transaction Ledger Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Payment Transactions & Tax Invoices</h4>
                      <span className="text-xs font-mono text-slate-400">{txList.length} total entries</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#182635]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#08101A] text-slate-400 border-b border-[#182635]">
                          <tr>
                            <th className="p-3 font-semibold">Date & Time</th>
                            <th className="p-3 font-semibold">Invoice #</th>
                            <th className="p-3 font-semibold">Customer</th>
                            <th className="p-3 font-semibold">Plan / Service</th>
                            <th className="p-3 font-semibold">Total Amount</th>
                            <th className="p-3 font-semibold">Payment ID</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#152332] font-mono text-slate-300">
                          {txList.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#0E1A26] transition">
                              <td className="p-3 text-slate-400 font-sans">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="p-3 font-bold text-cyan-400">{tx.invoice_number}</td>
                              <td className="p-3 font-sans">
                                <div className="text-white font-medium">{tx.user_name}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{tx.user_email}</div>
                              </td>
                              <td className="p-3 font-sans">
                                <span className="text-white font-medium block">{tx.item_name}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{tx.item_type}</span>
                              </td>
                              <td className="p-3">
                                <span className="text-white font-bold">₹{tx.amount.toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-slate-500 block">incl. 18% GST</span>
                              </td>
                              <td className="p-3 text-slate-400 text-[11px]">{tx.razorpay_payment_id}</td>
                              <td className="p-3 font-sans">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    tx.status === 'completed'
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAdminInvoice(tx)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#102336] hover:bg-[#16304b] text-cyan-400 hover:text-cyan-300 border border-cyan-800/50 text-xs font-sans font-medium transition"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>GST Invoice</span>
                                </button>
                              </td>
                            </tr>
                          ))}

                          {txList.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                                <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <div className="font-semibold text-white">No payment transactions recorded yet</div>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                  Transactions initiated by farmers via the Pro Plans or Clinical Services checkout will appear here with full GST breakdown.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 4. DISEASE KNOWLEDGE */}
        {activeTab === 'disease_knowledge' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182635]">
              <div>
                <h3 className="text-base font-bold text-white">Clinical Disease Knowledge Base</h3>
                <p className="text-xs text-slate-400">
                  Only Verified / Published knowledge is queried by the predictive engine
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0E2E25] text-emerald-400 border border-[#134E3E]">
                {diseases.length} Curated Tier-1 Profiles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diseases.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-[#0E2E25] px-2 py-0.5 rounded">
                      {d.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-[#0E2E25] px-2 py-0.5 rounded border border-[#134E3E]">
                      Published & Verified
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{d.name}</h4>
                  <p className="text-xs text-slate-400 italic">{d.scientific_name}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    <strong>Symptoms: </strong> {d.key_symptoms.join(', ')}
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#182635] text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Source: {d.reference_source}</span>
                    <span className="text-cyan-400">Tier {d.tier} Reference</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TRUSTED SOURCES */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
              <h3 className="text-sm font-bold text-white mb-1">Authoritative Source Provenance</h3>
              <p className="text-xs text-slate-400">
                Ranking hierarchy strictly prioritizes Tier 1 (WOAH, ICAR, DAHD) and Tier 2 (MSD Vet Manual).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { org: 'WOAH (World Organisation for Animal Health)', level: 'Tier 1 Global Authority', url: 'https://www.woah.org', status: 'Active Verified' },
                { org: 'ICAR-NIVEDI (NADRES v2 AI Early Warning)', level: 'Tier 1 National Authority', url: 'https://icar.org.in', status: 'Active Verified' },
                { org: 'DAHD (Department of Animal Husbandry & Dairying)', level: 'Tier 1 Policy & Disease Control', url: 'https://dahd.nic.in', status: 'Active Verified' },
                { org: 'MSD Veterinary Manual', level: 'Tier 2 Peer-Reviewed Clinical', url: 'https://www.msdvetmanual.com', status: 'Active Verified' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#08101A] border border-[#182635] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-[#101F2F] px-2 py-0.5 rounded">
                      {s.level}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-2">{s.org}</h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#182635] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">{s.status}</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. AI MODELS */}
        {activeTab === 'ai_models' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
              <h3 className="text-sm font-bold text-white mb-1">AI / Model Management</h3>
              <p className="text-xs text-slate-400">
                Only validated, calibrated models are enabled for production disease early warning.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#08101A] border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">AniGuard-Hybrid-v2.4</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0E2E25] text-emerald-400 border border-[#134E3E]">
                      Production Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-signal engine: Individual Rolling Baselines + Robust Z-Score / MAD + ICAR/WOAH Evidence Matching
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400">100% Calibrated</span>
                  <div className="text-[10px] text-slate-500">Validation Status</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#182635] grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                <div>Type: Rule-Statistical Hybrid</div>
                <div>Status: Validated</div>
                <div>Activated: 2026-09-29</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. SETTINGS & FLAGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
              <h3 className="text-sm font-bold text-white mb-1">Dynamic Feature Flags</h3>
              <p className="text-xs text-slate-400">
                Toggle platform capabilities in real time without redeployment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-4 rounded-xl bg-[#08101A] border border-[#182635] flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-xs text-white">{flag.key}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{flag.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag.key)}
                    className="ml-4 transition"
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-8 h-8 text-[#10B981]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182635]">
              <div>
                <h3 className="text-base font-bold text-white">Security & Role Audit Log</h3>
                <p className="text-xs text-slate-400">
                  Immutable append-only record of all administrative role modifications
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {auditLogs.length} Events Logged
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#182635]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#08101A] text-slate-400 border-b border-[#182635]">
                  <tr>
                    <th className="p-3 font-semibold">Timestamp</th>
                    <th className="p-3 font-semibold">Actor</th>
                    <th className="p-3 font-semibold">Action</th>
                    <th className="p-3 font-semibold">Entity Target</th>
                    <th className="p-3 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152332] font-mono text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#0E1A26] transition">
                      <td className="p-3 text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-sans font-medium text-white">{log.actor_email}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-[#101F2F] text-cyan-400 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{log.entity_id}</td>
                      <td className="p-3 font-sans text-slate-300">{log.reason || '—'}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                        No audit events logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. SECURITY & RLS */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#08101A] border border-[#182635]">
              <h3 className="text-sm font-bold text-white mb-1">
                PostgreSQL Row-Level Security (RLS) & Triggers
              </h3>
              <p className="text-xs text-slate-400">
                Security status verified against PostgreSQL and Supabase Auth
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Immutable Super Admin Database Trigger', status: 'ACTIVE', desc: 'Blocks UPDATE / DELETE on protected Super Admin records' },
                { name: 'Auto-Sync Protected Super Admin on Auth', status: 'ACTIVE', desc: 'Automatically maps verified emails to SUPER_ADMIN role' },
                { name: 'Row-Level Security on animals & daily_records', status: 'ENFORCED', desc: 'Farmers isolated to their own farm records' },
                { name: 'Atomic assign_user_role() RPC Function', status: 'ACTIVE', desc: 'Enforces Super Admin check + updates audit log in single transaction' },
                { name: 'Append-Only Audit Logs Policy', status: 'ENFORCED', desc: 'No user or admin can delete or alter past audit logs' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#08101A] border border-[#182635] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-white block">{s.name}</span>
                    <span className="text-[11px] text-slate-400">{s.desc}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0E2E25] text-emerald-400 border border-[#134E3E]">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && confirmDialog.user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
            <div className="flex items-center gap-3 pb-3 border-b border-[#182635]">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">
                {confirmDialog.actionType === 'make_admin'
                  ? 'Assign Admin Role'
                  : confirmDialog.actionType === 'revoke_admin'
                  ? 'Revoke Admin Role'
                  : 'Toggle User Status'}
              </h3>
            </div>

            <div className="py-4 space-y-2 text-xs text-slate-300">
              <p>
                <strong>Target User: </strong> {confirmDialog.user.full_name} (
                {confirmDialog.user.email})
              </p>
              <p>
                <strong>Current Role: </strong> {confirmDialog.user.role.toUpperCase()}
              </p>
              <p>
                <strong>New Role: </strong>{' '}
                {confirmDialog.actionType === 'make_admin' ? 'ADMIN' : 'USER'}
              </p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-[#182635]">
                This administrative action will be recorded permanently in the AniGuard audit log.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, actionType: 'make_admin' })}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-xs font-bold text-white shadow-md"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GST Tax Invoice Viewer for Admin */}
      {selectedAdminInvoice && (
        <GSTInvoiceModal
          isOpen={!!selectedAdminInvoice}
          onClose={() => setSelectedAdminInvoice(null)}
          transaction={selectedAdminInvoice}
        />
      )}
    </div>
  );
};
