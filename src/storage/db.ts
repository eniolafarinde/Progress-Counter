import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../models/Event';
import { Tag } from '../models/Tag';

const EVENTS_KEY = '@progress_counter:events';
const TAGS_KEY = '@progress_counter:tags';

export async function getAllEvents(): Promise<Event[]> {
  try {
    const data = await AsyncStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

export async function saveEvent(event: Event): Promise<void> {
  try {
    const events = await getAllEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const events = await getAllEvents();
    const filtered = events.filter(e => e.id !== eventId);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const data = await AsyncStorage.getItem(TAGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
}

export async function saveTag(tag: Tag): Promise<void> {
  try {
    const tags = await getAllTags();
    const existingIndex = tags.findIndex(t => t.id === tag.id);
    
    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }
    
    await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  try {
    const tags = await getAllTags();
    const filtered = tags.filter(t => t.id !== tagId);
    await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
}

