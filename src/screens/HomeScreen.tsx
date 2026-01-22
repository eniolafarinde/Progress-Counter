import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Event } from '../models/Event';
import { Tag } from '../models/Tag';
import { EventsCard } from '../components/EventsCard';
import { getAllEvents, deleteEvent, saveEvent } from '../storage/db';
import { getAllTags } from '../storage/db';
import { useRouter } from 'expo-router';

export function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [loadedEvents, loadedTags] = await Promise.all([
        getAllEvents(),
        getAllTags(),
      ]);
      setEvents(loadedEvents);
      setTags(loadedTags);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '/event-detail',
      params: { eventId: event.id },
    });
  };

  const handleToggleTimer = async (event: Event) => {
    const updatedEvent = {
      ...event,
      isRunning: !event.isRunning,
      referenceDate: event.isRunning
        ? event.referenceDate
        : new Date().toISOString(),
    };
    await saveEvent(updatedEvent);
    await loadData();
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <EventsCard
      event={item}
      tags={tags}
      onPress={() => handleEventPress(item)}
      onToggleTimer={() => handleToggleTimer(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Counter</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-event')}
        >
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "Add Event" to create your first event
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#11181C',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#687076',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9BA1A6',
    textAlign: 'center',
  },
});

