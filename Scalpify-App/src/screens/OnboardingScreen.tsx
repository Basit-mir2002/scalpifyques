import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/ui';
// WireframeHead removed — scan visual deleted
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

const { width: SCREEN_W } = Dimensions.get('window');

type Page = {
  key: string;
  title: string;
  body: string;
  highlight?: string;
  render: () => React.ReactNode;
};

const PAGES: Page[] = [
  {
    key: 'journey',
    title: 'Visualize your recovery.',
    body: 'Powered by Generative AI, our Hair Journey engine projects plausible regrowth outcomes based on your specific treatment plan. See the future of your hairline today.',
    render: () => <JourneyVisual />,
  },
  {
    key: 'medical',
    title: 'Science-led,\npatient-focused.',
    body: 'Our medical risk engine cross-references your family history, medication, and surgery data to adjust your recovery milestones. A personalized journey tailored to your clinical profile.',
    render: () => <MedicalVisual />,
  },
  {
    key: 'track',
    title: 'Your recovery, on track.',
    body: 'Manage your medications, track your surgery milestones, and monitor long-term trends in one secure location. Clinical-grade hair-loss management in your pocket.',
    render: () => <TrackVisual />,
  },
];

export default function OnboardingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function goNext() {
    if (currentIndex === 0) {
      nav.navigate('OnboardingFlow');
      return;
    }

    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      return;
    }

    nav.navigate('OnboardingFlow');
  }

  function skip() {
    nav.navigate('OnboardingFlow');
  }

  const isLast = currentIndex === PAGES.length - 1;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Skip button */}
      <View style={styles.topBar}>
        <View style={{ width: 50 }} />
        <Pressable onPress={skip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={p => p.key}
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={styles.page}>
            {/* Visual */}
            <View style={styles.visualWrap}>{item.render()}</View>

            {/* Text */}
            <Text style={styles.pageTitle}>{item.title}</Text>
            <Text style={styles.pageBody}>
              {item.body}
              {item.highlight && (
                <Text style={styles.pageHighlight}>{item.highlight}</Text>
              )}
            </Text>
          </View>
        )}
      />

      {/* Dots + Button */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {PAGES.map((p, i) => (
            <View
              key={p.key}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <PrimaryButton
          label={currentIndex === 0 ? 'Start questionnaire' : isLast ? 'Get Started' : 'Next'}
          iconRight="arrow-forward"
          onPress={goNext}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
}

/* Scan visual removed */

/* ─── Visual 2: Current vs Projected Grid ─── */
function JourneyVisual() {
  const gridSize = 8;
  const dotR = 3;
  const gap = 18;
  const w = gridSize * gap;
  const h = gridSize * gap;

  function renderGrid(
    filled: boolean,
    color: string,
    connections: boolean,
  ) {
    const dots = [];
    const lines = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * gap + gap / 2;
        const y = row * gap + gap / 2;
        dots.push(
          <Circle
            key={`d-${row}-${col}`}
            cx={x}
            cy={y}
            r={dotR}
            fill={color}
          />,
        );
        if (connections && filled) {
          if (col < gridSize - 1) {
            lines.push(
              <Line
                key={`h-${row}-${col}`}
                x1={x}
                y1={y}
                x2={x + gap}
                y2={y}
                stroke={color}
                strokeWidth={0.5}
                opacity={0.4}
              />,
            );
          }
          if (row < gridSize - 1) {
            lines.push(
              <Line
                key={`v-${row}-${col}`}
                x1={x}
                y1={y}
                x2={x}
                y2={y + gap}
                stroke={color}
                strokeWidth={0.5}
                opacity={0.4}
              />,
            );
          }
          if (col < gridSize - 1 && row < gridSize - 1) {
            lines.push(
              <Line
                key={`d1-${row}-${col}`}
                x1={x}
                y1={y}
                x2={x + gap}
                y2={y + gap}
                stroke={color}
                strokeWidth={0.3}
                opacity={0.3}
              />,
            );
            lines.push(
              <Line
                key={`d2-${row}-${col}`}
                x1={x + gap}
                y1={y}
                x2={x}
                y2={y + gap}
                stroke={color}
                strokeWidth={0.3}
                opacity={0.3}
              />,
            );
          }
        }
      }
    }
    return (
      <Svg width={w} height={h}>
        {lines}
        {dots}
      </Svg>
    );
  }

  return (
    <View style={vs.journeyCard}>
      <View style={vs.journeyRow}>
        <View style={vs.journeyCol}>
          <Text style={vs.journeyColLabel}>AI PROJECTION</Text>
          <View style={vs.gridWrap}>
            {renderGrid(false, 'rgba(255,255,255,0.25)', false)}
          </View>
        </View>
        <View style={vs.journeyVsWrap}>
          <View style={vs.journeyVsCircle}>
            <Text style={vs.journeyVsText}>vs</Text>
          </View>
        </View>
        <View style={vs.journeyCol}>
          <Text style={[vs.journeyColLabel, { color: colors.primary }]}>
            PROJECTED
          </Text>
          <View style={vs.gridWrap}>
            {renderGrid(true, colors.primary, true)}
          </View>
          <Text style={vs.journeyMonthLabel}>MONTH 6 EST.</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Visual 3: Medical Timeline ─── */
function MedicalVisual() {
  return (
    <View style={vs.medCard}>
      {/* Vertical line */}
      <View style={vs.medLine} />

      {/* Factor 1 */}
      <View style={[vs.medFactor, { top: '20%', left: 20 }]}>
        <View style={vs.medFactorCard}>
          <View style={vs.medFactorIcon}>
            <Ionicons name="fitness" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={vs.medFactorTitle}>Smoking:</Text>
            <Text style={vs.medFactorValue}>+14 days delay</Text>
          </View>
        </View>
      </View>

      {/* Dot 1 */}
      <View style={[vs.medDot, { top: '25%' }]}>
        <View style={vs.medDotInner} />
      </View>

      {/* Dot 2 */}
      <View style={[vs.medDot, { top: '50%' }]}>
        <View style={vs.medDotInner} />
      </View>

      {/* Dot 3 */}
      <View style={[vs.medDot, { top: '72%' }]}>
        <View style={vs.medDotInner} />
      </View>

      {/* Factor 2 */}
      <View style={[vs.medFactor, { top: '65%', right: 20, left: undefined }]}>
        <View style={vs.medFactorCard}>
          <View style={vs.medFactorIcon}>
            <Ionicons name="heart" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={vs.medFactorTitle}>Minoxidil:</Text>
            <Text style={vs.medFactorValue}>Standard recovery</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── Visual 4: Phone Mockup ─── */
function TrackVisual() {
  return (
    <View style={vs.trackCard}>
      {/* Phone frame */}
      <View style={vs.phoneFrame}>
        <View style={vs.phoneNotch} />
        {/* Chart area */}
        <View style={vs.phoneChart}>
          <Text style={vs.phoneChartLabel}>Y</Text>
          <View style={vs.phoneChartArea}>
            <Svg width={140} height={60}>
              <Defs>
                <LinearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M0,10 Q20,8 35,15 T70,25 T105,35 T140,50"
                stroke={colors.primary}
                strokeWidth={2}
                fill="none"
              />
              <Path
                d="M0,10 Q20,8 35,15 T70,25 T105,35 T140,50 L140,60 L0,60 Z"
                fill="url(#tg)"
              />
            </Svg>
          </View>
          <Text style={vs.phoneChartXLabel}>X</Text>
          <Text style={vs.phoneChartTitle}>Weekly Adherence Trend</Text>
          <Text style={vs.phoneChartSub}>↓ 12% compared to last week</Text>
        </View>

        {/* Medication task */}
        <View style={vs.phoneMedCard}>
          <View style={vs.phoneMedCheck}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={vs.phoneMedTitle}>Medication Task</Text>
            <Text style={vs.phoneMedSub}>Morning Pill - Completed at 8:00 AM</Text>
          </View>
        </View>
        <View style={vs.phoneMedBar} />
      </View>

      {/* Clinical grade badge */}
      <View style={vs.clinicalBadge}>
        <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
        <Text style={vs.clinicalBadgeText}>CLINICAL GRADE</Text>
      </View>
    </View>
  );
}

const vs = StyleSheet.create({
  /* Scan visual */
  card: {
    width: SCREEN_W - 80,
    aspectRatio: 0.9,
    backgroundColor: colors.cardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardLabel: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: '600',
  },
  headCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanOverlays: {
    ...StyleSheet.absoluteFillObject,
  },
  scanPill: {
    position: 'absolute',
    right: 16,
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanPillLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  scanPillValue: {
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  scanPillSub: {
    color: colors.textMuted,
    fontSize: 10,
  },

  /* Journey visual */
  journeyCard: {
    width: SCREEN_W - 80,
    aspectRatio: 1.1,
    backgroundColor: colors.cardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: 'center',
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  journeyCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  journeyColLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  gridWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyVsWrap: {
    width: 40,
    alignItems: 'center',
  },
  journeyVsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyVsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  journeyMonthLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* Medical visual */
  medCard: {
    width: SCREEN_W - 80,
    aspectRatio: 0.9,
    backgroundColor: colors.cardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  medLine: {
    position: 'absolute',
    left: '50%',
    top: '10%',
    bottom: '10%',
    width: 2,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  medDot: {
    position: 'absolute',
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bgBase,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  medFactor: {
    position: 'absolute',
  },
  medFactorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  medFactorIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medFactorTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  medFactorValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  /* Track visual */
  trackCard: {
    width: SCREEN_W - 80,
    aspectRatio: 0.85,
    backgroundColor: colors.cardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  phoneFrame: {
    width: 180,
    height: 220,
    backgroundColor: colors.bgBase,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    overflow: 'hidden',
  },
  phoneNotch: {
    width: 50,
    height: 4,
    backgroundColor: colors.cardElev,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  phoneChart: {
    backgroundColor: colors.cardSolid,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 8,
  },
  phoneChartLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '600',
  },
  phoneChartArea: {
    height: 60,
    marginVertical: 4,
  },
  phoneChartXLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'right',
  },
  phoneChartTitle: {
    color: colors.textStrong,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  phoneChartSub: {
    color: colors.textMuted,
    fontSize: 8,
  },
  phoneMedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardSolid,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  phoneMedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneMedTitle: {
    color: colors.textStrong,
    fontSize: 10,
    fontWeight: '700',
  },
  phoneMedSub: {
    color: colors.textMuted,
    fontSize: 7,
  },
  phoneMedBar: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
    marginHorizontal: 4,
  },
  clinicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElev,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  clinicalBadgeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  page: {
    width: SCREEN_W,
    alignItems: 'center',
    paddingHorizontal: spacing.xl + 10,
    justifyContent: 'center',
  },
  visualWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pageTitle: {
    color: colors.textStrong,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
  },
  pageBody: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  pageHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 20,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.textDim,
  },
  nextBtn: {
    width: '100%',
  },
});
