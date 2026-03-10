# CLAUDE.md

**Tech stack:** Check `package.json` for current versions. Core: Expo, Expo Router, React Native, Reanimated, Zustand, Supabase, RevenueCat

**Components — always use:**
- `Button` (primary/glass variants) — never raw TouchableOpacity
- `GlassCard` — for any card/container
- `PressableScale` — for any custom interactive element (scale 0.96, spring animation, haptics built in)
- `ScreenWrapper` — for every screen (handles safe area, scroll, layout background)

**Styling:**
- All colors from `COLORS` in `constants/theme.ts` — never inline hex codes
- All spacing on 8px grid via `SPACING`
- All radii from `RADIUS` — always include `borderCurve: 'continuous'`
- All typography from `TYPE` or `FONTS`

**Animations:**
- Always Reanimated — never the RN Animated API
- Interactive: `withSpring(SPRING_BUTTON)`
- Entrances: `withTiming({ duration: 400, easing: Easing.out(Easing.ease) })`
- All animation constants live in `constants/theme.ts` (`SPRING_CONFIG`, `SPRING_BUTTON`, `TIMING_CONFIG`, `GLASS_BLUR`)
- Haptic feedback on every interaction

**State:**
- `useUserStore` — persisted user data (quit date, relapses, onboarding)
- `useOnboardingStore` — temp onboarding form state
- `useProStatusStore` — RevenueCat subscription status

**Screens:**
- Always use `useSafeAreaInsets()` hook — never `SafeAreaView`
- Handle 3 states: loading, empty, populated
- `headerShown: false` globally — no native headers
- No `autoFocus` on TextInputs
- No `KeyboardAvoidingView` — pin buttons, wrap in `Pressable onPress={Keyboard.dismiss}`

**File/folder conventions:**
- Screens go in `app/` (Expo Router file-based routing)
- Reusable UI components go in `components/ui/`
- App-specific components go in `components/`
- Icons/illustrations go in `components/icons/`
- Zustand stores go in `store/`
- Shared helpers go in `hooks/` or `lib/`
- Types go in `types/`
- Design tokens go in `constants/`

**Background:**
- AnimatedBackground lives at the layout level, not per-screen
- Screens go transparent via `LayoutBackgroundContext`

**Behavior:**
- Fix only the error — don't refactor surrounding code
- Mock data until told otherwise
- Don't add features beyond what's asked
