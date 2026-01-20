import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ParentsListScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await parentService.getChildren();
      setChildren(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderChild = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('ChildProfile', { childId: item.id })}
    >
      <Card>
        <View style={styles.childContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
            </Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>
              {item.firstName} {item.lastName}
            </Text>
            {item.dateOfBirth && (
              <Text style={styles.childAge}>
                {new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear()} years old
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.Colors.text.tertiary} />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Children" />
      {children.length === 0 ? (
        <EmptyState icon="people-outline" message="No children found" />
      ) : (
        <FlatList
          data={children}
          renderItem={renderChild}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadChildren}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  list: {
    padding: theme.Spacing.md,
  },
  childContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  avatarText: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  childAge: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
});
