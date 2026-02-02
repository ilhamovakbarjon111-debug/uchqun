import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useThemeTokens } from '../../hooks/useThemeTokens';
import { useTheme } from '../../context/ThemeContext';
import Screen from '../../components/layout/Screen';

export function RatingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const { isDark } = useTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const ratingOptions = [
    {
      id: 'school',
      title: t('schoolRatingPage.title', { defaultValue: 'Maktabni baholash' }),
      subtitle: t('schoolRatingPage.desc', { defaultValue: 'Maktab xizmatlari va sharoitlarini baholang' }),
      icon: 'business',
      gradient: ['#8B5CF6', '#A78BFA'],
      screen: 'SchoolRating',
    },
  ];

  return (
    <Screen scroll={true} padded={false} showAI={false} background="parent">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: tokens.colors.background.secondary }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconContainer, { backgroundColor: tokens.colors.accent.blue + '20' }]}>
            <Ionicons name="star" size={20} color={tokens.colors.accent.blue} />
          </View>
          <Text style={[styles.headerTitle, { color: tokens.colors.text.primary }]}>
            {t('nav.rating', { defaultValue: 'Baholash' })}
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: tokens.colors.text.secondary }]}>
          {t('rating.chooseOption', { defaultValue: 'Baholash turini tanlang' })}
        </Text>
      </View>

      {/* Rating Options */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {ratingOptions.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => navigation.navigate(option.screen)}
            style={({ pressed }) => [
              styles.optionCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={option.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <View style={styles.optionIconCircle}>
                  <Ionicons name={option.icon} size={32} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <View style={styles.optionArrow}>
                <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </Animated.View>

      {/* Info Card */}
      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: tokens.colors.card.base, borderColor: tokens.colors.border.light }]}>
          <Ionicons name="information-circle" size={20} color={tokens.colors.accent.blue} />
          <Text style={[styles.infoText, { color: tokens.colors.text.secondary }]}>
            {t('rating.infoText', { defaultValue: 'Sizning fikringiz bizga xizmatimizni yaxshilashga yordam beradi' })}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 52,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  optionGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 120,
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  optionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  optionArrow: {
    marginLeft: 12,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
