import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { teacherService } from '../../services/teacherService';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GlassCard } from '../../components/teacher/GlassCard';
import { StatCard } from '../../components/teacher/StatCard';
import { QuickActionCard } from '../../components/teacher/QuickActionCard';
import { DashboardHeader } from '../../components/teacher/DashboardHeader';
import tokens from '../../styles/tokens';

export function TeacherDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activities: 0,
    meals: 0,
    media: 0,
    monitoring: 'вЂ”',
  });

  // Bottom nav height + safe area + padding
  const BOTTOM_NAV_HEIGHT = 75;
  const bottomPadding = BOTTOM_NAV_HEIGHT + insets.bottom + 16;

  // Calculate card width for 2-column grid
  const screenWidth = Dimensions.get('window').width;
  const padding = tokens.space.lg * 2; // Left + right padding
  const gap = tokens.space.md;
  const cardWidth = (screenWidth - padding - gap) / 2;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load data like before: get parents, then count activities, meals, media
      const parentsRes = await teacherService.getParents().catch(() => []);
      const allParents = Array.isArray(parentsRes) ? parentsRes : [];
      const parents = user?.id ? allParents.filter((p) => p.teacherId === user.id) : allParents;
      const childIds = parents.flatMap((p) => Array.isArray(p.children) ? p.children.map(c => c.id) : []).filter(Boolean);

      // Fetch counts for activities, meals, media
      const fetchCount = async (path) => {
        try {
          if (childIds.length > 0) {
            const requests = childIds.map((id) =>
              api.get(`${path}?childId=${id}`).catch(() => ({ data: [] }))
            );
            const responses = await Promise.all(requests);
            return responses.reduce((acc, res) => {
              const data = res.data;
              if (Array.isArray(data)) return acc + data.length;
              if (Array.isArray(data?.activities)) return acc + data.activities.length;
              if (Array.isArray(data?.meals)) return acc + data.meals.length;
              if (Array.isArray(data?.media)) return acc + data.media.length;
              return acc;
            }, 0);
          }
          return 0;
        } catch (err) {
          console.warn(`[TeacherDashboard] Error fetching ${path}:`, err);
          return 0;
        }
      };

      const [activitiesCount, mealsCount, mediaCount] = await Promise.all([
        fetchCount('/activities'),
        fetchCount('/meals'),
        fetchCount('/media'),
      ]);

      setStats({
        activities: activitiesCount,
        meals: mealsCount,
        media: mediaCount,
        monitoring: 'вЂ”',
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid - 2x2 grid: Individual Plan, Meals, Media, Monitoring */}
        <View style={styles.statsGrid}>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="checkmark-circle"
              iconColor={tokens.colors.semantic.success}
              iconBg={tokens.colors.semantic.successSoft}
              count={stats.activities}
              label={t('dashboard.individualPlan', { defaultValue: 'Individual Plan' })}
              onPress={() => navigation.navigate('Activities')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="close-circle"
              iconColor={tokens.colors.joy.sunflower}
              iconBg={tokens.colors.joy.sunflowerSoft}
              count={stats.meals}
              label={t('dashboard.meals', { defaultValue: 'Meals' })}
              onPress={() => navigation.navigate('Meals')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="images"
              iconColor={tokens.colors.joy.lavender}
              iconBg={tokens.colors.joy.lavenderSoft}
              count={stats.media}
              label={t('dashboard.media', { defaultValue: 'Media' })}
              onPress={() => navigation.navigate('Media')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="heart"
              iconColor={tokens.colors.joy.coral}
              iconBg={tokens.colors.joy.coralSoft}
              count={stats.monitoring}
              label={t('dashboard.monitoring', { defaultValue: 'Monitoring' })}
              onPress={() => navigation.navigate('MonitoringJournal')}
            />
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.quickActions', { defaultValue: 'Quick Actions' })}
          </Text>

          <QuickActionCard
            icon="checkmark-circle"
            iconColor={tokens.colors.semantic.success}
            iconBg={tokens.colors.semantic.successSoft}
            title={t('dashboard.updatePlan', { defaultValue: 'Update Individual Plan' })}
            subtitle={t('dashboard.updatePlanDesc', { defaultValue: 'Manage student goals and progress' })}
            onPress={() => navigation.navigate('Activities')}
          />

          <QuickActionCard
            icon="people"
            iconColor={tokens.colors.joy.lavender}
            iconBg={tokens.colors.joy.lavenderSoft}
            title={t('dashboard.contactParents', { defaultValue: 'Contact Parents' })}
            subtitle={t('dashboard.contactParentsDesc', { defaultValue: 'Send updates and messages' })}
            onPress={() => navigation.navigate('TeacherTabs', { screen: 'Parents' })}
          />

          <QuickActionCard
            icon="heart"
            iconColor={tokens.colors.joy.coral}
            iconBg={tokens.colors.joy.coralSoft}
            title={t('dashboard.healthMonitoring', { defaultValue: 'Health Monitoring' })}
            subtitle={t('dashboard.healthMonitoringDesc', { defaultValue: 'Track vitals and wellness' })}
            onPress={() => navigation.navigate('EmotionalMonitoring')}
          />
        </View>

        {/* Recent Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.recentUpdates', { defaultValue: 'Recent Updates' })}
          </Text>

          <GlassCard style={styles.updateCard}>
            <View style={styles.updateRow}>
              <View style={[styles.updateIcon, { backgroundColor: tokens.colors.semantic.successSoft }]}>
                <Ionicons name="checkmark-circle" size={20} color={tokens.colors.semantic.success} />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>
                  {t('dashboard.planUpdated', { defaultValue: 'Individual Plan Updated' })}
                </Text>
                <Text style={styles.updateDesc}>
                  {t('dashboard.planUpdatedDesc', {
                    defaultValue: 'Emma\'s speech therapy goals have been updated for this week.',
                  })}
                </Text>
                <Text style={styles.updateTime}>
                  {t('dashboard.timeAgo', { defaultValue: '1 hour ago' })}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.updateCard}>
            <View style={styles.updateRow}>
              <View style={[styles.updateIcon, { backgroundColor: tokens.colors.joy.lavenderSoft }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={tokens.colors.joy.lavender} />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>
                  {t('dashboard.parentMessage', { defaultValue: 'Parent Message' })}
                </Text>
                <Text style={styles.updateDesc}>
                  {t('dashboard.parentMessageDesc', {
                    defaultValue: 'Sarah Johnson asked about tomorrow\'s activities.',
                  })}
                </Text>
                <Text style={styles.updateTime}>
                  {t('dashboard.timeAgo3h', { defaultValue: '3 hours ago' })}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.space.lg,
  },

  // Stats Grid - 2x2 grid layout
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.md,
    marginBottom: tokens.space.xl,
    marginTop: tokens.space.md,
  },

  // Section
  section: {
    marginBottom: tokens.space.xl,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
    paddingHorizontal: 2,
  },

  // Update Cards
  updateCard: {
    marginBottom: tokens.space.sm,
  },
  updateRow: {
    flexDirection: 'row',
    gap: tokens.space.sm,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  updateDesc: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  updateTime: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
  },
});


