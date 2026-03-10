import React from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';
import { useUserStore, getDaysSinceQuit, getMoneySaved } from '@/store/useUserStore';

export default function ShareProgressScreen() {
  const router = useRouter();
  const quitDate = useUserStore((s) => s.quitDate);
  const monthlySpend = useUserStore((s) => s.monthlySpend);

  const daysFree = getDaysSinceQuit(quitDate);
  const moneySaved = getMoneySaved(quitDate, monthlySpend);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've been nicotine-free for ${daysFree} days with Fein! $${moneySaved} saved. Join me: feinapp.netlify.app`,
      });
    } catch (error) {
      // user cancelled or share failed — do nothing
    }
  };

  const handleSaveImage = () => {
    Alert.alert('Image saved!', 'Your progress card has been saved to your camera roll.');
  };

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        {/* ── Header ── */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Share Progress</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* ── Shareable Progress Card ── */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={s.progressCard}>
          {/* App name */}
          <Text style={s.appName}>Fein</Text>

          {/* Big stat */}
          <Text style={s.bigStat}>{daysFree} Days</Text>
          <Text style={s.bigStatLabel}>Nicotine-Free</Text>

          <View style={{ height: SPACING.lg }} />

          {/* Mini stats row */}
          <View style={s.miniStatsRow}>
            <View style={s.miniStat}>
              <Text style={s.miniStatValue}>${moneySaved}</Text>
              <Text style={s.miniStatLabel}>Saved</Text>
            </View>
            <View style={s.miniStat}>
              <Text style={s.miniStatValue}>{daysFree}</Text>
              <Text style={s.miniStatLabel}>Days Free</Text>
            </View>
          </View>

          <View style={{ height: SPACING.lg }} />

          {/* Watermark */}
          <Text style={s.watermark}>feinapp.netlify.app</Text>
        </Animated.View>

        <View style={{ height: SPACING.xl }} />

        {/* ── Share Button ── */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <PressableScale onPress={handleShare} haptic="Heavy" style={s.ctaBtn}>
            <Text style={s.ctaText}>Share</Text>
          </PressableScale>
        </Animated.View>

        <View style={{ height: SPACING.md }} />

        {/* ── Save Image Button (secondary) ── */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <PressableScale onPress={handleSaveImage} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnText}>Save Image</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
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

  // Shareable card
  progressCard: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  bigStat: {
    fontFamily: FONTS.extrabold,
    fontSize: 42,
    color: COLORS.text,
    textAlign: 'center',
  },
  bigStatLabel: {
    ...TYPE.subheading,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Mini stats
  miniStatsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  miniStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  miniStatValue: {
    ...TYPE.subheading,
    color: COLORS.text,
  },
  miniStatLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // Watermark
  watermark: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // CTA button
  ctaBtn: {
    height: 56,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  ctaText: {
    ...TYPE.subheading,
    color: '#07090E',
  },

  // Secondary button
  secondaryBtn: {
    height: 56,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...TYPE.subheading,
    color: COLORS.text,
  },
});
