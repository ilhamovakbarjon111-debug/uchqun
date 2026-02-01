import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ParentsListScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getParents();
      const parentsList = Array.isArray(data?.parents) ? data.parents : (Array.isArray(data) ? data : []);
      setParents(parentsList);
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (parents.length === 0) {
    return <EmptyState message="No parents found" />;
  }

  const renderParent = ({ item }) => (
    <Pressable onPress={() => navigation.navigate('ParentDetail', { parentId: item.id })}>
      <Card>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
        {item.email && <Text style={styles.email}>{item.email}</Text>}
        {item.children && item.children.length > 0 && (
          <Text style={styles.children}>
            {item.children.length} child{item.children.length > 1 ? 'ren' : ''}
          </Text>
        )}
      </Card>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={parents}
        renderItem={renderParent}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadParents}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  children: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
