import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tokens from '../../styles/tokens';

/**
 * JoyfulIcon - Renders emoji icons with optional animated backgrounds
 * More expressive and child-friendly than standard vector icons
 */
export default function JoyfulIcon({
  emoji,
  size = 'md',
  variant = 'default', // 'default' | 'gradient' | 'soft' | 'outline'
  color = tokens.colors.accent.blue,
  gradientColors,
  style,
  animated = false,
}) {
  const sizeMap = {
    xs: { container: 28, emoji: 14 },
    sm: { container: 36, emoji: 18 },
    md: { container: 48, emoji: 24 },
    lg: { container: 64, emoji: 32 },
    xl: { container: 80, emoji: 42 },
    '2xl': { container: 100, emoji: 52 },
  };

  const { container: containerSize, emoji: emojiSize } = sizeMap[size] || sizeMap.md;

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'gradient':
        return null; // Will use LinearGradient
      case 'soft':
        return { backgroundColor: `${color}15` };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: `${color}30`,
        };
      default:
        return { backgroundColor: `${color}15` };
    }
  };

  const containerStyles = [
    styles.container,
    {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    },
    getBackgroundStyle(),
    style,
  ];

  const content = (
    <Text style={[styles.emoji, { fontSize: emojiSize }]} allowFontScaling={false}>
      {emoji}
    </Text>
  );

  if (variant === 'gradient') {
    const colors = gradientColors || tokens.colors.gradients.primary;
    return (
      <View style={[styles.gradientWrapper, { borderRadius: containerSize / 2 }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyles, styles.gradientContainer]}
        >
          {content}
        </LinearGradient>
      </View>
    );
  }

  return <View style={containerStyles}>{content}</View>;
}

// Pre-configured joyful icons for common use cases
export function ActivityIcon(props) {
  return <JoyfulIcon emoji="🎨" color={tokens.colors.joy.lavender} {...props} />;
}

export function MealIcon(props) {
  return <JoyfulIcon emoji="🍽️" color={tokens.colors.joy.peach} {...props} />;
}

export function MediaIcon(props) {
  return <JoyfulIcon emoji="📸" color={tokens.colors.joy.sky} {...props} />;
}

export function ChildIcon(props) {
  return <JoyfulIcon emoji="👶" color={tokens.colors.joy.rose} {...props} />;
}

export function TeacherIcon(props) {
  return <JoyfulIcon emoji="👩‍🏫" color={tokens.colors.joy.emerald} {...props} />;
}

export function NotificationIcon(props) {
  return <JoyfulIcon emoji="🔔" color={tokens.colors.joy.sunflower} {...props} />;
}

export function ChatIcon(props) {
  return <JoyfulIcon emoji="💬" color={tokens.colors.joy.lavender} {...props} />;
}

export function AIIcon(props) {
  return <JoyfulIcon emoji="🤖" color={tokens.colors.joy.sky} variant="gradient" {...props} />;
}

export function StarIcon(props) {
  return <JoyfulIcon emoji="⭐" color={tokens.colors.joy.sunflower} {...props} />;
}

export function SuccessIcon(props) {
  return <JoyfulIcon emoji="🎉" color={tokens.colors.semantic.success} {...props} />;
}

export function HeartIcon(props) {
  return <JoyfulIcon emoji="💖" color={tokens.colors.joy.coral} {...props} />;
}

export function SchoolIcon(props) {
  return <JoyfulIcon emoji="🏫" color={tokens.colors.accent.blue} {...props} />;
}

export function CalendarIcon(props) {
  return <JoyfulIcon emoji="📅" color={tokens.colors.joy.mint} {...props} />;
}

export function SettingsIcon(props) {
  return <JoyfulIcon emoji="⚙️" color={tokens.colors.text.secondary} {...props} />;
}

// Meal type icons
export function BreakfastIcon(props) {
  return <JoyfulIcon emoji="🥞" color={tokens.colors.joy.sunflower} {...props} />;
}

export function LunchIcon(props) {
  return <JoyfulIcon emoji="🍱" color={tokens.colors.joy.peach} {...props} />;
}

export function SnackIcon(props) {
  return <JoyfulIcon emoji="🍎" color={tokens.colors.joy.coral} {...props} />;
}

export function DinnerIcon(props) {
  return <JoyfulIcon emoji="🍝" color={tokens.colors.joy.lavender} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientWrapper: {
    ...tokens.shadow.soft,
  },
  gradientContainer: {
    backgroundColor: 'transparent',
  },
  emoji: {
    textAlign: 'center',
  },
});
