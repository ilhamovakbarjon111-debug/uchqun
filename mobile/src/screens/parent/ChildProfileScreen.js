import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Note: ImagePicker requires expo-image-picker package
// For now, using a simpler approach - can be enhanced later
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n/config';
import { parentService } from '../../services/parentService';
import { api } from '../../services/api';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import ListRow from '../../components/common/ListRow';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { API_URL } from '../../config';

export function ChildProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { childId = null } = route?.params || {};
  
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(childId);
  const [teacherName, setTeacherName] = useState('');
  const [parentGroupName, setParentGroupName] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    activities: 0,
    meals: 0,
    media: 0,
  });
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [imageLoading, setImageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const locale = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US',
  }[i18n.language] || 'en-US';

  const API_BASE = API_URL?.replace('/api', '') || 'https://uchqun-production.up.railway.app';

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadChild();
    } else {
      loadChildren();
    }
  }, [selectedChildId]);

  useEffect(() => {
    // Load messages only if user is authenticated
    // Messages endpoint might not be available, so we handle errors gracefully
    loadMessages();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const childrenData = await parentService.getChildren();
      const childrenList = Array.isArray(childrenData) ? childrenData : [];
      setChildren(childrenList);
      
      if (childrenList.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenList[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChild = async () => {
    if (!selectedChildId) return;
    
    try {
      setLoading(true);
      const [childResponse, activitiesResponse, mealsResponse, mediaResponse, profileResponse, monitoringResponse] = await Promise.all([
        parentService.getChildById(selectedChildId).catch(() => null),
        parentService.getActivities({ childId: selectedChildId }).catch(() => []),
        parentService.getMeals({ childId: selectedChildId }).catch(() => []),
        parentService.getMedia({ childId: selectedChildId }).catch(() => []),
        parentService.getProfile().catch(() => null),
        api.get(`/parent/emotional-monitoring/child/${selectedChildId}`).catch(() => ({ data: { data: [] } })),
      ]);

      if (childResponse) {
        setChild(childResponse);
        
        // In React Native, Image component handles loading automatically
        // The Image component's onLoad/onError handlers will set imageLoading to false
        // Just initialize imageLoading state
        if (childResponse.photo) {
          // Image will load via Image component's onLoad handler
          // Keep imageLoading true until Image component loads
        } else {
          setImageLoading(false);
        }
      }

      // Get teacher name from profile (assignedTeacher) or child data - exactly like web
      const assignedTeacher = profileResponse?.user?.assignedTeacher;
      const parentGroup = profileResponse?.user?.group;
      setParentGroupName(parentGroup?.name || '');
      
      // Combine teacher name - prefer assignedTeacher, fallback to child.teacher (web logic)
      // Web: assignedTeacher ? [firstName, lastName].join(' ') : childResponse.data?.teacher || '—'
      const combinedTeacherName = assignedTeacher
        ? [assignedTeacher.firstName, assignedTeacher.lastName].filter(Boolean).join(' ')
        : (childResponse?.teacher || '');
      // Always set teacherName, even if empty (will show '—' in UI)
      setTeacherName(combinedTeacherName);

      // Calculate weekly stats (last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activities = Array.isArray(activitiesResponse) ? activitiesResponse : [];
      const meals = Array.isArray(mealsResponse) ? mealsResponse : [];
      const media = Array.isArray(mediaResponse) ? mediaResponse : [];

      const activitiesThisWeek = activities.filter(a => {
        const activityDate = new Date(a.date || a.createdAt);
        return activityDate >= weekAgo;
      }).length;

      const mealsThisWeek = meals.filter(m => {
        const mealDate = new Date(m.date || m.createdAt);
        return mealDate >= weekAgo;
      }).length;

      const mediaThisWeek = media.filter(m => {
        const mediaDate = new Date(m.date || m.createdAt);
        return mediaDate >= weekAgo;
      }).length;

      setWeeklyStats({
        activities: activitiesThisWeek,
        meals: mealsThisWeek,
        media: mediaThisWeek,
      });

      // Load monitoring records
      const monitoring = Array.isArray(monitoringResponse.data?.data) ? monitoringResponse.data.data : [];
      setMonitoringRecords(monitoring);
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      // parentService.getMessages() already handles errors and returns empty array
      const messages = await parentService.getMessages();
      setMyMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      // This catch is for any unexpected errors
      console.error('[ChildProfile] Error loading messages:', error);
      setMyMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('child.photoPermissionRequired', { defaultValue: 'Photo library permission is required' })
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      setShowAvatarSelector(false);

      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('photo', { uri, name: filename, type });

      await api.post(`/parent/children/${selectedChildId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPhotoTimestamp(Date.now());
      await loadChild();
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error.response?.data?.error || t('child.photoUploadFailed', { defaultValue: 'Failed to upload photo' })
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageText.trim()) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('profile.messageRequired', { defaultValue: 'Subject and message are required' }));
      return;
    }

    setSendingMessage(true);
    try {
      await parentService.sendMessage({
        subject: messageSubject.trim(),
        message: messageText.trim(),
      });
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('profile.messageSent', { defaultValue: 'Message sent successfully' }));
      setMessageSubject('');
      setMessageText('');
      setShowMessageModal(false);
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(t('common.error', { defaultValue: 'Error' }), error.response?.data?.error || t('profile.messageError', { defaultValue: 'Error sending message' }));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    Alert.alert(t('settings.languageChanged', { defaultValue: 'Language Changed' }), t('settings.languageChangedDesc', { defaultValue: 'Language has been changed successfully' }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !child) {
    return <LoadingSpinner />;
  }

  // Show child selector if multiple children and no child selected
  if (Array.isArray(children) && children.length > 1 && !selectedChildId) {
    return (
      <Screen scroll={true} padded={true}>
        <Card style={styles.card} variant="elevated" shadow="soft">
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('child.selectPrompt', { defaultValue: 'Select your child' })}</Text>
          <View style={styles.childrenGrid}>
            {children.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedChildId(c.id)}
                style={styles.childSelectorCard}
              >
                <Card variant="elevated" shadow="sm" padding="md">
                  <View style={styles.childSelectorContent}>
                    <LinearGradient
                      colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
                      style={styles.childSelectorAvatar}
                    >
                      <Text style={styles.childSelectorAvatarText}>
                        {c.firstName?.charAt(0) || ''}{c.lastName?.charAt(0) || ''}
                      </Text>
                    </LinearGradient>
                    <View style={styles.childSelectorInfo}>
                      <Text style={styles.childSelectorName} allowFontScaling={true}>
                        {c.firstName} {c.lastName}
                      </Text>
                      {c.school && (
                        <Text style={styles.childSelectorSchool} allowFontScaling={true}>
                          {c.school}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </Card>
      </Screen>
    );
  }

  if (!child) {
    return (
      <Screen scroll={true} padded={true}>
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="person-outline"
            title={t('child.notFoundTitle', { defaultValue: 'Child not found' })}
            description={t('child.notFoundDesc', { defaultValue: 'No information found about your child' })}
          />
        </Card>
      </Screen>
    );
  }

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.accent.blue, tokens.colors.accent.blueVibrant]}
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
          <Text style={styles.topBarTitle} allowFontScaling={true}>
            {child.firstName} {child.lastName}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen scroll={true} padded={false} header={header} background="parent">
      {/* Child Selector (if multiple children) */}
      {Array.isArray(children) && children.length > 1 && (
        <Card style={styles.selectorCard} variant="elevated" shadow="soft">
          <View style={styles.selectorHeader}>
            <Ionicons name="people" size={20} color={tokens.colors.accent.blue} />
            <Text style={styles.selectorLabel} allowFontScaling={true}>
              {t('child.selectLabel', { defaultValue: 'Choose child' })}
            </Text>
          </View>
          <View style={styles.selectorDropdown}>
            {children.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.selectorOption,
                  selectedChildId === c.id && styles.selectorOptionActive,
                ]}
                onPress={() => {
                  setSelectedChildId(c.id);
                  setChild(null);
                  setLoading(true);
                  setImageLoading(true);
                  setPhotoTimestamp(Date.now());
                }}
              >
                <Text style={[
                  styles.selectorOptionText,
                  selectedChildId === c.id && styles.selectorOptionTextActive,
                ]} allowFontScaling={true}>
                  {c.firstName} {c.lastName} {c.school ? ` - ${c.school}` : ''}
                </Text>
                {selectedChildId === c.id && (
                  <Ionicons name="checkmark-circle" size={20} color={tokens.colors.accent.blue} />
                )}
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {/* Top Profile Hero - Like Web */}
      <Card style={styles.heroCard} variant="elevated" shadow="elevated">
        <View style={styles.heroContent}>
          <Pressable
            style={styles.avatarContainer}
            onPress={() => setShowAvatarSelector(true)}
            disabled={uploading}
          >
            {imageLoading && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="small" color={tokens.colors.accent.blue} />
              </View>
            )}
            {child.photo ? (
              <Image
                key={`${child.photo}-${photoTimestamp}`}
                source={{
                  uri: child.photo.startsWith('/avatars/')
                    ? child.photo
                    : child.photo.startsWith('http://') || child.photo.startsWith('https://')
                    ? `${child.photo}?t=${photoTimestamp}`
                    : `${API_BASE}${child.photo.startsWith('/') ? '' : '/'}${child.photo}?t=${photoTimestamp}`,
                }}
                style={[
                  styles.avatarImage,
                  imageLoading && styles.avatarImageLoading,
                ]}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            ) : (
              <LinearGradient
                colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                </Text>
              </LinearGradient>
            )}
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <View style={styles.activeIndicator} />
          </Pressable>

          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName} allowFontScaling={true}>
                {child.firstName} {child.lastName}
              </Text>
              {child.gender && (
                <View style={styles.genderBadge}>
                  <Text style={styles.genderBadgeText}>
                    {t(`child.gender.${child.gender?.toLowerCase()}`, { defaultValue: child.gender })}
                  </Text>
                </View>
              )}
            </View>
            {child.dateOfBirth && (
              <View style={styles.ageRow}>
                <Ionicons name="calendar-outline" size={16} color={tokens.colors.accent.blue} />
                <Text style={styles.ageText} allowFontScaling={true}>
                  {t('child.ageYears', { count: calculateAge(child.dateOfBirth) })}
                </Text>
              </View>
            )}
            <View style={styles.infoBadges}>
              {child.school && (
                <View style={styles.infoBadge}>
                  <Ionicons name="school" size={14} color={tokens.colors.accent.blue} />
                  <Text style={styles.infoBadgeText} allowFontScaling={true}>{child.school}</Text>
                </View>
              )}
              {parentGroupName && (
                <View style={styles.infoBadge}>
                  <Ionicons name="people" size={14} color={tokens.colors.accent.blue} />
                  <Text style={styles.infoBadgeText} allowFontScaling={true}>{parentGroupName}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.contentContainer}>
        {/* Basic Info */}
        <Card style={styles.card} variant="elevated" shadow="soft">
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color={tokens.colors.accent.blue} />
            <Text style={styles.sectionTitle} allowFontScaling={true}>{t('child.basicInfo', { defaultValue: 'Basic Information' })}</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem 
              label={t('child.fullName', { defaultValue: 'Full name' })} 
              value={`${child.firstName} ${child.lastName}`} 
              icon="person-outline"
            />
            {child.dateOfBirth && (
              <InfoItem 
                label={t('child.birthDate', { defaultValue: 'Date of birth' })} 
                value={formatDate(child.dateOfBirth)} 
                icon="calendar-outline"
              />
            )}
            {child.disabilityType && (
              <InfoItem 
                label={t('child.diagnosis', { defaultValue: 'Diagnosis' })} 
                value={child.disabilityType} 
                icon="medical-outline"
                color={tokens.colors.semantic.error}
              />
            )}
            <InfoItem 
              label={t('child.teacher', { defaultValue: 'Teacher' })} 
              value={(teacherName && teacherName.trim()) || child.teacher || '—'} 
              icon="school-outline"
              color={tokens.colors.accent.blue}
            />
          </View>
        </Card>

        {/* Special Needs */}
        {child.specialNeeds && (
          <Card style={styles.card} variant="elevated" shadow="soft">
            <View style={styles.specialNeedsHeader}>
              <Ionicons name="heart" size={24} color={tokens.colors.semantic.error} />
              <Text style={styles.specialNeedsTitle} allowFontScaling={true}>
                {t('child.specialNeeds', { defaultValue: 'Special Needs' })}
              </Text>
            </View>
            <View style={styles.specialNeedsContent}>
              <Text style={styles.specialNeedsText} allowFontScaling={true}>
                {child.specialNeeds}
              </Text>
            </View>
          </Card>
        )}

        {/* Weekly Stats */}
        <Card style={styles.statsCard} variant="elevated" shadow="soft">
          <Text style={styles.statsTitle} allowFontScaling={true}>
            {t('child.weeklyResults', { defaultValue: 'Weekly Results' })}
          </Text>
          <View style={styles.statsList}>
            <StatRow
              label={t('child.activities', { defaultValue: 'Activities' })}
              value={weeklyStats.activities}
            />
            <StatRow
              label={t('child.meals', { defaultValue: 'Meals' })}
              value={weeklyStats.meals}
            />
            <StatRow
              label={t('child.media', { defaultValue: 'Media' })}
              value={weeklyStats.media}
            />
          </View>
        </Card>

        {/* Emotional Monitoring */}
        {monitoringRecords.length > 0 && (
          <Card style={styles.card} variant="elevated" shadow="soft">
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={24} color={tokens.colors.joy.rose} />
              <Text style={styles.sectionTitle} allowFontScaling={true}>
                {t('profile.monitoringJournal', { defaultValue: 'Monitoring Journal' })}
              </Text>
            </View>
            <View style={styles.monitoringList}>
              {monitoringRecords.slice(0, 5).map((record) => {
                const emotionalState = record.emotionalState || {};
                const checkedCount = Object.values(emotionalState).filter(Boolean).length;
                const totalCount = Object.keys(emotionalState).length;
                const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
                
                return (
                  <View key={record.id} style={styles.monitoringCard}>
                    <View style={styles.monitoringHeader}>
                      <View>
                        <Text style={styles.monitoringDate} allowFontScaling={true}>
                          {formatDate(record.date)}
                        </Text>
                        {record.teacher && (
                          <Text style={styles.monitoringTeacher} allowFontScaling={true}>
                            {t('child.teacher', { defaultValue: 'Teacher' })}: {record.teacher.firstName} {record.teacher.lastName}
                          </Text>
                        )}
                      </View>
                      <View style={styles.monitoringPercentage}>
                        <Text style={styles.monitoringPercentageText}>{percentage}%</Text>
                        <Text style={styles.monitoringCount}>
                          {checkedCount} / {totalCount}
                        </Text>
                      </View>
                    </View>
                    {record.notes && (
                      <Text style={styles.monitoringNotes} allowFontScaling={true}>
                        {record.notes}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
            {monitoringRecords.length > 5 && (
              <Text style={styles.moreRecords} allowFontScaling={true}>
                +{monitoringRecords.length - 5} {t('common.more', { defaultValue: 'more' })}
              </Text>
            )}
          </Card>
        )}
      </View>

      {/* Avatar Upload Modal */}
      <Modal
        visible={showAvatarSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAvatarSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('child.changePhoto', { defaultValue: 'Change Photo' })}</Text>
              <TouchableOpacity onPress={() => setShowAvatarSelector(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Pressable
              style={styles.uploadButton}
              onPress={handleFileUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={tokens.colors.accent.blue} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={32} color={tokens.colors.accent.blue} />
                  <Text style={styles.uploadButtonText} allowFontScaling={true}>
                    {t('child.selectPhoto', { defaultValue: 'Select Photo from Gallery' })}
                  </Text>
                  <Text style={styles.uploadHint} allowFontScaling={true}>
                    {t('child.photoFormat', { defaultValue: 'JPG, PNG (max. 5MB)' })}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={32} color={tokens.colors.semantic.error} />
              <Text style={styles.modalTitle}>{t('profile.logoutTitle', { defaultValue: 'Logout' })}</Text>
            </View>
            <Text style={styles.modalText} allowFontScaling={true}>
              {t('profile.confirmLogout', { defaultValue: 'Do you want to logout?' })}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText} allowFontScaling={true}>
                  {t('profile.no', { defaultValue: 'No' })}
                </Text>
              </Pressable>
              <Pressable
                style={styles.modalConfirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText} allowFontScaling={true}>
                  {t('profile.yes', { defaultValue: 'Yes' })}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="mail-outline" size={24} color={tokens.colors.accent.blue} />
              <Text style={styles.modalTitle} allowFontScaling={true}>
                {t('profile.contactSuperAdmin', { defaultValue: 'Contact Super-Admin' })}
              </Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                {t('profile.subject', { defaultValue: 'Subject' })}
              </Text>
              <TextInput
                style={styles.textInput}
                value={messageSubject}
                onChangeText={setMessageSubject}
                placeholder={t('profile.subjectPlaceholder', { defaultValue: 'Message subject...' })}
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                {t('profile.message', { defaultValue: 'Message' })}
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={messageText}
                onChangeText={setMessageText}
                placeholder={t('profile.messagePlaceholder', { defaultValue: 'Write your message...' })}
                placeholderTextColor={tokens.colors.text.tertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowMessageModal(false)}
                disabled={sendingMessage}
              >
                <Text style={styles.modalCancelText} allowFontScaling={true}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirmButton, sendingMessage && styles.modalConfirmButtonDisabled]}
                onPress={handleSendMessage}
                disabled={sendingMessage || !messageSubject.trim() || !messageText.trim()}
              >
                {sendingMessage ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={20} color="#fff" />
                    <Text style={styles.modalConfirmText} allowFontScaling={true}>
                      {t('profile.send', { defaultValue: 'Send' })}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* My Messages Modal */}
      <Modal
        visible={showMessagesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.messagesModalContent]}>
            <View style={styles.modalHeader}>
              <Ionicons name="chatbubbles-outline" size={24} color={tokens.colors.semantic.success} />
              <Text style={styles.modalTitle} allowFontScaling={true}>
                {t('profile.myMessages', { defaultValue: 'My Messages' })}
              </Text>
              <TouchableOpacity onPress={() => setShowMessagesModal(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {loadingMessages ? (
              <View style={styles.messagesLoading}>
                <ActivityIndicator size="large" color={tokens.colors.accent.blue} />
              </View>
            ) : myMessages.length === 0 ? (
              <View style={styles.messagesEmpty}>
                <Ionicons name="chatbubbles-outline" size={48} color={tokens.colors.text.tertiary} />
                <Text style={styles.messagesEmptyText} allowFontScaling={true}>
                  {t('profile.noMessages', { defaultValue: 'No messages yet' })}
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.messagesList}>
                {myMessages.map((msg) => (
                  <View key={msg.id} style={styles.messageItem}>
                    <View style={styles.messageItemHeader}>
                      <Text style={styles.messageItemSubject} allowFontScaling={true}>
                        {msg.subject}
                      </Text>
                      {msg.reply && (
                        <View style={styles.repliedBadge}>
                          <Text style={styles.repliedBadgeText} allowFontScaling={true}>
                            {t('profile.replied', { defaultValue: 'Replied' })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.messageItemDate} allowFontScaling={true}>
                      {formatDate(msg.createdAt)}
                    </Text>
                    <View style={styles.messageItemContent}>
                      <Text style={styles.messageItemLabel} allowFontScaling={true}>
                        {t('profile.yourMessage', { defaultValue: 'Your message' })}:
                      </Text>
                      <Text style={styles.messageItemText} allowFontScaling={true}>
                        {msg.message}
                      </Text>
                    </View>
                    {msg.reply && (
                      <View style={styles.messageItemReply}>
                        <View style={styles.messageItemReplyHeader}>
                          <Ionicons name="chatbubble" size={16} color={tokens.colors.accent.blue} />
                          <Text style={styles.messageItemReplyLabel} allowFontScaling={true}>
                            {t('profile.superAdminReply', { defaultValue: 'Super-admin reply' })}
                          </Text>
                          <Text style={styles.messageItemReplyDate} allowFontScaling={true}>
                            {formatDate(msg.repliedAt)}
                          </Text>
                        </View>
                        <Text style={styles.messageItemReplyText} allowFontScaling={true}>
                          {msg.reply}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// Helper Components
function InfoItem({ label, value, icon, color = tokens.colors.accent.blue }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemLabelRow}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.infoItemLabel} allowFontScaling={true}>{label}</Text>
      </View>
      <Text style={styles.infoItemValue} allowFontScaling={true}>{value}</Text>
    </View>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statRowLeft}>
        <View style={styles.statDot} />
        <Text style={styles.statLabel} allowFontScaling={true}>{label}</Text>
      </View>
      <Text style={styles.statValue} allowFontScaling={true}>{value}</Text>
    </View>
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
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  selectorCard: {
    marginHorizontal: tokens.space.md,
    marginTop: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
  },
  selectorLabel: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  selectorDropdown: {
    gap: tokens.space.xs,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  selectorOptionActive: {
    backgroundColor: tokens.colors.accent[50],
    borderColor: tokens.colors.accent.blue,
  },
  selectorOptionText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
  },
  selectorOptionTextActive: {
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
  heroCard: {
    marginHorizontal: tokens.space.md,
    marginTop: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.soft,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarImageLoading: {
    opacity: 0,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: 50,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.semantic.success,
    borderWidth: 3,
    borderColor: '#fff',
  },
  heroInfo: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
    marginBottom: tokens.space.sm,
  },
  heroName: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  genderBadge: {
    backgroundColor: tokens.colors.accent[50],
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.pill,
  },
  genderBadgeText: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
    textTransform: 'uppercase',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.md,
  },
  ageText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
  },
  infoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    backgroundColor: tokens.colors.card.base,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadow.sm,
  },
  infoBadgeText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  contentContainer: {
    paddingHorizontal: tokens.space.md,
    gap: tokens.space.md,
  },
  card: {
    marginBottom: tokens.space.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.lg,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  infoGrid: {
    gap: tokens.space.lg,
  },
  infoItem: {
    gap: tokens.space.xs,
  },
  infoItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.xs / 2,
  },
  infoItemLabel: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoItemValue: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  specialNeedsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
  },
  specialNeedsTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.semantic.error,
  },
  specialNeedsContent: {
    backgroundColor: tokens.colors.semantic.errorSoft,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.error + '30',
  },
  specialNeedsText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.semantic.error,
    lineHeight: 22,
  },
  monitoringList: {
    gap: tokens.space.md,
  },
  monitoringCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.md,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.sm,
  },
  monitoringDate: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  monitoringTeacher: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs / 2,
  },
  monitoringPercentage: {
    alignItems: 'flex-end',
  },
  monitoringPercentageText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  monitoringCount: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs / 2,
  },
  monitoringNotes: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.sm,
    paddingTop: tokens.space.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  moreRecords: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: tokens.space.sm,
  },
  accountItem: {
    marginBottom: tokens.space.lg,
  },
  accountLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.sm,
  },
  languageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
  },
  languageButton: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
    backgroundColor: tokens.colors.card.base,
  },
  languageButtonActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  languageButtonText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.accent[50],
    borderWidth: 1,
    borderColor: tokens.colors.accent.blue + '30',
    marginBottom: tokens.space.sm,
    position: 'relative',
  },
  accountButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: tokens.colors.semantic.errorSoft,
    borderColor: tokens.colors.semantic.error + '30',
  },
  logoutButtonText: {
    color: tokens.colors.semantic.error,
  },
  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  statsCard: {
    backgroundColor: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  statsTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: '#fff',
    marginBottom: tokens.space.lg,
  },
  statsList: {
    gap: tokens.space.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent.blue,
  },
  statLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: '#fff',
  },
  childrenGrid: {
    gap: tokens.space.md,
    marginTop: tokens.space.md,
  },
  childSelectorCard: {
    marginBottom: tokens.space.sm,
  },
  childSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
  },
  childSelectorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  childSelectorAvatarText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  childSelectorInfo: {
    flex: 1,
  },
  childSelectorName: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  childSelectorSchool: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.surface.card,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    padding: tokens.space.xl,
    maxHeight: '80%',
  },
  messagesModalContent: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.xl,
  },
  modalTitle: {
    flex: 1,
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  modalText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: tokens.space.md,
  },
  inputLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xs,
  },
  textInput: {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: tokens.space.md,
    marginTop: tokens.space.lg,
  },
  modalCancelButton: {
    flex: 1,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.surface.secondary,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
  },
  modalConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.accent.blue,
  },
  modalConfirmButtonDisabled: {
    opacity: 0.5,
  },
  modalConfirmText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: '#fff',
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.space.xl,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: tokens.colors.border.medium,
    backgroundColor: tokens.colors.surface.secondary,
    gap: tokens.space.md,
  },
  uploadButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
  uploadHint: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  messagesLoading: {
    padding: tokens.space.xl,
    alignItems: 'center',
  },
  messagesEmpty: {
    padding: tokens.space.xl,
    alignItems: 'center',
  },
  messagesEmptyText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.md,
  },
  messagesList: {
    maxHeight: 500,
  },
  messageItem: {
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  messageItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.xs,
  },
  messageItemSubject: {
    flex: 1,
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  repliedBadge: {
    backgroundColor: tokens.colors.semantic.successSoft,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs / 2,
    borderRadius: tokens.radius.pill,
  },
  repliedBadgeText: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.semantic.success,
  },
  messageItemDate: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.sm,
  },
  messageItemContent: {
    marginBottom: tokens.space.sm,
  },
  messageItemLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xs,
  },
  messageItemText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.surface.secondary,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
  },
  messageItemReply: {
    marginTop: tokens.space.md,
    paddingTop: tokens.space.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  messageItemReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.xs,
  },
  messageItemReplyLabel: {
    flex: 1,
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
  messageItemReplyDate: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  messageItemReplyText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.accent[50],
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
  },
});
