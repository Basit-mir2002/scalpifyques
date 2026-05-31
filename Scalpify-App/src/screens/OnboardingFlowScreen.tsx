import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Field, PrimaryButton, ScreenProgress, Segmented } from '../components/ui';
import QuestionCard from '../components/QuestionCard';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type StageChoice = 'pre' | 'post';

type Q = {
  key: string;
  label: string;
  type: 'mcq' | 'yesno' | 'scale' | 'open' | 'multiselect' | 'number';
  options?: { id: string; label: string }[];
};

const GENERAL: Q[] = [
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'gender',
    label: 'Gender',
    type: 'mcq',
    options: [
      { id: 'm', label: 'Male' },
      { id: 'f', label: 'Female' },
      { id: 'p', label: 'Prefer not to say' },
    ],
  },
  { key: 'urgent', label: 'Do you have any urgent symptoms right now?', type: 'yesno' },
  { key: 'meds', label: 'Are you taking any regular medicines?', type: 'yesno' },
];

const PRE: Q[] = [
  { key: 'reason', label: 'Why is a transplant being considered for you?', type: 'open' },
  {
    key: 'stage',
    label: 'What stage are you at now?',
    type: 'mcq',
    options: [
      { id: 'Assessment', label: 'Assessment' },
      { id: 'Approved', label: 'Approved' },
      { id: 'Waiting', label: 'Waiting' },
    ],
  },
  {
    key: 'conditions',
    label: 'Do you have health problems? (select all that apply)',
    type: 'multiselect',
    options: [
      { id: 'diabetes', label: 'Diabetes' },
      { id: 'heart', label: 'Heart disease' },
      { id: 'kidney', label: 'Kidney disease' },
      { id: 'lung', label: 'Lung disease' },
      { id: 'infection', label: 'Infection' },
      { id: 'other', label: 'Other' },
    ],
  },
  { key: 'adherence', label: 'Are you taking medicines as prescribed?', type: 'yesno' },
  { key: 'allergies', label: 'Do you have allergies?', type: 'yesno' },
  {
    key: 'substance',
    label: 'Do you use tobacco, alcohol or vaping?',
    type: 'mcq',
    options: [
      { id: 'tobacco', label: 'Tobacco' },
      { id: 'alcohol', label: 'Alcohol' },
      { id: 'vaping', label: 'Vaping' },
      { id: 'none', label: 'None' },
    ],
  },
  { key: 'understanding', label: 'How well do you understand the surgery and long-term medicines?', type: 'scale' },
];

const POST: Q[] = [
  { key: 'missed', label: 'Have you missed any medicine doses?', type: 'yesno' },
  {
    key: 'local_symptoms',
    label: 'Symptoms near the transplant area',
    type: 'multiselect',
    options: [
      { id: 'redness', label: 'Redness' },
      { id: 'swelling', label: 'Swelling' },
      { id: 'pain', label: 'Pain' },
      { id: 'drain', label: 'Drainage' },
      { id: 'fever', label: 'Fever' },
      { id: 'none', label: 'None' },
    ],
  },
  { key: 'timing', label: 'Are you taking medicines on time?', type: 'yesno' },
  { key: 'side_effects', label: 'Have you had side effects?', type: 'yesno' },
  {
    key: 'serious',
    label: 'Serious symptoms',
    type: 'multiselect',
    options: [
      { id: 'chest', label: 'Chest pain' },
      { id: 'sob', label: 'Shortness of breath' },
      { id: 'lowurine', label: 'Low urine' },
      { id: 'yellow', label: 'Yellowing skin' },
      { id: 'severe_swelling', label: 'Severe swelling' },
    ],
  },
  { key: 'followups', label: 'Have you attended follow-up appointments?', type: 'yesno' },
  { key: 'guidelines', label: 'Are you following post-transplant guidelines?', type: 'yesno' },
  { key: 'energy', label: 'Energy (1-10)', type: 'scale' },
  { key: 'sleep', label: 'Sleep (1-10)', type: 'scale' },
  { key: 'mood', label: 'Mood (1-10)', type: 'scale' },
  { key: 'hardest', label: 'What is the hardest part of recovery?', type: 'open' },
];

