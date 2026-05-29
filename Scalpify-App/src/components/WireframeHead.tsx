import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Line, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

export function WireframeHead({
  size = 280,
  scanLine = true,
  animated = true,
}: {
  size?: number;
  scanLine?: boolean;
  animated?: boolean;
}) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (scanLine && animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [animated, scanLine]);

  const cx = size / 2;
  const cy = size * 0.48;
  const rx = size * 0.30;
  const ry = size * 0.40;

  const wireColor = 'rgba(255,255,255,0.12)';
  const wireWidth = 0.8;

  const latLines = 8;
  const lonLines = 12;

  const latitudeLines = [];
  for (let i = 1; i < latLines; i++) {
    const t = i / latLines;
    const y = cy - ry + t * 2 * ry;
    const localRx = rx * Math.sqrt(1 - Math.pow((y - cy) / ry, 2));
    if (localRx > 2) {
      latitudeLines.push(
        <Ellipse
          key={`lat-${i}`}
          cx={cx}
          cy={y}
          rx={localRx}
          ry={localRx * 0.15}
          stroke={wireColor}
          strokeWidth={wireWidth}
          fill="none"
        />,
      );
    }
  }

  const longitudeLines = [];
  for (let i = 0; i < lonLines; i++) {
    const angle = (i / lonLines) * Math.PI;
    const x1 = cx + rx * Math.cos(angle);
    const y1 = cy;
    const cp1x = cx + rx * 0.5 * Math.cos(angle);
    const cp1y = cy - ry;
    const cp2x = cx + rx * 0.5 * Math.cos(angle);
    const cp2y = cy + ry;

    longitudeLines.push(
      <Path
        key={`lon-${i}`}
        d={`M ${x1} ${cy - ry * 0.95} Q ${cx + rx * 1.1 * Math.cos(angle)} ${cy} ${x1} ${cy + ry * 0.95}`}
        stroke={wireColor}
        strokeWidth={wireWidth}
        fill="none"
      />,
    );
  }

  const earSize = size * 0.06;
  const earY = cy + size * 0.02;

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cy - ry * 0.6, cy + ry * 0.3],
  });

  return (
    <Animated.View style={[{ width: size, height: size, opacity: fadeAnim }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="scanGlow" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
            <Stop offset="0.3" stopColor={colors.primary} stopOpacity="0.6" />
            <Stop offset="0.5" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="0.7" stopColor={colors.primary} stopOpacity="0.6" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Head outline */}
        <Ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke="rgba(255,255,255,0.20)"
          strokeWidth={1.2}
          fill="none"
        />

        {/* Wireframe grid */}
        {latitudeLines}
        {longitudeLines}

        {/* Ears */}
        <Ellipse
          cx={cx - rx - earSize * 0.5}
          cy={earY}
          rx={earSize * 0.5}
          ry={earSize}
          stroke={wireColor}
          strokeWidth={wireWidth}
          fill="none"
        />
        <Ellipse
          cx={cx + rx + earSize * 0.5}
          cy={earY}
          rx={earSize * 0.5}
          ry={earSize}
          stroke={wireColor}
          strokeWidth={wireWidth}
          fill="none"
        />

        {/* Top of head (hair area indicator) */}
        <Path
          d={`M ${cx - rx * 0.3} ${cy - ry * 0.92} Q ${cx} ${cy - ry * 1.05} ${cx + rx * 0.3} ${cy - ry * 0.92}`}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.8}
          fill="none"
        />
      </Svg>

      {/* Animated scan line */}
      {scanLine && (
        <Animated.View
          style={[
            styles.scanLineWrap,
            {
              transform: [{ translateY: scanY as any }],
              position: 'absolute',
              left: cx - rx - 10,
              width: rx * 2 + 20,
            },
          ]}
        >
          <View style={styles.scanLine} />
          <View style={styles.scanGlow} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scanLineWrap: {
    height: 3,
    alignItems: 'center',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  scanGlow: {
    position: 'absolute',
    width: '80%',
    height: 20,
    backgroundColor: colors.primary,
    opacity: 0.15,
    top: -9,
    borderRadius: 10,
  },
});
