import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { RingLoader } from '@/components/ui/RingLoader';
import {
  Flame,
  Check,
  X,
  HeartHandshake,
  Wind,
  RotateCcw,
  Timer,
  Flag,
} from 'lucide-react-native';
import {
  COLORS,
  TYPE,
  FONTS,
  SPACING,
  RADIUS,
} from '@/constants/theme';
import { PressableScale, type HapticType } from '@/components/ui/PressableScale';
import {
  useUserStore,
  getDaysSinceQuit,
  getPhaseLabel,
  getWeekStates,
} from '@/store/useUserStore';

// ── Brighter Glass Tokens ────────────────────────────────
const BRIGHT = {
  bg: '#0F1218',
  glass: 'rgba(255,255,255,0.09)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassTopEdge: 'rgba(255,255,255,0.18)',
  glassFaint: 'rgba(255,255,255,0.04)',
} as const;

// ── Circle Progress Constants ────────────────────────────
const RING_SIZE = 260;
const MAX_DAYS = 90;

// ── Week Labels ─────────────────────────────────────────
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
type DayState = 'completed' | 'missed' | 'today' | 'future';

// ── Today pulsing teal dot ───────────────────────────────
function TodayPulse() {
  const pulseScale = useSharedValue(0.8);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.primary,
        },
        pulseStyle,
      ]}
    />
  );
}

// ── Weekly streak circle ─────────────────────────────────
function StreakCircle({
  state,
  dayLabel,
  index,
}: {
  state: DayState;
  dayLabel: string;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50 + 100).duration(300)}
      style={styles.streakCol}
    >
      <View
        style={[
          styles.streakCircle,
          state === 'completed' && styles.streakCompleted,
          state === 'missed' && styles.streakMissed,
          state === 'today' && styles.streakToday,
          state === 'future' && styles.streakFuture,
        ]}
      >
        {state === 'completed' && <Check color="#fff" size={14} />}
        {state === 'missed' && <X color="#fff" size={14} />}
        {state === 'today' && <Check color="#fff" size={14} />}
      </View>
      <Text style={styles.dayLabel}>{dayLabel}</Text>
    </Animated.View>
  );
}

// ── Action button ────────────────────────────────────────
function ActionButton({
  icon: Icon,
  label,
  onPress,
  index,
  haptic,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  index: number;
  haptic?: HapticType;
}) {
  return (
    <Animated.View entering={FadeIn.delay(index * 50 + 400).duration(300)}>
      <PressableScale onPress={onPress} scaleDown={0.9} haptic={haptic} style={styles.actionCol}>
        <View style={styles.actionCircle}>
          <Icon color={COLORS.textSecondary} size={24} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </PressableScale>
    </Animated.View>
  );
}

