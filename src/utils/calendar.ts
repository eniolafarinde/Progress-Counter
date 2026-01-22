import * as Calendar from 'expo-calendar';
import { Event } from '../models/Event';
import { Platform } from 'react-native';

let calendarId: string | null = null;

async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Calendar permission not granted');
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    
    if (calendars.length === 0) {
      console.warn('No calendars found');
      return null;
    }

    // Try to find a default calendar
    const defaultCalendar = calendars.find(
      (cal) => cal.allowsModifications && cal.source.name !== 'Holidays'
    );

    return defaultCalendar?.id || calendars[0].id;
  } catch (error) {
    console.error('Error getting calendar:', error);
    return null;
  }
}

export async function syncEventToCalendar(event: Event): Promise<string | null> {
  // If already synced, return existing ID
  if (event.calendarEventId) {
    return event.calendarEventId;
  }
  try {
    if (!calendarId) {
      calendarId = await getDefaultCalendarId();
    }

    if (!calendarId) {
      throw new Error('No calendar available');
    }

    const startDate = new Date(event.referenceDate);
    let endDate: Date;

    if (event.type === 'countdown') {
      // For countdown, set end date as the target date
      endDate = new Date(event.referenceDate);
      endDate.setHours(endDate.getHours() + 1); // 1 hour event
    } else if (event.type === 'time_since') {
      // For time since, create an all-day event starting from reference date
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      // For timer, create a 1-hour event
      endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
    }

    const calendarEventId = await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate,
      endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notes: `Progress Counter: ${event.type}`,
      alarms: event.type === 'countdown' ? [{ relativeOffset: -15 }] : undefined, // 15 min before
    });

    return calendarEventId;
  } catch (error) {
    console.error('Error syncing to calendar:', error);
    throw error;
  }
}

export async function removeEventFromCalendar(
  event: Event
): Promise<void> {
  try {
    if (event.calendarEventId) {
      // Use stored calendar event ID if available
      await Calendar.deleteEventAsync(event.calendarEventId);
      return;
    }

    // Fallback: search for events with matching title
    if (!calendarId) {
      calendarId = await getDefaultCalendarId();
    }

    if (!calendarId) {
      return;
    }

    const startDate = new Date(event.referenceDate);
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date(event.referenceDate);
    endDate.setDate(endDate.getDate() + 1);

    const events = await Calendar.getEventsAsync(
      [calendarId],
      startDate,
      endDate
    );

    const matchingEvent = events.find((e) => e.title === event.title);
    if (matchingEvent) {
      await Calendar.deleteEventAsync(matchingEvent.id);
    }
  } catch (error) {
    console.error('Error removing from calendar:', error);
    throw error;
  }
}

