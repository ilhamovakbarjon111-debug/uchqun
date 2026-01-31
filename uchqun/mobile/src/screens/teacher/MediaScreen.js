import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Image, View, Pressable, Modal, TextInput, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mediaService } from '../../services/mediaService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageViewer } from '../../components/common/ImageViewer';

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 3;

export function MediaScreen() {
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
          <Ionicons name="trash" size={20} color="#ef4444" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={handleCreate}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Media</Text>
      </Pressable>
      {media.length === 0 ? (
        <EmptyState message="No media found" />
      ) : (
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadMedia}
        />
      )}

      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImage}
        onClose={() => setViewerVisible(false)}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Media</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
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
    backgroundColor: '#f3f4f6',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    padding: 16,
  },
  mediaItemContainer: {
    width: itemSize,
    height: itemSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