export default function OnboardingFlowScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { answers, setGeneral, setPre, setPost, setFollowUp, setStage, ready } = useOnboarding();
  const [choice, setChoice] = useState<StageChoice | null>(answers.stage ?? null);
  const [phase, setPhase] = useState<'select' | 'general' | 'pre' | 'post'>('select');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (answers.stage === 'pre' || answers.stage === 'post') {
      setChoice(answers.stage);
    }
  }, [answers.stage, ready]);

  const list = useMemo(() => {
    if (phase === 'general') return GENERAL;
    if (phase === 'pre') return PRE;
    if (phase === 'post') return POST;
    return [] as Q[];
  }, [phase]);

  const q = list[index];

  function setAnswer(key: string, value: any) {
    if (phase === 'general') setGeneral(key, value);
    else if (phase === 'pre') setPre(key, value);
    else if (phase === 'post') setPost(key, value);
  }

  const [safetyOpen, setSafetyOpen] = useState(false);

  function saveFollowUp(key: string, text: string) {
    const section = phase === 'general' ? 'general' : phase === 'pre' ? 'pre' : 'post';
    setFollowUp(section as any, key, text);
  }

  function validateCurrentQuestion(): string | null {
    if (!q) return null;
    if (q.key === 'age') {
      const val = answers.general?.age;
      if (!val || Number(val) <= 0 || Number(val) > 120) return 'Please enter a valid age (0–120).';
    }
    return null;
  }

  function handleContinueFromChoice() {
    if (!choice) {
      Alert.alert('Choose one option', 'Please select Pre-transplant or Post-transplant to continue.');
      return;
    }
    setStage(choice);
    setPhase('general');
    setIndex(0);
  }

  function handleNext() {
    if (phase === 'select') {
      handleContinueFromChoice();
      return;
    }

    const err = validateCurrentQuestion();
    if (err) {
      Alert.alert('Missing answer', err);
      return;
    }

    if (index < list.length - 1) {
      setIndex(i => i + 1);
      return;
    }

    if (phase === 'general') {
      if (!choice) {
        Alert.alert('Choose one option', 'Please select Pre-transplant or Post-transplant to continue.');
        setPhase('select');
        setIndex(0);
        return;
      }
      setPhase(choice);
      setIndex(0);
      return;
    }

    nav.navigate('OnboardingReview' as never);
  }

  function handleBack() {
    if (phase === 'select') {
      nav.navigate('Welcome');
      return;
    }
    if (index > 0) {
      setIndex(i => i - 1);
      return;
    }
    if (phase === 'general') {
      setPhase('select');
      return;
    }
    setPhase('general');
    setIndex(GENERAL.length - 1);
  }

  const progress =
    phase === 'select'
      ? 0
      : phase === 'general'
        ? Math.round(((index + 1) / GENERAL.length) * 100)
        : Math.round(((index + 1) / list.length) * 100);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Text style={styles.title}>Tell us about you</Text>
        <ScreenProgress pct={progress} />
      </View>

      <View style={styles.center}>
        {phase === 'select' ? (
          <QuestionCard
            label="Are you here before or after a transplant?"
            hint="This choice controls which questions you see next."
          >
            <View style={{ gap: 12 }}>
              <StageChoiceCard
                title="Pre-transplant"
                description="I'm preparing for surgery or waiting for a transplant."
                active={choice === 'pre'}
                onPress={() => setChoice('pre')}
              />
              <StageChoiceCard
                title="Post-transplant"
                description="I've already had a transplant and want recovery support."
                active={choice === 'post'}
                onPress={() => setChoice('post')}
              />
            </View>
          </QuestionCard>
        ) : (
          <QuestionCard
            label={q.label}
            hint={q.type === 'open' ? 'Write a short answer' : 'Answer honestly — this helps personalize your experience.'}
          >
            {q.type === 'number' && (
              <Field placeholder="Enter your age" keyboardType="numeric" onChangeText={t => setAnswer(q.key, Number(t || 0))} />
            )}

            {q.type === 'mcq' && q.options && (
              <View style={{ gap: 12 }}>
                {q.options.map(o => {
                  const selected =
                    (phase === 'general' && answers.general?.[q.key] === o.id) ||
                    (phase === 'pre' && answers.pre?.[q.key] === o.id) ||
                    (phase === 'post' && answers.post?.[q.key] === o.id);
                  return (
                    <PrimaryButton
                      key={o.id}
                      label={o.label}
                      onPress={() => setAnswer(q.key, o.id)}
                      style={selected ? styles.selectedButton : styles.optionButton}
                    />
                  );
                })}
              </View>
            )}

            {q.type === 'yesno' && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <PrimaryButton
                  label="Yes"
                  onPress={() => setAnswer(q.key, true)}
                  style={[
                    styles.optionButton,
                    answers.general?.[q.key] === true || answers.pre?.[q.key] === true || answers.post?.[q.key] === true
                      ? styles.selectedButton
                      : undefined,
                    { flex: 1 },
                  ]}
                />
                <PrimaryButton
                  label="No"
                  onPress={() => setAnswer(q.key, false)}
                  style={[
                    styles.optionButton,
                    answers.general?.[q.key] === false || answers.pre?.[q.key] === false || answers.post?.[q.key] === false
                      ? styles.selectedButton
                      : undefined,
                    { flex: 1 },
                  ]}
                />
              </View>
            )}

            {/* follow-up detail fields for certain yes answers */}
            {q.type === 'yesno' && (
              (() => {
                const section = phase === 'general' ? answers.general : phase === 'pre' ? answers.pre : answers.post;
                const answered = section?.[q.key];
                if (!answered) return null;
                if (q.key === 'urgent') {
                  return (
                    <Field
                      label="Describe urgent symptoms"
                      placeholder="e.g. chest pain, high fever"
                      onChangeText={t => saveFollowUp('urgent_details', t)}
                      multiline
                    />
                  );
                }
                if (q.key === 'meds') {
                  return (
                    <Field
                      label="Which medicines?"
                      placeholder="List medicines and doses"
                      onChangeText={t => saveFollowUp('meds_list', t)}
                      multiline
                    />
                  );
                }
                if (q.key === 'allergies') {
                  return (
                    <Field
                      label="Allergy details"
                      placeholder="What are you allergic to?"
                      onChangeText={t => saveFollowUp('allergies_details', t)}
                      multiline
                    />
                  );
                }
                if (q.key === 'side_effects') {
                  return (
                    <Field
                      label="Side effect details"
                      placeholder="Describe the side effects"
                      onChangeText={t => saveFollowUp('side_effects_details', t)}
                      multiline
                    />
                  );
                }
                return null;
              })()
            )}

            {q.type === 'open' && <Field placeholder="Type your answer" onChangeText={t => setAnswer(q.key, t)} multiline />}

            {q.type === 'scale' && (
              <View>
                <Text style={styles.scaleLabel}>{(answers.general?.[q.key] ?? answers.pre?.[q.key] ?? answers.post?.[q.key]) ?? 5}</Text>
                <View style={{ height: 8 }} />
                <Segmented
                  options={Array.from({ length: 10 }).map((_, i) => ({ value: String(i + 1) as any, label: String(i + 1) }))}
                  value={String((answers.general?.[q.key] ?? answers.pre?.[q.key] ?? answers.post?.[q.key]) ?? 5)}
                  onChange={v => setAnswer(q.key, Number(v))}
                />
              </View>
            )}

            {q.type === 'multiselect' && q.options && (
              <View style={{ gap: 8 }}>
                {q.options.map(o => {
                  const cur = phase === 'general' ? answers.general : phase === 'pre' ? answers.pre : answers.post;
                  const selected = Array.isArray(cur?.[q.key]) && cur[q.key].includes(o.id);
                  return (
                    <PrimaryButton
                      key={o.id}
                      label={o.label}
                      onPress={() => {
                        const base = Array.isArray(cur?.[q.key]) ? cur[q.key] : [];
                        const next = selected ? base.filter((id: string) => id !== o.id) : [...base, o.id];
                        setAnswer(q.key, next);
                        // if this is serious symptoms, open safety modal when any selected
                        if (q.key === 'serious' && next.length > 0) {
                          setSafetyOpen(true);
                        }
                      }}
                      style={selected ? styles.selectedButton : styles.optionButton}
                    />
                  );
                })}
              </View>
            )}
          </QuestionCard>
        )}
      </View>

      <View style={styles.controls}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <PrimaryButton label="Back" onPress={handleBack} variant="success" />
          <PrimaryButton
            label={phase === 'select' ? 'Continue' : index < list.length - 1 ? 'Next' : phase === 'general' ? 'Continue' : 'Finish'}
            onPress={handleNext}
            disabled={phase === 'select' && !choice}
          />
        </View>
      </View>

      <Modal visible={safetyOpen} transparent animationType="fade" onRequestClose={() => setSafetyOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18 }}>
            <Text style={{ fontWeight: '800', fontSize: 16, marginBottom: 8 }}>Serious symptoms selected</Text>
            <Text style={{ color: '#444', marginBottom: 16 }}>Some symptoms you selected may require urgent attention. Call emergency services or contact your clinic if you are worried.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <PrimaryButton label="Call Emergency" onPress={() => { Linking.openURL('tel:112'); }} style={{ minWidth: 130 }} />
              <PrimaryButton label="Contact Clinic" onPress={() => { setSafetyOpen(false); nav.navigate('Profile' as never); }} variant="success" style={{ minWidth: 120 }} />
              <PrimaryButton label="Continue" onPress={() => setSafetyOpen(false)} style={{ minWidth: 90 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StageChoiceCard({
  title,
  description,
  active,
  onPress,
}: {
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        active && styles.choiceCardActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.choiceHead}>
        <Text style={[styles.choiceTitle, active && { color: colors.primary }]}>{title}</Text>
        <View style={[styles.choiceDot, active && styles.choiceDotActive]} />
      </View>
      <Text style={styles.choiceDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  top: { gap: 12, marginBottom: spacing.md },
  title: { color: colors.textStrong, fontSize: 22, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center' },
  controls: { paddingVertical: spacing.md },
  scaleLabel: { color: colors.textStrong, fontSize: 18, textAlign: 'center', marginBottom: 8 },
  optionButton: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  choiceCard: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  choiceCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  choiceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800',
  },
  choiceDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  choiceDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
