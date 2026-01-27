import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { api } from '../../services/api';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function TherapyScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [selectedTherapy, setSelectedTherapy] = useState(null);

  useEffect(() => {
    // Get first child as selected child
    const loadChildren = async () => {
      try {
        const children = await parentService.getChildren();
        if (Array.isArray(children) && children.length > 0) {
          setSelectedChildId(children[0].id);
        }
      } catch (error) {
        console.error('Error loading children:', error);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadTherapies();
    }
  }, [filter, selectedChildId]);

  const loadTherapies = async () => {
    try {
      setLoading(true);
      const params = { isActive: true };
      if (filter !== 'all') {
        params.therapyType = filter;
      }
      const response = await api.get('/therapy', { params });
      const therapiesData = response.data?.data?.therapies || response.data?.data || response.data?.therapies || [];
      setTherapies(Array.isArray(therapiesData) ? therapiesData : []);
    } catch (error) {
      console.error('Error loading therapies:', error);
      setTherapies([]);
    } finally {
      setLoading(false);
    }
  };

  const startTherapy = async (therapyId) => {
    try {
      const response = await api.post(`/therapy/${therapyId}/start`, {
        childId: selectedChildId || null,
      });
      setActiveSession(response.data?.data);
      setSelectedTherapy(therapies.find(t => t.id === therapyId));
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('therapy.started', { defaultValue: 'Therapy session started' }));
    } catch (error) {
      console.error('Error starting therapy:', error);
      Alert.alert(t('common.error', { defaultValue: 'Error' }), error.response?.data?.error || t('therapy.startError', { defaultValue: 'Failed to start therapy' }));
    }
  };

  const endTherapy = async (sessionId) => {
    try {
      await api.put(`/therapy/usage/${sessionId}/end`);
      setActiveSession(null);
      setSelectedTherapy(null);
      loadTherapies();
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('therapy.ended', { defaultValue: 'Therapy session ended' }));
    } catch (error) {
      console.error('Error ending therapy:', error);
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('therapy.endError', { defaultValue: 'Failed to end therapy' }));
    }
  };

  const getTherapyIcon = (type) => {
    switch (type) {
      case 'music':
        return 'musical-notes';
      case 'video':
        return 'videocam';
      case 'content':
        return 'document-text';
      default:
        return 'play';
    }
  };

  const getTherapyColor = (type) => {
    switch (type) {
      case 'music':
        return tokens.colors.joy.lavender;
      case 'video':
        return tokens.colors.accent.blue;
      case 'content':
        return tokens.colors.semantic.success;
      default:
        return tokens.colors.text.secondary;
    }
  };

  const filteredTherapies = therapies.filter(therapy => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        therapy.title?.toLowerCase().includes(query) ||
        therapy.description?.toLowerCase().includes(query) ||
        (Array.isArray(therapy.tags) && therapy.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    return true;
  });

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.joy.lavender, tokens.colors.joy.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="musical-notes" size={24} color="#fff" />
          <Text style={styles.topBarTitle} allowFontScaling={true}>
            {t('therapy.title', { defaultValue: 'Terapiya' })}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <Screen scroll={false} padded={false} header={header}>
        <LoadingSpinner />
      </Screen>
    );
  }

  return (
    <Screen scroll={true} padded={true} header={header} background="parent">
      <Text style={styles.subtitle} allowFontScaling={true}>
        {t('therapy.subtitle', { defaultValue: 'Musiqa, video va content terapiyalar' })}
      </Text>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={tokens.colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('therapy.search', { defaultValue: 'Qidirish...' })}
            placeholderTextColor={tokens.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {['all', 'music', 'video', 'content'].map((f) => (
              <Pressable
                key={f}
                style={({ pressed }) => [
                  styles.filterPill,
                  filter === f && styles.filterPillActive,
                  pressed && styles.filterPillPressed,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text style={[
                  styles.filterPillText,
                  filter === f && styles.filterPillTextActive,
                ]} allowFontScaling={true}>
                  {f === 'all' ? t('therapy.all', { defaultValue: 'Barchasi' }) :
                   f === 'music' ? t('therapy.music', { defaultValue: 'Musiqa' }) :
                   f === 'video' ? t('therapy.video', { defaultValue: 'Video' }) :
                   t('therapy.content', { defaultValue: 'Content' })}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Active Session */}
      {activeSession && selectedTherapy && (
        <Card style={styles.activeSessionCard} variant="gradient" gradientColors={[tokens.colors.accent.blue, tokens.colors.accent.blueVibrant]} shadow="elevated">
          <View style={styles.activeSessionContent}>
            <View style={styles.activeSessionInfo}>
              <Text style={styles.activeSessionTitle} allowFontScaling={true}>
                {selectedTherapy.title}
              </Text>
              <Text style={styles.activeSessionLabel} allowFontScaling={true}>
                {t('therapy.activeSession', { defaultValue: 'Faol sessiya' })}
              </Text>
            </View>
            <Pressable
              style={styles.endButton}
              onPress={() => endTherapy(activeSession.id)}
            >
              <Text style={styles.endButtonText} allowFontScaling={true}>
                {t('therapy.end', { defaultValue: 'Yakunlash' })}
              </Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* Therapies List */}
      {filteredTherapies.length > 0 ? (
        <View style={styles.therapiesGrid}>
          {filteredTherapies.map((therapy) => {
            const iconName = getTherapyIcon(therapy.therapyType);
            const iconColor = getTherapyColor(therapy.therapyType);
            return (
              <Card key={therapy.id} style={styles.therapyCard} variant="elevated" shadow="soft">
                <View style={styles.therapyHeader}>
                  <LinearGradient
                    colors={[iconColor + '30', iconColor + '15']}
                    style={styles.therapyIconContainer}
                  >
                    <Ionicons name={iconName} size={24} color={iconColor} />
                  </LinearGradient>
                  <View style={styles.therapyInfo}>
                    <Text style={styles.therapyTitle} allowFontScaling={true}>
                      {therapy.title}
                    </Text>
                    <Text style={styles.therapyDescription} numberOfLines={2} allowFontScaling={true}>
                      {therapy.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.therapyMeta}>
                  {therapy.duration && (
                    <View style={styles.therapyMetaItem}>
                      <Ionicons name="time-outline" size={16} color={tokens.colors.text.secondary} />
                      <Text style={styles.therapyMetaText} allowFontScaling={true}>
                        {therapy.duration} {t('therapy.min', { defaultValue: 'min' })}
                      </Text>
                    </View>
                  )}
                  {therapy.rating != null && !isNaN(Number(therapy.rating)) && (
                    <View style={styles.therapyMetaItem}>
                      <Ionicons name="star" size={16} color={tokens.colors.semantic.warning} />
                      <Text style={styles.therapyMetaText} allowFontScaling={true}>
                        {Number(therapy.rating).toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {Array.isArray(therapy.tags) && therapy.tags.length > 0 && (
                  <View style={styles.therapyTags}>
                    {therapy.tags.slice(0, 3).map((tag, idx) => (
                      <View key={idx} style={styles.therapyTag}>
                        <Text style={styles.therapyTagText} allowFontScaling={true}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  style={[styles.startButton, activeSession && styles.startButtonDisabled]}
                  onPress={() => startTherapy(therapy.id)}
                  disabled={!!activeSession}
                >
                  <Text style={[
                    styles.startButtonText,
                    activeSession && styles.startButtonTextDisabled,
                  ]} allowFontScaling={true}>
                    {t('therapy.start', { defaultValue: 'Boshlash' })}
                  </Text>
                </Pressable>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="musical-notes-outline"
            title={t('therapy.noTherapies', { defaultValue: 'Terapiyalar topilmadi' })}
            description={t('therapy.noTherapiesDesc', { defaultValue: 'Qidiruv natijalari bo\'sh' })}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  subtitle: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.lg,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: tokens.space.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadow.sm,
  },
  searchIcon: {
    marginRight: tokens.space.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    paddingVertical: tokens.space.md,
  },
  filterScroll: {
    marginBottom: tokens.space.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: tokens.space.sm,
  },
  filterPill: {
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface.secondary,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  filterPillActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  filterPillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  filterPillText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  activeSessionCard: {
    marginBottom: tokens.space.lg,
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSessionInfo: {
    flex: 1,
  },
  activeSessionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: '#fff',
    marginBottom: tokens.space.xs,
  },
  activeSessionLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  endButton: {
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    backgroundColor: '#fff',
    borderRadius: tokens.radius.md,
  },
  endButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
  therapiesGrid: {
    gap: tokens.space.md,
  },
  therapyCard: {
    marginBottom: tokens.space.md,
  },
  therapyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  therapyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  therapyInfo: {
    flex: 1,
  },
  therapyTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  therapyDescription: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  therapyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  therapyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
  },
  therapyMetaText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  therapyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.xs,
    marginBottom: tokens.space.md,
  },
  therapyTag: {
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs / 2,
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.sm,
  },
  therapyTagText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  startButton: {
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.accent.blue,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: tokens.colors.surface.tertiary,
  },
  startButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: '#fff',
  },
  startButtonTextDisabled: {
    color: tokens.colors.text.tertiary,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
});
