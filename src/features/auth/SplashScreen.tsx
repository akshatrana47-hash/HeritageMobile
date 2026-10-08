import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components';
import { colors, spacing } from '../../theme';
import { Wordmark } from './Brand';

/** Branded splash shown while the session is restored. */
export function SplashScreen({ subtitle }: { subtitle?: string }) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, [progress]);
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]} testID="splash-screen">
      <View style={styles.rings} pointerEvents="none">
        {[380, 300, 220].map(d => <View key={d} style={[styles.ring, { width: d, height: d, borderRadius: d / 2 }]} />)}
      </View>
      <View style={styles.center}>
        <Wordmark />
        <Text variant="titleLg" color={colors.green900} style={styles.tagline}>Learn. Grow. Achieve.</Text>
        <View style={styles.divider}><View style={styles.dash} /><View style={styles.dot} /><View style={styles.dash} /></View>
        <Text variant="body" align="center">Your learning journey starts here.</Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.track}><Animated.View style={[styles.bar, { width }]} /></View>
        <Text variant="overline" color={colors.green900} align="center" style={{ letterSpacing: 2 }}>Heritage Community College</Text>
        {subtitle ? <Text variant="caption" align="center">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'space-between' },
  rings: { ...StyleSheet.absoluteFill as object, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: colors.green100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xxl },
  tagline: { marginTop: spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dash: { width: 22, height: 2, backgroundColor: colors.coral500, borderRadius: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral500 },
  bottom: { width: '100%', paddingHorizontal: spacing.xxxl, gap: spacing.sm },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden', marginBottom: spacing.sm },
  bar: { height: 4, borderRadius: 2, backgroundColor: colors.green700 },
});
