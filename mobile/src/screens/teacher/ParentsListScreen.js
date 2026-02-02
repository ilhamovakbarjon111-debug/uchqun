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
import tokens from '../../styles/tokens';

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
                    <Ionicons name="mail-outline" size={14} color={tokens.colors.text.secondary} />
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
                    <Ionicons name="call" size={16} color={tokens.colors.text.white} />
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
            <Ionicons name="chevron-forward" size={20} color={tokens.colors.text.secondary} />
          </View>

          {/* Children Section */}
          {item.children && item.children.length > 0 && (
            <View style={styles.childrenSection}>
              <View style={styles.childrenHeader}>
                <Ionicons name="people-outline" size={14} color={tokens.colors.text.secondary} />
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
            <Ionicons name="search" size={20} color={tokens.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('parentsPage.searchPlaceholder')}
              placeholderTextColor={tokens.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={tokens.colors.text.secondary} />
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
    marginHorizontal: tokens.space.md,
    marginTop: tokens.space.sm,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchGradient: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.md,
  },
  cardWrapper: {
    marginBottom: tokens.space.md,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.space.sm,
    gap: tokens.space.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
  },
  resultCount: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs,
    textAlign: 'right',
  },
  list: {
    padding: tokens.space.md,
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
    backgroundColor: tokens.colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  parentAvatarText: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.accent.blue,
  },
  parentContent: {
    flex: 1,
  },
  name: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  contactRow: {
    marginBottom: tokens.space.xs / 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.space.xs,
  },
  phoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: tokens.type.sub.fontSize,
    color: '#9333EA',
    fontWeight: tokens.typography.fontWeight.medium,
  },
  callButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: tokens.space.xs,
    gap: 4,
  },
  groupText: {
    fontSize: tokens.type.caption.fontSize,
    color: '#9333EA',
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  childrenSection: {
    marginTop: tokens.space.md,
    paddingTop: tokens.space.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  childrenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: tokens.space.sm,
  },
  childrenCount: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  childrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.xs,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  childChipText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  childClass: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
});
