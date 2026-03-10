import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, Lock } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';

// ── Mock Data ────────────────────────────────────────────
const REASONS = [
  { emoji: '👨‍👩‍👧‍👦', reason: 'For my family' },
  { emoji: '💰', reason: 'Save money' },
  { emoji: '❤️', reason: 'Better health' },
  { emoji: '🕊️', reason: 'Freedom from addiction' },
];

const QUOTE = {
  text: '"The secret of change is to focus all your energy not on fighting the old, but on building the new."',
  author: '— Socrates',
};

const MILESTONES = [
  { time: '20 min', label: 'Heart rate drops to normal', unlocked: true },
  { time: '8 hrs', label: 'Carbon monoxide levels drop to normal', unlocked: true },
  { time: '48 hrs', label: 'Taste and smell begin to improve', unlocked: true },
  { time: '72 hrs', label: 'Breathing becomes easier', unlocked: true },
  { time: '2 weeks', label: 'Circulation begins to improve', unlocked: true },
  { time: '1 month', label: 'Lung function begins to improve', unlocked: false },
  { time: '3 months', label: 'Coughing and shortness of breath decrease', unlocked: false },
  { time: '1 year', label: 'Heart disease risk drops by about half', unlocked: false },
  { time: '5–15 yrs', label: 'Stroke risk may return to non-smoker level', unlocked: false },
];

export default function RealityCheckScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Reality Check</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* ── Your Reasons ── */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={s.sectionTitle}>Your Reasons</Text>
        </Animated.View>
        <View style={s.reasonsGrid}>
          {REASONS.map((item, i) => (
            <Animated.View
              key={item.reason}
              entering={FadeInUp.delay(150 + i * 80).duration(400)}
              style={{ flex: 1 }}
            >
              <GlassCard style={s.reasonCard}>
                <Text style={s.reasonEmoji}>{item.emoji}</Text>
                <Text style={s.reasonText}>{item.reason}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        {/* ── Motivational Quote ── */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <View style={s.quoteCard}>
            <Text style={s.quoteText}>{QUOTE.text}</Text>
            <Text style={s.quoteAuthor}>{QUOTE.author}</Text>
          </View>
        </Animated.View>

        {/* ── Benefits Timeline ── */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <Text style={[s.sectionTitle, { marginTop: SPACING.lg }]}>Benefits Timeline</Text>
        </Animated.View>
        <View style={s.timeline}>
          {MILESTONES.map((m, i) => (
            <Animated.View
              key={m.time}
              entering={FadeInUp.delay(700 + i * 60).duration(400)}
              style={s.timelineRow}
            >
              {/* Connecting line */}
              {i < MILESTONES.length - 1 && <View style={s.timelineLine} />}
              {/* Icon */}
              <View
                style={[
                  s.timelineIcon,
                  m.unlocked ? s.timelineIconUnlocked : s.timelineIconLocked,
                ]}
              >
                {m.unlocked ? (
                  <Check color="#07090E" size={14} />
                ) : (
                  <Lock color={COLORS.textMuted} size={12} />
                )}
              </View>
              {/* Text */}
              <View style={s.timelineContent}>
                <Text
                  style={[
                    TYPE.caption,
                    { color: m.unlocked ? COLORS.primary : COLORS.textMuted },
                  ]}
                >
                  {m.time}
                </Text>
                <Text
                  style={[
                    TYPE.body,
                    { color: m.unlocked ? COLORS.text : COLORS.textSecondary },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          Based on data from the CDC and American Cancer Society. For informational purposes only — not medical advice. Consult your doctor for guidance.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...TYPE.subheading,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reasonCard: {
    alignItems: 'center',
    paddingVertical: 16,
    minWidth: '45%',
  },
  reasonEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  reasonText: {
    ...TYPE.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  quoteCard: {
    marginTop: SPACING.lg,
    padding: 20,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  quoteText: {
    ...TYPE.body,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  timeline: {
    marginTop: SPACING.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 32,
    backgroundColor: COLORS.bgGlass,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineIconUnlocked: {
    backgroundColor: COLORS.primary,
  },
  timelineIconLocked: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  disclaimer: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
});
