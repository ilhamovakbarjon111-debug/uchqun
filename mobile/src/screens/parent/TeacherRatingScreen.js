import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { parentService } from '../../services/parentService';
import { api } from '../../services/api';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';

export function TeacherRatingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { childId = null } = route?.params || {};
  
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [rating, setRating] = useState(null);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // School rating states
  const [school, setSchool] = useState(null);
  const [schoolRating, setSchoolRating] = useState(null);
  const [schoolSummary, setSchoolSummary] = useState({ average: 0, count: 0 });
  const [schoolStars, setSchoolStars] = useState(0);
  const [schoolEvaluation, setSchoolEvaluation] = useState({
    officiallyRegistered: false,
    qualifiedSpecialists: false,
    individualPlan: false,
    safeEnvironment: false,
    medicalRequirements: false,
    developmentalActivities: false,
    foodQuality: false,
    regularInformation: false,
    clearPayments: false,
    kindAttitude: false,
  });
  const [schoolComment, setSchoolComment] = useState('');
  const [savingSchool, setSavingSchool] = useState(false);
  const [schoolError, setSchoolError] = useState('');
  const [schoolSuccess, setSchoolSuccess] = useState('');

  const locale = useMemo(() => {
    return {
      uz: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US',
    }[i18n.language] || 'en-US';
  }, [i18n.language]);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setSchoolError('');
    try {
      // Get childId from route params if available
      const childIdParam = childId ? `?childId=${childId}` : '';
      
      // Get teacher from profile and rating data (like web)
      const [profileRes, ratingRes, schoolRatingRes] = await Promise.all([
        api.get('/parent/profile').catch(() => ({ data: { data: { user: { assignedTeacher: null } } } })),
        api.get('/parent/ratings').catch((err) => {
          if (err.response?.status === 400 || err.response?.status === 404) {
            return { data: { data: { rating: null, summary: { average: 0, count: 0 } } } };
          }
          throw err;
        }),
        api.get(`/parent/school-rating${childIdParam}`).catch((err) => {
          // Handle 400, 404, and 500 errors gracefully
          if (err.response?.status === 400 || err.response?.status === 404 || err.response?.status === 500) {
            console.warn('School rating endpoint error (handled gracefully):', err.response?.status, err.response?.data);
            return { data: { data: { rating: null, school: null, summary: { average: 0, count: 0 }, allRatings: [] } } };
          }
          throw err;
        }),
      ]);

      const teacherData = profileRes.data?.data?.user?.assignedTeacher || null;
      setTeacher(teacherData);

      const ratingData = ratingRes?.data?.data || { rating: null, summary: { average: 0, count: 0 } };
      setRating(ratingData.rating);
      setStars(ratingData.rating?.stars || 0);
      setComment(ratingData.rating?.comment || '');
      setSummary(ratingData.summary || { average: 0, count: 0 });

      // School rating data
      const schoolRatingData = schoolRatingRes?.data?.data || { rating: null, school: null, summary: { average: 0, count: 0 } };
      setSchool(schoolRatingData.school);
      setSchoolRating(schoolRatingData.rating);
      setSchoolStars(schoolRatingData.rating?.stars || 0);
      setSchoolEvaluation(schoolRatingData.rating?.evaluation || {
        officiallyRegistered: false,
        qualifiedSpecialists: false,
        individualPlan: false,
        safeEnvironment: false,
        medicalRequirements: false,
        developmentalActivities: false,
        foodQuality: false,
        regularInformation: false,
        clearPayments: false,
        kindAttitude: false,
      });
      setSchoolComment(schoolRatingData.rating?.comment || '');
      setSchoolSummary(schoolRatingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error loading rating data:', err);
      setError(t('ratingPage.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!teacher) {
      setError(t('ratingPage.noTeacher'));
      return;
    }

    if (!stars) {
      setError(t('ratingPage.errorRequired'));
      return;
    }

    setSaving(true);
    try {
      await api.post('/parent/ratings', { stars, comment });
      setRating({
        stars,
        comment,
        updatedAt: new Date().toISOString(),
      });
      setSuccess(t('ratingPage.success'));

      // Refresh summary after saving
      const refreshRes = await api.get('/parent/ratings').catch((err) => {
        if (err.response?.status === 400 || err.response?.status === 404) {
          return { data: { data: { summary: { average: 0, count: 0 } } } };
        }
        throw err;
      });
      const ratingData = refreshRes?.data?.data || {};
      setSummary(ratingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error saving rating:', err);
      setError(err.response?.data?.error || t('ratingPage.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = useMemo(() => {
    if (!rating?.updatedAt && !rating?.createdAt) return null;
    const dateValue = rating.updatedAt || rating.createdAt;
    return new Date(dateValue).toLocaleString(locale);
  }, [rating, locale]);

  const handleSchoolSubmit = async () => {
    setSchoolError('');
    setSchoolSuccess('');

    if (!school) {
      setSchoolError(t('schoolRatingPage.noSchool'));
      return;
    }

    // Check if at least one evaluation criterion is selected
    const hasEvaluation = Object.values(schoolEvaluation).some(value => value === true);
    if (!hasEvaluation && !schoolStars) {
      setSchoolError(t('schoolRatingPage.errorRequired'));
      return;
    }

    // Validate school data
    if (!school.id && (!school.name || typeof school.name !== 'string' || school.name.trim().length === 0)) {
      setSchoolError(t('schoolRatingPage.noSchool'));
      return;
    }

    setSavingSchool(true);
    try {
      // Send schoolId if available, otherwise send schoolName
      const payload = school.id 
        ? { 
            schoolId: school.id, 
            evaluation: schoolEvaluation,
            comment: schoolComment || null
          }
        : { 
            schoolName: school.name.trim(), 
            evaluation: schoolEvaluation,
            comment: schoolComment || null
          };
      
      console.log('Sending school rating payload:', payload);
      await api.post('/parent/school-rating', payload);
      setSchoolRating({
        evaluation: schoolEvaluation,
        comment: schoolComment,
        updatedAt: new Date().toISOString(),
      });
      setSchoolSuccess(t('schoolRatingPage.success'));

      // Refresh summary after saving
      const childIdParam = childId ? `?childId=${childId}` : '';
      const refreshRes = await api.get(`/parent/school-rating${childIdParam}`).catch((err) => {
        if (err.response?.status === 400 || err.response?.status === 404) {
          return { data: { data: { summary: { average: 0, count: 0 } } } };
        }
        throw err;
      });
      const ratingData = refreshRes?.data?.data || {};
      setSchoolSummary(ratingData.summary || { average: 0, count: 0 });
      // Also update school data in case it was found/created
      if (ratingData.school) {
        setSchool(ratingData.school);
      }
    } catch (err) {
      console.error('Error saving school rating:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Get error message from response
      let errorMessage = t('schoolRatingPage.errorSave');
      if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        // Add details if available
        if (err.response.data.details) {
          if (typeof err.response.data.details === 'string') {
            errorMessage += ': ' + err.response.data.details;
          } else if (typeof err.response.data.details === 'object') {
            errorMessage += ': ' + JSON.stringify(err.response.data.details);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSchoolError(errorMessage);
    } finally {
      setSavingSchool(false);
    }
  };

  const starButtons = [1, 2, 3, 4, 5];

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.semantic.warning, tokens.colors.joy.peach]}
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
          <View style={styles.headerIconContainer}>
            <Ionicons name="star" size={24} color="#fff" />
          </View>
          <Text style={styles.topBarTitle} allowFontScaling={true}>{t('ratingPage.title')}</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header} contentStyle={styles.scrollContent}>
          {loading ? (
            <Card style={styles.card}>
              <Skeleton width={80} height={80} variant="circle" style={{ alignSelf: 'center', marginBottom: tokens.space.lg }} />
              <Skeleton width="60%" height={24} variant="text" style={{ alignSelf: 'center', marginBottom: tokens.space.md }} />
              <Skeleton width="80%" height={60} variant="text" style={{ alignSelf: 'center' }} />
            </Card>
          ) : !teacher ? (
            <Card style={styles.card}>
              <View style={styles.alertContainer}>
                <Ionicons name="alert-circle" size={20} color={tokens.colors.accent.blue} />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle} allowFontScaling={true}>{t('ratingPage.title')}</Text>
                  <Text style={styles.alertMessage} allowFontScaling={true}>{t('ratingPage.noTeacher')}</Text>
                </View>
              </View>
            </Card>
          ) : (
            <>
              {/* Gradient Header Card - Enhanced */}
              <Card variant="gradient" gradientColors={[tokens.colors.semantic.warning, tokens.colors.joy.peach]} style={styles.gradientHeader} padding="xl" shadow="elevated">
                <Text style={styles.gradientTitle} allowFontScaling={true}>{t('ratingPage.title')}</Text>
                <Text style={styles.gradientSubtitle} allowFontScaling={true}>{t('ratingPage.subtitle')}</Text>
              </Card>

              {/* Main Content Card */}
              <Card style={styles.mainCard} variant="elevated" shadow="soft">
                {/* Teacher Info Header */}
                <View style={styles.teacherHeader}>
                  <View style={styles.teacherInfoLeft}>
                    <LinearGradient
                      colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
                      style={styles.teacherAvatar}
                    >
                      <Text style={styles.teacherAvatarText}>
                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                      </Text>
                    </LinearGradient>
                    <View style={styles.teacherDetails}>
                      <Text style={styles.teacherLabel} allowFontScaling={true}>
                        {t('ratingPage.yourTeacher')}
                      </Text>
                      <Text style={styles.teacherName} allowFontScaling={true}>
                        {teacher.firstName} {teacher.lastName}
                      </Text>
                      <Text style={styles.teacherEmail} allowFontScaling={true}>{teacher.email}</Text>
                    </View>
                  </View>

                  <View style={styles.averageContainer}>
                    <Text style={styles.averageLabel} allowFontScaling={true}>
                      {t('ratingPage.average')}
                    </Text>
                    <View style={styles.averageValueContainer}>
                      <Ionicons name="star" size={20} color={tokens.colors.accent.blue} />
                      <Text style={styles.averageValue} allowFontScaling={true}>
                        {summary.average?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                    <Text style={styles.ratingsCount} allowFontScaling={true}>
                      {t('ratingPage.ratingsCount', { count: summary.count || 0 })}
                    </Text>
                  </View>
                </View>

                {/* Email and Phone Info Boxes */}
                <View style={styles.infoBoxes}>
                  <View style={styles.infoBox}>
                    <Ionicons name="mail-outline" size={16} color={tokens.colors.text.secondary} />
                    <Text style={styles.infoBoxText} allowFontScaling={true}>{teacher.email || '—'}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Ionicons name="call-outline" size={16} color={tokens.colors.text.secondary} />
                    <Text style={styles.infoBoxText} allowFontScaling={true}>
                      {teacher.phone || t('ratingPage.noPhone')}
                    </Text>
                  </View>
                </View>

                {/* Star Rating */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel} allowFontScaling={true}>
                    {t('ratingPage.starsLabel')}
                  </Text>
                  <View style={styles.starButtonsContainer}>
                    {starButtons.map((value) => (
                      <Pressable
                        key={value}
                        onPress={() => setStars(value)}
                        style={[
                          styles.starButton,
                          stars >= value && styles.starButtonActive,
                        ]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="star"
                          size={24}
                          color={stars >= value ? '#f97316' : tokens.colors.border.medium}
                          style={stars >= value ? { fill: '#ea580c' } : {}}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Comment Input */}
                <View style={styles.commentSection}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentLabel} allowFontScaling={true}>
                      {t('ratingPage.commentLabel')}
                    </Text>
                    <Text style={styles.optionalLabel} allowFontScaling={true}>
                      {t('ratingPage.optional')}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.commentInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder={t('ratingPage.commentPlaceholder')}
                    placeholderTextColor={tokens.colors.text.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Error/Success Messages */}
                {error && (
                  <View style={styles.messageContainer}>
                    <Ionicons name="alert-circle" size={16} color={tokens.colors.semantic.error} />
                    <Text style={styles.errorText} allowFontScaling={true}>{error}</Text>
                  </View>
                )}

                {success && (
                  <View style={[styles.messageContainer, styles.successContainer]}>
                    <Ionicons name="checkmark-circle" size={16} color={tokens.colors.semantic.success} />
                    <Text style={styles.successText} allowFontScaling={true}>{success}</Text>
                  </View>
                )}

                {/* Submit Button */}
                <View style={styles.submitContainer}>
                  {lastUpdated && (
                    <Text style={styles.lastUpdatedText} allowFontScaling={true}>
                      {t('ratingPage.lastUpdated', { date: lastUpdated })}
                    </Text>
                  )}
                  <Pressable
                    style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={saving}
                  >
                    {saving && (
                      <Ionicons name="hourglass-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.submitButtonText} allowFontScaling={true}>
                      {rating ? t('ratingPage.update') : t('ratingPage.submit')}
                    </Text>
                  </Pressable>
                </View>
              </Card>

              {/* Sidebar Cards - Your Rating & Summary */}
              <View style={styles.sidebar}>
                {/* Your Rating Card */}
                <Card style={styles.sidebarCard} variant="elevated" shadow="soft">
                  <View style={styles.sidebarCardHeader}>
                    <View style={styles.sidebarIcon}>
                      <Ionicons name="chatbubble-outline" size={20} color={tokens.colors.accent.blue} />
                    </View>
                    <Text style={styles.sidebarCardTitle} allowFontScaling={true}>
                      {t('ratingPage.yourRating')}
                    </Text>
                  </View>
                  <View style={styles.sidebarStars}>
                    {starButtons.map((value) => (
                      <Ionicons
                        key={value}
                        name="star"
                        size={20}
                        color={(rating?.stars || stars) >= value ? '#f97316' : tokens.colors.border.medium}
                        style={(rating?.stars || stars) >= value ? { fill: '#ea580c' } : {}}
                      />
                    ))}
                  </View>
                  <Text style={styles.sidebarComment} allowFontScaling={true}>
                    {rating?.comment || comment || t('ratingPage.noComment')}
                  </Text>
                </Card>

                {/* Summary Card */}
                <Card style={styles.sidebarCard} variant="elevated" shadow="soft">
                  <Text style={styles.sidebarCardTitle} allowFontScaling={true}>
                    {t('ratingPage.summaryTitle')}
                  </Text>
                  <View style={styles.summaryContent}>
                    <View style={styles.summaryItem}>
                      <Ionicons name="star" size={20} color={tokens.colors.accent.blue} />
                      <View>
                        <Text style={styles.summaryValue} allowFontScaling={true}>
                          {summary.average?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={styles.summaryLabel} allowFontScaling={true}>
                          {t('ratingPage.average')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.summaryItem}>
                      <View>
                        <Text style={styles.summaryValue} allowFontScaling={true}>
                          {summary.count || 0}
                        </Text>
                        <Text style={styles.summaryLabel} allowFontScaling={true}>
                          {t('ratingPage.ratingsCount', { count: summary.count || 0 })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </View>

              {/* School Rating Section */}
              {school ? (
                <>
                  {/* Gradient Header Card for School Rating */}
                  <Card variant="gradient" gradientColors={[tokens.colors.semantic.success, '#22c55e']} style={styles.gradientHeader} padding="xl" shadow="elevated">
                    <Text style={styles.gradientTitle} allowFontScaling={true}>{t('schoolRatingPage.title')}</Text>
                    <Text style={styles.gradientSubtitle} allowFontScaling={true}>{t('schoolRatingPage.subtitle')}</Text>
                  </Card>

                  {/* School Rating Main Card */}
                  <Card style={styles.mainCard} variant="elevated" shadow="soft">
                    {/* School Info Header */}
                    <View style={styles.schoolHeader}>
                      <View style={styles.schoolInfoLeft}>
                        <View style={styles.schoolIconContainer}>
                          <Ionicons name="school" size={24} color={tokens.colors.semantic.success} />
                        </View>
                        <View style={styles.schoolDetails}>
                          <Text style={styles.schoolLabel} allowFontScaling={true}>
                            {t('schoolRatingPage.yourSchool')}
                          </Text>
                          <Text style={styles.schoolName} allowFontScaling={true}>
                            {school.name}
                          </Text>
                          {school.address && (
                            <Text style={styles.schoolAddress} allowFontScaling={true}>{school.address}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.averageContainer}>
                        <Text style={styles.averageLabel} allowFontScaling={true}>
                          {t('schoolRatingPage.average')}
                        </Text>
                        <View style={styles.averageValueContainer}>
                          <Ionicons name="star" size={20} color={tokens.colors.semantic.success} />
                          <Text style={[styles.averageValue, { color: tokens.colors.semantic.success }]} allowFontScaling={true}>
                            {schoolSummary.average?.toFixed(1) || '0.0'}
                          </Text>
                        </View>
                        <Text style={styles.ratingsCount} allowFontScaling={true}>
                          {t('schoolRatingPage.ratingsCount', { count: schoolSummary.count || 0 })}
                        </Text>
                      </View>
                    </View>

                    {/* Evaluation Criteria */}
                    <View style={styles.evaluationSection}>
                      <Text style={styles.evaluationLabel} allowFontScaling={true}>
                        {t('schoolRatingPage.evaluationLabel')}
                      </Text>
                      <Text style={styles.evaluationSubtitle} allowFontScaling={true}>
                        {t('schoolRatingPage.evaluationSubtitle')}
                      </Text>
                      <View style={styles.evaluationList}>
                        {Object.keys(schoolEvaluation).map((key) => (
                          <Pressable
                            key={key}
                            style={styles.evaluationItem}
                            onPress={() => setSchoolEvaluation(prev => ({
                              ...prev,
                              [key]: !prev[key]
                            }))}
                          >
                            <Switch
                              value={schoolEvaluation[key] || false}
                              onValueChange={(value) => setSchoolEvaluation(prev => ({
                                ...prev,
                                [key]: value
                              }))}
                              trackColor={{ false: tokens.colors.border.medium, true: tokens.colors.semantic.success }}
                              thumbColor="#fff"
                            />
                            <Text style={styles.evaluationItemText} allowFontScaling={true}>
                              {t(`schoolRatingPage.criteria.${key}`)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {/* Comment Input */}
                    <View style={styles.commentSection}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentLabel} allowFontScaling={true}>
                          {t('schoolRatingPage.commentLabel')}
                        </Text>
                        <Text style={styles.optionalLabel} allowFontScaling={true}>
                          {t('schoolRatingPage.optional')}
                        </Text>
                      </View>
                      <TextInput
                        style={styles.commentInput}
                        value={schoolComment}
                        onChangeText={setSchoolComment}
                        placeholder={t('schoolRatingPage.commentPlaceholder')}
                        placeholderTextColor={tokens.colors.text.muted}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Error/Success Messages */}
                    {schoolError && (
                      <View style={styles.messageContainer}>
                        <Ionicons name="alert-circle" size={16} color={tokens.colors.semantic.error} />
                        <Text style={styles.errorText} allowFontScaling={true}>{schoolError}</Text>
                      </View>
                    )}

                    {schoolSuccess && (
                      <View style={[styles.messageContainer, styles.successContainer]}>
                        <Ionicons name="checkmark-circle" size={16} color={tokens.colors.semantic.success} />
                        <Text style={styles.successText} allowFontScaling={true}>{schoolSuccess}</Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <View style={styles.submitContainer}>
                      {schoolRating?.updatedAt && (
                        <Text style={styles.lastUpdatedText} allowFontScaling={true}>
                          {t('schoolRatingPage.lastUpdated', { 
                            date: new Date(schoolRating.updatedAt).toLocaleString(locale) 
                          })}
                        </Text>
                      )}
                      <Pressable
                        style={[styles.submitButton, styles.schoolSubmitButton, savingSchool && styles.submitButtonDisabled]}
                        onPress={handleSchoolSubmit}
                        disabled={savingSchool}
                      >
                        {savingSchool && (
                          <Ionicons name="hourglass-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.submitButtonText} allowFontScaling={true}>
                          {schoolRating ? t('schoolRatingPage.update') : t('schoolRatingPage.submit')}
                        </Text>
                      </Pressable>
                    </View>
                  </Card>

                  {/* School Rating Sidebar Cards */}
                  <View style={styles.sidebar}>
                    {/* Your School Rating Card */}
                    <Card style={styles.sidebarCard} variant="elevated" shadow="soft">
                      <View style={styles.sidebarCardHeader}>
                        <View style={[styles.sidebarIcon, { backgroundColor: `${tokens.colors.semantic.success}15` }]}>
                          <Ionicons name="checkmark-circle" size={20} color={tokens.colors.semantic.success} />
                        </View>
                        <View>
                          <Text style={styles.sidebarCardTitle} allowFontScaling={true}>
                            {t('schoolRatingPage.yourRating')}
                          </Text>
                          <Text style={styles.sidebarCardSubtitle} allowFontScaling={true}>
                            {t('schoolRatingPage.rateCta')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.evaluationChecklist}>
                        {Object.keys(schoolEvaluation).map((key) => {
                          const isChecked = (schoolRating?.evaluation?.[key] || schoolEvaluation[key]) === true;
                          return (
                            <View key={key} style={styles.evaluationCheckItem}>
                              <Ionicons 
                                name={isChecked ? "checkmark-circle" : "ellipse-outline"} 
                                size={16} 
                                color={isChecked ? tokens.colors.semantic.success : tokens.colors.border.medium} 
                              />
                              <Text style={[
                                styles.evaluationCheckText,
                                isChecked && styles.evaluationCheckTextActive
                              ]} allowFontScaling={true}>
                                {t(`schoolRatingPage.criteria.${key}`)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <Text style={styles.sidebarComment} allowFontScaling={true}>
                        {schoolRating?.comment ? `"${schoolRating.comment}"` : t('schoolRatingPage.noComment')}
                      </Text>
                    </Card>

                    {/* School Summary Card */}
                    <Card style={styles.sidebarCard} variant="elevated" shadow="soft">
                      <Text style={styles.sidebarCardTitle} allowFontScaling={true}>
                        {t('schoolRatingPage.summaryTitle')}
                      </Text>
                      <View style={styles.summaryContent}>
                        <View style={styles.summaryItem}>
                          <Ionicons name="star" size={20} color={tokens.colors.semantic.success} />
                          <View>
                            <Text style={styles.summaryValue} allowFontScaling={true}>
                              {schoolSummary.average?.toFixed(1) || '0.0'}
                            </Text>
                            <Text style={styles.summaryLabel} allowFontScaling={true}>
                              {t('schoolRatingPage.average')}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.summaryItem}>
                          <View>
                            <Text style={styles.summaryValue} allowFontScaling={true}>
                              {schoolSummary.count || 0}
                            </Text>
                            <Text style={styles.summaryLabel} allowFontScaling={true}>
                              {t('schoolRatingPage.ratingsCount', { count: schoolSummary.count || 0 })}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  </View>
                </>
              ) : (
                <Card style={styles.card}>
                  <View style={styles.alertContainer}>
                    <View style={[styles.sidebarIcon, { backgroundColor: `${tokens.colors.semantic.success}15` }]}>
                      <Ionicons name="school" size={20} color={tokens.colors.semantic.success} />
                    </View>
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle} allowFontScaling={true}>{t('schoolRatingPage.title')}</Text>
                      <Text style={styles.alertMessage} allowFontScaling={true}>{t('schoolRatingPage.noSchool')}</Text>
                    </View>
                  </View>
                </Card>
              )}
            </>
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
    marginLeft: tokens.space.md,
    gap: tokens.space.md,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: tokens.space['3xl'],
  },
  // Gradient Header
  gradientHeader: {
    backgroundColor: tokens.colors.accent.blue,
    borderRadius: tokens.radius.xl,
    padding: tokens.space.xl,
    marginBottom: tokens.space.lg,
    ...tokens.shadow.lg,
  },
  gradientTitle: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: '#fff',
    marginBottom: tokens.space.xs,
  },
  gradientSubtitle: {
    fontSize: tokens.type.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Main Card
  mainCard: {
    marginBottom: tokens.space.lg,
  },
  // Teacher Header
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.lg,
  },
  teacherInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teacherAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
    ...tokens.shadow.sm,
  },
  teacherAvatarText: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherLabel: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  teacherName: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  averageContainer: {
    alignItems: 'flex-end',
  },
  averageLabel: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  averageValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  averageValue: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  ratingsCount: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: 4,
  },
  // Info Boxes
  infoBoxes: {
    flexDirection: 'row',
    gap: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  infoBoxText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.primary,
    flex: 1,
  },
  // Rating Section
  ratingSection: {
    marginBottom: tokens.space.lg,
  },
  ratingLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  starButtonsContainer: {
    flexDirection: 'row',
    gap: tokens.space.sm,
  },
  starButton: {
    padding: tokens.space.md,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border.medium,
    backgroundColor: '#fff',
  },
  starButtonActive: {
    backgroundColor: `${tokens.colors.accent.blue}10`,
    borderColor: tokens.colors.accent.blue,
  },
  // Comment Section
  commentSection: {
    marginBottom: tokens.space.lg,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
  },
  commentLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  optionalLabel: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
  },
  commentInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  // Messages
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    padding: tokens.space.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: `${tokens.colors.semantic.error}10`,
    borderWidth: 1,
    borderColor: `${tokens.colors.semantic.error}30`,
    marginBottom: tokens.space.md,
  },
  successContainer: {
    backgroundColor: `${tokens.colors.semantic.success}10`,
    borderColor: `${tokens.colors.semantic.success}30`,
  },
  errorText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.semantic.error,
    flex: 1,
  },
  successText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.semantic.success,
    flex: 1,
  },
  // Submit
  submitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.accent.blue,
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.lg,
    borderRadius: tokens.radius.xl,
    ...tokens.shadow.soft,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: '#fff',
  },
  // Sidebar
  sidebar: {
    gap: tokens.space.md,
  },
  sidebarCard: {
    marginBottom: tokens.space.md,
  },
  sidebarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
  },
  sidebarIcon: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.md,
    backgroundColor: `${tokens.colors.accent.blue}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarCardTitle: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  sidebarStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: tokens.space.sm,
  },
  sidebarComment: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    fontStyle: 'italic',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.space.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
  },
  summaryValue: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  summaryLabel: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  // Alert
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space.md,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  alertMessage: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
  },
});
