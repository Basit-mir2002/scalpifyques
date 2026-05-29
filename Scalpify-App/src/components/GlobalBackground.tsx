import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Premium clinical-medical background.
 * Sits behind every screen. Pure visual layer — does not capture touches.
 *
 * Layer 1: dark base `#0A0C12`
 * Layer 2: primary radial blue glow from top-center (~28% peak, fades before middle)
 * Layer 3: secondary subtle blue glow from bottom-center (~10% peak)
 *
 * Many smooth stops are used to avoid banding on dark backgrounds.
 */
export function GlobalBackground() {
  return (
    <View style={styles.root} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          {/* Primary glow — top-center, fades before reaching the middle */}
          <RadialGradient id="topGlow" cx="50%" cy="0%" rx="80%" ry="55%" fx="50%" fy="0%">
            <Stop offset="0%" stopColor="rgb(35,95,200)" stopOpacity="0.28" />
            <Stop offset="15%" stopColor="rgb(35,95,200)" stopOpacity="0.22" />
            <Stop offset="30%" stopColor="rgb(35,95,200)" stopOpacity="0.14" />
            <Stop offset="50%" stopColor="rgb(35,95,200)" stopOpacity="0.06" />
            <Stop offset="75%" stopColor="rgb(35,95,200)" stopOpacity="0.015" />
            <Stop offset="100%" stopColor="rgb(35,95,200)" stopOpacity="0" />
          </RadialGradient>

          {/* Secondary glow — bottom-center, very subtle */}
          <RadialGradient id="bottomGlow" cx="50%" cy="100%" rx="70%" ry="45%" fx="50%" fy="100%">
            <Stop offset="0%" stopColor="rgb(35,95,200)" stopOpacity="0.10" />
            <Stop offset="25%" stopColor="rgb(35,95,200)" stopOpacity="0.06" />
            <Stop offset="55%" stopColor="rgb(35,95,200)" stopOpacity="0.02" />
            <Stop offset="100%" stopColor="rgb(35,95,200)" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Stack the two glows on transparent rects so the root bgBase shows through */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#topGlow)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgBase,
  },
});
