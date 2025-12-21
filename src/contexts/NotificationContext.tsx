import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationData } from '../services/notificationService';

// Configure notification behavior globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // Set to false to avoid badge issues
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isLoading: boolean;
  error: string | null;
  // Functions
  sendLocalNotification: (notification: NotificationData) => Promise<string>;
  scheduleEventReminder: (eventName: string, eventTime: Date) => Promise<string>;
  sendEventNotification: (eventName: string, hostName: string) => Promise<string>;
  sendBookingNotification: (guestName: string, eventName: string) => Promise<string>;
  sendBookingConfirmation: (eventName: string, hostName: string) => Promise<string>;
  clearNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize notifications when component mounts
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Listen for notifications received while app is in foreground
    const notificationListener = notificationService.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    const responseListener = notificationService.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
        handleNotificationResponse(response);
      }
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await notificationService.registerForPushNotificationsAsync();
      setExpoPushToken(token);
      
      // Even if we don't get a push token, we can still use local notifications
      if (!token) {
        console.log('Push notifications may not be available, but local notifications should still work');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register for notifications';
      setError(errorMessage);
      console.error('Error registering for push notifications:', err);
      // Don't throw - allow the app to continue with local notifications only
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Handle different types of notifications
    switch (data?.type) {
      case 'event_reminder':
        // Navigate to event details
        console.log('Event reminder tapped:', data);
        // TODO: Add navigation logic
        break;
      case 'new_booking':
        // Navigate to host dashboard
        console.log('New booking notification tapped:', data);
        // TODO: Add navigation logic
        break;
      case 'booking_confirmed':
        // Navigate to bookings/events
        console.log('Booking confirmed notification tapped:', data);
        // TODO: Add navigation logic
        break;
      case 'new_event':
        // Navigate to event discovery
        console.log('New event notification tapped:', data);
        // TODO: Add navigation logic
        break;
      default:
        console.log('Unknown notification type:', data);
    }
  };

  // Wrapper functions that handle errors
  const sendLocalNotification = async (notification: NotificationData): Promise<string> => {
    try {
      return await notificationService.sendLocalNotification(notification);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const scheduleEventReminder = async (eventName: string, eventTime: Date): Promise<string> => {
    try {
      return await notificationService.scheduleEventReminder(eventName, eventTime);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminder';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendEventNotification = async (eventName: string, hostName: string): Promise<string> => {
    try {
      return await notificationService.sendNewEventNotification(eventName, hostName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send event notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendBookingNotification = async (guestName: string, eventName: string): Promise<string> => {
    try {
      return await notificationService.sendNewBookingNotification(guestName, eventName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send booking notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendBookingConfirmation = async (eventName: string, hostName: string): Promise<string> => {
    try {
      return await notificationService.sendBookingConfirmation(eventName, hostName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send confirmation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      await notificationService.clearAllNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear notifications';
      setError(errorMessage);
      console.error(errorMessage);
    }
  };

  const setBadgeCount = async (count: number): Promise<void> => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set badge count';
      setError(errorMessage);
      console.error(errorMessage);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    isLoading,
    error,
    sendLocalNotification,
    scheduleEventReminder,
    sendEventNotification,
    sendBookingNotification,
    sendBookingConfirmation,
    clearNotifications,
    setBadgeCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;