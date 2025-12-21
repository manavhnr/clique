// Featured Events and Promotion System Types

export interface FeaturedEvent {
  id: string;
  eventId: string;
  eventInfo: {
    title: string;
    hostName: string;
    category: string;
    date: string;
    location: string;
    price: number;
    image: string;
  };
  featuredType: FeaturedType;
  promotionLevel: PromotionLevel;
  placement: FeaturePlacement[];
  priority: number; // 1-10, 10 being highest
  status: FeatureStatus;
  startDate: string;
  endDate: string;
  budget?: number;
  spent?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number; // Click-through rate
  conversionRate?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  autoRenew?: boolean;
  targetAudience?: TargetAudience;
  customStyling?: FeatureCustomStyling;
}

export type FeaturedType = 
  | 'hero_banner'        // Main homepage banner
  | 'trending_spotlight' // Trending section highlight
  | 'category_featured'  // Featured in specific category
  | 'sponsored'          // Paid promotion
  | 'editor_pick'        // Curated by editorial team
  | 'local_highlight'    // Local area promotion
  | 'new_host'          // New host promotion
  | 'premium_listing'    // Premium search placement
  | 'flash_deal'        // Limited time promotion
  | 'seasonal';         // Seasonal/holiday promotion

export type PromotionLevel = 
  | 'basic'    // Standard featuring
  | 'premium'  // Enhanced featuring
  | 'platinum' // Maximum featuring
  | 'custom';  // Custom package

export type FeaturePlacement = 
  | 'homepage_hero'
  | 'homepage_trending'
  | 'category_top'
  | 'search_results'
  | 'discovery_feed'
  | 'user_dashboard'
  | 'mobile_banner'
  | 'email_newsletter'
  | 'push_notification'
  | 'social_media';

export type FeatureStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export interface TargetAudience {
  demographics: {
    ageRange?: [number, number];
    gender?: 'all' | 'male' | 'female' | 'other';
    location?: {
      cities?: string[];
      radius?: number; // km from event location
      countries?: string[];
    };
  };
  interests: string[];
  behaviors: {
    eventFrequency?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
    spendingRange?: [number, number];
    preferredCategories?: string[];
  };
  excludeAudience?: {
    userIds?: string[];
    previousAttendees?: boolean;
    competitors?: boolean;
  };
}

export interface FeatureCustomStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  gradient?: {
    colors: string[];
    direction: string;
  };
  animation?: {
    type: 'pulse' | 'glow' | 'slide' | 'fade';
    duration: number;
  };
  badge?: {
    text: string;
    color: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

export interface PromotionPackage {
  id: string;
  name: string;
  description: string;
  level: PromotionLevel;
  price: number;
  duration: number; // days
  features: PromotionFeature[];
  placements: FeaturePlacement[];
  maxImpressions?: number;
  targetingOptions: boolean;
  customStyling: boolean;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  autoRenew: boolean;
  discounts?: PromotionDiscount[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PromotionDiscount {
  type: 'early_bird' | 'bulk' | 'loyalty' | 'seasonal';
  condition: string;
  discountPercent: number;
  validUntil?: string;
}

export interface FeaturedEventAnalytics {
  id: string;
  featuredEventId: string;
  date: string;
  impressions: number;
  clicks: number;
  views: number;
  bookings: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  engagementRate: number;
  bounceRate: number;
  averageTimeSpent: number;
  audienceBreakdown: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
    device: Record<string, number>;
  };
  placementPerformance: Record<FeaturePlacement, {
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    impressions: number;
    clicks: number;
  }>;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  targetAudience: TargetAudience;
  featuredEvents: string[]; // FeaturedEvent IDs
  rules: CampaignRule[];
  autoOptimization: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignType = 
  | 'seasonal'
  | 'category_boost'
  | 'new_host_promotion'
  | 'geographic'
  | 'retention'
  | 'acquisition'
  | 'upsell';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface CampaignRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface TrendingAlgorithm {
  id: string;
  name: string;
  description: string;
  factors: TrendingFactor[];
  weights: Record<string, number>;
  timeWindow: number; // hours
  updateFrequency: number; // minutes
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrendingFactor {
  name: string;
  type: 'engagement' | 'velocity' | 'quality' | 'diversity';
  weight: number;
  calculation: string;
}

export interface EditorialPick {
  id: string;
  eventId: string;
  curatedBy: string;
  curatorInfo: {
    name: string;
    role: string;
    bio?: string;
  };
  headline: string;
  description: string;
  reason: string;
  tags: string[];
  featuredAt: string;
  validUntil?: string;
  socialProof?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface LocalPromotion {
  id: string;
  eventId: string;
  targetCities: string[];
  radius: number; // km
  localizedContent?: {
    [city: string]: {
      headline?: string;
      description?: string;
      culturalReferences?: string[];
    };
  };
  weatherConditional?: boolean;
  localInfluencers?: string[];
  communityPartners?: string[];
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface PromotionBid {
  id: string;
  eventId: string;
  hostId: string;
  placement: FeaturePlacement;
  bidAmount: number;
  maxBudget: number;
  startDate: string;
  endDate: string;
  status: BidStatus;
  priority: number;
  estimatedImpressions: number;
  estimatedClicks: number;
  submittedAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export type BidStatus = 
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'winning'
  | 'outbid'
  | 'rejected'
  | 'expired';

export interface PromotionMetrics {
  totalFeaturedEvents: number;
  activeCampaigns: number;
  totalRevenue: number;
  averageCTR: number;
  averageConversionRate: number;
  topPerformingPlacements: Array<{
    placement: FeaturePlacement;
    impressions: number;
    clicks: number;
    revenue: number;
  }>;
  topPerformingCategories: Array<{
    category: string;
    featuredCount: number;
    totalRevenue: number;
    avgPerformance: number;
  }>;
}

// Database Collections
export const FEATURED_COLLECTIONS = {
  FEATURED_EVENTS: 'featuredEvents',
  PROMOTION_PACKAGES: 'promotionPackages',
  FEATURED_ANALYTICS: 'featuredEventAnalytics',
  PROMOTION_CAMPAIGNS: 'promotionCampaigns',
  TRENDING_ALGORITHMS: 'trendingAlgorithms',
  EDITORIAL_PICKS: 'editorialPicks',
  LOCAL_PROMOTIONS: 'localPromotions',
  PROMOTION_BIDS: 'promotionBids',
} as const;

// API Response Types
export interface FeaturedEventResponse {
  featured: FeaturedEvent;
  analytics?: FeaturedEventAnalytics;
  recommendations?: FeaturedEvent[];
}

export interface PromotionDashboard {
  activeFeatures: FeaturedEvent[];
  campaigns: PromotionCampaign[];
  metrics: PromotionMetrics;
  recommendations: {
    suggestedEvents: string[];
    optimalPlacements: FeaturePlacement[];
    budgetRecommendations: Record<string, number>;
  };
}

export interface TrendingEventsResponse {
  trending: FeaturedEvent[];
  algorithm: TrendingAlgorithm;
  lastUpdated: string;
  nextUpdate: string;
}