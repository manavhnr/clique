// Admin and Platform Management System Types

export interface AdminUser {
  id: string;
  userId: string; // Reference to regular user account
  role: AdminRole;
  permissions: AdminPermission[];
  level: number; // 1-5, 5 being highest access
  status: 'active' | 'suspended' | 'inactive';
  department?: AdminDepartment;
  supervisor?: string; // Admin ID
  directReports?: string[]; // Admin IDs
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastLoginAt?: string;
  loginCount: number;
  twoFactorEnabled: boolean;
  emergencyAccess: boolean;
}

export type AdminRole = 
  | 'super_admin'
  | 'platform_admin'
  | 'content_moderator'
  | 'event_moderator'
  | 'customer_support'
  | 'data_analyst'
  | 'marketing_admin'
  | 'finance_admin'
  | 'technical_admin'
  | 'compliance_officer';

export type AdminDepartment = 
  | 'operations'
  | 'moderation'
  | 'customer_service'
  | 'marketing'
  | 'finance'
  | 'engineering'
  | 'legal_compliance'
  | 'data_analytics';

export type AdminPermission = 
  | 'user_management'
  | 'event_management'
  | 'content_moderation'
  | 'financial_operations'
  | 'platform_settings'
  | 'analytics_access'
  | 'marketing_tools'
  | 'system_monitoring'
  | 'user_support'
  | 'data_export'
  | 'emergency_actions'
  | 'audit_logs'
  | 'admin_management'
  | 'compliance_tools'
  | 'feature_flags';

export interface AdminSession {
  id: string;
  adminId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  loginAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isActive: boolean;
  loginMethod: 'password' | 'sso' | '2fa' | 'emergency';
  riskScore?: number;
  flaggedActivity?: string[];
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminInfo: {
    username: string;
    role: AdminRole;
  };
  action: AdminActionType;
  targetType: 'user' | 'event' | 'post' | 'comment' | 'report' | 'system';
  targetId?: string;
  targetInfo?: {
    name?: string;
    email?: string;
    title?: string;
  };
  details: AdminActionDetails;
  reason?: string;
  impact: AdminActionImpact;
  requiredApproval?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  reversible: boolean;
  reversed?: boolean;
  reversedBy?: string;
  reversedAt?: string;
}

export type AdminActionType = 
  | 'user_suspend'
  | 'user_ban'
  | 'user_verify'
  | 'user_unverify'
  | 'event_approve'
  | 'event_reject'
  | 'event_feature'
  | 'event_unfeature'
  | 'content_remove'
  | 'content_restore'
  | 'report_resolve'
  | 'payment_refund'
  | 'system_config'
  | 'data_export'
  | 'emergency_action'
  | 'admin_create'
  | 'admin_modify'
  | 'admin_delete';

export type AdminActionImpact = 'low' | 'medium' | 'high' | 'critical';

export interface AdminActionDetails {
  previousState?: any;
  newState?: any;
  affectedCount?: number;
  additionalData?: Record<string, any>;
  systemGenerated?: boolean;
  batchOperation?: boolean;
  batchId?: string;
}

export interface PlatformSettings {
  id: string;
  category: SettingsCategory;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  defaultValue: any;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  requiresRestart?: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
  version: number;
  environment: 'production' | 'staging' | 'development';
}

export type SettingsCategory = 
  | 'general'
  | 'authentication'
  | 'payments'
  | 'notifications'
  | 'moderation'
  | 'features'
  | 'limits'
  | 'security'
  | 'integrations'
  | 'maintenance';

export interface SystemHealth {
  id: string;
  component: SystemComponent;
  status: HealthStatus;
  metrics: HealthMetrics;
  alerts: SystemAlert[];
  lastChecked: string;
  uptime: number;
  responseTime: number;
  errorRate: number;
}

export type SystemComponent = 
  | 'api_server'
  | 'database'
  | 'authentication'
  | 'payments'
  | 'notifications'
  | 'file_storage'
  | 'image_processing'
  | 'search_service'
  | 'analytics'
  | 'cdn';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  requests: number;
  errors: number;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: SystemComponent;
  message: string;
  details?: string;
  timestamp: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  adminId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdminDashboard {
  stats: AdminStats;
  recentActions: AdminAction[];
  systemHealth: SystemHealth[];
  pendingApprovals: AdminAction[];
  alerts: SystemAlert[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  activeEvents: number;
  pendingReports: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  growth: {
    users: number;
    events: number;
    revenue: number;
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  key: string;
  enabled: boolean;
  environment: 'all' | 'production' | 'staging' | 'development';
  rolloutPercentage: number;
  targetUsers?: string[]; // Specific user IDs
  targetGroups?: string[]; // User groups
  conditions?: FeatureFlagCondition[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface FeatureFlagCondition {
  type: 'user_attribute' | 'device' | 'location' | 'time';
  attribute: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface EmergencyAction {
  id: string;
  type: EmergencyActionType;
  initiatedBy: string;
  reason: string;
  description: string;
  affectedUsers?: string[];
  affectedEvents?: string[];
  duration?: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled';
  approvals: EmergencyApproval[];
  timeline: EmergencyTimeline[];
  createdAt: string;
  completedAt?: string;
}

export type EmergencyActionType = 
  | 'platform_lockdown'
  | 'event_shutdown'
  | 'user_mass_suspend'
  | 'payment_freeze'
  | 'content_purge'
  | 'system_maintenance'
  | 'security_incident';

export interface EmergencyApproval {
  approverRole: AdminRole;
  approverId?: string;
  required: boolean;
  approved: boolean;
  approvedAt?: string;
  reason?: string;
}

export interface EmergencyTimeline {
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  status: 'success' | 'failure' | 'in_progress';
}

// Database Collections
export const ADMIN_COLLECTIONS = {
  ADMIN_USERS: 'adminUsers',
  ADMIN_SESSIONS: 'adminSessions',
  ADMIN_ACTIONS: 'adminActions',
  PLATFORM_SETTINGS: 'platformSettings',
  SYSTEM_HEALTH: 'systemHealth',
  AUDIT_LOGS: 'auditLogs',
  FEATURE_FLAGS: 'featureFlags',
  EMERGENCY_ACTIONS: 'emergencyActions',
} as const;

// Helper functions and utilities
export interface AdminPermissionCheck {
  adminId: string;
  permission: AdminPermission;
  resource?: string;
  resourceId?: string;
}

export interface AdminNotification {
  id: string;
  adminId: string;
  type: 'system_alert' | 'approval_request' | 'emergency' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}