import React from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';

// ── Action Items ────────────────────────────────────────
const ACTIONS = [
  { emoji: '⚙️', title: 'Settings', subtitle: 'Preferences', route: null, comingSoon: true },
  { emoji: '📤', title: 'Share Progress', subtitle: 'Tell the world', route: '/share-progress', comingSoon: false },
  { emoji: '👥', title: 'Community', subtitle: 'Connect', route: null, comingSoon: true },
  { emoji: '📓', title: 'Journal', subtitle: 'Daily log', route: null, comingSoon: true },
  { emoji: '🔔', title: 'Reminders', subtitle: 'Stay on track', route: null, comingSoon: true },
  { emoji: 'ℹ️', title: 'About', subtitle: 'Version 1.0', route: null, comingSoon: true },
] as const;

export default function MoreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardSize = (width - 40 - 12) / 2;

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Quick Actions</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={s.grid}>
          {ACTIONS.map((action, i) => (
            <Animated.View
              key={action.title}
              entering={FadeInUp.delay(i * 80).springify()}
            >
              <PressableScale
                onPress={() => {
                  if (action.comingSoon) {
                    Alert.alert('Coming Soon', `${action.title} is coming in a future update!`);
                  } else {
                    router.push(action.route as any);
                  }
                }}
                style={[s.card, { width: cardSize }]}
              >
                {action.comingSoon && (
                  <View style={s.comingSoonBadge}>
                    <Text style={s.comingSoonText}>Soon</Text>
                  </View>
                )}
                <View style={[s.accentDot, { backgroundColor: action.comingSoon ? COLORS.textMuted : COLORS.primary }]} />
                <Text style={s.emoji}>{action.emoji}</Text>
                <View style={{ height: SPACING.sm }} />
                <Text style={[TYPE.subheading, { color: COLORS.text, textAlign: 'center' }]}>
                  {action.title}
                </Text>
                <View style={{ height: SPACING.xs }} />
                <Text style={[TYPE.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  {action.subtitle}
                </Text>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    aspectRatio: 1,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accentDot: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emoji: {
    fontSize: 32,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  comingSoonText: {
    ...TYPE.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
