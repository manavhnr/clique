// Analytics and Business Intelligence Types

export interface UserAnalytics {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  sessionData: SessionAnalytics;
  engagementMetrics: EngagementMetrics;
  eventInteractions: EventInteractionMetrics;
  bookingBehavior: BookingBehaviorMetrics;
  socialMetrics: SocialMetrics;
  deviceInfo: DeviceAnalytics;
  locationData?: LocationAnalytics;
  conversionFunnel: ConversionFunnelData;
  retentionData: RetentionMetrics;
  lifetimeValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  pageViews: number;
  screenViews: number;
  bounceRate: number;
  exitPage: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  isFirstSession: boolean;
  sessionValue: number; // monetary value generated in session
}

export interface EngagementMetrics {
  timeSpent: number; // total seconds
  scrollDepth: number; // percentage
  clickEvents: number;
  tapEvents: number;
  swipeEvents: number;
  searchQueries: number;
  filtersUsed: number;
  sharesCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  profileViews: number;
  connectionRequests: number;
  messagesCount: number;
  engagementScore: number; // 0-100
}

export interface EventInteractionMetrics {
  eventsViewed: number;
  eventsShared: number;
  eventsBookmarked: number;
  eventsBooked: number;
  eventsHosted: number;
  eventsCancelled: number;
  categoryPreferences: Record<string, number>;
  averageEventPrice: number;
  totalEventSpending: number;
  searchesToBookingRatio: number;
  favoriteTimeSlots: string[];
  preferredLocations: string[];
  attendanceRate: number; // percentage of booked events actually attended
}

export interface BookingBehaviorMetrics {
  bookingFrequency: 'low' | 'medium' | 'high' | 'very_high';
  averageDaysInAdvance: number;
  cancellationRate: number;
  noShowRate: number;
  rebookingRate: number;
  groupSizePreference: number;
  paymentMethodPreferences: Record<string, number>;
  discountUsage: number;
  premiumUpgrades: number;
  refundRequests: number;
  averageBookingValue: number;
  seasonalBookingPattern: Record<string, number>;
}

export interface SocialMetrics {
  connectionsCount: number;
  followerCount: number;
  followingCount: number;
  mutualConnections: number;
  networkReach: number;
  influenceScore: number;
  contentShared: number;
  contentCreated: number;
  communitiesJoined: number;
  eventsRecommended: number;
  referralsSent: number;
  referralsConverted: number;
  socialEngagementRate: number;
}

export interface DeviceAnalytics {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  operatingSystem: string;
  browserName?: string;
  appVersion: string;
  screenResolution: string;
  connectionType: 'wifi' | '5g' | '4g' | '3g' | 'other';
  isFirstTimeDevice: boolean;
  pushNotificationsEnabled: boolean;
  locationPermissionGranted: boolean;
  performanceMetrics: {
    loadTime: number;
    crashCount: number;
    errorCount: number;
    batteryUsage?: number;
  };
}

export interface LocationAnalytics {
  country: string;
  region: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  language: string;
  proximityToEvents: number; // average km to events
  travelRadius: number; // km willing to travel
  locationAccuracy: 'precise' | 'approximate' | 'city' | 'region';
}

export interface ConversionFunnelData {
  stageMetrics: Record<ConversionStage, {
    entered: number;
    completed: number;
    abandonedAt: number;
    conversionRate: number;
    averageTime: number;
  }>;
  dropoffPoints: string[];
  conversionPath: ConversionStage[];
  totalConversionRate: number;
  revenuePerConversion: number;
}

export type ConversionStage = 
  | 'discovery'
  | 'event_view'
  | 'interest'
  | 'booking_intent'
  | 'checkout'
  | 'payment'
  | 'confirmation'
  | 'attendance'
  | 'repeat_booking';

export interface RetentionMetrics {
  firstSessionDate: string;
  lastSessionDate: string;
  totalSessions: number;
  daysSinceFirstSession: number;
  daysSinceLastSession: number;
  sessionFrequency: number; // sessions per week
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  reactivationAttempts: number;
  loyaltyScore: number; // 0-100
  cohortGroup: string;
}

export interface EventAnalytics {
  id: string;
  eventId: string;
  date: string;
  impressions: number;
  views: number;
  uniqueViews: number;
  clicks: number;
  bookings: number;
  cancellations: number;
  revenue: number;
  attendees: number;
  noShows: number;
  waitlistCount: number;
  shareCount: number;
  saveCount: number;
  conversionRate: number;
  attendanceRate: number;
  revenuePerAttendee: number;
  customerSatisfactionScore: number;
  reviewsCount: number;
  averageRating: number;
  photoUploads: number;
  engagementScore: number;
  viralityScore: number;
  demographicBreakdown: DemographicBreakdown;
  geographicData: GeographicEventData;
  timeSlotPerformance: TimeSlotPerformance;
  competitorComparison?: CompetitorComparison;
}

export interface DemographicBreakdown {
  ageGroups: Record<string, number>;
  genderDistribution: Record<string, number>;
  incomeRanges: Record<string, number>;
  interests: Record<string, number>;
  occupations: Record<string, number>;
  educationLevels: Record<string, number>;
}

