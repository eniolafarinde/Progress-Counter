import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Event } from '../models/Event';
import { Tag } from '../models/Tag';
import { getAllEvents, saveEvent, deleteEvent } from '../storage/db';
import { getAllTags } from '../storage/db';
import { EventsCard } from '../components/EventsCard';
import { syncEventToCalendar, removeEventFromCalendar } from '../utils/calendar';
import { scheduleReminder, cancelReminder } from '../utils/notifications';

export function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const events = await getAllEvents();
      const foundEvent = events.find((e) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }

      const loadedTags = await getAllTags();
      setTags(loadedTags);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event');
    }
  };

  const isSynced = event?.calendarEventId !== undefined;

  const handleToggleTimer = async () => {
    if (!event) return;

    const updatedEvent: Event = {
      ...event,
      isRunning: !event.isRunning,
      referenceDate: event.isRunning
        ? event.referenceDate
        : new Date().toISOString(),
    };

    try {
      await saveEvent(updatedEvent);
      setEvent(updatedEvent);
    } catch (error) {
      Alert.alert('Error', 'Failed to update timer');
    }
  };

  const handleSyncCalendar = async () => {
    if (!event) return;

    try {
      if (isSynced) {
        await removeEventFromCalendar(event);
        const updatedEvent = { ...event, calendarEventId: undefined };
        await saveEvent(updatedEvent);
        setEvent(updatedEvent);
        Alert.alert('Success', 'Event removed from calendar');
      } else {
        const calendarEventId = await syncEventToCalendar(event);
        if (calendarEventId) {
          const updatedEvent = { ...event, calendarEventId };
          await saveEvent(updatedEvent);
          setEvent(updatedEvent);
          Alert.alert('Success', 'Event synced to calendar');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync with calendar');
      console.error(error);
    }
  };

  const handleSetReminder = async () => {
    if (!event) return;

    try {
      if (event.type === 'countdown') {
        const notificationId = await scheduleReminder(event);
        if (notificationId) {
          const updatedEvent = { ...event, reminderNotificationId: notificationId };
          await saveEvent(updatedEvent);
          setEvent(updatedEvent);
          Alert.alert('Success', 'Reminder scheduled');
        }
      } else {
        Alert.alert('Info', 'Reminders are only available for countdown events');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set reminder');
      console.error(error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (event!.calendarEventId) {
                await removeEventFromCalendar(event!);
              }
              if (event!.reminderNotificationId) {
                await cancelReminder(event!.reminderNotificationId);
              }
              await deleteEvent(event!.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <EventsCard
          event={event}
          tags={tags}
          onPress={() => {}}
          onToggleTimer={handleToggleTimer}
        />

        <View style={styles.actionsContainer}>
          {event.type === 'timer' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleTimer}
            >
              <Text style={styles.actionButtonText}>
                {event.isRunning ? 'Pause Timer' : 'Start Timer'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSyncCalendar}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.secondaryButtonText,
              ]}
            >
              {isSynced ? 'Remove from Calendar' : 'Sync to Calendar'}
            </Text>
          </TouchableOpacity>

          {event.type === 'countdown' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleSetReminder}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.secondaryButtonText,
                ]}
              >
                Set Reminder
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDelete}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.dangerButtonText,
              ]}
            >
              Delete Event
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#11181C',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
});

