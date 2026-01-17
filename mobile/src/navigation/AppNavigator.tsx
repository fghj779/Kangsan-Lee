/**
 * Main app navigation structure
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Tab Screens
import CommunityScreen from '../screens/community/CommunityScreen';
import BoardDetailScreen from '../screens/community/BoardDetailScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';

import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import CollectionScreen from '../screens/profile/CollectionScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Dark theme colors
const COLORS = {
  background: '#1a1a1a',
  card: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#888888',
  primary: '#00a8ff',
  border: '#333333',
};

function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="CommunityHome"
        component={CommunityScreen}
        options={{ title: 'Community Boards' }}
      />
      <Stack.Screen
        name="BoardDetail"
        component={BoardDetailScreen}
        options={{ title: 'Board' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Discussion' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'New Post' }}
      />
    </Stack.Navigator>
  );
}

function MarketplaceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="MarketplaceHome"
        component={MarketplaceScreen}
        options={{ title: 'Marketplace' }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Listing' }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ title: 'New Listing' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={{ title: 'My Collection' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shirt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