// ── Home Screen ──────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Store ──
  const name = useUserStore((s) => s.name);
  const quitDate = useUserStore((s) => s.quitDate);
  const relapses = useUserStore((s) => s.relapses);
  const resetStreakAction = useUserStore((s) => s.resetStreak);

  const daysSinceQuit = getDaysSinceQuit(quitDate);
  const weekStates = getWeekStates(quitDate);

  // ── Count-up animation ──
  const [displayCount, setDisplayCount] = useState(0);
  const count = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      count.value = withTiming(daysSinceQuit, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [count, daysSinceQuit]);

  useAnimatedReaction(
    () => Math.round(count.value),
    (val, prev) => {
      if (val !== prev) runOnJS(setDisplayCount)(val);
    },
  );

  // ── Ring progress animation ──
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      ringProgress.value = withTiming(Math.min(daysSinceQuit / MAX_DAYS, 1), {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [ringProgress, daysSinceQuit]);

  // ── Live timer ──
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      if (!quitDate) return;
      const diff = Date.now() - new Date(quitDate).getTime();
      const total = Math.floor(diff / 1000);
      setElapsed({
        h: Math.floor(total / 3600),
        m: Math.floor((total % 3600) / 60),
        s: total % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quitDate]);

  // ── SOS pulse ──
  const sosScale = useSharedValue(1);

  useEffect(() => {
    sosScale.value = withRepeat(
      withTiming(1.015, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [sosScale]);

  const sosPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sosScale.value }],
  }));

  // ── Handlers ──
  const handlePledge = useCallback(
    () => router.push('/pledge' as any),
    [router],
  );
  const handleBreathe = useCallback(
    () => router.push('/breathing' as any),
    [router],
  );
  const handleReset = useCallback(() => {
    Alert.alert('Reset Streak', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetStreakAction() },
    ]);
  }, [resetStreakAction]);

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Bar */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.topBar}>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>{name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Fein'}</Text>
          <View style={styles.topRight}>
            <PressableScale style={styles.streakPill}>
              <Flame color={COLORS.accent} size={20} />
              <Text style={styles.streakNum}>{daysSinceQuit}</Text>
            </PressableScale>
          </View>
        </Animated.View>

        {/* 2. Weekly Streak */}
        <View style={styles.weekRow}>
          {WEEK_LABELS.map((day, i) => (
            <StreakCircle key={i} state={weekStates[i]} dayLabel={day} index={i} />
          ))}
        </View>

        {/* 3. Counter Section with Circle */}
        <View style={styles.counterSection}>
          <Animated.View entering={FadeIn.delay(200).duration(600)}>
            <RingLoader progress={ringProgress} size={RING_SIZE}>
              <View style={styles.ringContent}>
                <Text style={styles.ringLabel}>DAYS CLEAN</Text>
                <Text style={styles.ringNumber}>{displayCount}d</Text>
                <Text style={styles.ringPhase}>{getPhaseLabel(quitDate)}</Text>
              </View>
            </RingLoader>
          </Animated.View>

          {/* Stat Cards Row */}
          <Animated.View
            entering={FadeIn.delay(400).duration(400)}
            style={styles.statRow}
          >
            {/* Relapses */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Flame color={COLORS.danger} size={14} />
                <Text style={styles.statLabel}>RELAPSES</Text>
              </View>
              <Text style={styles.statValue}>{relapses}</Text>
            </View>

            {/* Streak (highlighted) */}
            <View style={[styles.statCard, styles.statCardActive]}>
              <View style={styles.statHeader}>
                <Timer color={COLORS.accent} size={14} />
                <Text style={[styles.statLabel, { color: COLORS.accent }]}>STREAK</Text>
              </View>
              <Text style={styles.statValue}>
                {Math.floor(elapsed.h / 24)}d {elapsed.h % 24}h {elapsed.m}m
              </Text>
            </View>

            {/* Til Sober */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Flag color={COLORS.primary} size={14} />
                <Text style={styles.statLabel}>TIL SOBER</Text>
              </View>
              <Text style={styles.statValue}>{Math.max(MAX_DAYS - daysSinceQuit, 0)}d</Text>
            </View>
          </Animated.View>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actionRow}>
          <ActionButton icon={HeartHandshake} label="Pledge" onPress={handlePledge} index={0} />
          <ActionButton icon={Wind} label="Breathe" onPress={handleBreathe} index={1} />
          <ActionButton icon={RotateCcw} label="Reset" onPress={handleReset} index={2} haptic="Heavy" />
        </View>

        {/* 5. SOS / I'm Feining */}
        <Animated.View entering={FadeIn.delay(600).duration(400)}>
          <Animated.View style={sosPulseStyle}>
            <PressableScale
              onPress={() => router.push('/sos-modal' as any)}
              scaleDown={0.96}
              haptic="Heavy"
            >
              <View style={styles.sosBtn}>
                <Text style={styles.sosTxt}>I'm Feining</Text>
              </View>
            </PressableScale>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRIGHT.glass,
    borderWidth: 1,
    borderColor: BRIGHT.glassBorder,
  },
  streakNum: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },

  // Weekly streak
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: SPACING.md,
  },
  streakCol: {
    alignItems: 'center',
  },
  streakCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCompleted: {
    backgroundColor: COLORS.primary,
  },
  streakMissed: {
    backgroundColor: COLORS.danger,
  },
  streakToday: {
    backgroundColor: COLORS.primary,
  },
  streakFuture: {
    backgroundColor: BRIGHT.glass,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Counter with ring
  counterSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 3,
  },
  ringNumber: {
    fontSize: 72,
    fontFamily: FONTS.extrabold,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  ringPhase: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.lg,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: BRIGHT.glass,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: BRIGHT.glassBorder,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statCardActive: {
    borderColor: 'rgba(246,173,85,0.35)',
    backgroundColor: 'rgba(246,173,85,0.08)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: SPACING.lg,
  },
  actionCol: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRIGHT.glass,
    borderWidth: 1,
    borderColor: BRIGHT.glassBorder,
    borderTopColor: BRIGHT.glassTopEdge,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  // SOS button
  sosBtn: {
    marginTop: SPACING.lg,
    height: 56,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  sosTxt: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: '#07090E',
  },
});
