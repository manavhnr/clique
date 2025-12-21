import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  writeBatch,
  Timestamp,
  CollectionReference,
  DocumentReference 
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Import all schema types
import type { User, AuthUser, Event } from '../types/auth';
import type { Report, ModerationAction } from '../types/reports';
import type { FeaturedEvent, PromotionPackage } from '../types/featured';
import type { UserAnalytics, PlatformAnalytics } from '../types/analytics';
import type { PaymentMethod, Transaction } from '../types/payments';
import type { AdminUser } from '../types/admin';

export class FirestoreSetupService {
  private static instance: FirestoreSetupService;
  
  static getInstance(): FirestoreSetupService {
    if (!FirestoreSetupService.instance) {
      FirestoreSetupService.instance = new FirestoreSetupService();
    }
    return FirestoreSetupService.instance;
  }

  // Collection References
  private getCollectionRef(collectionName: string): CollectionReference {
    return collection(db, collectionName);
  }

  /**
   * Initialize all Firestore collections with proper security rules and indexes
   */
  async initializeAllSchemas(): Promise<void> {
    console.log('🚀 Starting Firestore schema initialization...');
    
    try {
      await this.createUserSchemas();
      await this.createEventSchemas();
      await this.createBookingSchemas();
      await this.createNotificationSchemas();
      await this.createReportSchemas();
      await this.createAdminSchemas();
      await this.createFeaturedSchemas();
      await this.createAnalyticsSchemas();
      await this.createPaymentSchemas();
      await this.createSystemCollections();
      
      console.log('✅ All Firestore schemas initialized successfully!');
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Failed to initialize Firestore schemas:', error);
      throw error;
    }
  }

