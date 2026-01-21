import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import tokens from '../../styles/tokens';
import { ListRow } from '../common/ListRow';

export function ChildRow({ child, selected, onPress }) {
  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return `${age} years old`;
  };

  const initials = `${child.firstName?.charAt(0) || ''}${child.lastName?.charAt(0) || ''}`;
  const age = getAge(child.dateOfBirth);

  const avatar = (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );

  return (
    <ListRow
      title={`${child.firstName || ''} ${child.lastName || ''}`}
      subtitle={age}
      leading={avatar}
      onPress={onPress}
      selected={selected}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary[600],
  },
});
