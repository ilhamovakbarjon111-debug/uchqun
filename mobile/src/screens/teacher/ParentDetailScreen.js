import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ParentDetailScreen() {
  const route = useRoute();
  const { t } = useTranslation();
  const { parentId = null } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);

  if (!parentId) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('parentsPage.parentDetail') || 'Parent Detail'} />
        <View style={styles.content}>
          <Card>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.Colors.status.error} />
              <Text style={styles.errorText}>Missing parentId parameter</Text>
            </View>
          </Card>
        </View>
      </View>
    );
  }

  useEffect(() => {
    if (parentId) {
      loadParent();
    }
  }, [parentId]);

  const loadParent = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getParentById(parentId);
      setParent(data);
    } catch (error) {
      console.error('Error loading parent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!parent) {
    return <EmptyState message={t('parentsPage.notFound') || 'Parent not found'} />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={`${parent.firstName ?? '—'} ${parent.lastName ?? ''}`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {parent.firstName?.charAt(0)}
                {parent.lastName?.charAt(0)}
              </Text>
            </View>
            {parent.group && (
              <View style={styles.groupBadge}>
                <Ionicons name="school-outline" size={14} color={theme.Colors.primary.blue} />
                <Text style={styles.groupBadgeText}>{parent.group.name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>{t('parentsPage.parentInfo') || 'Parent Information'}</Text>

          {/* Name */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={18} color={theme.Colors.text.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>{t('parentsPage.name') || 'Name'}</Text>
              <Text style={styles.value}>
                {parent.firstName ?? '—'} {parent.lastName ?? ''}
              </Text>
            </View>
          </View>

          {/* Email */}
          {parent.email && (
            <TouchableOpacity style={styles.infoRow} onPress={() => handleEmail(parent.email)}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={18} color={theme.Colors.primary.blue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>{t('parentsPage.email') || 'Email'}</Text>
                <Text style={[styles.value, styles.linkValue]}>{parent.email}</Text>
              </View>
              <View style={styles.actionButton}>
                <Ionicons name="send-outline" size={16} color={theme.Colors.primary.blue} />
              </View>
            </TouchableOpacity>
          )}

          {/* Phone */}
          {parent.phone && (
            <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(parent.phone)}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={18} color={theme.Colors.status.success} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>{t('parentsPage.phone') || 'Phone'}</Text>
                <Text style={[styles.value, styles.phoneValue]}>{parent.phone}</Text>
              </View>
              <View style={[styles.actionButton, styles.callActionButton]}>
                <Ionicons name="call" size={16} color={theme.Colors.text.inverse} />
              </View>
            </TouchableOpacity>
          )}

          {/* Address */}
          {parent.address && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={18} color={theme.Colors.text.secondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>{t('parentsPage.address') || 'Address'}</Text>
                <Text style={styles.value}>{parent.address}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Children Card */}
        {parent.children && Array.isArray(parent.children) && parent.children.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color={theme.Colors.primary.blue} />
              <Text style={styles.sectionTitle}>{t('parentsPage.children') || 'Children'}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{parent.children.length}</Text>
              </View>
            </View>

            {parent.children.map((child, index) => (
              <View
                key={child?.id || index}
                style={[styles.childItem, index < parent.children.length - 1 && styles.childItemBorder]}
              >
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.firstName?.charAt(0)}
                    {child.lastName?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.childContent}>
                  <Text style={styles.childName}>
                    {child.firstName ?? '—'} {child.lastName ?? ''}
                  </Text>

                  {/* Child Details Grid */}
                  <View style={styles.childDetails}>
                    {child.dateOfBirth && (
                      <View style={styles.childDetailItem}>
                        <Ionicons name="calendar-outline" size={12} color={theme.Colors.text.secondary} />
                        <Text style={styles.childDetailText}>
                          {new Date(child.dateOfBirth).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {child.gender && (
                      <View style={styles.childDetailItem}>
                        <Ionicons
                          name={child.gender === 'male' ? 'male-outline' : 'female-outline'}
                          size={12}
                          color={theme.Colors.text.secondary}
                        />
                        <Text style={styles.childDetailText}>{child.gender}</Text>
                      </View>
                    )}

                    {child.school && (
                      <View style={styles.childDetailItem}>
                        <Ionicons name="school-outline" size={12} color={theme.Colors.text.secondary} />
                        <Text style={styles.childDetailText}>{child.school}</Text>
                      </View>
                    )}

                    {child.class && (
                      <View style={styles.childDetailItem}>
                        <Ionicons name="book-outline" size={12} color={theme.Colors.text.secondary} />
                        <Text style={styles.childDetailText}>{child.class}</Text>
                      </View>
                    )}

                    {child.teacher && (
                      <View style={styles.childDetailItem}>
                        <Ionicons name="person-outline" size={12} color={theme.Colors.text.secondary} />
                        <Text style={styles.childDetailText}>{child.teacher}</Text>
                      </View>
                    )}
                  </View>

                  {/* Disability Type */}
                  {child.disabilityType && (
                    <View style={styles.disabilityBadge}>
                      <Ionicons
                        name="medical-outline"
                        size={12}
                        color={theme.Colors.status.warning}
                      />
                      <Text style={styles.disabilityText}>{child.disabilityType}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  content: {
    padding: theme.Spacing.md,
  },
  errorContainer: {
    padding: theme.Spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    marginTop: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.primary.blueBg,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: theme.Spacing.sm,
    gap: 6,
  },
  groupBadgeText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.primary.blue,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
    gap: theme.Spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    flex: 1,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.inverse,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    fontWeight: theme.Typography.weights.medium,
  },
  linkValue: {
    color: theme.Colors.primary.blue,
  },
  phoneValue: {
    color: theme.Colors.status.success,
    fontWeight: theme.Typography.weights.semibold,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callActionButton: {
    backgroundColor: theme.Colors.status.success,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.Spacing.md,
  },
  childItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  childAvatarText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  childContent: {
    flex: 1,
  },
  childName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  childDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.sm,
  },
  childDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childDetailText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  disabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.status.warning + '15',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: theme.Spacing.sm,
    gap: 4,
  },
  disabilityText: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.status.warning,
    fontWeight: theme.Typography.weights.semibold,
  },
  bottomSpacer: {
    height: 100,
  },
});
