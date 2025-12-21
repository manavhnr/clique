import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

export interface ScheduledNotificationData extends NotificationData {
  trigger: Notifications.NotificationTriggerInput;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Request notification permissions and get push token
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Try to get push token, but don't fail if it's not available in development
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined,
      });
      
      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.warn('Could not get push token (this is normal in development):', error);
      // Don't fail completely - local notifications can still work
      return null;
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Send a local notification immediately
   */
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          ...(notification.badge !== undefined && { badge: notification.badge }),
        },
        trigger: null, // Send immediately
      });

      console.log('Local notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(notification: ScheduledNotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          ...(notification.badge !== undefined && { badge: notification.badge }),
        },
        trigger: notification.trigger,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Set notification badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await Notifications.setBadgeCountAsync(count);
      } catch (error) {
        console.error('Error setting badge count:', error);
      }
    }
  }

  /**
   * Clear all notifications from the notification tray
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response received listener (when user taps notification)
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Predefined notification types for the Clique app
  
  /**
   * Send event reminder notification
   */
  async sendEventReminder(eventName: string, eventTime: Date): Promise<string> {
    return this.sendLocalNotification({
      title: 'Event Reminder',
      body: `${eventName} starts in 1 hour`,
      data: { type: 'event_reminder', eventTime: eventTime.toISOString() },
    });
  }

  /**
   * Send new booking notification to host
   */
  async sendNewBookingNotification(guestName: string, eventName: string): Promise<string> {
    return this.sendLocalNotification({
      title: 'New Booking Received',
      body: `${guestName} wants to join ${eventName}`,
      data: { type: 'new_booking', guestName, eventName },
    });
  }

  /**
   * Send booking confirmation to guest
   */
  async sendBookingConfirmation(eventName: string, hostName: string): Promise<string> {
    return this.sendLocalNotification({
      title: 'Booking Confirmed!',
      body: `Your request to join ${eventName} has been approved by ${hostName}`,
      data: { type: 'booking_confirmed', eventName, hostName },
    });
  }

  /**
   * Schedule event reminder (1 hour before)
   */
  async scheduleEventReminder(eventName: string, eventTime: Date): Promise<string> {
    const now = new Date();
    const reminderTime = new Date(eventTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const secondsUntilReminder = Math.max(0, Math.floor((reminderTime.getTime() - now.getTime()) / 1000));

    return this.scheduleNotification({
      title: 'Upcoming Event',
      body: `${eventName} starts in 1 hour`,
      data: { type: 'event_reminder', eventName },
      trigger: secondsUntilReminder > 0 ? { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
        repeats: false 
      } : null,
    });
  }

  /**
   * Send new event in area notification
   */
  async sendNewEventNotification(eventName: string, hostName: string): Promise<string> {
    return this.sendLocalNotification({
      title: 'New Event Near You',
      body: `${hostName} is hosting ${eventName} in your area`,
      data: { type: 'new_event', eventName, hostName },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;