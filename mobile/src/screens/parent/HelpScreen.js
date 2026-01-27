import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';

export function HelpScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: t('help.faq1.question', { defaultValue: 'How do I view my child\'s daily activities?' }),
      answer: t('help.faq1.answer', { defaultValue: 'Navigate to the Activities page from the bottom navigation or dashboard to see all daily activities and updates from teachers.' }),
    },
    {
      question: t('help.faq2.question', { defaultValue: 'Where can I see photos and videos?' }),
      answer: t('help.faq2.answer', { defaultValue: 'Go to the Media page to browse all photos and videos shared by teachers from school activities.' }),
    },
    {
      question: t('help.faq3.question', { defaultValue: 'How do I track my child\'s meals?' }),
      answer: t('help.faq3.answer', { defaultValue: 'Visit the Meals page to see daily meal records, including what your child ate and any special dietary notes.' }),
    },
    {
      question: t('help.faq4.question', { defaultValue: 'Can I update my profile information?' }),
      answer: t('help.faq4.answer', { defaultValue: 'Yes, go to Settings from the top menu or Profile page to update your contact information and preferences.' }),
    },
  ];

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@uchqunplatform.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+998901234567');
  };

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
          <Ionicons name="help-circle" size={24} color="#fff" />
          <Text style={styles.topBarTitle} allowFontScaling={true}>
            {t('help.title', { defaultValue: 'Help & Support' })}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header} background="parent">
      <Text style={styles.subtitle} allowFontScaling={true}>
        {t('help.subtitle', { defaultValue: 'Find answers to common questions and get support' })}
      </Text>

      {/* Contact Information */}
      <Card style={styles.card} variant="elevated" shadow="soft">
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubbles-outline" size={24} color={tokens.colors.accent.blue} />
          <Text style={styles.sectionTitle} allowFontScaling={true}>
            {t('help.contactUs', { defaultValue: 'Contact Us' })}
          </Text>
        </View>
        <View style={styles.contactList}>
          <Pressable style={styles.contactItem} onPress={handleEmailPress}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={20} color={tokens.colors.accent.blue} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel} allowFontScaling={true}>Email</Text>
              <Text style={styles.contactValue} allowFontScaling={true}>support@uchqunplatform.com</Text>
            </View>
          </Pressable>
          <Pressable style={styles.contactItem} onPress={handlePhonePress}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call-outline" size={20} color={tokens.colors.accent.blue} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel} allowFontScaling={true}>Phone</Text>
              <Text style={styles.contactValue} allowFontScaling={true}>+998 90 123 45 67</Text>
            </View>
          </Pressable>
        </View>
      </Card>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={24} color={tokens.colors.accent.blue} />
          <Text style={styles.sectionTitle} allowFontScaling={true}>
            {t('help.faq', { defaultValue: 'Frequently Asked Questions' })}
          </Text>
        </View>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <Card key={index} style={styles.faqCard} variant="elevated" shadow="soft">
              <Pressable
                style={styles.faqHeader}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <Text style={styles.faqQuestion} allowFontScaling={true}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={tokens.colors.text.secondary}
                />
              </Pressable>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer} allowFontScaling={true}>{faq.answer}</Text>
              )}
            </Card>
          ))}
        </View>
      </View>

      {/* Quick Links */}
      <Card style={styles.quickLinksCard} variant="elevated" shadow="soft">
        <Text style={styles.quickLinksTitle} allowFontScaling={true}>
          {t('help.quickLinks', { defaultValue: 'Quick Links' })}
        </Text>
        <View style={styles.quickLinksGrid}>
          <Pressable
            style={styles.quickLink}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.quickLinkText} allowFontScaling={true}>
              {t('help.viewActivities', { defaultValue: 'View Activities' })} →
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickLink}
            onPress={() => navigation.navigate('Media')}
          >
            <Text style={styles.quickLinkText} allowFontScaling={true}>
              {t('help.browseMedia', { defaultValue: 'Browse Media' })} →
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickLink}
            onPress={() => navigation.navigate('Meals')}
          >
            <Text style={styles.quickLinkText} allowFontScaling={true}>
              {t('help.checkMeals', { defaultValue: 'Check Meals' })} →
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickLink}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.quickLinkText} allowFontScaling={true}>
              {t('help.accountSettings', { defaultValue: 'Account Settings' })} →
            </Text>
          </Pressable>
        </View>
      </Card>
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
  card: {
    marginBottom: tokens.space.lg,
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
  contactList: {
    gap: tokens.space.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xs / 2,
  },
  contactValue: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  faqSection: {
    marginBottom: tokens.space.lg,
  },
  faqList: {
    gap: tokens.space.md,
  },
  faqCard: {
    marginBottom: tokens.space.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginRight: tokens.space.sm,
  },
  faqAnswer: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.md,
    lineHeight: 20,
  },
  quickLinksCard: {
    marginBottom: tokens.space.lg,
  },
  quickLinksTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  quickLinksGrid: {
    gap: tokens.space.sm,
  },
  quickLink: {
    paddingVertical: tokens.space.sm,
  },
  quickLinkText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
});
