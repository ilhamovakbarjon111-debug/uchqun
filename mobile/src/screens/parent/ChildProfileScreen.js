import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import ListRow from '../../components/common/ListRow';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export function ChildProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // DATA SAFETY: Safe param access with defaults
  const { childId = null } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);

  // ROUTE SAFETY: Show fallback if required param missing
  if (!childId) {
    return (
      <Screen scroll={true} padded={true}>
        <Card>
          <View style={{ padding: tokens.space.xl, alignItems: 'center' }}>
            <Ionicons name="alert-circle-outline" size={48} color={tokens.colors.semantic.error} />
            <Text style={{ marginTop: tokens.space.md, fontSize: tokens.type.body.fontSize, color: tokens.colors.text.secondary }}>
              Missing childId parameter
            </Text>
          </View>
        </Card>
      </Screen>
    );
  }

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      setLoading(true);
      const children = await parentService.getChildren();
      const found = Array.isArray(children) ? children.find((c) => c.id === childId) : null;
      setChild(found);
    } catch (error) {
      console.error('Error loading child:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const header = (
    <View style={styles.topBar}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
      </Pressable>
      <Text style={styles.topBarTitle} allowFontScaling={true}>
        {child ? `${child.firstName} ${child.lastName}` : 'Child Profile'}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header}>
        {loading ? (
          <Card style={styles.card}>
            <Skeleton width={80} height={80} variant="circle" style={{ alignSelf: 'center', marginBottom: tokens.space.lg }} />
            <Skeleton width="100%" height={60} style={{ marginBottom: tokens.space.md }} />
            <Skeleton width="100%" height={60} style={{ marginBottom: tokens.space.md }} />
          </Card>
        ) : !child ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="person-outline"
              title="Child not found"
              description="The requested child profile could not be loaded"
            />
          </Card>
        ) : (
          <>
            <Card style={styles.card}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionTitle} allowFontScaling={true}>Basic Information</Text>
              
              <ListRow
                icon="person-outline"
                iconColor={tokens.colors.accent.blue}
                title="Name"
                subtitle={`${child.firstName || ''} ${child.lastName || ''}`}
                chevron={false}
                style={styles.infoRow}
              />
              
              {child.dateOfBirth && (
                <ListRow
                  icon="calendar-outline"
                  iconColor={tokens.colors.accent.blue}
                  title="Date of Birth"
                  subtitle={formatDate(child.dateOfBirth)}
                  chevron={false}
                  style={styles.infoRow}
                />
              )}
              
              {child.gender && (
                <ListRow
                  icon="person-circle-outline"
                  iconColor={tokens.colors.accent.blue}
                  title="Gender"
                  subtitle={child.gender}
                  chevron={false}
                  style={styles.infoRow}
                />
              )}
            </Card>

            {child.teacher && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle} allowFontScaling={true}>Teacher</Text>
                <View style={styles.teacherContainer}>
                  <View style={styles.teacherAvatar}>
                    <Text style={styles.teacherAvatarText}>
                      {child.teacher.firstName?.charAt(0) || ''}{child.teacher.lastName?.charAt(0) || ''}
                    </Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName} allowFontScaling={true}>
                      {child.teacher.firstName} {child.teacher.lastName}
                    </Text>
                    {child.teacher.email && (
                      <Text style={styles.teacherEmail} allowFontScaling={true}>
                        {child.teacher.email}
                      </Text>
                    )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: tokens.space.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  placeholder: {
    width: 44,
  },
  card: {
    marginBottom: tokens.space.lg,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: tokens.space.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  infoRow: {
    marginBottom: tokens.space.sm,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.space.sm,
  },
  teacherAvatar: {
    width: 50,
    height: 50,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  teacherAvatarText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  teacherEmail: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
  },
});
