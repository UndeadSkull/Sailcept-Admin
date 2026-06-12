export type NotificationType =
  | "new_request"
  | "change_of_dates"
  | "cancellation"
  | "extra_added"
  | "booking_changes"
  | "reviews";

export type NotificationTimeGroup = "Today" | "Yesterday" | "Earlier";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  timeGroup: NotificationTimeGroup;
  read: boolean;
  targetScreen: "Requests" | "Bookings" | "Reviews" | "More";
  targetParams?: Record<string, unknown>;
  outcome?: "accepted" | "rejected";
};
