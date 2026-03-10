import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/ui/PressableScale';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { FONTS, SPACING, RADIUS, SPRING_CONFIG, COLORS } from '@/constants/theme';

const DEFINITION_TEXT =
  'Someone with an intense craving, obsession, or addiction to something, desperate for a hit of an addiction. Popularized by Travis Scott\u2019s song "FE!N".';

export default function FeinDefinition() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  const showButton = () => {
    buttonOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
    );
    buttonTranslateY.value = withDelay(200, withSpring(0, SPRING_CONFIG));
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.content}>
        <Animated.Text entering={FadeIn.duration(600)} style={styles.intro}>
          Are you a...
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(300).duration(600)}
          style={styles.word}
        >
          Fein
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(500).duration(400)}
          style={styles.partOfSpeech}
        >
          (noun)
        </Animated.Text>

        <TypewriterText
          text={DEFINITION_TEXT}
          speed={12}
          delay={800}
          style={styles.definition}
          onDone={showButton}
        />
      </View>

      <Animated.View style={[styles.bottom, buttonAnimStyle]}>
        <PressableScale
          onPress={() => router.push('/onboarding/name')}
          style={styles.button}
          haptic="Light"
        >
          <Text style={styles.buttonText}>Let{'\u2019'}s go</Text>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  intro: {
    fontSize: 22,
    fontFamily: FONTS.medium,
    color: '#000000',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  word: {
    fontSize: 64,
    fontFamily: FONTS.extrabold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  partOfSpeech: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  definitionContainer: {
    paddingHorizontal: SPACING.sm,
  },
  definition: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 28,
  },
  bottom: {
    paddingBottom: SPACING.md,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: '#000000',
  },
});
