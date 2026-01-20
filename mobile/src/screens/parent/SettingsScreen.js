import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'AI Assistant',
      onPress: () => navigation.navigate('AIChat'),
    },
    {
      icon: 'star-outline',
      title: 'Rate Teacher',
      onPress: () => navigation.navigate('TeacherRating'),
    },
    {
      icon: 'school-outline',
      title: 'Rate School',
      onPress: () => navigation.navigate('SchoolRating'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => Alert.alert('About', 'Uchqun Platform v1.0.0'),
    },
    {
      icon: 'log-out-outline',
      title: 'Logout',
      onPress: handleLogout,
      destructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="people" size={14} color={theme.Colors.cards.parents} />
                <Text style={styles.roleText}>Parent</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Account</Text>
          {settingsItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.destructive ? theme.Colors.status.error : theme.Colors.text.secondary}
                />
                <Text
                  style={[
                    styles.settingsItemText,
                    item.destructive && styles.settingsItemTextDestructive,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.Colors.text.tertiary}
              />
            </Pressable>
          ))}
        </Card>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  userEmail: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.Colors.cards.parents + '20',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: theme.Spacing.xs / 2,
    borderRadius: theme.BorderRadius.sm,
  },
  roleText: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.cards.parents,
    marginLeft: theme.Spacing.xs / 2,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    marginLeft: theme.Spacing.md,
    fontWeight: theme.Typography.weights.medium,
  },
  settingsItemTextDestructive: {
    color: theme.Colors.status.error,
  },
});
