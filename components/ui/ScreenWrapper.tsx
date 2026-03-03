// NOTE: Do NOT use SafeAreaView here — it applies insets async, causing a
// visible "push up" jump on lazy-loaded tabs. useSafeAreaInsets() hook gives
// synchronous values on first render. See constants/conventions.ts.
import React, { createContext, useContext } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { AnimatedBackground } from './AnimatedBackground';

/**
 * Persistent Background Pattern
 *
 * Animated backgrounds (starfield, gradients, etc.) should live at the LAYOUT
 * level, not per-screen. This keeps the background continuous across navigations
 * — content slides over it while the background never resets or re-mounts.
 *
 * Usage in a _layout.tsx (Stack or Tabs):
 *
 *   <LayoutBackgroundContext.Provider value={true}>
 *     <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
 *       <AnimatedBackground />
 *       <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
 *         ...
 *       </Stack>
 *     </View>
 *   </LayoutBackgroundContext.Provider>
 *
 * For Tabs, use `sceneStyle` instead of `contentStyle`.
 *
 * Screens using ScreenWrapper will automatically go transparent.
 * Screens NOT using ScreenWrapper must remove their own <AnimatedBackground />
 * and set their container backgroundColor to 'transparent'.
 */
export const LayoutBackgroundContext = createContext(false);

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function ScreenWrapper({ children, scrollable = true, style }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const hasLayoutBackground = useContext(LayoutBackgroundContext);

  return (
    <View style={[styles.container, hasLayoutBackground && styles.transparent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {!hasLayoutBackground && <AnimatedBackground />}

      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
