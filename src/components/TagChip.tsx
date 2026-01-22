import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tag } from '../models/Tag';

interface TagChipProps {
  tag: Tag;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function TagChip({ tag, onPress, size = 'medium' }: TagChipProps) {
  const sizeStyles = {
    small: { padding: 4, paddingHorizontal: 8, fontSize: 10 },
    medium: { padding: 6, paddingHorizontal: 12, fontSize: 12 },
    large: { padding: 8, paddingHorizontal: 16, fontSize: 14 },
  };

  const style = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        { backgroundColor: tag.color || '#007AFF' },
        { padding: style.padding, paddingHorizontal: style.paddingHorizontal },
      ]}
    >
      <Text style={[styles.text, { fontSize: style.fontSize }]}>{tag.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