export interface GeographicEventData {
  attendeeLocations: Record<string, number>;
  averageDistanceTraveled: number;
  localVsVisitor: {
    local: number;
    visitor: number;
  };
  transportationMethods: Record<string, number>;
}

export interface TimeSlotPerformance {
  hourlyBookings: Record<number, number>;
  dayOfWeekPerformance: Record<string, number>;
  seasonalTrends: Record<string, number>;
  optimalTimeSlots: string[];
  peakBookingTimes: string[];
}

export interface CompetitorComparison {
  similarEvents: number;
  marketShare: number;
  priceComparison: 'below_average' | 'average' | 'above_average' | 'premium';
  uniqueSellingPoints: string[];
  competitiveAdvantage: number; // -100 to 100
}

export interface PlatformAnalytics {
  id: string;
  date: string;
  overallMetrics: OverallPlatformMetrics;
  userMetrics: UserPlatformMetrics;
  eventMetrics: EventPlatformMetrics;
  financialMetrics: FinancialMetrics;
  performanceMetrics: PlatformPerformanceMetrics;
  growthMetrics: GrowthMetrics;
  engagementMetrics: PlatformEngagementMetrics;
  qualityMetrics: QualityMetrics;
}

export interface OverallPlatformMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  userRetentionRate: number;
  churnRate: number;
  averageSessionDuration: number;
  totalSessions: number;
  bounceRate: number;
  pageViewsPerSession: number;
}

export interface UserPlatformMetrics {
  newRegistrations: number;
  accountVerifications: number;
  profileCompletions: number;
  hostApplications: number;
  hostApprovals: number;
  activeHosts: number;
  suspendedAccounts: number;
  deletedAccounts: number;
  averageUserLifetime: number;
  customerLifetimeValue: number;
}

export interface EventPlatformMetrics {
  totalEvents: number;
  newEventsCreated: number;
  publishedEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalBookings: number;
  successfulBookings: number;
  totalRevenue: number;
  averageEventPrice: number;
  fillRate: number; // average capacity utilization
  popularCategories: Record<string, number>;
}

export interface FinancialMetrics {
  totalRevenue: number;
  platformFees: number;
  hostPayouts: number;
  processingFees: number;
  refundsIssued: number;
  disputes: number;
  averageTransactionValue: number;
  revenueGrowthRate: number;
  profit: number;
  profitMargin: number;
  paymentMethodDistribution: Record<string, number>;
  currencyDistribution: Record<string, number>;
}

export interface PlatformPerformanceMetrics {
  apiResponseTime: number;
  systemUptime: number;
  errorRate: number;
  crashRate: number;
  searchResultRelevance: number;
  recommendationAccuracy: number;
  notificationDeliveryRate: number;
  imageLoadTime: number;
  databaseQueryTime: number;
  serverLoad: number;
}

export interface GrowthMetrics {
  userAcquisitionRate: number;
  organicGrowthRate: number;
  paidAcquisitionCost: number;
  viralCoefficient: number;
  referralRate: number;
  marketPenetration: number;
  brandAwareness: number;
  competitorAnalysis: Record<string, number>;
  marketingEfficiency: Record<string, number>;
}

export interface PlatformEngagementMetrics {
  averageEventsPerUser: number;
  averageBookingsPerUser: number;
  socialInteractionRate: number;
  contentCreationRate: number;
  communityParticipation: number;
  featureAdoptionRates: Record<string, number>;
  userFeedbackScore: number;
  supportTicketVolume: number;
  selfServiceUsage: number;
}

export interface QualityMetrics {
  eventQualityScore: number;
  hostQualityScore: number;
  userSatisfactionScore: number;
  contentModerationAccuracy: number;
  fraudDetectionRate: number;
  spamDetectionRate: number;
  trustScore: number;
  safetyIncidents: number;
  reportedIssues: number;
  resolutionTime: number;
}

export interface CohortAnalysis {
  id: string;
  cohortDate: string; // YYYY-MM
  cohortSize: number;
  retentionRates: Record<number, number>; // week/month -> retention rate
  lifetimeValue: Record<number, number>; // week/month -> average LTV
  churnAnalysis: ChurnAnalysis;
  behaviorPatterns: CohortBehaviorPattern[];
  segments: CohortSegment[];
}

export interface ChurnAnalysis {
  churnReasons: Record<string, number>;
  churnPredictors: string[];
  averageChurnTime: number;
  churnRecoveryRate: number;
  winbackCampaignSuccess: number;
}

export interface CohortBehaviorPattern {
  pattern: string;
  description: string;
  percentage: number;
  significance: number;
}

export interface CohortSegment {
  name: string;
  criteria: string;
  size: number;
  performance: Record<string, number>;
}

export interface BusinessIntelligence {
  id: string;
  reportType: BIReportType;
  generatedAt: string;
  timeFrame: {
    start: string;
    end: string;
  };
  insights: Insight[];
  recommendations: Recommendation[];
  predictions: Prediction[];
  alerts: Alert[];
  kpis: Record<string, number>;
  trends: Trend[];
  anomalies: Anomaly[];
}

