import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { CachedImage } from "@/components/CachedImage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeInUp,
} from "react-native-reanimated";
import { PressableScale } from "@/components/ui/PressableScale";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import {
  COLORS,
  TYPE,
  SPACING,
  RADIUS,
  TIMING_CONFIG,
} from "@/constants/theme";
import {
  getSubscriptionPackages,
  purchasePackage,
  restorePurchases,
} from "@/lib/revenueCat";
import type { PurchasesPackage } from "react-native-purchases";
import { useProStatusStore } from "@/lib/proStatusStore";

const APP_ICON = require("@/assets/icon.png");
const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const PRIVACY_URL = "https://feinapp.netlify.app";

// ── Helpers ─────────────────────────────────────────────
function getQuitDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 90);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

type PlanType = "annual" | "lifetime";

// ── Main screen ─────────────────────────────────────────
export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");

  const refreshProStatus = useProStatusStore((s) => s.refreshProStatus);
  const setProStatus = useProStatusStore((s) => s.setProStatus);
  const hasPro = useProStatusStore((s) => s.hasPro);

  const quitDate = useMemo(() => getQuitDate(), []);

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (hasPro) {
      router.replace("/(tabs)");
    }
  }, [hasPro]);

  const loadPackages = async () => {
    try {
      const availablePackages = await getSubscriptionPackages();
      if (__DEV__) {
        console.log(
          "RevenueCat packages:",
          availablePackages.map((p) => ({
            id: p.identifier,
            product: p.product.identifier,
            price: p.product.priceString,
          }))
        );
      }
      setPackages(availablePackages);
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const annualPackage =
    packages.find((p) => p.identifier === "$rc_annual") ??
    packages.find((p) => p.product.identifier.toLowerCase().includes("annual") || p.product.identifier.toLowerCase().includes("yearly"));
  const lifetimePackage =
    packages.find((p) => p.identifier === "$rc_lifetime") ??
    packages.find((p) => p.product.identifier.toLowerCase().includes("lifetime"));

  const handlePurchase = async () => {
    const pkg =
      selectedPlan === "annual" ? annualPackage : lifetimePackage;

    if (!pkg) {
      Alert.alert("Error", "Package not available. Please try again later.");
      return;
    }

    try {
      setPurchasing(true);
      const result = await purchasePackage(pkg);

      if (result.success) {
        setProStatus(true);
        refreshProStatus().catch((err) =>
          console.error("Failed to refresh Pro status:", err)
        );
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const result = await restorePurchases();
      if (result.success) {
        refreshProStatus().catch((err) =>
          console.error("Failed to refresh after restore:", err)
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases to restore."
        );
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    router.replace("/(tabs)");
  };

  // ── Pricing data (real or mock) ───────────────────────
  const annualPrice = annualPackage
    ? annualPackage.product.priceString
    : "$34.99";
  const annualMonthly = annualPackage
    ? `$${(annualPackage.product.price / 12).toFixed(2)}/mo`
    : "$2.92/mo";
  const lifetimePrice = lifetimePackage
    ? lifetimePackage.product.priceString
    : "$99.99";

  // ── Floating icon animation ─────────────────────────────
  const iconFloat = useSharedValue(0);

  useEffect(() => {
    iconFloat.value = withRepeat(
      withTiming(-10, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconFloat.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AnimatedBackground />

      {/* Header — close button */}
      <Animated.View
        entering={FadeInUp.duration(TIMING_CONFIG.entrance).delay(0)}
        style={styles.header}
      >
        <View style={styles.headerSpacer} />
        <PressableScale
          onPress={handleClose}
          scaleDown={0.9}
          haptic="Medium"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </PressableScale>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* App icon hero */}
        <Animated.View
          entering={FadeInUp.duration(TIMING_CONFIG.entrance).delay(100)}
          style={styles.iconHero}
        >
          <Animated.View style={iconAnimatedStyle}>
            <CachedImage source={APP_ICON} style={styles.appIcon} transition={0} />
          </Animated.View>
        </Animated.View>

        {/* Motivational headline */}
        <Animated.View
          entering={FadeInUp.duration(TIMING_CONFIG.entrance).delay(200)}
          style={styles.headlineContainer}
        >
          <Text style={styles.headline}>
            We'll help you{" "}
            <Text style={styles.headlineAccent}>quit nicotine</Text> by{" "}
            {quitDate}!
          </Text>
        </Animated.View>

        {/* Plan cards */}
        <Animated.View
          entering={FadeInUp.duration(TIMING_CONFIG.entrance).delay(300)}
        >
          {/* Yearly plan */}
          <View style={styles.cardWrapper}>
            {/* "Most popular" badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Most popular</Text>
              </View>
            </View>
            <PressableScale
              onPress={() => setSelectedPlan("annual")}
              style={[
                styles.planCard,
                selectedPlan === "annual"
                  ? styles.planCardSelected
                  : styles.planCardUnselected,
              ]}
            >
              <View style={styles.planCardContent}>
                <View style={styles.planLeft}>
                  <Text style={styles.planTitle}>12 months</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>$79.99/yr</Text>
                    <Text style={styles.discountedPrice}>{annualPrice}/yr</Text>
                  </View>
                </View>
                <View style={styles.planRight}>
                  <Text style={styles.perMonth}>{annualMonthly}</Text>
                </View>
              </View>
            </PressableScale>
          </View>

          {/* Lifetime plan */}
          <PressableScale
            onPress={() => setSelectedPlan("lifetime")}
            style={[
              styles.planCard,
              selectedPlan === "lifetime"
                ? styles.planCardSelected
                : styles.planCardUnselected,
            ]}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planLeft}>
                <Text style={styles.planTitle}>Lifetime</Text>
                <Text style={styles.planSubtext}>One-time purchase</Text>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.perMonth}>{lifetimePrice}</Text>
              </View>
            </View>
          </PressableScale>
        </Animated.View>

        {/* Spacer to push footer down on larger screens */}
        <View style={styles.flex} />
      </ScrollView>

      {/* Fixed footer */}
      <Animated.View
        entering={FadeInUp.duration(TIMING_CONFIG.entrance).delay(400)}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}
      >
        <Text style={styles.cancelText}>Cancel anytime</Text>

        <PressableScale onPress={handleRestore} scaleDown={0.98}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </PressableScale>

        <PressableScale
          style={[styles.continueButton, purchasing && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
          haptic="Medium"
        >
          {purchasing ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Start my change today</Text>
          )}
        </PressableScale>

        <Text style={styles.legalText}>
          By subscribing, you agree to our{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          . Subscription automatically renews unless cancelled at least 24 hours
          before the end of the current period.
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerSpacer: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    flexGrow: 1,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },

  // Icon hero
  iconHero: {
    height: 200,
    marginBottom: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  appIcon: {
    width: 180,
    height: 180,
    borderRadius: 40,
    borderCurve: "continuous" as const,
  },

  // Headline
  headlineContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  headline: {
    ...TYPE.heading,
    color: COLORS.text,
    textAlign: "center",
  },
  headlineAccent: {
    color: COLORS.primary,
  },

  // Plan cards
  cardWrapper: {
    position: "relative",
    marginBottom: SPACING.sm,
  },
  badgeContainer: {
    position: "absolute",
    top: -12,
    right: SPACING.md,
    zIndex: 1,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    ...TYPE.caption,
    fontSize: 11,
    color: COLORS.bg,
  },
  planCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderCurve: "continuous" as const,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  planCardUnselected: {
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgGlass,
  },
  planCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planLeft: {
    flex: 1,
  },
  planRight: {
    alignItems: "flex-end",
  },
  planTitle: {
    ...TYPE.subheading,
    color: COLORS.text,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  originalPrice: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    ...TYPE.caption,
    color: COLORS.primary,
  },
  planSubtext: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  perMonth: {
    ...TYPE.subheading,
    color: COLORS.text,
  },
  flex: {
    flex: 1,
    minHeight: SPACING.md,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    alignItems: "center",
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  cancelText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  restoreText: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: COLORS.text,
    height: 56,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  continueButtonText: {
    ...TYPE.subheading,
    color: COLORS.bg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  legalText: {
    ...TYPE.caption,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  legalLink: {
    textDecorationLine: "underline",
  },
});
