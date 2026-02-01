import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ParentsListScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getParents();
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter parents by search query
  const filteredParents = useMemo(() => {
    if (!searchQuery.trim()) {
      return parents;
    }
    const query = searchQuery.toLowerCase();
    return parents.filter((parent) => {
      const fullName = `${parent.firstName || ''} ${parent.lastName || ''}`.toLowerCase();
      const email = (parent.email || '').toLowerCase();
      const phone = (parent.phone || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [parents, searchQuery]);

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderParent = ({ item }) => (
    <Pressable
      onPress={() => {
        try {
          navigation.navigate('ParentDetail', { parentId: item.id });
        } catch (error) {
          console.error('[TeacherParentsList] Navigation error:', error);
        }
      }}
    >
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.parentHeader}>
            <View style={styles.parentAvatar}>
              <Text style={styles.parentAvatarText}>
                {item.firstName?.charAt(0)}
                {item.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.parentContent}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>

              {/* Contact Info Row */}
              <View style={styles.contactRow}>
                {item.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={14} color={theme.Colors.text.secondary} />
                    <Text style={styles.contactText} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                )}
              </View>

              {/* Phone Number */}
              {item.phone && (
                <View style={styles.phoneRow}>
                  <View style={styles.phoneItem}>
                    <Ionicons name="call-outline" size={14} color="#9333EA" />
                    <Text style={styles.phoneText}>{item.phone}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(item.phone)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="call" size={16} color={theme.Colors.text.inverse} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Group Badge */}
              {item.group && (
                <View style={styles.groupBadge}>
                  <Ionicons name="school-outline" size={12} color="#9333EA" />
                  <Text style={styles.groupText}>{item.group.name}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.Colors.text.secondary} />
          </View>

          {/* Children Section */}
          {item.children && item.children.length > 0 && (
            <View style={styles.childrenSection}>
              <View style={styles.childrenHeader}>
                <Ionicons name="people-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.childrenCount}>
                  {t('parentsPage.children', { count: item.children.length })}
                </Text>
              </View>
              <View style={styles.childrenList}>
                {item.children.map((child, index) => (
                  <View key={child.id || index} style={styles.childChip}>
                    <Text style={styles.childChipText}>
                      {child.firstName} {child.lastName?.charAt(0)}.
                    </Text>
                    {child.class && (
                      <Text style={styles.childClass}>({child.class})</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333EA', '#7C3AED', '#6D28D9']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScreenHeader title={t('parentsPage.title')} showBack={false} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
          style={styles.searchGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={theme.Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('parentsPage.searchPlaceholder')}
              placeholderTextColor={theme.Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultCount}>
            {filteredParents.length} {t('parentsPage.results')}
          </Text>
        </LinearGradient>
      </View>

      {filteredParents.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={
            searchQuery
              ? t('parentsPage.noSearchResults')
              : t('parentsPage.noParentsFound')
          }
        />
      ) : (
        <FlatList
          data={filteredParents}
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
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  searchContainer: {
    marginHorizontal: theme.Spacing.md,
    marginTop: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchGradient: {
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
  },
  cardWrapper: {
    marginBottom: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.sm,
    paddingHorizontal: theme.Spacing.sm,
    gap: theme.Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
  },
  resultCount: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.xs,
    textAlign: 'right',
  },
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  contactRow: {
    marginBottom: theme.Spacing.xs / 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.Spacing.xs,
  },
  phoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: theme.Typography.sizes.sm,
    color: '#9333EA',
    fontWeight: theme.Typography.weights.medium,
  },
  callButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.Colors.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: theme.Spacing.xs,
    gap: 4,
  },
  groupText: {
    fontSize: theme.Typography.sizes.xs,
    color: '#9333EA',
    fontWeight: theme.Typography.weights.semibold,
  },
  childrenSection: {
    marginTop: theme.Spacing.md,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
  },
  childrenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.Spacing.sm,
  },
  childrenCount: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    fontWeight: theme.Typography.weights.medium,
  },
  childrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.xs,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.secondary,
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  childChipText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.primary,
    fontWeight: theme.Typography.weights.medium,
  },
  childClass: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.secondary,
  },
});
