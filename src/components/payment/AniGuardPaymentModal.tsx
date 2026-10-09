import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Crown,
  Sparkles,
  Zap,
  PhoneCall,
  Activity,
  Syringe,
  FileText,
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  QrCode,
  IndianRupee,
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

interface AniGuardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserPhone?: string;
  defaultTab?: 'plans' | 'services' | 'history';
  onPlanActivated?: (planTier: 'free' | 'pro' | 'enterprise') => void;
}

export const AniGuardPaymentModal: React.FC<AniGuardPaymentModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail = 'ramesh.kumar@dairy.in',
  currentUserName = 'Ramesh Kumar',
  currentUserPhone = '+91 98250 88990',
  defaultTab = 'plans',
  onPlanActivated,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'services' | 'history'>(defaultTab);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_pro');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv_vet_video');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransactionRecord | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<PaymentTransactionRecord | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  const currentTier = razorpayService.getActiveSubscriptionTier();
  const isLiveKey = razorpayService.isLiveKeyConfigured();
  const configuredKey = razorpayService.getRazorpayKeyId();

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.tier === 'free') {
      razorpayService.cancelActiveSubscription();
      toast.success('Kisan Free tier selected');
      onPlanActivated?.('free');
      onClose();
      return;
    }

    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const finalAmount = promoApplied ? Math.round(price * 0.9) : price;

    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'subscription',
      itemId: plan.id,
      itemName: plan.name,
      amount: finalAmount,
      billingCycle,
      userName: currentUserName,
      userEmail: currentUserEmail,
      userPhone: currentUserPhone,
      onSuccess: (record) => {
        setIsProcessing(false);
        setCompletedTransaction(record);
        toast.success(`🎉 ${plan.name} Activated Successfully!`, {
          description: `Razorpay Payment ID: ${record.razorpay_payment_id}`,
        });
        onPlanActivated?.(plan.tier);
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Payment Incomplete', { description: errMsg });
      },
    });
  };

  const handleBookService = (service: ClinicalServiceItem) => {
    const finalAmount = service.price;

    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'clinical_service',
      itemId: service.id,
      itemName: service.name,
      amount: finalAmount,
      userName: currentUserName,
      userEmail: currentUserEmail,
      userPhone: currentUserPhone,
      onSuccess: (record) => {
        setIsProcessing(false);
        setCompletedTransaction(record);
        toast.success(`🎉 ${service.name} Confirmed!`, {
          description: `Receipt: ${record.invoice_number} generated.`,
        });
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Booking Incomplete', { description: errMsg });
      },
    });
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'KISAN10' || promoCode.trim().toUpperCase() === 'ANIGUARD') {
      setPromoApplied(true);
      toast.success('Promo Code Applied! 10% Special Agri-Discount added.');
    } else {
      toast.error('Invalid Promo Code. Try "KISAN10"');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-4xl text-white shadow-2xl p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Payment Success View */}
          {completedTransaction ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Payment Verified (भुगतान सफल)
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
                  Order Successfully Placed!
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                  Thank you! Your transaction has been securely processed via Razorpay. Your intelligence module is now active.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#08101A] border border-[#182635] text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Product / Plan:</span>
                  <span className="font-bold text-white">{completedTransaction.item_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-400">₹{completedTransaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Razorpay ID:</span>
                  <span className="text-slate-300">{completedTransaction.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Invoice Number:</span>
                  <span className="text-cyan-400">{completedTransaction.invoice_number}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Gateway Status:</span>
                  <span className="text-emerald-400 font-semibold uppercase">{completedTransaction.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedInvoiceForView(completedTransaction)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0E2E25] hover:bg-[#134E3E] border border-emerald-700 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download / Print GST Invoice</span>
                </button>

                <button
                  onClick={() => {
                    setCompletedTransaction(null);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition"
                >
                  Continue to Farm Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="pb-4 border-b border-[#182635]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-emerald-400 flex items-center justify-center border border-emerald-800 shadow-md">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        AniGuard Secure Payments
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#101F2F] text-cyan-400 border border-cyan-800">
                          Razorpay Enabled
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Dairy subscription plans & on-demand veterinary intelligence
                      </p>
                    </div>
                  </div>

                  {/* Razorpay Gateway Status Badge */}
                  <div className="flex items-center gap-2 bg-[#08101A] border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveKey ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {isLiveKey ? 'Razorpay Live' : 'Razorpay Sandbox Mode'}
                    </span>
                    <Lock className="w-3 h-3 text-[#D4AF37]" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 rounded-xl bg-[#08101A] border border-slate-800 mt-4 max-w-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab('plans')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'plans' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Plans & Pro Herd</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'services' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Clinical On-Demand</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'history' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Invoices ({razorpayService.getTransactions().length})</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Subscription Plans */}
              {activeTab === 'plans' && (
                <div className="mt-5 space-y-5">
                  {/* Monthly vs Annual Toggle */}
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                      Monthly
                    </span>
                    <button
                      type="button"
                      onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                      className="w-12 h-6 rounded-full bg-[#142333] border border-slate-700 relative p-0.5 transition"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#059669] transition-transform ${
                          billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
                      <span>Annual</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/40">
                        Save 17%
                      </span>
                    </span>
                  </div>

                  {/* 3 Pricing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const isCurrent = currentTier === plan.tier;
                      const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`rounded-2xl p-5 border flex flex-col justify-between transition relative cursor-pointer ${
                            plan.isPopular
                              ? 'bg-[#0E201B] border-emerald-500 shadow-xl shadow-emerald-950/30'
                              : isSelected
                              ? 'bg-[#0F1C2B] border-cyan-500 shadow-lg'
                              : 'bg-[#08101A] border-[#182635] hover:border-slate-700'
                          }`}
                        >
                          {plan.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                                  plan.isPopular
                                    ? 'bg-[#059669] text-white border-emerald-400'
                                    : 'bg-[#142333] text-slate-300 border-slate-700'
                                }`}
                              >
                                {plan.badge}
                              </span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                <h3 className="font-bold text-base text-white">{plan.name}</h3>
                                <p className="text-[11px] text-slate-400">{plan.hindiName}</p>
                              </div>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                                  Current
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                                ₹{price.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400 font-normal">
                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                              {plan.description}
                            </p>

                            {/* Feature Checklist */}
                            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                              {plan.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-tight">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 pt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe(plan);
                              }}
                              disabled={isProcessing}
                              className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 ${
                                plan.isPopular
                                  ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-950/40'
                                  : isCurrent
                                  ? 'bg-slate-800 text-slate-400 cursor-default'
                                  : 'bg-[#142333] hover:bg-[#1E334A] text-slate-200 border border-slate-700'
                              }`}
                            >
                              {isProcessing && selectedPlanId === plan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isCurrent ? (
                                <span>Active Plan</span>
                              ) : plan.priceMonthly === 0 ? (
                                <span>Select Free</span>
                              ) : (
                                <>
                                  <span>Pay ₹{price.toLocaleString()} with Razorpay</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: On-Demand Clinical Services */}
              {activeTab === 'services' && (
                <div className="mt-5 space-y-4">
                  <p className="text-xs text-slate-300">
                    Pay-as-you-go veterinary consultations, instant diagnostic audits, and vaccination packages.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CLINICAL_SERVICES.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-[#08101A] border border-[#182635] hover:border-emerald-800 rounded-xl p-5 flex flex-col justify-between transition shadow-md"
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
                          <p className="text-[11px] text-slate-400">{srv.hindiName}</p>

                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {srv.description}
                          </p>

                          <div className="mt-3 p-2 rounded-lg bg-[#0E1A26] border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{srv.doctorName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookService(srv)}
                          disabled={isProcessing}
                          className="mt-5 w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
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
              )}

              {/* Tab 3: Transaction History */}
              {activeTab === 'history' && (
                <div className="mt-5 space-y-3">
                  {razorpayService.getTransactions().length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-white">No Payment Records Found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        When you subscribe or book a veterinary service, your GST tax invoices will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#08101A]">
                      {razorpayService.getTransactions().map((tx) => (
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
                              onClick={() => setSelectedInvoiceForView(tx)}
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
              )}

              {/* Bottom Razorpay Security Compliance Strip */}
              <div className="mt-6 pt-4 border-t border-[#182635] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Razorpay 256-Bit SSL Encrypted</span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-[11px] text-slate-400">UPI, RuPay, Visa, MC, NetBanking</span>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span>GSTIN: 24AABCA1234F1Z8 • RBI Compliant</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      <GSTInvoiceModal
        isOpen={!!selectedInvoiceForView}
        onClose={() => setSelectedInvoiceForView(null)}
        transaction={selectedInvoiceForView}
      />
    </>
  );
};
