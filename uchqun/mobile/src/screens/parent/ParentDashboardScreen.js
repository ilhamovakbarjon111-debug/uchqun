import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ParentDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, activitiesData, mealsData, mediaData] = await Promise.all([
        parentService.getChildren().catch(() => []),
        parentService.getActivities().catch(() => []),
        parentService.getMeals().catch(() => []),
        parentService.getMedia().catch(() => []),
      ]);

      setChildren(Array.isArray(childrenData) ? childrenData : []);
      if (childrenData.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenData[0].id);
      }

      const activities = Array.isArray(activitiesData) ? activitiesData : [];
      const meals = Array.isArray(mealsData) ? mealsData : [];
      const media = Array.isArray(mediaData) ? mediaData : [];

      setStats({
        activities: activities.length,
        meals: meals.length,
        media: media.length,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Activities',
      value: stats?.activities || 0,
      icon: 'clipboard-outline',
      onPress: () => navigation.navigate('Activities'),
    },
    {
      title: 'Meals',
      value: stats?.meals || 0,
      icon: 'restaurant-outline',
      onPress: () => navigation.navigate('Meals'),
    },
    {
      title: 'Media',
      value: stats?.media || 0,
      icon: 'images-outline',
      onPress: () => navigation.navigate('Media'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.nameText}>
            {user?.firstName || ''} {user?.lastName || ''}
          </Text>
          {children.length > 0 && (
            <View style={styles.childSelector}>
              <Text style={styles.childLabel}>Select Child:</Text>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childButton,
                    selectedChildId === child.id && styles.childButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedChildId(child.id);
                    navigation.navigate('ChildProfile', { childId: child.id });
                  }}
                >
                  <Text
                    style={[
                      styles.childButtonText,
                      selectedChildId === child.id && styles.childButtonTextActive,
                    ]}
                  >
                    {child.firstName} {child.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statCards.map((stat, index) => (
            <Pressable key={index} onPress={stat.onPress} style={styles.statCard}>
              <Ionicons name={stat.icon} size={32} color="#2563eb" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <Card>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('AIChat')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>AI Assistant</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Notifications</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('TeacherRating')}
            >
              <Ionicons name="star-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Rate Teacher</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#2563eb',
    marginBottom: 16,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  childSelector: {
    marginTop: 16,
  },
  childLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  childButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  childButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  childButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  childButtonTextActive: {
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
});
