import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CircleIconButton, PrimaryButton } from '../components/ui';
import { colors, spacing } from '../theme';
import { analyzePhoto, type AnalyzeResponse } from '../api';
import type { RootStackParamList } from '../navigation';
import { useUser } from '../userStore';
import { setLatestScan } from '../scanStore';

type ScanState =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; data: AnalyzeResponse }
  | { kind: 'no-detection' }
  | { kind: 'error'; message: string };

export default function CameraScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scan, setScan] = useState<ScanState>({ kind: 'idle' });
  const cam = useRef<CameraView>(null);
  const user = useUser();

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.root, { padding: spacing.xl }]}>
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginVertical: 24 }}>
          Camera permission is required to capture scalp scans.
        </Text>
        <PrimaryButton label="Grant Permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  async function runAnalyze(uri: string) {
    setScan({ kind: 'busy' });
    try {
      const data = await analyzePhoto(uri, user?.id ?? 'guest');
      const total =
        data.measurements.percentage.hair_coverage +
        data.measurements.percentage.baldness_ratio;
      if (total < 1) {
        setScan({ kind: 'no-detection' });
      } else {
        setLatestScan(data, uri);
        setScan({ kind: 'ok', data });
        nav.navigate('ScanResults');
      }
    } catch (e: any) {
      setScan({ kind: 'error', message: e?.message ?? String(e) });
    }
  }

  async function capture() {
    if (!cam.current || scan.kind === 'busy') return;
    try {
      const photo = await cam.current.takePictureAsync({ quality: 1 });
      if (!photo) throw new Error('No photo');
      await runAnalyze(photo.uri);
    } catch (e: any) {
      setScan({ kind: 'error', message: e?.message ?? String(e) });
    }
  }

  async function pickFromLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets.length > 0) {
      await runAnalyze(res.assets[0].uri);
    }
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} />
      <View style={styles.overlay} pointerEvents="box-none">
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
          <View style={styles.topRow}>
            <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} bg="rgba(0,0,0,0.5)" />
            <View style={styles.scanBadge}>
              <Text style={styles.scanBadgeText}>New Scan</Text>
            </View>
            <Pressable onPress={pickFromLibrary} hitSlop={8} style={styles.libraryBtn}>
              <Ionicons name="images-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Reticle */}
        <View style={styles.reticleWrap} pointerEvents="none">
          <View style={styles.bracketTL} />
          <View style={styles.bracketTR} />
          <View style={styles.bracketBL} />
          <View style={styles.bracketBR} />
          <View style={styles.reticle} />
        </View>

        {/* Hint */}
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={styles.hint}>
            Hold the phone above your head, point camera at the crown
          </Text>
        </View>

        {/* Bottom controls */}
        <SafeAreaView edges={['bottom']} style={styles.bottom}>
          {scan.kind === 'ok' && (
            <ResultCard
              result={scan.data}
              onClose={() => setScan({ kind: 'idle' })}
            />
          )}
          {scan.kind === 'no-detection' && (
            <NoDetectionCard onRetry={() => setScan({ kind: 'idle' })} />
          )}
          {scan.kind === 'error' && (
            <ErrorCard message={scan.message} onClose={() => setScan({ kind: 'idle' })} />
          )}
          {(scan.kind === 'idle' || scan.kind === 'busy') && (
            <View style={styles.controls}>
              <Pressable onPress={pickFromLibrary} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Library</Text>
              </Pressable>
              <Pressable onPress={capture} disabled={scan.kind === 'busy'}>
                <View style={styles.shutterRing}>
                  <View style={styles.shutter}>
                    {scan.kind === 'busy' && <ActivityIndicator size="small" color="#000" />}
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => setFacing(f => (f === 'front' ? 'back' : 'front'))}
                style={styles.smallBtn}
              >
                <Text style={styles.smallBtnText}>Switch</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

function ResultCard({ result, onClose }: { result: AnalyzeResponse; onClose: () => void }) {
  return (
    <View style={styles.resultCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>SCAN COMPLETE</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.resultBig}>
        {result.measurements.percentage.hair_coverage.toFixed(0)}%{' '}
        <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '500' }}>coverage</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          Severity: <Text style={{ color: colors.text, fontWeight: '600' }}>{result.classification.severity}</Text>
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          Norwood: <Text style={{ color: colors.text, fontWeight: '600' }}>{result.classification.norwood_scale}</Text>
        </Text>
      </View>
    </View>
  );
}

function NoDetectionCard({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={[styles.resultCard, { borderColor: 'rgba(249,115,22,0.45)' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.orange, fontSize: 13, fontWeight: '700' }}>NO SCALP DETECTED</Text>
        <Pressable onPress={onRetry} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={{ color: colors.text, fontSize: 15, marginTop: 6, lineHeight: 22 }}>
        The AI couldn't find any hair or scalp in this photo. Hold the phone{' '}
        <Text style={{ fontWeight: '700' }}>above your head</Text> and point the camera{' '}
        <Text style={{ fontWeight: '700' }}>down at your crown</Text> — not at your face.
      </Text>
      <Pressable onPress={onRetry} style={[styles.retryBtn, { marginTop: 10 }]}>
        <Text style={styles.retryBtnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

function ErrorCard({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <View style={[styles.resultCard, { borderColor: 'rgba(239,68,68,0.45)' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '700' }}>SCAN FAILED</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={{ color: colors.text, fontSize: 14, marginTop: 6 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  scanBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  libraryBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleWrap: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '15%',
    bottom: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  bracketTL: { position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.primary },
  bracketTR: { position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTopWidth: 2, borderRightWidth: 2, borderColor: colors.primary },
  bracketBL: { position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: colors.primary },
  bracketBR: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.primary },
  hintWrap: { alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  hint: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    textAlign: 'center',
  },
  bottom: { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  shutterRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  shutter: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.35)',
    padding: 16,
    gap: 6,
  },
  resultBig: { color: colors.text, fontSize: 32, fontWeight: '700', marginTop: 6 },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: 'rgba(249,115,22,0.10)',
  },
  retryBtnText: { color: colors.orange, fontSize: 13, fontWeight: '600' },
});
