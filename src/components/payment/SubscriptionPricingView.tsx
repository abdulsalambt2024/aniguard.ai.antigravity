import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Check,
  Crown,
  Sparkles,
  PhoneCall,
  Activity,
  Syringe,
  FileText,
  Lock,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  SUBSCRIPTION_PLANS,
  CLINICAL_SERVICES,
  razorpayService,
} from '../../services/razorpayService';
import {
  BillingCycle,
  SubscriptionPlan,
  ClinicalServiceItem,
  PaymentTransactionRecord,
} from '../../types/payment';
import { GSTInvoiceModal } from './GSTInvoiceModal';
import { toast } from 'sonner';

interface SubscriptionPricingViewProps {
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserPhone?: string;
  onPlanChanged?: () => void;
}

export const SubscriptionPricingView: React.FC<SubscriptionPricingViewProps> = ({
  currentUserEmail = 'ramesh.kumar@dairy.in',
  currentUserName = 'Ramesh Kumar',
  currentUserPhone = '+91 98250 88990',
  onPlanChanged,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransactionRecord | null>(null);

  const activeTier = razorpayService.getActiveSubscriptionTier();
  const transactions = razorpayService.getTransactions();
  const isLiveKey = razorpayService.isLiveKeyConfigured();

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.tier === 'free') {
      razorpayService.cancelActiveSubscription();
      toast.success('Kisan Free tier selected');
      onPlanChanged?.();
      return;
    }

    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'subscription',
      itemId: plan.id,
      itemName: plan.name,
      amount: price,
      billingCycle,
      userName: currentUserName,
      userEmail: currentUserEmail,
      userPhone: currentUserPhone,
      onSuccess: (record) => {
        setIsProcessing(false);
        toast.success(`🎉 ${plan.name} Activated!`, {
          description: `Razorpay Payment ID: ${record.razorpay_payment_id}`,
        });
        setSelectedInvoice(record);
        onPlanChanged?.();
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Payment Incomplete', { description: errMsg });
      },
    });
  };

  const handleBookService = (service: ClinicalServiceItem) => {
    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'clinical_service',
      itemId: service.id,
      itemName: service.name,
      amount: service.price,
      userName: currentUserName,
      userEmail: currentUserEmail,
      userPhone: currentUserPhone,
      onSuccess: (record) => {
        setIsProcessing(false);
        toast.success(`🎉 ${service.name} Confirmed!`, {
          description: `Receipt: ${record.invoice_number}`,
        });
        setSelectedInvoice(record);
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Booking Incomplete', { description: errMsg });
      },
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B1520] via-[#0E201B] to-[#0B1520] border border-[#182635] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Razorpay Gateway
            </span>
            <span className="text-xs text-slate-400">
              {isLiveKey ? '● Live Production Gateway' : '● Sandbox Mode Active'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Pro Herd Plans & Clinical Billing
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Predictive disease risk screening, ration optimization, and direct access to licensed veterinary clinicians.
          </p>
        </div>

        {/* Current Active Plan Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Plan:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                activeTier === 'enterprise'
                  ? 'bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50'
                  : activeTier === 'pro'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activeTier.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>Instant GST Tax Invoicing</span>
          </div>
        </div>
      </div>

      {/* Monthly vs Annual Toggle */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 bg-[#08101A] border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              billingCycle === 'monthly'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = activeTier === plan.tier;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition relative ${
                plan.isPopular
                  ? 'bg-[#0B1A16] border-emerald-500 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-[#0B1520] border-[#182635] hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-sm ${
                      plan.isPopular
                        ? 'bg-[#059669] text-white border-emerald-400'
                        : 'bg-[#142333] text-slate-200 border-slate-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400">{plan.hindiName}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                      Active
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {plan.description}
                </p>

                {/* Feature List */}
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-950/50'
                      : isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-[#142333] hover:bg-[#1C2F44] text-slate-200 border border-slate-700'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    <span>Current Active Plan</span>
                  ) : plan.priceMonthly === 0 ? (
                    <span>Downgrade to Free</span>
                  ) : (
                    <>
                      <span>Pay ₹{price.toLocaleString()} with Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* On-Demand Veterinary Services */}
      <div className="mt-12 pt-8 border-t border-[#182635] space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            On-Demand Clinical Services
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Book certified veterinary consultations, herd audits, or preventive packages on demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CLINICAL_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-emerald-700/60 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {srv.duration}
                  </span>
                  <span className="text-xl font-bold text-white font-mono">
                    ₹{srv.price}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mt-3">{srv.name}</h3>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {srv.description}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-[#08101A] border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{srv.doctorName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBookService(srv)}
                disabled={isProcessing}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Book & Pay ₹{srv.price}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History / Invoices Section */}
      <div className="mt-12 pt-8 border-t border-[#182635] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Billing Ledger & GST Invoices
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Official GST Tax Invoices (SAC 998313) with 18% GST breakdown.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#08101A] px-3 py-1 rounded-lg border border-slate-800">
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#08101A] border border-slate-800 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Transactions Recorded Yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Subscribe to a plan or order a clinical service to generate your first tax receipt.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#08101A]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0E1A26] transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{tx.item_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      PAID
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Invoice: <strong className="font-mono text-cyan-400">{tx.invoice_number}</strong></span>
                    <span>•</span>
                    <span>Razorpay ID: <strong className="font-mono text-slate-300">{tx.razorpay_payment_id}</strong></span>
                    <span>•</span>
                    <span>{new Date(tx.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-base font-bold text-white font-mono">
                    ₹{tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedInvoice(tx)}
                    className="px-3 py-1.5 rounded-lg bg-[#0E2E25] hover:bg-[#134E3E] border border-emerald-700 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View GST Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <GSTInvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        transaction={selectedInvoice}
      />
    </div>
  );
};
