/**
 * Main navigation component with bottom tabs
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { MainTabParamList, CommunityStackParamList, MarketplaceStackParamList, ProfileStackParamList } from './types';

// Import screens (will be created)
import BoardListScreen from '../screens/community/BoardListScreen';
import BoardDetailScreen from '../screens/community/BoardDetailScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';

import ListingListScreen from '../screens/marketplace/ListingListScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';
import OfferListScreen from '../screens/marketplace/OfferListScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import CollectionScreen from '../screens/profile/CollectionScreen';
import ReputationScreen from '../screens/profile/ReputationScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const CommunityStack = createStackNavigator<CommunityStackParamList>();
const MarketplaceStack = createStackNavigator<MarketplaceStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Community Stack Navigator
const CommunityNavigator = () => {
  const { theme } = useTheme();

  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <CommunityStack.Screen
        name="BoardList"
        component={BoardListScreen}
        options={{ title: 'Community Boards' }}
      />
      <CommunityStack.Screen
        name="BoardDetail"
        component={BoardDetailScreen}
        options={({ route }) => ({ title: route.params.boardName })}
      />
      <CommunityStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Discussion' }}
      />
      <CommunityStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
    </CommunityStack.Navigator>
  );
};

// Marketplace Stack Navigator
const MarketplaceNavigator = () => {
  const { theme } = useTheme();

  return (
    <MarketplaceStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <MarketplaceStack.Screen
        name="ListingList"
        component={ListingListScreen}
        options={{ title: 'Marketplace' }}
      />
      <MarketplaceStack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <MarketplaceStack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ title: 'Sell Jersey' }}
      />
      <MarketplaceStack.Screen
        name="OfferList"
        component={OfferListScreen}
        options={{ title: 'Offers' }}
      />
    </MarketplaceStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileNavigator = () => {
  const { theme } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="Collection"
        component={CollectionScreen}
        options={{ title: 'Collection' }}
      />
      <ProfileStack.Screen
        name="Reputation"
        component={ReputationScreen}
        options={{ title: 'Reputation' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Community"
        component={CommunityNavigator}
        options={{
          tabBarLabel: 'Community',
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{
          tabBarLabel: 'Marketplace',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
