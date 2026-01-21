import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Image,
  View,
  Pressable,
  Text,
  Dimensions,
  Animated,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { ImageViewer } from '../../components/common/ImageViewer';

const { width } = Dimensions.get('window');
const GRID_GAP = tokens.space.sm;
const GRID_PADDING = tokens.space.lg;
const COLUMNS = 3;
const itemSize = (width - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

export function MediaScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [media, setMedia] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await parentService.getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    setRefreshing(false);
  };

  const openImageViewer = (item, index) => {
    const imageUrl = item.url || item.photoUrl || item.thumbnailUrl;
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setSelectedIndex(index);
      setViewerVisible(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group media by date
  const groupedMedia = media.reduce((groups, item) => {
    const dateKey = formatDate(item.createdAt || item.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {});

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#EC4899', '#F472B6']}
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
          <Text style={styles.headerEmoji}>📸</Text>
          <View>
            <Text style={styles.headerTitle}>Galereya</Text>
            <Text style={styles.headerSubtitle}>
              {media.length} ta rasm
            </Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen
      scroll={true}
      padded={false}
      header={header}
      contentStyle={styles.content}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <View key={i} style={styles.skeletonWrapper}>
                <Skeleton
                  width={itemSize}
                  height={itemSize}
                  style={styles.skeletonItem}
                />
              </View>
            ))}
          </View>
        ) : media.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <EmptyState
                emoji="📷"
                title="Rasmlar topilmadi"
                description="Yangi rasmlar va videolar tez orada qo'shiladi"
              />
            </Card>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {Object.entries(groupedMedia).map(([date, dateMedia]) => (
              <View key={date} style={styles.dateSection}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateIcon}>
                    <Text style={styles.dateEmoji}>📅</Text>
                  </View>
                  <Text style={styles.dateLabel}>{date}</Text>
                  <Text style={styles.dateCount}>{dateMedia.length} ta</Text>
                </View>
                <View style={styles.grid}>
                  {dateMedia.map((item, index) => {
                    const imageUrl = item.url || item.photoUrl || item.thumbnailUrl;
                    if (!imageUrl) return null;

                    const globalIndex = media.findIndex((m) => m.id === item.id);
                    const isVideo = item.type === 'video' || item.mediaType === 'video';

                    return (
                      <Pressable
                        key={item.id || index}
                        style={({ pressed }) => [
                          styles.mediaItem,
                          pressed && styles.mediaItemPressed,
                        ]}
                        onPress={() => openImageViewer(item, globalIndex)}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                        {isVideo && (
                          <View style={styles.videoOverlay}>
                            <View style={styles.playButton}>
                              <Ionicons name="play" size={20} color="#fff" />
                            </View>
                          </View>
                        )}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.3)']}
                          style={styles.imageGradient}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {viewerVisible && selectedImage && (
        <ImageViewer
          imageUri={selectedImage}
          visible={viewerVisible}
          onClose={() => {
            setViewerVisible(false);
            setSelectedImage(null);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tokens.space['3xl'],
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.space.md,
    gap: tokens.space.sm,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: tokens.type.caption.fontSize,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: GRID_GAP,
  },
  skeletonWrapper: {
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  skeletonItem: {
    borderRadius: tokens.radius.md,
  },
  emptyContainer: {
    padding: GRID_PADDING,
    paddingTop: tokens.space.xl,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  dateSection: {
    marginBottom: tokens.space.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingVertical: tokens.space.md,
    gap: tokens.space.sm,
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.joy.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateEmoji: {
    fontSize: 16,
  },
  dateLabel: {
    flex: 1,
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  dateCount: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.pill,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
  },
  mediaItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    backgroundColor: tokens.colors.joy.skySoft,
  },
  mediaItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
