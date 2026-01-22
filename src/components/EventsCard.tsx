import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event, EventType } from '../models/Event';
import { getTimeDifference } from '../utils/time';
import { TagChip } from './TagChip';
import { Tag } from '../models/Tag';
import dayjs from 'dayjs';

interface EventsCardProps {
  event: Event;
  tags: Tag[];
  onPress: () => void;
  onToggleTimer?: () => void;
}

export function EventsCard({ event, tags, onPress, onToggleTimer }: EventsCardProps) {
  const [timeDisplay, setTimeDisplay] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      if (event.type === 'timer' && event.isRunning) {
        // Timer counts up from reference date
        const startTime = dayjs(event.referenceDate);
        const now = dayjs();
        const diff = now.diff(startTime);
        const duration = dayjs.duration(diff);
        
        setTimeDisplay({
          days: Math.floor(duration.asDays()),
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: duration.seconds(),
        });
      } else {
        const diff = getTimeDifference(event.referenceDate, event.type);
        const now = dayjs();
        const target = dayjs(event.referenceDate);
        
        if (event.type === 'countdown') {
          setIsPast(target.isBefore(now));
          const totalSeconds = Math.floor(target.diff(now, 'second'));
          setTimeDisplay({
            days: diff.days,
            hours: diff.hours,
            minutes: diff.minutes,
            seconds: Math.abs(totalSeconds % 60),
          });
        } else {
          // time_since
          const totalSeconds = Math.floor(now.diff(target, 'second'));
          setTimeDisplay({
            days: diff.days,
            hours: diff.hours,
            minutes: diff.minutes,
            seconds: totalSeconds % 60,
          });
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [event.referenceDate, event.type, event.isRunning]);

  const formatTime = () => {
    if (event.type === 'countdown' && isPast) {
      return 'Event passed';
    }
    
    const parts: string[] = [];
    if (timeDisplay.days > 0) {
      parts.push(`${timeDisplay.days}d`);
    }
    if (timeDisplay.hours > 0 || timeDisplay.days > 0) {
      parts.push(`${timeDisplay.hours}h`);
    }
    if (timeDisplay.minutes > 0 || timeDisplay.hours > 0 || timeDisplay.days > 0) {
      parts.push(`${timeDisplay.minutes}m`);
    }
    if (event.type === 'timer' || event.type === 'countdown') {
      parts.push(`${timeDisplay.seconds}s`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'countdown':
        return isPast ? 'Past Event' : 'Countdown';
      case 'time_since':
        return 'Time Since';
      case 'timer':
        return event.isRunning ? 'Timer (Running)' : 'Timer (Paused)';
      default:
        return event.type;
    }
  };

  const eventTags = event.tags
    ? tags.filter(tag => event.tags?.includes(tag.id))
    : [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={[styles.typeBadge, { backgroundColor: event.color || '#007AFF' }]}>
          <Text style={styles.typeText}>{getTypeLabel()}</Text>
        </View>
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime()}</Text>
      </View>

      {event.type === 'timer' && (
        <TouchableOpacity
          style={[styles.timerButton, event.isRunning && styles.timerButtonActive]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleTimer?.();
          }}
        >
          <Text style={styles.timerButtonText}>
            {event.isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
      )}

      {eventTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {eventTags.map(tag => (
            <TagChip key={tag.id} tag={tag} size="small" />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  timerButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  timerButtonActive: {
    backgroundColor: '#FF3B30',
  },
  timerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});

