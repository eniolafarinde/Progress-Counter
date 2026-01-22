export type EventType = "countdown" | "time_since" | "timer";

export interface Event {
  id: string;
  title: string;
  type: EventType;
  referenceDate: string; // ISO string
  isRunning?: boolean;
  tags?: string[];
  color?: string;
  calendarEventId?: string; // ID of synced calendar event
  reminderNotificationId?: string; // ID of scheduled notification
}