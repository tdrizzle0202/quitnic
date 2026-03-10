import React, { useState, useEffect, useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedProps,
  withTiming,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Check, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';
import {
  useUserStore,
  getDaysSinceQuit,
  getHoursSinceQuit,
  getDailySpend,
  getMoneySaved,
  getBrainRewirePercent,
} from '@/store/useUserStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MOCK_MILESTONES = [
  { id: '1', title: 'Heart rate normalizes', time: '20 min', icon: '❤️', hoursRequired: 0.33, detail: 'Your heart rate and blood pressure have returned to normal.' },
  { id: '2', title: 'Carbon monoxide drops', time: '8 hrs', icon: '🫁', hoursRequired: 8, detail: 'CO levels in your blood have dropped to normal.' },
  { id: '3', title: 'Nicotine leaves blood', time: '2 days', icon: '🩸', hoursRequired: 48, detail: 'Nicotine has been flushed from your bloodstream.' },
  { id: '4', title: 'Taste improves', time: '2 days', icon: '👅', hoursRequired: 48, detail: 'Taste and smell begin to improve.' },
  { id: '5', title: 'Breathing easier', time: '3 days', icon: '🌬️', hoursRequired: 72, detail: 'Bronchial tubes relaxing. You may breathe deeper.' },
  { id: '6', title: 'Energy increases', time: '1 week', icon: '⚡', hoursRequired: 168, detail: 'Your body may produce more energy without fighting toxins.' },
  { id: '7', title: 'Circulation improves', time: '2 weeks', icon: '🔄', hoursRequired: 336, detail: 'Blood begins to flow more freely throughout your body.' },
  { id: '8', title: 'Lung function improves', time: '1 month', icon: '💨', hoursRequired: 720, detail: 'Your lungs are healing and beginning to work better.' },
  { id: '9', title: 'Coughing decreases', time: '3 months', icon: '🤧', hoursRequired: 2160, detail: 'Cilia regrow, helping clear mucus naturally.' },
  { id: '10', title: 'Heart disease risk drops', time: '1 year', icon: '🫀', hoursRequired: 8760, detail: 'Your risk may drop by about half compared to a smoker.' },
];

const MOCK_TRIGGERS = [
  { emoji: '😰', label: 'Stress', count: 8, tip: 'Try the breathing exercise next time' },
  { emoji: '🍻', label: 'Social', count: 5, tip: 'Have a go-to drink alternative ready' },
  { emoji: '😴', label: 'Boredom', count: 4, tip: 'Keep your hands busy — try the pop game' },
  { emoji: '☕', label: 'Morning', count: 3, tip: 'Replace the ritual with something new' },
];

const REWARD_IDEAS = [
  { emoji: '☕', item: 'fancy coffees', cost: 6 },
  { emoji: '🎬', item: 'movie tickets', cost: 15 },
  { emoji: '🍕', item: 'pizza nights', cost: 20 },
  { emoji: '🎧', item: 'month of Spotify', cost: 11 },
  { emoji: '👟', item: 'new shoes', cost: 80 },
  { emoji: '✈️', item: 'weekend trip', cost: 200 },
];

// ── Animated Counter ─────────────────────────────────────
function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  style,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}) {
  const count = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      count.value = withTiming(target, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [count, target]);

  useAnimatedReaction(
    () => Math.round(count.value),
    (val, prev) => {
      if (val !== prev) runOnJS(setDisplay)(val);
    },
  );

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}

