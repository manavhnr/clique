// Payment Processing and Transaction Management Types

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  details: PaymentMethodDetails;
  isDefault: boolean;
  isActive: boolean;
  lastUsed?: string;
  expiryDate?: string;
  billingAddress: BillingAddress;
  securityFeatures: PaymentSecurityFeatures;
  verificationStatus: VerificationStatus;
  addedAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type PaymentMethodType = 
  | 'credit_card'
  | 'debit_card'
  | 'bank_account'
  | 'digital_wallet'
  | 'buy_now_pay_later'
  | 'cryptocurrency'
  | 'gift_card'
  | 'store_credit'
  | 'bank_transfer'
  | 'mobile_payment';

export type PaymentProvider = 
  | 'stripe'
  | 'paypal'
  | 'square'
  | 'adyen'
  | 'braintree'
  | 'apple_pay'
  | 'google_pay'
  | 'samsung_pay'
  | 'venmo'
  | 'zelle'
  | 'klarna'
  | 'afterpay'
  | 'affirm'
  | 'plaid'
  | 'wise'
  | 'cryptocurrency_wallet';

export interface PaymentMethodDetails {
  // Credit/Debit Card
  cardNumber?: string; // masked, e.g., "****-****-****-1234"
  cardholderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay';
  
  // Bank Account
  bankName?: string;
  accountType?: 'checking' | 'savings';
  routingNumber?: string; // masked
  accountNumber?: string; // masked
  
  // Digital Wallet
  walletEmail?: string;
  walletId?: string;
  
  // Cryptocurrency
  walletAddress?: string;
  cryptocurrency?: 'bitcoin' | 'ethereum' | 'litecoin' | 'other';
  
