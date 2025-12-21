// Report and Moderation System Types

export interface Report {
  id: string;
  reporterId: string;
  reporterInfo: {
    username: string;
    email: string;
  };
  targetType: 'user' | 'event' | 'comment' | 'photo' | 'post';
  targetId: string;
  targetInfo: {
    title?: string; // For events/posts
    username?: string; // For users
    url?: string; // For photos/content
  };
  category: ReportCategory;
  subcategory?: string;
  description: string;
  evidence?: ReportEvidence[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: ReportStatus;
  priority: number; // 1-5, 5 being highest
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
  resolution?: ReportResolution;
  appealable: boolean;
  appealed?: boolean;
  appealedAt?: string;
  appealReason?: string;
}

export type ReportCategory = 
  | 'inappropriate_content'
  | 'harassment'
  | 'spam'
  | 'fake_profile'
  | 'safety_concern'
  | 'copyright'
  | 'privacy_violation'
  | 'fraud'
  | 'hate_speech'
  | 'violence'
  | 'adult_content'
  | 'other';

export type ReportStatus = 
  | 'pending'
  | 'under_review'
  | 'investigating'
  | 'resolved'
  | 'dismissed'
  | 'escalated'
  | 'appealed'
  | 'closed';

export interface ReportEvidence {
  id: string;
  type: 'screenshot' | 'url' | 'text' | 'video';
  content: string;
  description?: string;
  uploadedAt: string;
}

export interface ReportResolution {
  action: ResolutionAction;
  reason: string;
  duration?: string; // For temporary actions
  permanent?: boolean;
  notifyReporter: boolean;
  notifyTarget: boolean;
  publicNote?: string;
}

export type ResolutionAction = 
  | 'no_action'
  | 'warning'
  | 'content_removal'
  | 'account_restriction'
  | 'temporary_suspension'
  | 'permanent_ban'
  | 'event_cancellation'
  | 'host_privileges_revoked'
  | 'require_verification';

export interface ModerationAction {
  id: string;
  reportId: string;
  moderatorId: string;
  moderatorInfo: {
    username: string;
    role: string;
  };
  action: ResolutionAction;
  targetUserId: string;
  targetType: 'user' | 'event' | 'content';
  targetId: string;
  reason: string;
  duration?: string;
  restrictions?: UserRestriction[];
  notificationSent: boolean;
  appealDeadline?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface UserRestriction {
  type: 'posting' | 'commenting' | 'hosting' | 'booking' | 'messaging';
  reason: string;
  appliedAt: string;
  expiresAt?: string;
}

export interface ModerationQueue {
  id: string;
  reportId: string;
  priority: number;
  assignedTo?: string;
  estimatedReviewTime: string;
  queueType: 'auto_flagged' | 'user_reported' | 'routine_review';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: string;
  reportsByCategory: Record<ReportCategory, number>;
  reportsByStatus: Record<ReportStatus, number>;
  topReportedUsers: {
    userId: string;
    username: string;
    reportCount: number;
  }[];
  moderatorStats: {
    moderatorId: string;
    reportsHandled: number;
    averageTime: string;
    accuracy: number;
  }[];
}

// Auto-moderation system
export interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  type: 'keyword' | 'pattern' | 'image' | 'behavior';
  target: 'posts' | 'comments' | 'profiles' | 'events' | 'messages';
  conditions: AutoModerationCondition[];
  actions: AutoModerationAction[];
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AutoModerationCondition {
  field: string;
  operator: 'contains' | 'matches' | 'starts_with' | 'ends_with' | 'equals';
  value: string | string[];
  caseSensitive?: boolean;
}

export interface AutoModerationAction {
  type: 'flag' | 'hide' | 'require_review' | 'auto_remove' | 'notify_moderators';
  severity: 'low' | 'medium' | 'high';
  notifyUser?: boolean;
  escalate?: boolean;
}

export interface ContentFlag {
  id: string;
  contentType: 'post' | 'comment' | 'event' | 'profile' | 'photo';
  contentId: string;
  flagType: 'auto' | 'user_report' | 'manual';
  reason: string;
  flaggedBy?: string; // User ID if user report
  autoRuleId?: string; // Auto-moderation rule ID
  confidence?: number; // AI confidence score
  status: 'pending' | 'reviewed' | 'cleared' | 'confirmed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Database Collections
export const REPORT_COLLECTIONS = {
  REPORTS: 'reports',
  MODERATION_ACTIONS: 'moderationActions',
  MODERATION_QUEUE: 'moderationQueue',
  AUTO_MODERATION_RULES: 'autoModerationRules',
  CONTENT_FLAGS: 'contentFlags',
  USER_RESTRICTIONS: 'userRestrictions',
} as const;

// Helper types for API responses
export interface ReportResponse {
  report: Report;
  relatedReports?: Report[];
  targetInfo?: any;
  reporterInfo?: any;
}

export interface ModerationDashboard {
  stats: ReportStats;
  urgentReports: Report[];
  queueSummary: {
    total: number;
    highPriority: number;
    overdue: number;
    assigned: number;
  };
  recentActions: ModerationAction[];
}