import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export function Card({
  children,
  style,
  glow,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glow?: 'teal' | 'purple' | 'orange';
}) {
  const glowStyle =
    glow === 'teal'
      ? { borderColor: colors.primary, shadowColor: colors.primary }
      : glow === 'purple'
      ? { borderColor: colors.purple, shadowColor: colors.purple }
      : glow === 'orange'
      ? { borderColor: colors.orange, shadowColor: colors.orange }
      : null;
  return <View style={[styles.card, glowStyle, style]}>{children}</View>;
}

export function Pill({
  label,
  variant = 'default',
  icon,
}: {
  label: string;
  variant?: 'default' | 'teal' | 'purple' | 'green' | 'orange';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const map = {
    default: { bg: colors.cardElev, fg: colors.textMuted, br: colors.border },
    teal: { bg: 'rgba(46,230,200,0.10)', fg: colors.primary, br: 'rgba(46,230,200,0.35)' },
    purple: { bg: colors.purpleSoft, fg: colors.purple, br: 'rgba(139,92,246,0.35)' },
    green: { bg: 'rgba(34,197,94,0.10)', fg: '#22C55E', br: 'rgba(34,197,94,0.35)' },
    orange: { bg: colors.orangeSoft, fg: colors.orange, br: 'rgba(249,115,22,0.35)' },
  }[variant];
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: map.bg, borderColor: map.br },
      ]}
    >
      {icon && <Ionicons name={icon} size={14} color={map.fg} style={{ marginRight: 6 }} />}
      <Text style={[styles.pillText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function GhostLink({
  label,
  onPress,
  underline,
  color = colors.text,
}: {
  label: string;
  onPress?: () => void;
  underline?: boolean;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={[styles.ghostLink, { color }, underline && { textDecorationLine: 'underline' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  iconRight,
  ...rest
}: {
  label: string;
  iconRight?: React.ComponentProps<typeof Ionicons>['name'];
} & TextInputProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldWrap}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          style={styles.fieldInput}
          {...rest}
        />
        {iconRight && (
          <Ionicons name={iconRight} size={18} color={colors.textDim} />
        )}
      </View>
    </View>
  );
}

export function CircleIconButton({
  icon,
  onPress,
  bg = colors.cardElev,
  size = 40,
  color = colors.text,
  border,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  bg?: string;
  size?: number;
  color?: string;
  border?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: border ? 1 : 0,
          borderColor: border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={size * 0.45} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryBtnText: { color: '#001712', fontSize: 16, fontWeight: '700' },
  ghostLink: { fontSize: 14, fontWeight: '500' },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
  },
  fieldInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 14,
  },
});
