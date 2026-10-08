import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '../../components';
import { colors, spacing } from '../../theme';

/**
 * Recreated brand mark (no original logo asset was supplied – see docs/DESIGN_DECISIONS.md).
 * Gold disc with a green shield, matching the splash/login screenshots.
 */
export function Logo({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityLabel="Heritage Community College logo">
      <Circle cx="36" cy="36" r="34" fill={colors.gold500} />
      <Circle cx="36" cy="36" r="30" fill={colors.gold500} stroke={colors.cream} strokeWidth="2" />
      <Path d="M36 16 L52 22 V38 C52 48 44 54 36 58 C28 54 20 48 20 38 V22 Z" fill={colors.green900} />
      <Path d="M36 24 L44 27 V37 C44 43 40 46 36 49 C32 46 28 43 28 37 V27 Z" fill={colors.gold500} />
      <Path d="M31 36 H41 M36 31 V43" stroke={colors.green900} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.wordmark, compact ? styles.compact : null]}>
      <Logo size={compact ? 40 : 72} />
      <View>
        <Text variant={compact ? 'displayXs' : 'displayMd'} style={{ lineHeight: compact ? 22 : 30 }}>Heritage</Text>
        <Text variant={compact ? 'caption' : 'bodySm'} color={colors.green700} style={{ fontFamily: 'PlayfairDisplay-Regular', letterSpacing: 0.3 }}>Community College</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  compact: { gap: spacing.sm },
});
