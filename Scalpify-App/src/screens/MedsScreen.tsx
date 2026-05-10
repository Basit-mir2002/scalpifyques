import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { addMed, formatTime, removeMed, useMeds, type Med } from '../medsStore';

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

const ICON_PALETTE: { icon: Med['icon']; color: string; bg: string }[] = [
  { icon: 'water-outline', color: colors.primary, bg: 'rgba(46,230,200,0.12)' },
  { icon: 'pulse', color: colors.purple, bg: colors.purpleSoft },
  { icon: 'star-outline', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  { icon: 'medical-outline', color: colors.orange, bg: 'rgba(249,115,22,0.12)' },
];

function pickPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ICON_PALETTE[hash % ICON_PALETTE.length];
}

export default function MedsScreen() {
  const meds = useMeds();
  const [adding, setAdding] = useState(false);

  function confirmRemove(med: Med) {
    Alert.alert('Remove medication', `Remove ${med.name} from your protocol?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMed(med.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Medications</Text>
          <Pressable onPress={() => setAdding(true)} style={styles.addBtn} hitSlop={8}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <Text style={styles.protocolHead}>YOUR PROTOCOL</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {meds.length === 0 ? (
              <Pressable onPress={() => setAdding(true)} style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emptyTitle}>No medications yet</Text>
                  <Text style={styles.emptySub}>
                    Add your first medication or supplement to start tracking adherence.
                  </Text>
                </View>
              </Pressable>
            ) : (
              meds.map(m => <MedCard key={m.id} med={m} onLongPress={() => confirmRemove(m)} />)
            )}
          </View>
        </View>
      </ScrollView>

      <AddMedModal visible={adding} onDismiss={() => setAdding(false)} />
    </SafeAreaView>
  );
}

function MedCard({ med, onLongPress }: { med: Med; onLongPress: () => void }) {
  return (
    <Pressable onLongPress={onLongPress} style={styles.medCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.medIcon, { backgroundColor: med.iconBg }]}>
          <Ionicons name={med.icon} size={20} color={med.iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.medName}>{med.name}</Text>
          <Text style={styles.medType}>{med.type}</Text>
        </View>
        <Text style={styles.medTime}>{formatTime(med.time)}</Text>
      </View>
    </Pressable>
  );
}

function AddMedModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName('');
    setType('');
    setTime('');
  }

  async function handleSave() {
    if (!name.trim()) return Alert.alert('Missing name', 'Enter the medication name.');
    if (!TIME_RE.test(time.trim())) {
      return Alert.alert('Invalid time', 'Use 24-hour HH:MM format, e.g. 08:00.');
    }
    setSubmitting(true);
    try {
      const palette = pickPalette(name);
      await addMed({
        name: name.trim(),
        type: type.trim() || 'Daily',
        time: time.trim(),
        weeklyPct: 0,
        icon: palette.icon,
        iconColor: palette.color,
        iconBg: palette.bg,
      });
      reset();
      onDismiss();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.modalBackdrop} onPress={onDismiss}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <Pressable onPress={onDismiss} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ModalField
            label="Name"
            placeholder="e.g. Minoxidil 5%"
            value={name}
            onChangeText={setName}
          />
          <ModalField
            label="Type"
            placeholder="e.g. Topical solution"
            value={type}
            onChangeText={setType}
          />
          <ModalField
            label="Time (HH:MM, 24h)"
            placeholder="08:00"
            keyboardType="numbers-and-punctuation"
            value={time}
            onChangeText={setTime}
          />

          <PrimaryButton
            label="Save"
            loading={submitting}
            disabled={submitting}
            onPress={handleSave}
            style={{ marginTop: spacing.sm }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalField({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.modalLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={styles.modalInput}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46,230,200,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolHead: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 16,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46,230,200,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  emptySub: { color: colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  medCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  medIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  medName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  medType: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  medTime: { color: colors.text, fontSize: 14, fontWeight: '500' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  modalLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modalInput: {
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
