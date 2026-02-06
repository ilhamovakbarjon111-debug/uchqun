import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import tokens from '../../styles/tokens';

/**
 * ScreenHeader - Reusable header component for all teacher screens
 * Supports back button (when showBack=true), title, and optional right action
 * No burger menu - removed per design requirements
 */
export function ScreenHeader({ 
  title, 
  showBack = true, 
  rightAction,
  rightActionIcon,
  onRightActionPress,
  notificationBadge = false,
}) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Left: Back button or empty space */}
        {showBack ? (
          <Pressable
            style={styles.leftButton}
            onPress={handleBack}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={tokens.colors.text.primary} 
            />
          </Pressable>
        ) : (
          <View style={styles.leftButton} />
        )}

        {/* Center: Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title || t('common.title', { defaultValue: 'Screen' })}
        </Text>

        {/* Right: Action button or placeholder */}
        {rightAction || rightActionIcon ? (
          <Pressable
            style={styles.rightButton}
            onPress={onRightActionPress}
          >
            <Ionicons 
              name={rightActionIcon || "ellipsis-horizontal"} 
              size={24} 
              color={tokens.colors.text.primary} 
            />
            {notificationBadge && (
              <View style={styles.notificationBadge}>
                <View style={styles.badgeDot} />
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background.primary,
    paddingTop: 8,
    paddingBottom: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginHorizontal: tokens.space.md,
  },
  rightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.warning,
  },
  badgeDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.warning,
  },
});
