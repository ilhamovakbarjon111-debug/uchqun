import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ParentsListScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getParents();
      // Service now returns array directly (handles special backend format internally)
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (parents.length === 0) {
    return <EmptyState message="No parents found" />;
  }

  const renderParent = ({ item }) => (
    <Pressable onPress={() => {
      try {
        navigation.navigate('ParentDetail', { parentId: item.id });
      } catch (error) {
        console.error('[TeacherParentsList] Navigation error:', error);
      }
    }}>
      <Card>
        <View style={styles.parentHeader}>
          <View style={styles.parentAvatar}>
            <Text style={styles.parentAvatarText}>
              {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
            </Text>
          </View>
          <View style={styles.parentContent}>
            <Text style={styles.name}>
              {item.firstName} {item.lastName}
            </Text>
            {item.email && (
              <View style={styles.emailContainer}>
                <Ionicons name="mail-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.email}>{item.email}</Text>
              </View>
            )}
            {item.children && item.children.length > 0 && (
              <View style={styles.childrenContainer}>
                <Ionicons name="people-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.children}>
                  {item.children.length} child{item.children.length > 1 ? 'ren' : ''}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.Colors.text.secondary} />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Parents" showBack={false} />
      {parents.length === 0 ? (
        <EmptyState icon="people-outline" message="No parents found" />
      ) : (
        <FlatList
          data={parents}
          renderItem={renderParent}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadParents}
          showsVerticalScrollIndicator={false}
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
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  parentAvatarText: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
  },
  parentContent: {
    flex: 1,
  },
  name: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.xs / 2,
  },
  email: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginLeft: theme.Spacing.xs / 2,
  },
  childrenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
  },
  children: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginLeft: theme.Spacing.xs / 2,
  },
});