export type BIReportType = 
  | 'daily_summary'
  | 'weekly_report'
  | 'monthly_analysis'
  | 'quarterly_review'
  | 'annual_report'
  | 'custom_analysis'
  | 'real_time_dashboard'
  | 'executive_summary';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  category: string;
  data: Record<string, any>;
  actionable: boolean;
}

export type InsightType = 
  | 'trend_detection'
  | 'anomaly_detection'
  | 'pattern_recognition'
  | 'correlation_analysis'
  | 'performance_gap'
  | 'opportunity_identification'
  | 'risk_assessment';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: RecommendationCategory;
  estimatedImpact: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard' | 'complex';
  timeToImplement: string;
  expectedOutcome: string;
  relatedInsights: string[];
  actionSteps: string[];
}

export type RecommendationCategory = 
  | 'user_experience'
  | 'business_growth'
  | 'cost_optimization'
  | 'feature_development'
  | 'marketing_strategy'
  | 'operational_efficiency'
  | 'risk_mitigation'
  | 'quality_improvement';

export interface Prediction {
  id: string;
  metric: string;
  predictedValue: number;
  confidence: number;
  timeFrame: string;
  methodology: string;
  factors: string[];
  scenarios: PredictionScenario[];
}

export interface PredictionScenario {
  name: string;
  probability: number;
  outcome: number;
  description: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  acknowledged: boolean;
  resolvedAt?: string;
  actionRequired: boolean;
}

export type AlertType = 
  | 'performance_degradation'
  | 'anomaly_detected'
  | 'threshold_breach'
  | 'business_metric_drop'
  | 'security_concern'
  | 'operational_issue'
  | 'quality_decline';

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable' | 'volatile';
  magnitude: number;
  significance: number;
  timeframe: string;
  description: string;
}

export interface Anomaly {
  metric: string;
  expectedValue: number;
  actualValue: number;
  severity: number;
  detectedAt: string;
  possibleCauses: string[];
  impact: string;
}

export interface AnalyticsConfiguration {
  id: string;
  dataRetentionDays: number;
  samplingRate: number;
  realTimeEnabled: boolean;
  privacySettings: PrivacySettings;
  trackingSettings: TrackingSettings;
  reportingSettings: ReportingSettings;
  alertSettings: AlertSettings;
  updatedAt: string;
  updatedBy: string;
}

export interface PrivacySettings {
  anonymizeUserData: boolean;
  dataMinimization: boolean;
  consentRequired: boolean;
  rightToBeDeleted: boolean;
  dataExportEnabled: boolean;
  thirdPartySharing: boolean;
  locationTracking: boolean;
}

export interface TrackingSettings {
  enabledEvents: string[];
  customEvents: CustomEventTracking[];
  sessionRecording: boolean;
  heatmapTracking: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  userJourneyTracking: boolean;
}

export interface CustomEventTracking {
  name: string;
  description: string;
  parameters: Record<string, string>;
  enabled: boolean;
}

export interface ReportingSettings {
  automaticReports: AutomaticReport[];
  dashboardConfiguration: DashboardConfig;
  exportFormats: string[];
  sharingPermissions: Record<string, string[]>;
}

export interface AutomaticReport {
  type: BIReportType;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  enabled: boolean;
}

export interface DashboardConfig {
  defaultTimeRange: string;
  refreshInterval: number;
  widgets: DashboardWidget[];
  customizable: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  metric: string;
  visualization: 'line' | 'bar' | 'pie' | 'number' | 'table' | 'heatmap';
  position: { x: number; y: number; width: number; height: number };
  filters: Record<string, any>;
}

export interface AlertSettings {
  globalEnabled: boolean;
  alertRules: AlertRule[];
  notificationChannels: NotificationChannel[];
  escalationPolicies: EscalationPolicy[];
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  timeWindow: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  name: string;
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
  enabled: boolean;
}

export interface EscalationStep {
  delay: number; // minutes
  notificationChannels: string[];
  assignees: string[];
}

// Database Collections
export const ANALYTICS_COLLECTIONS = {
  USER_ANALYTICS: 'userAnalytics',
  EVENT_ANALYTICS: 'eventAnalytics',
  PLATFORM_ANALYTICS: 'platformAnalytics',
  COHORT_ANALYSIS: 'cohortAnalysis',
  BUSINESS_INTELLIGENCE: 'businessIntelligence',
  ANALYTICS_CONFIG: 'analyticsConfiguration',
} as const;

// API Response Types
export interface AnalyticsDashboardResponse {
  userMetrics: UserAnalytics;
  eventMetrics: EventAnalytics[];
  platformOverview: PlatformAnalytics;
  insights: Insight[];
  alerts: Alert[];
  trends: Trend[];
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  timeRange: {
    start: string;
    end: string;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
  orderBy?: string;
  groupBy?: string[];
}

export interface AnalyticsQueryResponse {
  data: Record<string, any>[];
  totalCount: number;
  aggregations: Record<string, number>;
  metadata: {
    query: AnalyticsQuery;
    executionTime: number;
    dataPoints: number;
    cached: boolean;
  };
}