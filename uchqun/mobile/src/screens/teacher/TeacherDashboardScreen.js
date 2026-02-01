import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function TeacherDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getDashboard();
      setStats(data);
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
      title: 'Parents',
      value: stats?.parents || 0,
      icon: 'people-outline',
      onPress: () => navigation.navigate('Parents'),
    },
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
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Profile</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('Responsibilities')}
            >
              <Ionicons name="list-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Responsibilities</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Tasks</Text>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
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
