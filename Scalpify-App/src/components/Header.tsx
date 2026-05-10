import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CircleIconButton } from './ui';
import { colors, spacing } from '../theme';

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  rightSlot,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const nav = useNavigation();
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        {showBack && (
          <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
        )}
        <View style={{ flex: 1 }}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightSlot}
    </View>
  );
}

export function StatusBarFiller() {
  return <View style={{ height: 8 }} />;
}

export function PulseLogo({ size = 18 }: { size?: number }) {
  return <Ionicons name="pulse" size={size} color={colors.primary} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
