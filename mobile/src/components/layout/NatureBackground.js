import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export function NatureBackground({ children }) {
  return (
    <View style={styles.container}>
      {/* Absolute positioned background container */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Sky gradient base */}
        <LinearGradient
          colors={['#e0f2fe', '#dbeafe', '#ecfdf5']} // sky-200 → blue-100 → emerald-50
          style={StyleSheet.absoluteFillObject}
        />

        {/* Clouds layer */}
        <View style={[styles.cloud, { top: 64, left: 16, width: 128, height: 64 }]} />
        <View style={[styles.cloud, { top: 96, right: 32, width: 160, height: 80, opacity: 0.3 }]} />
        <View style={[styles.cloud, { top: 160, left: 48, width: 144, height: 72, opacity: 0.35 }]} />
        <View style={[styles.cloud, { top: 120, right: 100, width: 120, height: 60, opacity: 0.25 }]} />

        {/* Sun rays */}
        <View style={styles.sunRays} />

        {/* Distant Hills - furthest back */}
        <View style={[styles.hillContainer, { bottom: 128 }]}>
          <Svg height={192} width={width} viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
            <Path
              d={`M0,100 Q${width * 0.25},60 ${width * 0.5},90 T${width},80 L${width},200 L0,200 Z`}
              fill="#86efac"
              opacity={0.3}
            />
          </Svg>
        </View>

        {/* Middle Hills */}
        <View style={[styles.hillContainer, { bottom: 80 }]}>
          <Svg height={224} width={width} viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
            <Path
              d={`M0,120 Q${width * 0.25},80 ${width * 0.5},100 T${width},90 L${width},200 L0,200 Z`}
              fill="#86efac"
              opacity={0.5}
            />
          </Svg>
        </View>

        {/* Foreground Slope */}
        <View style={[styles.hillContainer, { bottom: 64 }]}>
          <Svg height={160} width={width} viewBox={`0 0 ${width} 150`} preserveAspectRatio="none">
            <Path
              d={`M0,80 Q${width * 0.25},50 ${width * 0.5},70 T${width},60 L${width},150 L0,150 Z`}
              fill="#86efac"
              opacity={0.7}
            />
          </Svg>
        </View>

        {/* Grass Gradient Overlay */}
        <LinearGradient
          colors={['rgba(134, 239, 172, 0.8)', 'transparent']}
          style={styles.grassGradient}
        />

        {/* Scattered Flowers */}
        <View style={[styles.flower, { bottom: 96, left: 32 }]}>
          <View style={[styles.bloom, { backgroundColor: '#fbcfe8' }]} />
          <View style={styles.stem} />
        </View>
        <View style={[styles.flower, { bottom: 110, left: 80 }]}>
          <View style={[styles.bloom, { backgroundColor: '#fef08a', width: 10, height: 10 }]} />
          <View style={[styles.stem, { height: 28 }]} />
        </View>
        <View style={[styles.flower, { bottom: 88, right: 60 }]}>
          <View style={[styles.bloom, { backgroundColor: '#e9d5ff', width: 14, height: 14 }]} />
          <View style={[styles.stem, { height: 36 }]} />
        </View>
        <View style={[styles.flower, { bottom: 105, right: 120 }]}>
          <View style={[styles.bloom, { backgroundColor: '#bfdbfe', width: 11, height: 11 }]} />
          <View style={styles.stem} />
        </View>
        <View style={[styles.flower, { bottom: 92, left: width * 0.4 }]}>
          <View style={[styles.bloom, { backgroundColor: '#fbcfe8', width: 12, height: 12 }]} />
          <View style={[styles.stem, { height: 34 }]} />
        </View>
        <View style={[styles.flower, { bottom: 115, right: 40 }]}>
          <View style={[styles.bloom, { backgroundColor: '#fef08a', width: 9, height: 9 }]} />
          <View style={[styles.stem, { height: 26 }]} />
        </View>
        <View style={[styles.flower, { bottom: 100, left: width * 0.6 }]}>
          <View style={[styles.bloom, { backgroundColor: '#e9d5ff', width: 13, height: 13 }]} />
          <View style={[styles.stem, { height: 30 }]} />
        </View>
      </View>

      {/* Content with relative z-index */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 9999,
    opacity: 0.4,
  },
  sunRays: {
    position: 'absolute',
    top: 80,
    right: 32,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(254, 243, 199, 0.2)', // yellow-100 with 20% opacity
    borderRadius: 9999,
  },
  hillContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  grassGradient: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    height: 128,
  },
  flower: {
    position: 'absolute',
    alignItems: 'center',
  },
  bloom: {
    width: 12,
    height: 12,
    borderRadius: 9999,
    opacity: 0.6,
  },
  stem: {
    width: 2,
    height: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.4)', // green-400 with 40% opacity
    marginTop: -32,
  },
});
