import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const DecorativeBackground = () => {
  // Och ko'k rang
  const lightBlue = '#B3E5FC'; // #E3F2FD dan yanada och ko'k

  // Dekorativ elementlar
  const decorativeElements = [
    // O'yinchoq ayiqchalar (emoji yoki oddiy shakllar)
    { type: 'bear', top: 10, left: 20, size: 30, rotation: -15 },
    { type: 'bear', top: 150, left: 80, size: 25, rotation: 20 },
    { type: 'bear', top: 300, left: 15, size: 35, rotation: -10 },
    { type: 'bear', top: 500, left: 70, size: 28, rotation: 15 },
    
    // O'yinchoq mashinalar
    { type: 'car', top: 50, left: 60, size: 40, rotation: 25 },
    { type: 'car', top: 200, left: 10, size: 35, rotation: -20 },
    { type: 'car', top: 400, left: 50, size: 38, rotation: 10 },
    { type: 'car', top: 600, left: 25, size: 32, rotation: -15 },
    
    // Yulduzchalar
    { type: 'star', top: 30, left: 45, size: 20, rotation: 0 },
    { type: 'star', top: 120, left: 30, size: 18, rotation: 45 },
    { type: 'star', top: 250, left: 75, size: 22, rotation: -45 },
    { type: 'star', top: 350, left: 20, size: 19, rotation: 30 },
    { type: 'star', top: 450, left: 65, size: 21, rotation: -30 },
    { type: 'star', top: 550, left: 40, size: 17, rotation: 60 },
    
    // Ipli pufakchalar
    { type: 'bubble', top: 80, left: 35, size: 25, rotation: 0 },
    { type: 'bubble', top: 180, left: 55, size: 30, rotation: 0 },
    { type: 'bubble', top: 280, left: 25, size: 22, rotation: 0 },
    { type: 'bubble', top: 380, left: 60, size: 28, rotation: 0 },
    { type: 'bubble', top: 480, left: 15, size: 24, rotation: 0 },
    { type: 'bubble', top: 580, left: 50, size: 26, rotation: 0 },
  ];

  const renderElement = (element) => {
    const style = {
      position: 'absolute',
      top: element.top,
      left: `${element.left}%`,
      width: element.size,
      height: element.size,
      opacity: 0.3,
      transform: [{ rotate: `${element.rotation}deg` }],
    };

    switch (element.type) {
      case 'bear':
        // Oddiy ayiqcha shakli - ikki yumaloq (bosh va tanasi)
        return (
          <View key={`${element.type}-${element.top}-${element.left}`} style={style}>
            <View style={[styles.bearHead, { backgroundColor: lightBlue }]} />
            <View style={[styles.bearBody, { backgroundColor: lightBlue }]} />
          </View>
        );
      
      case 'car':
        // Oddiy mashina shakli - to'rtburchak va yumaloq
        return (
          <View key={`${element.type}-${element.top}-${element.left}`} style={style}>
            <View style={[styles.carBody, { backgroundColor: lightBlue }]} />
            <View style={[styles.carWindow, { backgroundColor: lightBlue, opacity: 0.5 }]} />
            <View style={[styles.carWheel, { backgroundColor: lightBlue }]} />
            <View style={[styles.carWheel, { backgroundColor: lightBlue, left: element.size * 0.6 }]} />
          </View>
        );
      
      case 'star':
        // Yulduzcha shakli - emoji
        return (
          <View key={`${element.type}-${element.top}-${element.left}`} style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: element.size, opacity: 0.4 }}>⭐</Text>
          </View>
        );
      
      case 'bubble':
        // Ipli pufakcha - yumaloq
        return (
          <View key={`${element.type}-${element.top}-${element.left}`} style={style}>
            <View style={[styles.bubble, { backgroundColor: lightBlue, width: element.size, height: element.size, borderRadius: element.size / 2 }]} />
            <View style={[styles.bubbleString, { backgroundColor: lightBlue, opacity: 0.4 }]} />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {decorativeElements.map(renderElement)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  // Ayiqcha shakllari
  bearHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 5,
  },
  bearBody: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    top: 15,
    left: 6,
  },
  // Mashina shakllari
  carBody: {
    width: 30,
    height: 15,
    borderRadius: 3,
    position: 'absolute',
    top: 10,
    left: 5,
  },
  carWindow: {
    width: 12,
    height: 8,
    borderRadius: 2,
    position: 'absolute',
    top: 12,
    left: 14,
  },
  carWheel: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 20,
    left: 8,
  },
  // Pufakcha shakllari
  bubble: {
    position: 'absolute',
  },
  bubbleString: {
    position: 'absolute',
    width: 1,
    height: 8,
    top: -8,
    left: '50%',
    marginLeft: -0.5,
  },
});

export default DecorativeBackground;
