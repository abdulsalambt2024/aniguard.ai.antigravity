export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  hindiName?: string;
  tier: 'free' | 'pro' | 'enterprise';
  priceMonthly: number;
  priceYearly: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export interface ClinicalServiceItem {
  id: string;
  name: string;
  hindiName?: string;
  price: number;
  category: 'vet_consult' | 'audit' | 'vaccine_pack' | 'nutrition';
  description: string;
  duration?: string;
  doctorName?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  amount: number;
  currency: string;
  base_amount: number;
  tax_amount: number;
  status: 'completed' | 'pending' | 'failed';
  payment_gateway: 'razorpay' | 'simulated';
  payment_method: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
  item_type: 'subscription' | 'clinical_service';
  item_id: string;
  item_name: string;
  billing_cycle?: BillingCycle;
  invoice_number: string;
  created_at: string;
  verified_at: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}
