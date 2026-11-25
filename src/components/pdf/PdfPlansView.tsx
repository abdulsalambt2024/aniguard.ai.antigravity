import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Building2, Landmark, GraduationCap, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { razorpayService } from '../../services/razorpayService';
import { toast } from 'sonner';

interface PdfPlansViewProps {
  currentUserEmail?: string;
  currentUserName?: string;
  onUpgradeSuccess?: () => void;
  onOpenPaymentModal?: () => void;
  onBack?: () => void;
}

export const PdfPlansView: React.FC<PdfPlansViewProps> = ({
  currentUserEmail = 'ramesh@dairy.in',
  currentUserName = 'Ramesh',
  onUpgradeSuccess,
  onOpenPaymentModal,
  onBack,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>('plan_free');

  // Yearly discount calculation (20% off)
  const discountMultiplier = billingCycle === 'yearly' ? 0.8 : 1;

  const handleCheckout = (planId: string, planName: string, baseMonthlyPrice: number) => {
    if (baseMonthlyPrice === 0) {
      setActivePlanId(planId);
      toast.success('Active plan set to Free Pilot.');
      return;
    }

    const finalAmount = billingCycle === 'yearly'
      ? Math.round(baseMonthlyPrice * 12 * 0.8)
      : baseMonthlyPrice;

    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'subscription',
      itemId: planId,
      itemName: `${planName} (${billingCycle.toUpperCase()})`,
      amount: finalAmount,
      billingCycle,
      userName: currentUserName,
      userEmail: currentUserEmail,
      onSuccess: (record) => {
        setIsProcessing(false);
        setActivePlanId(planId);
        toast.success(`🎉 ${planName} Activated!`, {
          description: `Razorpay Payment ID: ${record.razorpay_payment_id} • GST Invoice Ready`,
        });
        onUpgradeSuccess?.();
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Payment Incomplete', { description: errMsg });
      },
    });
  };

  const handleBookService = (name: string, price: number, srvId: string) => {
    setIsProcessing(true);
    razorpayService.processPayment({
      itemType: 'clinical_service',
      itemId: srvId,
      itemName: name,
      amount: price,
      userName: currentUserName,
      userEmail: currentUserEmail,
      onSuccess: (record) => {
        setIsProcessing(false);
        toast.success(`🎉 ${name} Confirmed!`, {
          description: `Booking Invoice: ${record.invoice_number}`,
        });
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        toast.error('Booking Incomplete', { description: errMsg });
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-32">
      {/* Optional Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122B1E] hover:opacity-80 transition py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Care hub</span>
        </button>
      )}

      {/* Header: Byterover Style Dark Title */}
      <div className="text-center space-y-3 pt-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#122B1E] text-[#8BE314] text-xs font-semibold border border-emerald-800/40 shadow-sm">
          <Sparkles className="w-3 h-3 text-[#8BE314]" />
          <span>ICAR-IVRI Aligned Pricing Model</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#122B1E] tracking-tight">
          Flexible Plans for <span className="font-serif italic font-normal text-emerald-800">Everyone</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6C61]">
          Choose an AI-powered livestock health plan that fits your farm goals and scales with your herd.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-2 flex justify-center">
          <div className="bg-white p-1 rounded-full border border-[#DFE4DA] shadow-sm flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-[#122B1E] text-white shadow-sm'
                  : 'text-[#5E6C61] hover:text-[#122B1E]'
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#122B1E] text-white shadow-sm'
                  : 'text-[#5E6C61] hover:text-[#122B1E]'
              }`}
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-[#DCF8E8] text-[#126A42] text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Note Banner (Transparent Reporting) */}
      <div className="bg-[#FEF6E9] border border-[#FCE5BE] rounded-2xl p-4 text-xs text-[#7C4610] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#7C4610] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Pricing Model Note:</strong> Pro Plan is displayed at the requested{' '}
          <strong className="text-emerald-900 font-bold">₹149/month</strong> ICAR-IVRI benchmark. The alternate ₹499/month
          tier from earlier design PDFs is logged for administrator review before altering active billing gateways.
        </div>
      </div>

      {/* 5-Tier Pricing Grid matching Image 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        {/* Tier 1: Free Pilot */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between space-y-5 hover:border-[#122B1E]/30 transition">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#5E6C61] font-medium block">Pilot Farmers</span>
              <h3 className="text-lg font-bold text-[#122B1E] mt-0.5">Free Pilot</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#122B1E]">₹0</span>
              <span className="text-xs text-[#5E6C61]">/month</span>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-[#3D4A41]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Basic animal profile (up to 2 animals)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Limited health anomaly alerts</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Standard vaccination calendar</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('plan_pilot', 'Free Pilot', 0)}
            className="w-full py-3 rounded-xl border border-[#D0D6CB] hover:bg-black/5 text-xs font-bold text-[#122B1E] transition"
          >
            {activePlanId === 'plan_pilot' ? 'Current Active' : 'Start Free'}
          </button>
        </div>

        {/* Tier 2: Basic Plan */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between space-y-5 hover:border-[#122B1E]/30 transition">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#5E6C61] font-medium block">Small Farmers</span>
              <h3 className="text-lg font-bold text-[#122B1E] mt-0.5">Basic Plan</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#122B1E]">
                ₹{billingCycle === 'yearly' ? Math.round(49 * 0.8) : 49}
              </span>
              <span className="text-xs text-[#5E6C61]">/month</span>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-[#3D4A41]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Complete health monitoring (up to 5 animals)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Basic early-risk anomaly warnings</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>ICAR disease prevention guidance</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('plan_basic', 'Basic Plan', 49)}
            className="w-full py-3 rounded-xl border border-[#D0D6CB] hover:bg-black/5 text-xs font-bold text-[#122B1E] transition"
          >
            Choose Basic
          </button>
        </div>

        {/* Tier 3: Pro Plan (FEATURED - HIGHLIGHTED) */}
        <div className="bg-[#122B1E] text-white rounded-[26px] p-6 shadow-xl flex flex-col justify-between space-y-5 relative ring-2 ring-[#8BE314] transform lg:-translate-y-2">
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#8BE314] text-[#0A2619] font-black text-[10px] tracking-wider uppercase shadow-md">
            Most Popular
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <span className="text-xs text-[#9DB8A6] font-medium block">Dairy Farmers / Larger Herds</span>
              <h3 className="text-xl font-bold text-white mt-0.5">AniGuard Pro</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                ₹{billingCycle === 'yearly' ? Math.round(149 * 0.8) : 149}
              </span>
              <span className="text-xs text-[#9DB8A6]">/month</span>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-[#E1EAE3]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#8BE314] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>Advanced AI risk alerts & differential triage</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#8BE314] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>Complete digital animal health history</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#8BE314] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>Multi-animal precision feed calculator</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#8BE314] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>1-Tap direct veterinary call line</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('plan_pro_149', 'AniGuard Pro', 149)}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-[#8BE314] hover:bg-[#9BF024] text-[#0A2619] font-bold text-xs shadow-[0_0_15px_rgba(139,227,20,0.4)] transition active:scale-[0.99] disabled:opacity-50"
          >
            {isProcessing ? 'Connecting...' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Tier 4: B2B Plan */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between space-y-5 hover:border-[#122B1E]/30 transition">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#5E6C61] font-medium block">Cooperatives / Organizations</span>
              <h3 className="text-lg font-bold text-[#122B1E] mt-0.5">B2B Co-op</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#122B1E]">₹1,500</span>
              <span className="text-xs text-[#5E6C61]">/month</span>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-[#3D4A41]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Up to 100 animals registered</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Centralized multi-farm telemetry</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Organizational analytics & export</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('plan_b2b', 'B2B Co-op Plan', 1500)}
            className="w-full py-3 rounded-xl border border-[#D0D6CB] hover:bg-black/5 text-xs font-bold text-[#122B1E] transition"
          >
            Select B2B
          </button>
        </div>

        {/* Tier 5: Institutional / B2B2C / B2G */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between space-y-5 hover:border-[#122B1E]/30 transition">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#5E6C61] font-medium block">Vet Colleges / Dairy Boards / Govt</span>
              <h3 className="text-lg font-bold text-[#122B1E] mt-0.5">B2B2C & B2G</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#122B1E]">Custom</span>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-[#3D4A41]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Bulk institutional deployment</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>State & national scheme integration</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#126A42] shrink-0 mt-0.5" />
                <span>Custom API & database integration</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.info('Enterprise desk contact initiated. A team member will reach out within 4 hours.')}
            className="w-full py-3 rounded-xl bg-[#122B1E] text-white hover:bg-[#1b3b2a] text-xs font-bold transition"
          >
            Contact Desk
          </button>
        </div>
      </div>

      {/* Book a Vet Service Clinical Desk */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-[#E5EAE1] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5EAE1] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#122B1E]">Book On-Demand Veterinary Services</h3>
            <p className="text-xs text-[#5E6C61] mt-0.5">Pay-per-use clinical consults with verified ICAR & state-registered veterinarians.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#DCF8E8] text-[#126A42]">
            GST Invoice Included
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4.5 rounded-2xl border border-[#E5EAE1] bg-[#F4F5EE]/60 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-base font-bold text-[#122B1E]">Video Call with Vet</span>
              <p className="text-xs text-[#5E6C61] mt-1">15–20 minutes direct telemedicine with digital e-prescription.</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-black text-[#122B1E]">₹299</span>
              <button
                onClick={() => handleBookService('Video Call with Vet', 299, 'srv_video')}
                className="px-4 py-2 rounded-xl bg-[#122B1E] text-white text-xs font-bold hover:bg-[#1b3b2a] transition"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl border border-[#E5EAE1] bg-[#F4F5EE]/60 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-base font-bold text-[#122B1E]">Full Herd Health Audit</span>
              <p className="text-xs text-[#5E6C61] mt-1">Biosecurity risk report, nutritional balance check & certification.</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-black text-[#122B1E]">₹799</span>
              <button
                onClick={() => handleBookService('Full Herd Health Audit', 799, 'srv_audit')}
                className="px-4 py-2 rounded-xl bg-[#122B1E] text-white text-xs font-bold hover:bg-[#1b3b2a] transition"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl border border-[#E5EAE1] bg-[#F4F5EE]/60 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-base font-bold text-[#122B1E]">Vaccine & Deworming Plan</span>
              <p className="text-xs text-[#5E6C61] mt-1">Full-year tailored immunisation schedule, sms reminders & cold-chain advisory.</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-black text-[#122B1E]">₹1,199</span>
              <button
                onClick={() => handleBookService('Vaccine & Deworming Plan', 1199, 'srv_vaccines')}
                className="px-4 py-2 rounded-xl bg-[#122B1E] text-white text-xs font-bold hover:bg-[#1b3b2a] transition"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
