import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import DecorativeBackground from '../../components/common/DecorativeBackground';
import theme from '../../styles/theme';

export function ParentDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // CRITICAL FIX: Wrap each API call in try-catch to prevent crashes
      // Use Promise.allSettled instead of Promise.all to handle individual failures
      const results = await Promise.allSettled([
        parentService.getChildren().catch((e) => {
          console.error('[ParentDashboard] Error loading children:', e);
          return [];
        }),
        parentService.getActivities().catch((e) => {
          console.error('[ParentDashboard] Error loading activities:', e);
          return [];
        }),
        parentService.getMeals().catch((e) => {
          console.error('[ParentDashboard] Error loading meals:', e);
          return [];
        }),
        parentService.getMedia().catch((e) => {
          console.error('[ParentDashboard] Error loading media:', e);
          return [];
        }),
        parentService.getMessages().catch((e) => {
          console.error('[ParentDashboard] Error loading messages/notifications:', e);
          return [];
        }),
      ]);

      // Extract data from settled promises
      const childrenData = results[0].status === 'fulfilled' ? results[0].value : [];
      const activitiesData = results[1].status === 'fulfilled' ? results[1].value : [];
      const mealsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const mediaData = results[3].status === 'fulfilled' ? results[3].value : [];
      const notificationsData = results[4].status === 'fulfilled' ? results[4].value : [];

      setChildren(Array.isArray(childrenData) ? childrenData : []);
      if (Array.isArray(childrenData) && childrenData.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenData[0].id);
      }

      const activities = Array.isArray(activitiesData) ? activitiesData : [];
      const meals = Array.isArray(mealsData) ? mealsData : [];
      const media = Array.isArray(mediaData) ? mediaData : [];

      setStats({
        activities: activities.length,
        meals: meals.length,
        media: media.length,
        notifications: Array.isArray(notificationsData) ? notificationsData.length : 0,
      });
    } catch (error) {
      console.error('[ParentDashboard] Fatal error loading dashboard:', error);
      // Set safe defaults on error
      setChildren([]);
      setStats({
        activities: 0,
        meals: 0,
        media: 0,
        notifications: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calculate progress (example: based on activities viewed)
  const totalItems = (stats?.activities || 0) + (stats?.meals || 0) + (stats?.media || 0);
  const progressPercentage = totalItems > 0 ? Math.min(Math.round((totalItems / 50) * 100), 100) : 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const statCards = [
    {
      title: t('dashboard.activities'),
      value: stats?.activities || 0,
      icon: 'checkmark-circle',
      color: theme.Colors.cards.activities,
      onPress: () => navigation.navigate('Activities'),
    },
    {
      title: t('dashboard.meals'),
      value: stats?.meals || 0,
      icon: 'restaurant',
      color: theme.Colors.cards.meals,
      onPress: () => navigation.navigate('Meals'),
    },
    {
      title: t('dashboard.media'),
      value: stats?.media || 0,
      icon: 'images',
      color: theme.Colors.cards.media,
      onPress: () => navigation.navigate('Media'),
    },
  ];

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.placeholder} />
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={theme.Colors.text.inverse} />
                {stats?.notifications > 0 && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.nameText}>
            {user?.firstName || ''} {user?.lastName || ''}
          </Text>
          <View style={styles.motivationalContainer}>
            <Text style={styles.motivationalText}>
              {t('dashboard.motivationalMessage')} ☀️
            </Text>
          </View>
        </View>

        {/* Stats Cards Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
          <View style={styles.statsContainer}>
            {statCards.map((stat, index) => (
              <Pressable 
                key={index} 
                onPress={stat.onPress} 
                style={[styles.statCard, { backgroundColor: stat.color }]}
              >
                <Ionicons name={stat.icon} size={28} color={theme.Colors.text.inverse} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Child Selector */}
        {children.length > 0 && (
          <View style={styles.childrenSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.myChildren')}</Text>
            <View style={styles.childrenList}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childCard,
                    selectedChildId === child.id && styles.childCardActive,
                  ]}
                  onPress={() => {
                    setSelectedChildId(child.id);
                    navigation.navigate('ChildProfile', { childId: child.id });
                  }}
                >
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.firstName} {child.lastName}
                    </Text>
                    {child.dateOfBirth && (
                      <Text style={styles.childAge}>
                        {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years old
                      </Text>
                    )}
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={theme.Colors.text.secondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate('AIChat')}
            >
              <Ionicons name="chatbubble-ellipses" size={28} color={theme.Colors.primary.blue} />
              <Text style={styles.actionText}>AI Assistant</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={28} color={theme.Colors.status.warning} />
              <Text style={styles.actionText}>Notifications</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate('TeacherRating')}
            >
              <Ionicons name="star" size={28} color={theme.Colors.status.warning} />
              <Text style={styles.actionText}>Rate Teacher</Text>
            </Pressable>
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate('SchoolRating')}
            >
              <Ionicons name="school" size={28} color={theme.Colors.primary.blue} />
              <Text style={styles.actionText}>Rate School</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Och ko'k background
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingBottom: theme.Spacing.xl,
  },
  // Header Styles
  header: {
    backgroundColor: theme.Colors.primary.blue,
    paddingTop: 50,
    paddingBottom: theme.Spacing.lg,
    paddingHorizontal: theme.Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  placeholder: {
    width: 40,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  notificationButton: {
    padding: theme.Spacing.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.Colors.status.warning,
  },
  greetingText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.inverse,
    opacity: 0.9,
    marginBottom: theme.Spacing.xs,
  },
  nameText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.inverse,
    marginBottom: theme.Spacing.sm,
  },
  motivationalContainer: {
    marginTop: theme.Spacing.sm,
  },
  motivationalText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.inverse,
    opacity: 0.9,
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: theme.Spacing.md,
    paddingTop: theme.Spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.md,
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.Spacing.md,
    gap: theme.Spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
    ...theme.Colors.shadow.md,
  },
  statValue: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.inverse,
    marginTop: theme.Spacing.sm,
  },
  statTitle: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.inverse,
    marginTop: theme.Spacing.xs,
    opacity: 0.95,
  },
  // Children Section
  childrenSection: {
    paddingHorizontal: theme.Spacing.md,
    paddingTop: theme.Spacing.lg,
    marginTop: theme.Spacing.md,
  },
  childrenList: {
    gap: theme.Spacing.sm,
    marginTop: theme.Spacing.md,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    ...theme.Colors.shadow.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childCardActive: {
    borderColor: theme.Colors.primary.blue,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  childAvatarText: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
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
  // Actions Section
  actionsSection: {
    paddingHorizontal: theme.Spacing.md,
    paddingTop: theme.Spacing.lg,
    marginTop: theme.Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.md,
    marginTop: theme.Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...theme.Colors.shadow.sm,
  },
  actionText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.primary,
    marginTop: theme.Spacing.sm,
    textAlign: 'center',
  },
});
