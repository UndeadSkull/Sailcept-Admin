import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  BoatAssetModal: { boatName: string };
  UserProfileModal: undefined;
};

export type MainTabParamList = {
  Overview: undefined;
  Availability: { selectBoat?: string } | undefined;
  Requests: undefined;
  Bookings: { focusGuest?: string; focusToken?: number } | undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  UserProfile: undefined;
  BoatProfilesList: undefined;
  BoatProfileDetail: { boatName: string };
  Reviews: undefined;
  Invoices: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type MoreStackScreenProps<T extends keyof MoreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MoreStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, "More">,
      NativeStackScreenProps<RootStackParamList>
    >
  >;
