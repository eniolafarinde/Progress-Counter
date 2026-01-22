import * as Notifications from 'expo-notifications';
import { Event } from '../models/Event';
import dayjs from 'dayjs';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleReminder(event: Event): Promise<string | null> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    if (event.type !== 'countdown') {
      throw new Error('Reminders only work for countdown events');
    }

    const targetDate = dayjs(event.referenceDate);
    const now = dayjs();

    if (targetDate.isBefore(now)) {
      throw new Error('Cannot set reminder for past events');
    }

    // Schedule reminder 15 minutes before the event
    const reminderDate = targetDate.subtract(15, 'minute');

    if (reminderDate.isBefore(now)) {
      // If reminder time has passed, schedule for 1 minute before
      const alternativeReminder = targetDate.subtract(1, 'minute');
      if (alternativeReminder.isBefore(now)) {
        throw new Error('Event is too soon to set a reminder');
      }
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${event.title}`,
        body: `Your event "${event.title}" is coming up!`,
        sound: true,
        data: { eventId: event.id },
      },
      trigger: reminderDate.toDate(),
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
}

export async function cancelReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling reminder:', error);
    // Don't throw - notification might not exist
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all reminders:', error);
  }
}

