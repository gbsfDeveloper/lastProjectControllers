export declare type StripeResponse = {
  status: number;
  data: {
    code: 'SUCCESS' | 'FAILED' | 'ERROR' | '200';
    data: string;
    message: string;
  };
};

export declare interface StripeIntent {
  id?: string;
  object?: string;
  billing_details?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  card?: {
    brand?: string;
    checks?: {
      address_line1_check?: string;
      address_postal_code_check?: string;
      cvc_check?: string;
    };
    country?: string;
    exp_month?: number;
    exp_year?: number;
    fingerprint?: string;
    funding?: string;
    generated_from?: string;
    last4?: string;
    networks?: {
      available?: [string];
      preferred?: null;
    };
    three_d_secure_usage?: {
      supported?: boolean;
    };
    wallet?: string;
  };
  created?: number;
  customer?: string;
  livemode?: boolean;
  type?: string;
}

export declare interface StripeInvoice {
  id?: string;
  object?: string;
  account_country?: string;
  account_name?: string;
  amount_due?: number;
  amount_paid?: number;
  amount_remaining?: number;
  attempt_count?: number;
  attempted?: boolean;
  auto_advance?: boolean;
  billing_reason?: string;
  charge?: string;
  collection_method?: string;
  created?: number;
  currency?: string;
  customer?: string;
  customer_address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_shipping?: string;
  customer_tax_exempt?: string;
  customer_tax_ids?: [];
  default_payment_method?: string;
  default_tax_rates?: [];
  description?: string;
  discounts?: [];
  due_date?: number;
  ending_balance?: number;
  footer?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  last_finalization_error?: null;
  lines?: {
    data: [
      {
        id: string;
        amount: number;
        description: string;
        discountable: boolean;
        metadata: {
          email: string;
          userId: string;
        };
        plan: {
          id: string;
          object: string;
          active: boolean;
          amount: number;
          amount_decimal: string;
          billing_scheme: string;
          created: number;
          currency: string;
          interval: string;
          interval_count: number;
          product: string;
          trial_period_days: number;
          usage_type: string;
        };
        proration: boolean;
        quantity: number;
        subscription: string;
        subscription_item: string;
        type: string;
        unit_amount_excluding_tax: string;
      }
    ];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  next_payment_attempt?: number;
  number?: string;
  paid?: boolean;
  paid_out_of_band?: boolean;
  payment_intent?: string;
  period_end?: number;
  period_start?: number;
  post_payment_credit_notes_amount?: number;
  pre_payment_credit_notes_amount?: number;
  quote?: string;
  receipt_number?: string;
  starting_balance?: number;
  status?: string;
  subscription?: string;
  subtotal?: number;
  subtotal_excluding_tax?: number;
  tax?: number;
  test_clock?: string;
  total?: number;
  total_discount_amounts?: [];
  total_excluding_tax?: number;
  total_tax_amounts?: [];
}

export declare interface StripeSuscription {
  id?: string;
  object?: string;
  automatic_tax?: {
    enabled?: boolean;
  };
  billing_cycle_anchor?: number;
  billing_thresholds?: null;
  cancel_at?: null;
  cancel_at_period_end?: boolean;
  canceled_at?: null;
  collection_method?: string;
  created?: number;
  current_period_end?: number;
  current_period_start?: number;
  customer?: string;
  days_until_due?: string;
  default_payment_method?: string;
  default_tax_rates?: [];
  description?: string;
  discount?: string;
  ended_at?: number;
  latest_invoice?: string;
  livemode?: boolean;
  metadata?: {
    userId?: string;
    email?: string;
  };
  plan?: {
    id?: string;
    object?: string;
    active?: boolean;
    amount?: number;
    amount_decimal?: string;
    billing_scheme?: string;
    created?: number;
    currency?: string;
    interval?: string;
    interval_count?: number;
    livemode?: boolean;
    nickname?: string;
    product?: string;
    trial_period_days?: number;
    usage_type?: string;
  };
  quantity?: number;
  start_date?: number;
  status?: string;
  test_clock?: string;
  trial_end?: number;
  trial_start?: number;
}

export declare interface StripeOxxoCheckOut {
  id?: string;
  object?: string;
  amount_subtotal?: number;
  amount_total?: number;
  cancel_url?: string;
  currency?: string;
  customer?: string;
  customer_email?: string;
  metadata?: {
    email?: string;
    userId?: string;
    suscriptionInterval?: string;
  };
  mode?: string;
  payment_intent?: string;
  payment_method_options?: {
    oxxo: {
      expires_after_days: number;
    };
  };
  payment_method_types?: [string];
  payment_status?: string;
  status?: string;
  success_url?: string;
}
