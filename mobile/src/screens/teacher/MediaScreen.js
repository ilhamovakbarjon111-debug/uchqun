import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Image, View, Pressable, Modal, TextInput, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mediaService } from '../../services/mediaService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageViewer } from '../../components/common/ImageViewer';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 3;

export function MediaScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    childId: '',
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ title: '', description: '', childId: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await mediaService.createMedia(formData);
      setShowModal(false);
      loadMedia();
    } catch (error) {
      console.error('Error saving media:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await mediaService.deleteMedia(id);
      loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const openImageViewer = (item) => {
    const imageUrl = item.url || item.photoUrl || item.thumbnailUrl;
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setViewerVisible(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderMediaItem = ({ item }) => {
    const imageUrl = item.url || item.photoUrl || item.thumbnailUrl;
    if (!imageUrl) return null;

    return (
      <View style={styles.mediaItemContainer}>
        <Pressable onPress={() => openImageViewer(item)}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={theme.Colors.text.inverse} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Media" rightAction={handleCreate} rightIcon="add" />
      {media.length === 0 ? (
        <EmptyState icon="images-outline" message="No media found" />
      ) : (
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadMedia}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color={theme.Colors.text.inverse} />
      </TouchableOpacity>

      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImage}
        onClose={() => setViewerVisible(false)}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Media</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: theme.Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.Colors.cards.media,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.Colors.shadow.lg,
  },
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  mediaItemContainer: {
    width: itemSize,
    height: itemSize,
    margin: 4,
    borderRadius: theme.BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    ...theme.Colors.shadow.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.Colors.status.error,
    borderRadius: theme.BorderRadius.sm,
    padding: 6,
    ...theme.Colors.shadow.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.lg,
    padding: theme.Spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...theme.Colors.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    padding: theme.Spacing.md,
    marginBottom: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    backgroundColor: theme.Colors.background.card,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
    marginRight: theme.Spacing.md,
  },
  cancelButtonText: {
    color: theme.Colors.text.secondary,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
  },
  saveButton: {
    backgroundColor: theme.Colors.cards.media,
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.sm,
  },
  saveButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
