import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Star (1 animation: opacity twinkle) ───────────────────
function Star({
  x,
  y,
  size,
  baseOpacity,
  twinkleDuration,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleDuration: number;
  delay: number;
}) {
  const dimmed = baseOpacity * 0.5;
  const opacity = useSharedValue(dimmed);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(baseOpacity, { duration: twinkleDuration * 0.4, easing: Easing.inOut(Easing.ease) }),
          withTiming(dimmed, { duration: twinkleDuration * 0.6, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'white',
        },
        animatedStyle,
      ]}
    />
  );
}

// ── Drifting layer (1 animation: slow translateY) ─────────
function DriftLayer({
  children,
  drift,
  duration,
  delay,
}: {
  children: React.ReactNode;
  drift: number;
  duration: number;
  delay: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-drift, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(drift, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// ── Starfield ─────────────────────────────────────────────
const STAR_COUNT = 30;
const COLS = 6;
const ROWS = 5;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Starfield() {
  const layers = useMemo(() => {
    const layerData: Array<Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      twinkleDuration: number;
      delay: number;
    }>> = [[], [], []];

    const cellW = SCREEN_W / COLS;
    const cellH = SCREEN_H / ROWS;

    for (let i = 0; i < STAR_COUNT; i++) {
      const r1 = seededRandom(i);
      const r2 = seededRandom(i + 100);
      const r3 = seededRandom(i + 200);

      // Jittered grid — place each star within a grid cell with random offset
      const col = i % COLS;
      const row = Math.floor(i / COLS) % ROWS;
      const x = col * cellW + r1 * cellW;
      const y = row * cellH + r2 * cellH;

      // 3 tiers: tiny/dim (back), medium (mid), bright (front)
      const layer = i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
      const size = layer === 2 ? 3 + r3 * 3 : layer === 1 ? 1.8 + r3 * 1.5 : 1 + r3 * 1;
      const baseOpacity = layer === 2 ? 0.35 + r3 * 0.15 : layer === 1 ? 0.2 + r3 * 0.15 : 0.1 + r3 * 0.1;

      layerData[layer].push({
        id: i,
        x,
        y,
        size,
        baseOpacity,
        twinkleDuration: 4000 + r3 * 5000,
        delay: r1 * 6000,
      });
    }

    return layerData;
  }, []);

  return (
    <>
      {/* Back layer — tiny stars, slowest drift */}
      <DriftLayer drift={6} duration={25000} delay={0}>
        {layers[0].map((s) => <Star key={s.id} {...s} />)}
      </DriftLayer>

      {/* Mid layer — medium stars, medium drift */}
      <DriftLayer drift={12} duration={20000} delay={3000}>
        {layers[1].map((s) => <Star key={s.id} {...s} />)}
      </DriftLayer>

      {/* Front layer — bright stars, most drift */}
      <DriftLayer drift={20} duration={16000} delay={1000}>
        {layers[2].map((s) => <Star key={s.id} {...s} />)}
      </DriftLayer>
    </>
  );
}

// ── Animated Background ───────────────────────────────────
// 80 star twinkles + 3 layer drifts = 83 total loops
export function AnimatedBackground() {
  return <Starfield />;
}
