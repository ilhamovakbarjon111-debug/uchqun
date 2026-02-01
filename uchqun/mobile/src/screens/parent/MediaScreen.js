import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Image, View, Pressable, Dimensions } from 'react-native';
import { parentService } from '../../services/parentService';
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

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await parentService.getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const openImageViewer = (item) => {
    // Get signed URL for viewing
    if (item.url || item.photoUrl) {
      setSelectedImage(item.url || item.photoUrl);
      setViewerVisible(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (media.length === 0) {
    return <EmptyState message="No media found" />;
  }

  const renderMediaItem = ({ item }) => {
    const imageUrl = item.url || item.photoUrl || item.thumbnailUrl;
    if (!imageUrl) return null;

    return (
      <Pressable
        style={styles.mediaItem}
        onPress={() => openImageViewer(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadMedia}
      />
      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImage}
        onClose={() => setViewerVisible(false)}
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
  mediaItem: {
    width: itemSize,
    height: itemSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
