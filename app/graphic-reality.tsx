import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';

// ── Mock Data ────────────────────────────────────────────
const ORGANS = [
  {
    emoji: '🫁',
    name: 'Lungs',
    healthy: 'Pink, elastic tissue with clear airways',
    damaged: 'Blackened with tar, reduced capacity, chronic inflammation',
    severity: 85,
    fact: 'Smoking can damage the tiny air sacs (alveoli) that transfer oxygen to your blood.',
  },
  {
    emoji: '🫀',
    name: 'Heart',
    healthy: 'Strong, steady rhythm with clean arteries',
    damaged: 'Hardened arteries, elevated blood pressure, increased heart attack risk',
    severity: 70,
    fact: 'Nicotine can raise your heart rate by 10-20 BPM and constrict blood vessels.',
  },
  {
    emoji: '🦷',
    name: 'Teeth',
    healthy: 'White enamel, healthy pink gums',
    damaged: 'Yellow-brown stains, receding gums, increased decay',
    severity: 60,
    fact: 'Smokers may be up to 6x more likely to develop gum disease than non-smokers.',
  },
  {
    emoji: '🧬',
    name: 'Skin',
    healthy: 'Smooth, even tone with good elasticity',
    damaged: 'Premature wrinkles, dull complexion, slow wound healing',
    severity: 50,
    fact: 'Smoking may reduce blood flow to your skin, contributing to premature aging.',
  },
];

function SeverityBar({ severity, index }: { severity: number; index: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      width.value = withTiming(severity, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, 400 + index * 200);
    return () => clearTimeout(t);
  }, [width, severity, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={s.barTrack}>
      <Animated.View style={[s.barFill, animatedStyle]} />
    </View>
  );
}

export default function GraphicRealityScreen() {
  const router = useRouter();

  const glowScale = useSharedValue(1);
  useEffect(() => {
    glowScale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [glowScale]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Hard Truth</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[TYPE.body, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
            What nicotine does to your body.
          </Text>
        </Animated.View>

        {/* Organ Cards */}
        {ORGANS.map((organ, i) => (
          <Animated.View
            key={organ.name}
            entering={FadeInUp.delay(200 + i * 100).duration(400)}
          >
            <View style={s.organCard}>
              <View style={s.organHeader}>
                <Text style={s.organEmoji}>{organ.emoji}</Text>
                <Text style={[TYPE.subheading, { color: COLORS.text }]}>{organ.name}</Text>
              </View>

              <View style={s.comparisonRow}>
                <View style={s.comparisonCol}>
                  <Text style={s.comparisonLabel}>Healthy</Text>
                  <Text style={s.comparisonText}>{organ.healthy}</Text>
                </View>
                <View style={s.divider} />
                <View style={s.comparisonCol}>
                  <Text style={[s.comparisonLabel, { color: COLORS.danger }]}>Damaged</Text>
                  <Text style={s.comparisonText}>{organ.damaged}</Text>
                </View>
              </View>

              <View style={s.severityRow}>
                <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                  Damage severity
                </Text>
                <Text style={[TYPE.caption, { color: COLORS.danger }]}>{organ.severity}%</Text>
              </View>
              <SeverityBar severity={organ.severity} index={i} />

              <Text style={s.factText}>{organ.fact}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          Based on data from the CDC and American Cancer Society. For informational purposes only — not medical advice. Consult your doctor for guidance.
        </Text>

        {/* CTA Button */}
        <Animated.View entering={FadeInUp.delay(800).duration(400)} style={s.ctaArea}>
          <Animated.View style={glowStyle}>
            <PressableScale
              onPress={() => router.back()}
              haptic="Heavy"
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>I Choose Health</Text>
            </PressableScale>
          </Animated.View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
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
  organCard: {
    padding: 20,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderTopColor: COLORS.glassTopEdge,
    marginBottom: SPACING.md,
  },
  organHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.md,
  },
  organEmoji: {
    fontSize: 32,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    ...TYPE.caption,
    color: COLORS.success,
    marginBottom: 4,
  },
  comparisonText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.glassBorder,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  barFill: {
    height: 6,
    backgroundColor: COLORS.danger,
    borderRadius: 3,
  },
  factText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  ctaArea: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  ctaBtn: {
    height: 56,
    paddingHorizontal: 48,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  ctaText: {
    ...TYPE.subheading,
    color: '#07090E',
  },
  disclaimer: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
});