  /**
   * User Management Schemas
   */
  private async createUserSchemas(): Promise<void> {
    console.log('📝 Creating User schemas...');
    
    const collections = [
      'users',
      'userProfiles',
      'hostProfiles',
      'userConnections',
      'userPreferences',
      'userSessions'
    ];

    // Create sample user document structure
    const sampleUser: Partial<User> = {
      id: 'sample_user_id',
      phone_number: '+1234567890',
      is_verified: false,
      is_host: false,
      created_at: new Date().toISOString(),
      username: 'sampleuser',
      name: 'Sample User',
      email: 'sample@example.com',
      city: 'San Francisco',
      age: 25,
      social_activity_level: 'occasionally',
      is_profile_complete: false
    };

    await this.createCollectionWithSample('users', sampleUser);
    
    for (const collectionName of collections.slice(1)) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Event Management Schemas
   */
  private async createEventSchemas(): Promise<void> {
    console.log('🎉 Creating Event schemas...');
    
    const collections = [
      'events',
      'eventCategories',
      'joinRequests',
      'eventTemplates',
      'eventSeries',
      'eventPhotos',
      'eventReviews'
    ];

    // Create sample event category
    const sampleCategory = {
      id: 'sample_category',
      name: 'Sample Category',
      description: 'Sample event category',
      icon: '🎭',
      color: '#8B5CF6',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString()
    };

    await this.createCollectionWithSample('eventCategories', sampleCategory);

    // Create sample event
    const sampleEvent: Partial<Event> = {
      id: 'sample_event_id',
      title: 'Sample Event',
      description: 'This is a sample event for testing purposes',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      location: '123 Sample St, San Francisco, CA',
      price: 25,
      capacity: 50,
      hostId: 'sample_user_id',
      hostName: 'Sample Host',
      hostPhone: '+1234567890',
      imageUrl: '',
      category: 'party',
      tags: ['networking', 'social', 'fun'],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await this.createCollectionWithSample('events', sampleEvent);

    for (const collectionName of collections.slice(2)) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Booking Management Schemas
   */
  private async createBookingSchemas(): Promise<void> {
    console.log('🎫 Creating Booking schemas...');
    
    const collections = [
      'bookingPasses',
      'tickets', 
      'bookingHistory',
      'waitlists',
      'bookingPreferences'
    ];

    for (const collectionName of collections) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Notification Schemas
   */
  private async createNotificationSchemas(): Promise<void> {
    console.log('🔔 Creating Notification schemas...');
    
    const collections = [
      'notifications',
      'notificationPreferences',
      'notificationTemplates',
      'pushTokens',
      'notificationHistory'
    ];

    for (const collectionName of collections) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Content Moderation & Reporting Schemas
   */
  private async createReportSchemas(): Promise<void> {
    console.log('🛡️ Creating Report & Moderation schemas...');
    
    const collections = [
      'reports',
      'moderationActions',
      'autoModerationRules',
      'contentFlags',
      'moderationQueue',
      'userSuspensions',
      'appealRequests'
    ];

    for (const collectionName of collections) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Admin & Platform Management Schemas
   */
  private async createAdminSchemas(): Promise<void> {
    console.log('👨‍💼 Creating Admin schemas...');
    
    const collections = [
      'adminUsers',
      'adminActions',
      'platformSettings',
      'systemHealth',
      'auditLogs',
      'emergencyActions',
      'platformAnnouncements'
    ];

    // Create sample platform settings
    const sampleSettings = {
      id: 'platform_config',
      general: {
        platformName: 'Clique',
        tagline: 'Connect through experiences',
        supportEmail: 'support@clique.app',
        maxEventCapacity: 1000,
        defaultEventDuration: 120,
        timezonSupport: true
      },
      features: {
        userRegistration: true,
        eventCreation: true,
        paymentProcessing: true,
        socialFeatures: true,
        analyticsTracking: true,
        pushNotifications: true
      },
      security: {
        twoFactorRequired: false,
        passwordMinLength: 8,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        requireEmailVerification: true
      },
      content: {
        autoModeration: true,
        manualReview: true,
        allowUserReports: true,
        contentRetentionDays: 365
      },
      business: {
        commissionRate: 0.05,
        minPayoutAmount: 10,
        payoutSchedule: 'weekly',
        refundWindow: 168,
        currency: 'USD'
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };

    await this.createCollectionWithSample('platformSettings', sampleSettings);

    for (const collectionName of collections.slice(1)) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Featured Events & Marketing Schemas
   */
  private async createFeaturedSchemas(): Promise<void> {
    console.log('⭐ Creating Featured Events schemas...');
    
    const collections = [
      'featuredEvents',
      'promotionPackages',
      'featuredEventAnalytics',
      'promotionCampaigns',
      'trendingAlgorithms',
      'editorialPicks',
      'localPromotions',
      'promotionBids'
    ];

    // Create sample promotion package
    const samplePackage = {
      id: 'basic_promotion',
      name: 'Basic Promotion',
      description: 'Standard event promotion package',
      level: 'basic' as const,
      price: 49,
      duration: 7,
      features: [
        { name: 'Homepage visibility', description: 'Event appears on homepage', included: true },
        { name: 'Category highlighting', description: 'Featured in category section', included: true },
        { name: 'Social media boost', description: 'Promoted on social channels', included: false }
      ],
      placements: ['homepage_trending' as const, 'category_top' as const],
      maxImpressions: 10000,
      targetingOptions: false,
      customStyling: false,
      analyticsAccess: true,
      prioritySupport: false,
      autoRenew: false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.createCollectionWithSample('promotionPackages', samplePackage);

    for (const collectionName of collections.slice(1)) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Analytics & Business Intelligence Schemas
   */
  private async createAnalyticsSchemas(): Promise<void> {
    console.log('📊 Creating Analytics schemas...');
    
    const collections = [
      'userAnalytics',
      'eventAnalytics', 
      'platformAnalytics',
      'cohortAnalysis',
      'businessIntelligence',
      'analyticsConfiguration'
    ];

    for (const collectionName of collections) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Payment & Financial Management Schemas
   */
  private async createPaymentSchemas(): Promise<void> {
    console.log('💳 Creating Payment schemas...');
    
    const collections = [
      'paymentMethods',
      'transactions',
      'payouts',
      'paymentIntents',
      'subscriptions',
      'invoices',
      'refundRequests',
      'paymentSettings'
    ];

    for (const collectionName of collections) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * System & Metadata Collections
   */
  private async createSystemCollections(): Promise<void> {
    console.log('⚙️ Creating System collections...');
    
    const systemCollections = [
      'appVersions',
      'maintenanceWindows',
      'featureFlags',
      'apiKeys',
      'webhookConfigs',
      'backupLogs',
      'migrationHistory'
    ];

    // Create feature flags document
    const defaultFeatureFlags = {
      id: 'default_flags',
      notifications: { enabled: true, rolloutPercentage: 100 },
      analytics: { enabled: true, rolloutPercentage: 100 },
      payments: { enabled: true, rolloutPercentage: 100 },
      socialFeatures: { enabled: true, rolloutPercentage: 100 },
      advancedSearch: { enabled: false, rolloutPercentage: 0 },
      aiRecommendations: { enabled: false, rolloutPercentage: 10 },
      updatedAt: new Date().toISOString()
    };

    await this.createCollectionWithSample('featureFlags', defaultFeatureFlags);

    for (const collectionName of systemCollections.slice(1)) {
      await this.ensureCollectionExists(collectionName);
    }
  }

  /**
   * Helper method to create a collection with a sample document
   */
  private async createCollectionWithSample(
    collectionName: string, 
    sampleData: any
  ): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(collectionName);
      const sampleDocRef = doc(collectionRef, sampleData.id || 'sample_doc');
      
      // Check if sample doc already exists
      const docSnap = await getDoc(sampleDocRef);
      if (!docSnap.exists()) {
        await setDoc(sampleDocRef, {
          ...sampleData,
          _isTemplate: true,
          _createdAt: Timestamp.now()
        });
        console.log(`✅ Created collection: ${collectionName} with sample data`);
      } else {
        console.log(`ℹ️  Collection ${collectionName} already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to ensure a collection exists
   */
  private async ensureCollectionExists(collectionName: string): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(collectionName);
      const placeholderDoc = doc(collectionRef, '_placeholder');
      
      // Check if placeholder exists
      const docSnap = await getDoc(placeholderDoc);
      if (!docSnap.exists()) {
        await setDoc(placeholderDoc, {
          _isPlaceholder: true,
          _createdAt: Timestamp.now(),
          _note: `Placeholder document for ${collectionName} collection`
        });
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection ${collectionName} already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create collection ${collectionName}:`, error);
    }
  }

  /**
   * Create composite indexes programmatically (for documentation)
   */
  async createIndexes(): Promise<void> {
    console.log('📋 Index creation requirements:');
    
    const indexRequirements = [
      // User indexes
      { collection: 'users', fields: ['email', 'accountStatus'] },
      { collection: 'users', fields: ['isHost', 'isVerified'] },
      { collection: 'users', fields: ['location.city', 'accountStatus'] },
      
      // Event indexes
      { collection: 'events', fields: ['status', 'visibility', 'schedule.startTime'] },
      { collection: 'events', fields: ['category', 'location.city', 'schedule.startTime'] },
      { collection: 'events', fields: ['hostId', 'status'] },
      { collection: 'events', fields: ['tags', 'schedule.startTime'] },
      
      // Booking indexes
      { collection: 'bookingPasses', fields: ['userId', 'status'] },
      { collection: 'bookingPasses', fields: ['eventId', 'status'] },
      { collection: 'bookingPasses', fields: ['status', 'bookedAt'] },
      
      // Notification indexes
      { collection: 'notifications', fields: ['userId', 'isRead', 'createdAt'] },
      { collection: 'notifications', fields: ['type', 'createdAt'] },
      
      // Analytics indexes
      { collection: 'userAnalytics', fields: ['userId', 'date'] },
      { collection: 'eventAnalytics', fields: ['eventId', 'date'] },
      { collection: 'platformAnalytics', fields: ['date'] },
      
      // Payment indexes
      { collection: 'transactions', fields: ['userId', 'status'] },
      { collection: 'transactions', fields: ['status', 'createdAt'] },
      { collection: 'payouts', fields: ['hostId', 'status'] },
    ];

    indexRequirements.forEach(index => {
      console.log(`📋 Required index: ${index.collection} -> [${index.fields.join(', ')}]`);
    });

    console.log(`
    🔍 To create these indexes manually:
    1. Go to Firebase Console -> Firestore -> Indexes
    2. Create composite indexes for the fields listed above
    3. Or use Firebase CLI: firebase firestore:indexes
    `);
  }

  /**
   * Verify all collections exist
   */
  async verifySchemas(): Promise<{ success: boolean; collections: string[]; missing: string[] }> {
    console.log('🔍 Verifying all schemas...');
    
    const expectedCollections = [
      // User management
      'users', 'userProfiles', 'hostProfiles', 'userConnections', 'userPreferences', 'userSessions',
      
      // Event management  
      'events', 'eventCategories', 'joinRequests', 'eventTemplates', 'eventSeries', 'eventPhotos', 'eventReviews',
      
      // Booking system
      'bookingPasses', 'tickets', 'bookingHistory', 'waitlists', 'bookingPreferences',
      
      // Notifications
      'notifications', 'notificationPreferences', 'notificationTemplates', 'pushTokens', 'notificationHistory',
      
      // Reports & Moderation
      'reports', 'moderationActions', 'autoModerationRules', 'contentFlags', 'moderationQueue', 'userSuspensions', 'appealRequests',
      
      // Admin & Platform
      'adminUsers', 'adminActions', 'platformSettings', 'systemHealth', 'auditLogs', 'emergencyActions', 'platformAnnouncements',
      
      // Featured & Marketing
      'featuredEvents', 'promotionPackages', 'featuredEventAnalytics', 'promotionCampaigns', 'trendingAlgorithms', 'editorialPicks', 'localPromotions', 'promotionBids',
      
      // Analytics & BI
      'userAnalytics', 'eventAnalytics', 'platformAnalytics', 'cohortAnalysis', 'businessIntelligence', 'analyticsConfiguration',
      
      // Payments
      'paymentMethods', 'transactions', 'payouts', 'paymentIntents', 'subscriptions', 'invoices', 'refundRequests', 'paymentSettings',
      
      // System
      'appVersions', 'maintenanceWindows', 'featureFlags', 'apiKeys', 'webhookConfigs', 'backupLogs', 'migrationHistory'
    ];

    const existingCollections: string[] = [];
    const missingCollections: string[] = [];

    for (const collectionName of expectedCollections) {
      try {
        const collectionRef = this.getCollectionRef(collectionName);
        const placeholderDoc = doc(collectionRef, '_placeholder');
        const docSnap = await getDoc(placeholderDoc);
        
        if (docSnap.exists()) {
          existingCollections.push(collectionName);
        } else {
          missingCollections.push(collectionName);
        }
      } catch (error) {
        missingCollections.push(collectionName);
      }
    }

    const success = missingCollections.length === 0;
    
    console.log(`
    📊 Schema Verification Results:
    ✅ Existing collections: ${existingCollections.length}/${expectedCollections.length}
    ${existingCollections.map(c => `   - ${c}`).join('\n')}
    
    ${missingCollections.length > 0 ? `❌ Missing collections: ${missingCollections.length}
    ${missingCollections.map(c => `   - ${c}`).join('\n')}` : '🎉 All collections exist!'}
    `);

    return {
      success,
      collections: existingCollections,
      missing: missingCollections
    };
  }

  /**
   * Clean up test/sample data (use with caution)
   */
  async cleanupSampleData(): Promise<void> {
    console.warn('⚠️  This will delete all sample/template data. Use with caution!');
    // Implementation would go here for production cleanup
  }
}

// Export singleton instance
export const firestoreSetup = FirestoreSetupService.getInstance();

// Export utility functions
export const initializeFirestoreSchemas = () => firestoreSetup.initializeAllSchemas();
export const verifyFirestoreSchemas = () => firestoreSetup.verifySchemas();
export const createFirestoreIndexes = () => firestoreSetup.createIndexes();