  // Provider-specific token for secure storage
  providerToken: string;
  providerCustomerId?: string;
  fingerprint?: string; // unique identifier for duplicate detection
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentSecurityFeatures {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  fraudDetectionEnabled: boolean;
  velocityChecks: boolean;
  geoLocationChecks: boolean;
  deviceFingerprinting: boolean;
  riskScore?: number; // 0-100, 100 being highest risk
  lastSecurityUpdate?: string;
}

export type VerificationStatus = 
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'expired';

export interface Transaction {
  id: string;
  eventId?: string;
  userId: string;
  hostId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: Money;
  fees: TransactionFees;
  netAmount: Money;
  paymentMethodId: string;
  paymentProvider: PaymentProvider;
  providerTransactionId?: string;
  refundTransactionId?: string;
  description: string;
  metadata: TransactionMetadata;
  timeline: TransactionTimeline;
  securityChecks: SecurityCheckResults;
  disputeInfo?: DisputeInfo;
  taxInfo?: TaxInfo;
  recurringInfo?: RecurringPaymentInfo;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
}

export type TransactionType = 
  | 'booking_payment'
  | 'booking_refund'
  | 'host_payout'
  | 'platform_fee'
  | 'cancellation_fee'
  | 'late_fee'
  | 'promotional_credit'
  | 'gift_card_purchase'
  | 'gift_card_redemption'
  | 'subscription_payment'
  | 'deposit'
  | 'withdrawal'
  | 'chargeback'
  | 'dispute_resolution'
  | 'tip'
  | 'promotional_bonus';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'disputed'
  | 'refunded'
  | 'partially_refunded'
  | 'on_hold'
  | 'requires_action'
  | 'under_review';

export interface Money {
  amount: number; // in smallest currency unit (e.g., cents)
  currency: string; // ISO 4217 currency code
  displayAmount: string; // formatted for display (e.g., "$12.99")
}

export interface TransactionFees {
  platformFee: Money;
  processingFee: Money;
  hostFee: Money;
  taxAmount: Money;
  discountAmount: Money;
  tipAmount?: Money;
  totalFees: Money;
}

export interface TransactionMetadata {
  eventTitle?: string;
  eventDate?: string;
  bookingId?: string;
  guestCount?: number;
  promoCode?: string;
  referralSource?: string;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  sessionId?: string;
  riskScore?: number;
  customerNotes?: string;
  internalNotes?: string;
}

export interface TransactionTimeline {
  initiated: string;
  authorized?: string;
  captured?: string;
  settled?: string;
  failed?: string;
  refunded?: string;
  disputed?: string;
  resolved?: string;
  processingTime?: number; // seconds
}

export interface SecurityCheckResults {
  avsCheck?: 'pass' | 'fail' | 'unavailable' | 'not_checked';
  cvvCheck?: 'pass' | 'fail' | 'unavailable' | 'not_checked';
  fraudCheck?: 'pass' | 'fail' | 'review' | 'not_checked';
  velocityCheck?: 'pass' | 'fail' | 'not_checked';
  geolocationCheck?: 'pass' | 'fail' | 'not_checked';
  deviceCheck?: 'pass' | 'fail' | 'not_checked';
  overallRiskScore: number; // 0-100
  riskFactors: string[];
  recommendedAction: 'approve' | 'decline' | 'review' | 'require_verification';
}

export interface DisputeInfo {
  disputeId: string;
  reason: DisputeReason;
  amount: Money;
  status: DisputeStatus;
  evidence: DisputeEvidence[];
  submittedAt: string;
  resolvedAt?: string;
  outcome?: DisputeOutcome;
  providerDisputeId?: string;
}

export type DisputeReason = 
  | 'unauthorized'
  | 'duplicate'
  | 'fraudulent'
  | 'subscription_cancelled'
  | 'product_unacceptable'
  | 'product_not_received'
  | 'unrecognized'
  | 'credit_not_processed'
  | 'general'
  | 'other';

export type DisputeStatus = 
  | 'warning_needs_response'
  | 'warning_under_review'
  | 'warning_closed'
  | 'needs_response'
  | 'under_review'
  | 'charge_refunded'
  | 'won'
  | 'lost';

export interface DisputeEvidence {
  type: string;
  description: string;
  documentUrl?: string;
  uploadedAt: string;
}

export type DisputeOutcome = 
  | 'won'
  | 'lost'
  | 'accepted'
  | 'warning_closed';

export interface TaxInfo {
  taxType: 'sales_tax' | 'vat' | 'gst' | 'other';
  taxRate: number;
  taxAmount: Money;
  taxJurisdiction: string;
  exemptionReason?: string;
  taxId?: string;
}

export interface RecurringPaymentInfo {
  subscriptionId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextPaymentDate?: string;
  endDate?: string;
  totalPayments?: number;
  paymentsCompleted: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
}

export interface Payout {
  id: string;
  hostId: string;
  status: PayoutStatus;
  amount: Money;
  fees: PayoutFees;
  netAmount: Money;
  payoutMethodId: string;
  transactions: string[]; // Transaction IDs included in this payout
  period: PayoutPeriod;
  taxDocuments: TaxDocument[];
  bankInfo?: PayoutBankInfo;
  timeline: PayoutTimeline;
  failureReason?: string;
  retryCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export type PayoutStatus = 
  | 'pending'
  | 'processing'
  | 'in_transit'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'on_hold'
  | 'requires_action';

export interface PayoutFees {
  transferFee: Money;
  processingFee: Money;
  holdbackAmount: Money;
  adjustments: PayoutAdjustment[];
  totalFees: Money;
}

export interface PayoutAdjustment {
  type: 'chargeback' | 'refund' | 'fee' | 'bonus' | 'penalty' | 'correction';
  description: string;
  amount: Money;
  transactionId?: string;
  reason: string;
}

export interface PayoutPeriod {
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'on-demand';
  eventCount: number;
  totalRevenue: Money;
}

export interface TaxDocument {
  id: string;
  type: '1099-K' | '1099-NEC' | 'invoice' | 'receipt' | 'other';
  year: number;
  amount: Money;
  documentUrl: string;
  generatedAt: string;
  sentAt?: string;
}

export interface PayoutBankInfo {
  bankName: string;
  accountHolderName: string;
  accountNumber: string; // masked
  routingNumber: string; // masked
  accountType: 'checking' | 'savings';
  currency: string;
}

export interface PayoutTimeline {
  initiated: string;
  processing?: string;
  in_transit?: string;
  completed?: string;
  failed?: string;
  estimatedArrival?: string;
  actualArrival?: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  eventId?: string;
  amount: Money;
  fees: TransactionFees;
  paymentMethodId?: string;
  status: PaymentIntentStatus;
  currency: string;
  description: string;
  automaticPaymentMethods: boolean;
  captureMethod: 'automatic' | 'manual';
  confirmationMethod: 'automatic' | 'manual';
  clientSecret: string;
  metadata: Record<string, any>;
  nextAction?: PaymentIntentNextAction;
  lastPaymentError?: PaymentError;
  timeline: PaymentIntentTimeline;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'cancelled'
  | 'succeeded';

export interface PaymentIntentNextAction {
  type: 'redirect_to_url' | 'use_stripe_sdk' | 'verify_with_microdeposits';
  redirectToUrl?: {
    url: string;
    returnUrl: string;
  };
  useStripeSdk?: Record<string, any>;
  verifyWithMicrodeposits?: {
    arrivalDate: string;
    hostedVerificationUrl: string;
  };
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  param?: string;
  declineCode?: string;
  charge?: string;
}

export interface PaymentIntentTimeline {
  created: string;
  confirmed?: string;
  succeeded?: string;
  cancelled?: string;
  processing_started?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  defaultPaymentMethodId?: string;
  paymentSettings: SubscriptionPaymentSettings;
  pricing: SubscriptionPricing;
  usage?: SubscriptionUsage;
  discounts: SubscriptionDiscount[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'unpaid';

export interface SubscriptionPaymentSettings {
  collectionMethod: 'charge_automatically' | 'send_invoice';
  paymentBehavior: 'default_incomplete' | 'error_if_incomplete' | 'pending_if_incomplete';
  saveDefaultPaymentMethod: 'off' | 'on_subscription';
}

export interface SubscriptionPricing {
  amount: Money;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  setupFee?: Money;
  trialPeriodDays?: number;
  usageType: 'licensed' | 'metered';
}

export interface SubscriptionUsage {
  currentUsage: number;
  usageLimit?: number;
  overage: boolean;
  overageAmount?: Money;
  meteringMethod: 'sum' | 'max' | 'unique_count';
  reportingInterval: 'daily' | 'weekly' | 'monthly';
}

export interface SubscriptionDiscount {
  id: string;
  couponId?: string;
  promotionCodeId?: string;
  amount: Money;
  percentage?: number;
  duration: 'forever' | 'once' | 'repeating';
  durationInMonths?: number;
  start: string;
  end?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  amount: Money;
  amountPaid: Money;
  amountRemaining: Money;
  tax: Money;
  total: Money;
  subtotal: Money;
  lineItems: InvoiceLineItem[];
  paymentIntent?: string;
  dueDate?: string;
  paidAt?: string;
  paymentAttempts: PaymentAttempt[];
  discounts: InvoiceDiscount[];
  customerInfo: CustomerInfo;
  billingAddress: BillingAddress;
  notes?: string;
  footer?: string;
  currency: string;
  invoiceNumber: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: Money;
  quantity: number;
  unitAmount: Money;
  taxRates: TaxRate[];
  period?: {
    start: string;
    end: string;
  };
  metadata: Record<string, any>;
}

export interface TaxRate {
  id: string;
  displayName: string;
  percentage: number;
  inclusive: boolean;
  jurisdiction: string;
}

export interface PaymentAttempt {
  id: string;
  paymentMethodId?: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'failed';
  paymentError?: PaymentError;
  attemptedAt: string;
}

export interface InvoiceDiscount {
  amount: Money;
  discount: SubscriptionDiscount;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  address?: BillingAddress;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  requestedBy: string;
  type: RefundType;
  reason: RefundReason;
  amount: Money;
  status: RefundStatus;
  providerRefundId?: string;
  timeline: RefundTimeline;
  supportingDocuments: RefundDocument[];
  approvalInfo?: RefundApproval;
  processingInfo?: RefundProcessingInfo;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export type RefundType = 
  | 'full'
  | 'partial'
  | 'cancellation'
  | 'service_issue'
  | 'duplicate_charge'
  | 'fraud'
  | 'chargeback'
  | 'goodwill';

export type RefundReason = 
  | 'event_cancelled'
  | 'duplicate_payment'
  | 'fraudulent_transaction'
  | 'customer_request'
  | 'service_issue'
  | 'technical_error'
  | 'policy_violation'
  | 'chargeback'
  | 'other';

export type RefundStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface RefundTimeline {
  requested: string;
  under_review?: string;
  approved?: string;
  rejected?: string;
  processing?: string;
  completed?: string;
  failed?: string;
  estimated_completion?: string;
}

export interface RefundDocument {
  id: string;
  type: 'receipt' | 'cancellation_proof' | 'communication' | 'other';
  description: string;
  url: string;
  uploadedAt: string;
}

export interface RefundApproval {
  approvedBy: string;
  approvalReason: string;
  approvedAt: string;
  conditions?: string[];
}

export interface RefundProcessingInfo {
  processingMethod: 'original_payment_method' | 'bank_transfer' | 'store_credit' | 'check';
  estimatedArrival: string;
  actualArrival?: string;
  processingFee?: Money;
  exchangeRate?: number;
}

export interface PaymentSettings {
  id: string;
  userId?: string; // null for platform-wide settings
  currencies: string[];
  defaultCurrency: string;
  paymentMethods: PaymentMethodConfig[];
  fees: FeeStructure;
  limits: PaymentLimits;
  security: PaymentSecuritySettings;
  compliance: ComplianceSettings;
  notifications: PaymentNotificationSettings;
  integrations: PaymentIntegrationSettings;
  updatedAt: string;
  updatedBy: string;
}

export interface PaymentMethodConfig {
  type: PaymentMethodType;
  enabled: boolean;
  provider: PaymentProvider;
  processingFee: number;
  minimumAmount?: Money;
  maximumAmount?: Money;
  supportedCurrencies: string[];
  countries: string[];
  configuration: Record<string, any>;
}

export interface FeeStructure {
  platformFeePercent: number;
  hostFeePercent: number;
  processingFeePercent: number;
  minimumFee?: Money;
  maximumFee?: Money;
  feeSchedule: FeeScheduleRule[];
}

export interface FeeScheduleRule {
  condition: string;
  feePercent: number;
  fixedFee?: Money;
  description: string;
}

export interface PaymentLimits {
  singleTransaction: {
    minimum: Money;
    maximum: Money;
  };
  daily: {
    maximum: Money;
    transactionCount: number;
  };
  monthly: {
    maximum: Money;
    transactionCount: number;
  };
  velocity: {
    maxTransactionsPerMinute: number;
    maxAmountPerMinute: Money;
  };
  riskBased: {
    newUserLimit: Money;
    unverifiedUserLimit: Money;
    highRiskUserLimit: Money;
  };
}

export interface PaymentSecuritySettings {
  fraudDetection: {
    enabled: boolean;
    riskThreshold: number;
    machineLearningSecurity: boolean;
    velocityChecking: boolean;
    geolocationVerification: boolean;
    deviceFingerprinting: boolean;
  };
  authentication: {
    twoFactorRequired: boolean;
    strongCustomerAuthentication: boolean;
    biometricAuth: boolean;
    riskBasedAuth: boolean;
  };
  encryption: {
    tlsVersion: string;
    dataEncryptionStandard: string;
    keyRotationPeriod: number;
  };
}

export interface ComplianceSettings {
  pciCompliance: boolean;
  amlCompliance: boolean;
  kycRequirements: boolean;
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  taxCompliance: {
    enabled: boolean;
    jurisdictions: string[];
    reportingThreshold: Money;
  };
  recordRetention: {
    transactionDataDays: number;
    personalDataDays: number;
    complianceDataDays: number;
  };
}

export interface PaymentNotificationSettings {
  transactionEmails: boolean;
  payoutEmails: boolean;
  failureAlerts: boolean;
  fraudAlerts: boolean;
  disputeNotifications: boolean;
  webhook: {
    enabled: boolean;
    url?: string;
    events: string[];
    secret?: string;
  };
}

export interface PaymentIntegrationSettings {
  providers: Record<PaymentProvider, {
    enabled: boolean;
    credentials: Record<string, string>;
    configuration: Record<string, any>;
    testMode: boolean;
  }>;
  accounting: {
    enabled: boolean;
    provider?: 'quickbooks' | 'xero' | 'sage' | 'custom';
    configuration: Record<string, any>;
  };
  reporting: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    format: 'csv' | 'json' | 'pdf';
    recipients: string[];
  };
}

// Database Collections
export const PAYMENT_COLLECTIONS = {
  PAYMENT_METHODS: 'paymentMethods',
  TRANSACTIONS: 'transactions',
  PAYOUTS: 'payouts',
  PAYMENT_INTENTS: 'paymentIntents',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices',
  REFUND_REQUESTS: 'refundRequests',
  PAYMENT_SETTINGS: 'paymentSettings',
} as const;

// API Response Types
export interface PaymentMethodResponse {
  paymentMethod: PaymentMethod;
  setupIntent?: {
    clientSecret: string;
    status: string;
  };
}

export interface TransactionResponse {
  transaction: Transaction;
  paymentIntent?: PaymentIntent;
  receipt?: {
    url: string;
    number: string;
  };
}

export interface PaymentDashboard {
  transactions: Transaction[];
  payouts: Payout[];
  analytics: {
    totalRevenue: Money;
    totalFees: Money;
    transactionCount: number;
    averageTransactionValue: Money;
    topPaymentMethods: Record<PaymentMethodType, number>;
  };
  pendingActions: {
    failedTransactions: number;
    pendingRefunds: number;
    disputesToResolve: number;
    payoutsOnHold: number;
  };
}

// Utility Types
export interface PaymentValidation {
  isValid: boolean;
  errors: PaymentValidationError[];
  warnings: string[];
  riskAssessment: {
    score: number;
    factors: string[];
    recommendation: 'approve' | 'decline' | 'review' | 'require_verification';
  };
}

export interface PaymentValidationError {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}