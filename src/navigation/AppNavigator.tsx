import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AccountScreen from '../screens/AccountScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import UserProfileViewScreen from '../screens/UserProfileViewScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import HostApplicationScreen from '../screens/HostApplicationScreen';
import HostDashboardScreen from '../screens/HostDashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import AttendeesListScreen from '../screens/AttendeesListScreen';
import EventPhotoDashboard from '../screens/EventPhotoDashboard';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import FindPeopleScreen from '../screens/FindPeopleScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registration: undefined;
  Main: undefined;
  Profile: undefined;
  EventDetails: { eventId: string };
  Booking: { eventId: string };
  Settings: undefined;
  EditProfile: undefined;
  Connections: { tab?: 'followers' | 'following' };
  HostApplication: undefined;
  HostDashboard: undefined;
  CreateEvent: { eventId?: string; mode?: 'create' | 'edit' };
  UserProfileView: { userId: string; userName?: string };
  AttendeesList: { eventId: string; eventTitle?: string };
  EventPhotoDashboard: { 
    eventId: string; 
    eventTitle: string; 
    totalPhotos: number; 
    totalContributors: number;
  };
  ChatList: undefined;
  Chat: {
    conversationId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
  };
  FindPeople: {
    existingConversationUserIds?: string[];
  };
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Dashboard: undefined;
  Account: {
    userId?: string;
    userName?: string;
  };
};

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = React.memo(function MainTabNavigator() {
  const { user } = useAuth();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 80,
          paddingTop: 8,
          paddingBottom: 20,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <MainTab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{ 
          headerShown: false,
          tabBarLabel: 'Discover'
        }}
      />
      <MainTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          headerShown: false,
          tabBarLabel: 'My Events'
        }}
      />
      <MainTab.Screen 
        name="Account" 
        component={AccountScreen}
        options={({ route }) => {
          const params = route.params as { userId?: string; userName?: string } | undefined;
          return {
            title: params?.userId ? params.userName || 'Profile' : 'Profile',
            headerShown: false
          };
        }}
      />
      </MainTab.Navigator>
  );
});

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or loading screen
  }

  const isAuthenticated = user && user.isProfileComplete;
  const needsRegistration = user && !user.isProfileComplete;

  return (
    <RootStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? "Main" : needsRegistration ? "Registration" : "Welcome"}
    >
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen 
            name="Profile" 
            component={UserProfileScreen}
            options={{ 
              headerShown: true,
              title: 'Profile',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
            }}
          />
          <RootStack.Screen 
            name="EventDetails" 
            component={EventDetailsScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Booking" 
            component={BookingScreen}
            options={{ 
              headerShown: true,
              title: 'Book Event',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
            }}
          />
          <RootStack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              headerShown: true,
              title: 'Settings',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
            }}
          />
          <RootStack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ 
              headerShown: true,
              title: 'Edit Profile',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
            }}
          />
          <RootStack.Screen 
            name="Connections" 
            component={ConnectionsScreen}
            options={{ 
              headerShown: true,
              title: 'Connections',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
            }}
          />
          <RootStack.Screen 
            name="HostApplication" 
            component={HostApplicationScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="HostDashboard" 
            component={HostDashboardScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="UserProfileView" 
            component={UserProfileViewScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="CreateEvent" 
            component={CreateEventScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="AttendeesList" 
            component={AttendeesListScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="EventPhotoDashboard" 
            component={EventPhotoDashboard}
            options={{ 
              headerShown: false,
            }}  
          />
          <RootStack.Screen 
            name="ChatList" 
            component={ChatListScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="FindPeople" 
            component={FindPeopleScreen}
            options={{ 
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Registration" component={RegistrationScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}