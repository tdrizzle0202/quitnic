import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks/useTypewriter';
import { COLORS, TYPE, FONTS, SPACING, RADIUS, SPRING_CONFIG } from '@/constants/theme';

// ── Blinking Cursor ───────────────────────────────────────
function Cursor({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 300 });
      return;
    }
    // Blink loop
    const blink = () => {
      opacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      );
    };
    blink();
    const id = setInterval(blink, 800);
    return () => clearInterval(id);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cursor, animatedStyle]} />
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function Welcome() {
  const router = useRouter();
  const [phase, setPhase] = useState(0); // 0=logo, 1=typing title, 2=typing subtitle, 3=show rest

  // Phase progression
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);   // Start title typewriter
    const t2 = setTimeout(() => setPhase(2), 900);   // Start subtitle typewriter
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const title = useTypewriter('Welcome!', 35, phase >= 1 ? 0 : 99999);
  const subtitle = useTypewriter(
    "Your journey to quitting\nnicotine starts right here.",
    20,
    phase >= 2 ? 0 : 99999,
  );

  // Show button + stars once subtitle is done
  useEffect(() => {
    if (subtitle.done && phase < 3) {
      setPhase(3);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [subtitle.done]);

  // Button entrance animation
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    if (phase >= 3) {
      buttonOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
      buttonTranslateY.value = withDelay(200, withSpring(0, SPRING_CONFIG));
    }
  }, [phase]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>FEIN</Text>
          <View style={styles.logoDot} />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title with typewriter */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title.displayed}</Text>
            {phase >= 1 && !title.done && <Cursor visible />}
          </View>

          {/* Subtitle - invisible placeholder always reserves space */}
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, { opacity: 0 }]}>
              {"Your journey to quitting\nnicotine starts right here."}
            </Text>
            {phase >= 2 && (
              <View style={StyleSheet.absoluteFill}>
                <View style={styles.subtitleRow}>
                  <Text style={styles.subtitle}>{subtitle.displayed}</Text>
                  {!subtitle.done && <Cursor visible />}
                </View>
              </View>
            )}
          </View>

          {/* Rating - appears with button */}
          <View style={[styles.ratingRow, { opacity: phase >= 3 ? 1 : 0 }]}>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.ratingText}>Top Science-Based Quitting App</Text>
          </View>
        </View>

        {/* Bottom section */}
        <Animated.View style={[styles.bottom, buttonAnimStyle]}>
          <Button
            title="Start Quiz"
            onPress={() => router.push('/onboarding/fein-definition')}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  logo: {
    fontSize: 28,
    fontFamily: FONTS.extrabold,
    color: COLORS.text,
    letterSpacing: 6,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: -12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    ...TYPE.display,
    fontSize: 40,
    color: COLORS.text,
    lineHeight: 48,
  },
  subtitleContainer: {
    marginTop: SPACING.md,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  subtitle: {
    ...TYPE.body,
    fontSize: 20,
    color: COLORS.textSecondary,
    lineHeight: 30,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: COLORS.primary,
    marginLeft: 2,
    borderRadius: 1,
  },
  ratingRow: {
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  ratingStars: {
    fontSize: 22,
  },
  ratingText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  bottom: {
    paddingBottom: SPACING.md,
  },
  button: {
    height: 56,
  },
});
