import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
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

export function PaymentsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [monthlyAmount, setMonthlyAmount] = useState(0);

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
      loadPayments();
      calculateNextPayment();
      
      // Real-time countdown
      const interval = setInterval(() => {
        calculateNextPayment();
      }, 1000 * 60); // Update every minute

      return () => clearInterval(interval);
    }
  }, [payments, selectedChildId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = { status: 'completed' };
      if (selectedChildId) {
        params.childId = selectedChildId;
      }
      const response = await api.get('/payments', { params });
      const paymentsData = response.data?.data?.payments || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Calculate monthly amount from last payment
      if (paymentsData && paymentsData.length > 0) {
        const lastPayment = paymentsData[0];
        setMonthlyAmount(parseFloat(lastPayment.amount || 0));
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPayment = () => {
    if (!payments || payments.length === 0) {
      // If no payments, set next payment to end of current month
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setNextPaymentDate(lastDay);
      const diffTime = lastDay - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);
      return;
    }

    // Get last completed payment
    const lastPayment = payments.find(p => p.status === 'completed' && p.paidAt);
    if (!lastPayment || !lastPayment.paidAt) {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setNextPaymentDate(lastDay);
      const diffTime = lastDay - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);
      return;
    }

    // Calculate next payment date (1 month after last payment)
    const lastPaidDate = new Date(lastPayment.paidAt);
    const nextDate = new Date(lastPaidDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    setNextPaymentDate(nextDate);

    // Calculate days remaining
    const now = new Date();
    const diffTime = nextDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysRemaining(diffDays);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentProviderLabel = (provider) => {
    const labels = {
      payme: t('payments.paymentProvider.payme', { defaultValue: 'Payme' }),
      click: t('payments.paymentProvider.click', { defaultValue: 'Click' }),
      card: t('payments.paymentProvider.card', { defaultValue: 'Karta' }),
    };
    return labels[provider] || t('payments.paymentProvider.other', { defaultValue: 'To\'lov' });
  };

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
          <Ionicons name="card-outline" size={24} color="#fff" />
          <Text style={styles.topBarTitle} allowFontScaling={true}>
            {t('payments.title', { defaultValue: 'To\'lovlar' })}
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
        {t('payments.subtitle', { defaultValue: 'Oylik to\'lovlar va to\'lov tarixi' })}
      </Text>

      {/* Monthly Payment Card */}
      <Card style={styles.monthlyCard} variant="gradient" gradientColors={[tokens.colors.accent.blue, tokens.colors.accent.blueVibrant]} shadow="elevated">
        <View style={styles.monthlyCardContent}>
          <View style={styles.monthlyCardLeft}>
            <Text style={styles.monthlyCardTitle} allowFontScaling={true}>
              {t('payments.monthlyPayment', { defaultValue: 'Oylik To\'lov' })}
            </Text>
            <Text style={styles.monthlyCardSubtitle} allowFontScaling={true}>
              {t('payments.nextPayment', { defaultValue: 'Keyingi to\'lov' })}: {nextPaymentDate ? formatDate(nextPaymentDate) : '-'}
            </Text>
          </View>
          <View style={styles.monthlyCardRight}>
            {daysRemaining > 0 ? (
              <View style={styles.daysRemainingContainer}>
                <Ionicons name="time-outline" size={24} color="#fff" />
                <Text style={styles.daysRemainingText} allowFontScaling={true}>
                  {t('payments.daysRemaining', { count: daysRemaining, defaultValue: '{{count}} kun qoldi' })}
                </Text>
              </View>
            ) : (
              <View style={styles.daysOverdueContainer}>
                <Ionicons name="alert-circle" size={24} color="#FFD700" />
                <Text style={styles.daysOverdueText} allowFontScaling={true}>
                  {t('payments.daysOverdue', { count: Math.abs(daysRemaining), defaultValue: '{{count}} kun kechikdi' })}
                </Text>
              </View>
            )}
            <Text style={styles.monthlyAmount} allowFontScaling={true}>
              {monthlyAmount > 0 ? `${monthlyAmount.toLocaleString()} UZS` : t('payments.amountNotSet', { defaultValue: 'Summa belgilanmagan' })}
            </Text>
          </View>
        </View>
        
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color={tokens.colors.accent.blue} />
          <Text style={styles.noteText} allowFontScaling={true}>
            <Text style={styles.noteLabel}>{t('payments.note', { defaultValue: 'Eslatma' })}:</Text> {t('payments.noteText', { defaultValue: 'To\'lov qilish uchun admin bilan bog\'laning yoki admin panel orqali to\'lov qiling.' })}
          </Text>
        </View>
      </Card>

      {/* Payment History */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Ionicons name="calendar-outline" size={24} color={tokens.colors.accent.blue} />
          <Text style={styles.historyTitle} allowFontScaling={true}>
            {t('payments.history', { defaultValue: 'To\'lov Tarixi' })}
          </Text>
        </View>

        {payments && payments.length > 0 ? (
          <View style={styles.paymentsList}>
            {payments.map((payment) => (
              <Card key={payment.id} style={styles.paymentCard} variant="elevated" shadow="soft">
                <View style={styles.paymentCardContent}>
                  <View style={styles.paymentCardLeft}>
                    <View style={styles.paymentIconContainer}>
                      <Ionicons name="checkmark-circle" size={24} color={tokens.colors.semantic.success} />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentDate} allowFontScaling={true}>
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </Text>
                      <Text style={styles.paymentProvider} allowFontScaling={true}>
                        {getPaymentProviderLabel(payment.paymentProvider)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentCardRight}>
                    <Text style={styles.paymentAmount} allowFontScaling={true}>
                      {parseFloat(payment.amount || 0).toLocaleString()} {payment.currency || 'UZS'}
                    </Text>
                    <Text style={styles.paymentDescription} allowFontScaling={true}>
                      {payment.description || t('payments.monthlyPaymentLabel', { defaultValue: 'Oylik to\'lov' })}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="card-outline"
              title={t('payments.noPayments', { defaultValue: 'To\'lovlar yo\'q' })}
              description={t('payments.noPaymentsDesc', { defaultValue: 'Hozircha to\'lovlar mavjud emas' })}
            />
          </Card>
        )}
      </View>
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
  monthlyCard: {
    marginBottom: tokens.space.lg,
  },
  monthlyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.md,
  },
  monthlyCardLeft: {
    flex: 1,
  },
  monthlyCardTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
    marginBottom: tokens.space.sm,
  },
  monthlyCardSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255,255,255,0.9)',
  },
  monthlyCardRight: {
    alignItems: 'flex-end',
  },
  daysRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.sm,
  },
  daysRemainingText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: '#fff',
  },
  daysOverdueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.sm,
  },
  daysOverdueText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: '#FFD700',
  },
  monthlyAmount: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255,255,255,0.9)',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    marginTop: tokens.space.md,
  },
  noteText: {
    flex: 1,
    fontSize: tokens.type.sub.fontSize,
    color: '#fff',
    lineHeight: 18,
  },
  noteLabel: {
    fontWeight: tokens.type.h3.fontWeight,
  },
  historySection: {
    marginTop: tokens.space.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.lg,
  },
  historyTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  paymentsList: {
    gap: tokens.space.md,
  },
  paymentCard: {
    marginBottom: tokens.space.sm,
  },
  paymentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.semantic.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  paymentProvider: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  paymentCardRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  paymentDescription: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.tertiary,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
});