// ── Circular Progress Ring ───────────────────────────────
function CircularProgress({ percent, daysLeft }: { percent: number; daysLeft: number }) {
  const RING_SIZE = 140;
  const STROKE_W = 10;
  const R = (RING_SIZE - STROKE_W) / 2;
  const CIRC = 2 * Math.PI * R;

  const progress = useSharedValue(0);
  const [showDays, setShowDays] = useState(false);

  useEffect(() => {
    progress.value = withTiming(percent / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const handleTap = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowDays((s) => !s);
  };

  return (
    <Pressable onPress={handleTap} style={{ alignItems: 'center' }}>
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_W}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            stroke={COLORS.primary}
            strokeWidth={STROKE_W}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRC}`}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          {showDays ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ alignItems: 'center' }}
            >
              <Text style={[TYPE.heading, { color: COLORS.primary }]}>
                {daysLeft}
              </Text>
              <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                days left
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ alignItems: 'center' }}
            >
              <AnimatedCounter
                target={percent}
                suffix="%"
                style={[TYPE.heading, { color: COLORS.primary }]}
              />
              <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                rewired
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
      <View style={{ height: SPACING.xs }} />
      <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
        tap to toggle
      </Text>
    </Pressable>
  );
}

// ── Milestone Card ───────────────────────────────────────
function MilestoneCard({
  milestone,
  index,
  isUnlocked,
  isNext,
}: {
  milestone: (typeof MOCK_MILESTONES)[number];
  index: number;
  isUnlocked: boolean;
  isNext: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    setExpanded((e) => !e);
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 60).duration(400)}>
      <GlassCard
        onPress={isUnlocked || isNext ? handlePress : undefined}
        style={{ opacity: isUnlocked || isNext ? 1 : 0.4 }}
      >
        <View style={styles.milestoneRow}>
          <View
            style={[
              styles.milestoneIcon,
              {
                backgroundColor: isUnlocked
                  ? 'rgba(104,211,145,0.1)'
                  : 'rgba(62,74,90,0.1)',
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{milestone.icon}</Text>
          </View>
          <View style={styles.milestoneText}>
            <Text
              style={[
                TYPE.body,
                { color: isUnlocked ? COLORS.text : COLORS.textMuted },
              ]}
            >
              {milestone.title}
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              {milestone.time}
            </Text>
          </View>
          {isUnlocked ? (
            <View style={styles.checkCircle}>
              <Check size={14} color="#fff" />
            </View>
          ) : isNext ? (
            <View style={styles.nextPill}>
              <Text style={styles.nextPillText}>NEXT</Text>
            </View>
          ) : (
            <Lock size={18} color={COLORS.textMuted} />
          )}
        </View>

        {expanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={{ height: SPACING.sm }} />
            <View style={styles.detailBox}>
              <Text
                style={[
                  TYPE.caption,
                  { color: COLORS.textSecondary, lineHeight: 18 },
                ]}
              >
                {isUnlocked ? '✓ ' : '⏳ '}
                {milestone.detail}
              </Text>
            </View>
          </Animated.View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

// ── Trigger Pill ─────────────────────────────────────────
function TriggerPill({ trigger }: { trigger: (typeof MOCK_TRIGGERS)[number] }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <View>
      <PressableScale
        onPress={() => setShowTip((s) => !s)}
        scaleDown={0.95}
        style={[
          styles.triggerPill,
          showTip && styles.triggerPillActive,
        ]}
      >
        <Text style={[TYPE.caption, { color: COLORS.text }]}>
          {trigger.emoji} {trigger.label} ({trigger.count})
        </Text>
      </PressableScale>
      {showTip && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.triggerTip}>
          <Text
            style={[TYPE.caption, { color: COLORS.textSecondary, fontSize: 11 }]}
          >
            💡 {trigger.tip}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// ── Reward Row ───────────────────────────────────────────
function RewardRow({ moneySaved }: { moneySaved: number }) {
  const affordable = REWARD_IDEAS.filter((r) => moneySaved >= r.cost);
  const nextGoal = REWARD_IDEAS.find((r) => moneySaved < r.cost);

  return (
    <View style={{ gap: SPACING.sm }}>
      {affordable.length > 0 && (
        <View>
          <Text
            style={[
              TYPE.caption,
              { color: COLORS.textSecondary, marginBottom: 6 },
            ]}
          >
            You could buy
          </Text>
          <View style={styles.rewardRow}>
            {affordable.map((r) => (
              <View key={r.item} style={styles.rewardChip}>
                <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
                <Text style={[TYPE.caption, { color: COLORS.text }]}>
                  {Math.floor(moneySaved / r.cost)}x {r.item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {nextGoal && (
        <View style={styles.nextGoalBox}>
          <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
            ${nextGoal.cost - moneySaved} more until {nextGoal.emoji}{' '}
            {nextGoal.item}
          </Text>
          <View style={styles.goalProgress}>
            <View
              style={[
                styles.goalFill,
                { width: `${(moneySaved / nextGoal.cost) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ── Calendar ─────────────────────────────────────────────
function StreakCalendar({ quitDate }: { quitDate: string | null }) {
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = (screenWidth - 40 - 40) / 7;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const quitDateObj = quitDate ? new Date(quitDate) : null;

  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: {
      day: number;
      type: 'empty' | 'clean' | 'today' | 'future' | 'before';
    }[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, type: 'empty' });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = d === today;
      const isFuture = date > now;
      const isBeforeQuit = quitDateObj ? date < quitDateObj : true;

      if (isToday) days.push({ day: d, type: 'today' });
      else if (isFuture) days.push({ day: d, type: 'future' });
      else if (isBeforeQuit) days.push({ day: d, type: 'before' });
      else days.push({ day: d, type: 'clean' });
    }

    return days;
  }, [year, month, today]);

  const monthName = new Date(year, month).toLocaleString('default', {
    month: 'long',
  });

  return (
    <GlassCard>
      <Text
        style={[TYPE.body, { color: COLORS.text, textAlign: 'center' }]}
      >
        {monthName} {year}
      </Text>
      <View style={{ height: SPACING.sm }} />
      <View style={styles.calendarRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={[styles.calendarCell, { width: cellWidth }]}>
            <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {calendarDays.map((cell, i) => {
          if (cell.type === 'empty') {
            return <View key={`e${i}`} style={[styles.calendarCell, { width: cellWidth }]} />;
          }
          const isClean = cell.type === 'clean';
          const isToday = cell.type === 'today';
          const isFuture = cell.type === 'future';
          const isBefore = cell.type === 'before';

          return (
            <View
              key={`d${cell.day}`}
              style={[
                styles.calendarCell,
                { width: cellWidth },
                isClean && styles.calendarClean,
                isToday && styles.calendarToday,
              ]}
            >
              <Text
                style={[
                  TYPE.caption,
                  {
                    color:
                      isClean || isToday
                        ? '#fff'
                        : isFuture || isBefore
                          ? COLORS.textMuted
                          : COLORS.text,
                  },
                ]}
              >
                {cell.day}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

// ── Screen ───────────────────────────────────────────────
export default function ProgressScreen() {
  const quitDate = useUserStore((s) => s.quitDate);
  const monthlySpend = useUserStore((s) => s.monthlySpend);

  const daysSinceQuit = getDaysSinceQuit(quitDate);
  const hoursSinceQuit = getHoursSinceQuit(quitDate);
  const dailySpend = getDailySpend(monthlySpend);
  const moneySaved = getMoneySaved(quitDate, monthlySpend);
  const brainRewirePercent = getBrainRewirePercent(quitDate);

  const firstLockedIndex = MOCK_MILESTONES.findIndex(
    (m) => m.hoursRequired > hoursSinceQuit,
  );

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        <Text style={[TYPE.heading, { color: COLORS.text }]}>
          Your Progress
        </Text>

        <View style={{ height: SPACING.lg }} />

        {/* ── Brain Rewiring Ring ── */}
        <GlassCard>
          <Text
            style={[
              TYPE.subheading,
              { color: COLORS.text, textAlign: 'center' },
            ]}
          >
            Brain Rewiring
          </Text>
          <View style={{ height: SPACING.md }} />
          <CircularProgress percent={brainRewirePercent} daysLeft={Math.max(90 - daysSinceQuit, 0)} />
          <View style={{ height: SPACING.sm }} />
          <Text
            style={[
              TYPE.caption,
              { color: COLORS.textSecondary, textAlign: 'center' },
            ]}
          >
            Your brain is rewiring nicotine pathways. Full recovery ~90 days.
          </Text>
        </GlassCard>

        <View style={{ height: SPACING.md }} />

        {/* ── Health Milestones ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Health Milestones
        </Text>
        <View style={{ height: SPACING.xs }} />
        <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
          Tap unlocked milestones for details
        </Text>
        <View style={{ height: SPACING.sm }} />
        <View style={{ gap: 10 }}>
          {MOCK_MILESTONES.map((milestone, index) => {
            const isUnlocked = milestone.hoursRequired <= hoursSinceQuit;
            const isNext = index === firstLockedIndex;
            return (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                isUnlocked={isUnlocked}
                isNext={isNext}
              />
            );
          })}
        </View>

        <View style={{ height: SPACING.md }} />

        {/* ── Money Saved ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Money Saved
        </Text>
        <View style={{ height: SPACING.sm }} />
        <GlassCard>
          <AnimatedCounter
            target={moneySaved}
            prefix="$"
            style={[
              TYPE.display,
              { color: COLORS.accent, textAlign: 'center' },
            ]}
          />
          <Text
            style={[
              TYPE.caption,
              { color: COLORS.textSecondary, textAlign: 'center' },
            ]}
          >
            saved so far
          </Text>

          <View style={{ height: SPACING.md }} />

          <View style={styles.miniStatsRow}>
            {[
              { value: `$${Math.round(dailySpend)}`, label: 'per day' },
              { value: `$${Math.round(dailySpend * 7)}`, label: 'per week' },
              { value: `$${Math.round(dailySpend * 30)}`, label: 'per month' },
            ].map((stat) => (
              <View key={stat.label} style={styles.miniStat}>
                <Text style={[TYPE.subheading, { color: COLORS.text }]}>
                  {stat.value}
                </Text>
                <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: SPACING.md }} />
          <RewardRow moneySaved={moneySaved} />
        </GlassCard>

        <View style={{ height: SPACING.md }} />

        {/* ── Craving Stats ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Craving Stats
        </Text>
        <View style={{ height: SPACING.sm }} />
        <View style={styles.statsRow}>
          <GlassCard style={{ flex: 1 }}>
            <AnimatedCounter
              target={23}
              style={[TYPE.heading, { color: COLORS.accent }]}
            />
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              total cravings
            </Text>
          </GlassCard>
          <GlassCard style={{ flex: 1 }}>
            <Text style={[TYPE.heading, { color: COLORS.textSecondary }]}>
              3.2
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              avg intensity /5
            </Text>
          </GlassCard>
        </View>

        <View style={{ height: SPACING.sm }} />

        <GlassCard>
          <Text style={[TYPE.body, { color: COLORS.text }]}>Top Triggers</Text>
          <View style={{ height: SPACING.xs }} />
          <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
            Tap for tips
          </Text>
          <View style={{ height: SPACING.sm }} />
          <View style={styles.triggerRow}>
            {MOCK_TRIGGERS.map((trigger) => (
              <TriggerPill key={trigger.label} trigger={trigger} />
            ))}
          </View>
        </GlassCard>

        <View style={{ height: SPACING.md }} />

        {/* ── Streak Calendar ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Streak Calendar
        </Text>
        <View style={{ height: SPACING.sm }} />
        <StreakCalendar quitDate={quitDate} />

        <View style={{ height: SPACING.lg }} />
        <Text style={styles.disclaimer}>
          Based on data from the CDC and American Cancer Society. For informational purposes only — not medical advice. Consult your doctor for guidance.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Milestones
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    flex: 1,
    marginLeft: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  nextPillText: {
    ...TYPE.caption,
    color: '#07090E',
    fontSize: 11,
  },
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
  },

  // Money
  miniStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(246,173,85,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(246,173,85,0.15)',
  },
  nextGoalBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
  },
  goalProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
    overflow: 'hidden',
  },
  goalFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },

  // Craving stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  triggerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  triggerPillActive: {
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
  },
  triggerTip: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Calendar
  calendarRow: {
    flexDirection: 'row',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarClean: {
    backgroundColor: COLORS.primary,
  },
  calendarToday: {
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.primary,
  },
  disclaimer: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: SPACING.md,
  },
});
