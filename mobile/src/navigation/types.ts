/**
 * Navigation types for the app
 */
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Community Stack
export type CommunityStackParamList = {
  BoardList: undefined;
  BoardDetail: { boardId: number; boardName: string };
  PostDetail: { postId: number };
  CreatePost: { boardId: number };
};

// Marketplace Stack
export type MarketplaceStackParamList = {
  ListingList: undefined;
  ListingDetail: { listingId: number };
  CreateListing: undefined;
  OfferList: { listingId: number };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: { userId?: number };
  EditProfile: undefined;
  Collection: { userId: number };
  Reputation: { userId: number };
  Settings: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Community: NavigatorScreenParams<CommunityStackParamList>;
  Marketplace: NavigatorScreenParams<MarketplaceStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
