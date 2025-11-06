import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  
  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // Implement account deletion logic
            Alert.alert('Account deletion requested', 'Your account will be deleted within 24 hours.');
          }
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    value, 
    onValueChange, 
    type = 'arrow' 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'arrow' | 'switch' | 'text';
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon as any} size={20} color="#6B7280" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {type === 'arrow' && (
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        )}
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="person-circle"
            title="Profile Information"
            subtitle="Edit your personal details"
            onPress={() => navigation.navigate('EditProfile')}
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => console.log('Privacy settings')}
          />
          
          <SettingItem
            icon="key"
            title="Change Password"
            subtitle="Update your login credentials"
            onPress={() => console.log('Change password')}
          />
          
          <SettingItem
            icon="globe"
            title="Profile Visibility"
            subtitle="Who can see your profile"
            value={profileVisibility}
            onValueChange={setProfileVisibility}
            type="switch"
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Get notified about events and updates"
            value={pushNotifications}
            onValueChange={setPushNotifications}
            type="switch"
          />
          
          <SettingItem
            icon="mail"
            title="Email Notifications"
            subtitle="Receive updates via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            type="switch"
          />
          
          <SettingItem
            icon="alarm"
            title="Event Reminders"
            subtitle="Reminders for upcoming events"
            value={eventReminders}
            onValueChange={setEventReminders}
            type="switch"
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <SettingItem
            icon="location"
            title="Location Services"
            subtitle="Allow location access for nearby events"
            value={locationServices}
            onValueChange={setLocationServices}
            type="switch"
          />
          
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => console.log('Language settings')}
          />
          
          <SettingItem
            icon="color-palette"
            title="Theme"
            subtitle="Light mode"
            onPress={() => console.log('Theme settings')}
          />
          
          <SettingItem
            icon="cloud-download"
            title="Data & Storage"
            subtitle="Manage app data usage"
            onPress={() => console.log('Data settings')}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          
          <SettingItem
            icon="help-circle"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => console.log('Help center')}
          />
          
          <SettingItem
            icon="chatbubble-ellipses"
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => console.log('Contact us')}
          />
          
          <SettingItem
            icon="document-text"
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            onPress={() => console.log('Terms')}
          />
          
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => console.log('Privacy policy')}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash" size={20} color="#DC2626" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>HYN App Version 1.0.0</Text>
          <Text style={styles.buildNumber}>Build 2025.11.06</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  
  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingRight: {
    marginLeft: 12,
  },
  
  // Action Buttons
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    marginLeft: 12,
  },
  
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  buildNumber: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});