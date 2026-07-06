import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  BoatAssetModal: { boatId: number };
  UserProfileModal: undefined;
  Notifications: undefined;
  BookingDetail: { bookingId: string };
  RequestDetail: { requestName: string; boatId: number };
};

export type MainTabParamList = {
  Overview: undefined;
  Availability: { selectBoatId?: number } | undefined;
  Requests: undefined;
  Bookings: { focusGuest?: string; focusToken?: number } | undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  UserProfile: undefined;
  BoatProfilesList: undefined;
  BoatProfileDetail: { boatId: number };
  Reviews: undefined;
  Invoices: undefined; // keep for compatibility
  Finance: undefined;
  Settings: undefined;
  Legal: undefined;
  GetHelp: undefined;
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
