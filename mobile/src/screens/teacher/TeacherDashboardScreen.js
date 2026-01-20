import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import DecorativeBackground from '../../components/common/DecorativeBackground';
import theme from '../../styles/theme';

export function TeacherDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentsData, setParentsData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, tasksData, parentsData] = await Promise.all([
        teacherService.getDashboard().catch(() => null),
        teacherService.getTasks().catch(() => []),
        teacherService.getParents().catch(() => []),
      ]);
      setStats(dashboardData);
      
      // Filter today's tasks
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = Array.isArray(tasksData) ? tasksData.filter(task => {
        if (task.dueDate) {
          return task.dueDate.startsWith(today);
        }
        return false;
      }).slice(0, 4) : [];
      setTasks(todayTasks);
      setParentsData(parentsData);

      // Extract children from parents data
      const allChildren = [];
      if (Array.isArray(parentsData)) {
        parentsData.forEach(parent => {
          if (parent.children && Array.isArray(parent.children)) {
            allChildren.push(...parent.children);
          }
        });
      }
      // Sort by name for ranking display
      allChildren.sort((a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
      setChildren(allChildren.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calculate progress percentage (example: based on completed tasks)
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.isCompleted).length;
  const totalTasks = tasks.length || 4;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 65;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      title: 'Parents',
      value: stats?.parents || stats?.parentsCount || 0,
      icon: 'people',
      color: theme.Colors.cards.parents,
      onPress: () => navigation.navigate('TeacherTabs', { screen: 'Parents' }),
    },
    {
      title: 'Activities',
      value: stats?.activities || stats?.activitiesCount || 0,
      icon: 'checkmark-circle',
      color: theme.Colors.cards.activities,
      onPress: () => navigation.navigate('TeacherTabs', { screen: 'Activities' }),
    },
    {
      title: 'Meals',
      value: stats?.meals || stats?.mealsCount || 0,
      icon: 'restaurant',
      color: theme.Colors.cards.meals,
      onPress: () => navigation.navigate('TeacherTabs', { screen: 'Meals' }),
    },
  ];

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.navigate('TeacherTabs', { screen: 'Settings' })}
            >
              <Ionicons name="menu" size={24} color={theme.Colors.text.inverse} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={theme.Colors.text.inverse} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.nameText}>
            {user?.firstName || ''} {user?.lastName || ''}
          </Text>
          <View style={styles.motivationalContainer}>
            <Text style={styles.motivationalText}>
              You're doing amazing! Keep it up ☀️
            </Text>
          </View>
        </View>

        {/* Today's Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Progress</Text>
              <Text style={styles.sectionSubtitle}>Here's what's next</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{progressPercentage}%</Text>
            </View>
          </View>

          {/* Stats Cards */}
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

        {/* Children Ranking Section */}
        {children.length > 0 && (
          <View style={styles.rankingSection}>
            <View style={styles.rankingHeader}>
              <Text style={styles.sectionTitle}>Children Ranking</Text>
              <Pressable onPress={() => navigation.navigate('TeacherTabs', { screen: 'Parents' })}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.rankingList}>
              {children.map((child, index) => (
                <Pressable
                  key={child.id || index}
                  style={styles.rankingCard}
                  onPress={() => {
                    // Navigate to Parents tab to see all children
                    navigation.navigate('TeacherTabs', { screen: 'Parents' });
                  }}
                >
                  <View style={styles.rankingNumber}>
                    <Text style={styles.rankingNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.rankingAvatar}>
                    <Text style={styles.rankingAvatarText}>
                      {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.rankingInfo}>
                    <Text style={styles.rankingName}>
                      {child.firstName} {child.lastName}
                    </Text>
                    {child.dateOfBirth && (
                      <Text style={styles.rankingAge}>
                        {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years old
                      </Text>
                    )}
                  </View>
                  <Ionicons name="star" size={20} color={theme.Colors.status.warning} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Today's Tasks Section */}
        {tasks.length > 0 && (
          <View style={styles.tasksSection}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <Text style={styles.tasksProgress}>
                {completedTasks} of {totalTasks} done
              </Text>
            </View>
            
            <View style={styles.tasksList}>
              {tasks.map((task, index) => {
                const isCompleted = task.status === 'completed' || task.isCompleted;
                return (
                  <Pressable 
                    key={task.id || index} 
                    style={styles.taskCard}
                    onPress={() => navigation.navigate('Tasks')}
                  >
                    <View style={styles.taskIcon}>
                      <Ionicons 
                        name={isCompleted ? 'checkmark-circle' : 'time-outline'} 
                        size={20} 
                        color={isCompleted ? theme.Colors.status.success : theme.Colors.text.secondary} 
                      />
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                        {task.title || task.name || `Task ${index + 1}`}
                      </Text>
                      {task.dueTime && (
                        <Text style={styles.taskTime}>{task.dueTime}</Text>
                      )}
                    </View>
                    {isCompleted && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={theme.Colors.status.success} 
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
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
  menuButton: {
    padding: theme.Spacing.xs,
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
  // Progress Section
  progressSection: {
    paddingHorizontal: theme.Spacing.md,
    paddingTop: theme.Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.Colors.primary.blueBg,
    borderWidth: 4,
    borderColor: theme.Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
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
  // Ranking Section
  rankingSection: {
    marginTop: theme.Spacing.lg,
    paddingHorizontal: theme.Spacing.md,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  viewAllText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.semibold,
  },
  rankingList: {
    gap: theme.Spacing.sm,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.card,
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    ...theme.Colors.shadow.sm,
  },
  rankingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  rankingNumberText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  rankingAvatarText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  rankingAge: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  // Tasks Section
  tasksSection: {
    paddingHorizontal: theme.Spacing.md,
    paddingTop: theme.Spacing.lg,
    marginTop: theme.Spacing.md,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  tasksProgress: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    fontWeight: theme.Typography.weights.medium,
  },
  tasksList: {
    gap: theme.Spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    ...theme.Colors.shadow.sm,
  },
  taskIcon: {
    marginRight: theme.Spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.Colors.text.secondary,
  },
  taskTime: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
});
