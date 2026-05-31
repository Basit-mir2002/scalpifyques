import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui';
import { colors, spacing } from '../theme';

export default function QuestionCard({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>

      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: { gap: 8, marginBottom: spacing.md },
  label: { color: colors.textStrong, fontSize: 18, fontWeight: '700' },
  hint: { color: colors.textMuted, fontSize: 13 },
  body: { marginTop: spacing.sm },
});
