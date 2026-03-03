import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, TrendingUp, Heart, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS } from '@/constants/theme';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { LayoutBackgroundContext } from '@/components/ui/ScreenWrapper';

const ACTIVE_COLOR = COLORS.primary;
const INACTIVE_COLOR = 'rgba(255,255,255,0.35)';
const SOS_COLOR = COLORS.accent;

// ── SOS Glow (constant pulsing background) ──────────────
function SOSGlow() {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.25, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.sosGlow, style]} />;
}

// ── Single tab item ──────────────────────────────────────
interface TabItemProps {
  icon: 'home' | 'trending' | 'heart' | 'user';
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const ICONS = {
  home: Home,
  trending: TrendingUp,
  heart: Heart,
  user: User,
} as const;

function TabItem({ icon, isFocused, onPress, onLongPress }: TabItemProps) {
  const isSOS = icon === 'heart';
  const Icon = ICONS[icon];
  const iconSize = isSOS ? 26 : 24;

  const progress = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
  }, [isFocused]);

  const activeStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const inactiveStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const activeColor = isSOS ? SOS_COLOR : ACTIVE_COLOR;
  const inactiveColor = isSOS ? SOS_COLOR : INACTIVE_COLOR;

  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      scaleDown={0.85}
      haptic="Heavy"
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <View style={styles.iconContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, inactiveStyle]}>
          <Icon color={inactiveColor} size={iconSize} />
        </Animated.View>
        <Animated.View style={[styles.iconCenter, activeStyle]}>
          <Icon color={activeColor} size={iconSize} />
        </Animated.View>
      </View>
      <Animated.View style={[isSOS ? styles.sosDot : styles.dot, dotStyle]} />
    </PressableScale>
  );
}

// ── Tab icon mapping ─────────────────────────────────────
const TAB_ICONS: Record<string, TabItemProps['icon']> = {
  index: 'home',
  progress: 'trending',
  sos: 'heart',
  profile: 'user',
};

// ── Floating pill tab bar ────────────────────────────────
function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarOuter, { bottom: Math.max(24, insets.bottom) }]}>
      <View style={styles.tabBarPill}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const icon = TAB_ICONS[route.name] ?? 'home';

            const handlePress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const handleLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <TabItem
                key={route.key}
                icon={icon}
                isFocused={isFocused}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ── Layout ───────────────────────────────────────────────
export default function TabLayout() {
  const renderTabBar = useCallback(
    (props: any) => <FloatingTabBar {...props} />,
    [],
  );

  return (
    <LayoutBackgroundContext.Provider value={true}>
      <View style={styles.tabContainer}>
        <AnimatedBackground />
        <Tabs
          tabBar={renderTabBar}
          screenOptions={{
            headerShown: false,
            lazy: true,
            sceneStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="progress" />
          <Tabs.Screen name="sos" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    </LayoutBackgroundContext.Provider>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  tabBarOuter: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  tabBarPill: {
    height: 60,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(20,24,32,0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
  sosDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SOS_COLOR,
  },
  sosGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(246,173,85,0.15)',
  },
});
