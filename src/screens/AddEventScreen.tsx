import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { TagChip } from '../components/TagChip';
import { Event, EventType } from '../models/Event';
import { Tag } from '../models/Tag';
import { getAllTags, saveEvent, saveTag } from '../storage/db';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Countdown', value: 'countdown' },
  { label: 'Time Since', value: 'time_since' },
  { label: 'Timer', value: 'timer' },
];

const DEFAULT_COLORS = [
  '#007AFF',
  '#FF3B30',
  '#34C759',
  '#FF9500',
  '#AF52DE',
  '#5856D6',
  '#FF2D55',
];

export function AddEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('countdown');
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  useEffect(() => {
    loadTags();
    // Initialize date/time inputs
    const date = new Date(referenceDate);
    setDateInput(date.toISOString().split('T')[0]);
    setTimeInput(date.toTimeString().slice(0, 5));
  }, []);

  const loadTags = async () => {
    const tags = await getAllTags();
    setAvailableTags(tags);
  };

  const handleDateInputChange = (text: string) => {
    // Allow only numbers and dashes, format: YYYY-MM-DD
    const formatted = text.replace(/[^\d-]/g, '');
    setDateInput(formatted);
    
    if (formatted.length === 10) {
      const [year, month, day] = formatted.split('-').map(Number);
      if (year && month && day && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const newDate = new Date(referenceDate);
        newDate.setFullYear(year, month - 1, day);
        setReferenceDate(newDate);
      }
    }
  };

  const handleTimeInputChange = (text: string) => {
    // Allow only numbers and colons, format: HH:MM
    const formatted = text.replace(/[^\d:]/g, '');
    setTimeInput(formatted);
    
    if (formatted.length === 5) {
      const [hours, minutes] = formatted.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const newDate = new Date(referenceDate);
        newDate.setHours(hours, minutes);
        setReferenceDate(newDate);
      }
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Tag name cannot be empty');
      return;
    }

    const newTag: Tag = {
      id: uuidv4(),
      name: newTagName.trim(),
      color: selectedColor,
    };

    await saveTag(newTag);
    await loadTags();
    setSelectedTags((prev) => [...prev, newTag.id]);
    setNewTagName('');
    setShowNewTagInput(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const newEvent: Event = {
      id: uuidv4(),
      title: title.trim(),
      type: eventType,
      referenceDate: referenceDate.toISOString(),
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      color: selectedColor,
      isRunning: eventType === 'timer' ? false : undefined,
    };

    try {
      await saveEvent(newEvent);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save event');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
          placeholderTextColor="#9BA1A6"
        />

        <Text style={styles.label}>Event Type</Text>
        <View style={styles.typeContainer}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                eventType === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setEventType(type.value)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  eventType === type.value && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>
          {eventType === 'countdown'
            ? 'Target Date & Time'
            : eventType === 'time_since'
            ? 'Start Date & Time'
            : 'Start Date & Time'}
        </Text>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateTimeLabel}>Date:</Text>
            <TextInput
              style={styles.dateTimeInput}
              value={dateInput}
              onChangeText={handleDateInputChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9BA1A6"
            />
          </View>
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateTimeLabel}>Time:</Text>
            <TextInput
              style={styles.dateTimeInput}
              value={timeInput}
              onChangeText={handleTimeInputChange}
              placeholder="HH:MM"
              placeholderTextColor="#9BA1A6"
            />
          </View>
          <Text style={styles.datePreview}>
            Selected: {referenceDate.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorContainer}>
          {DEFAULT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.colorButtonSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
            >
              <TagChip
                tag={tag}
                size="medium"
              />
            </TouchableOpacity>
          ))}
        </View>

        {showNewTagInput ? (
          <View style={styles.newTagContainer}>
            <TextInput
              style={styles.tagInput}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="Tag name"
              placeholderTextColor="#9BA1A6"
            />
            <View style={styles.colorContainer}>
              {DEFAULT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.newTagActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewTagInput(false);
                  setNewTagName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createTagButton}
                onPress={createNewTag}
              >
                <Text style={styles.createTagButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => setShowNewTagInput(true)}
          >
            <Text style={styles.addTagButtonText}>+ New Tag</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#F5F5F5',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  typeButtonTextActive: {
    color: '#007AFF',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#11181C',
  },
  doneButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#11181C',
    transform: [{ scale: 1.2 }],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  newTagContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  newTagActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addTagButton: {
    marginTop: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#687076',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  createTagButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createTagButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  dateTimeContainer: {
    marginTop: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    width: 60,
  },
  dateTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#F5F5F5',
  },
  datePreview: {
    marginTop: 8,
    fontSize: 12,
    color: '#687076',
    fontStyle: 'italic',
  },
});

