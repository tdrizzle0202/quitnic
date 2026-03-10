import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Animated,
  Linking,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, SPACING } from "@/constants/theme";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";

const ONBOARDING_IMAGES = [
  require("../assets/onboarding/IMG_4969.png"),
  require("../assets/onboarding/IMG_4970.png"),
  require("../assets/onboarding/IMG_4975.png"),
  require("../assets/onboarding/IMG_4977.png"),
  require("../assets/onboarding/IMG_4979.png"),
];

const IMAGE_GAP = 10;

const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const PRIVACY_URL = "https://feinapp.netlify.app";

export default function LandingScreen() {
  const hasPro = useProStatusStore((state) => state.hasPro);
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const IMAGE_WIDTH = SCREEN_WIDTH * 0.75;
  const IMAGE_HEIGHT = IMAGE_WIDTH * 1.5;
  const TOTAL_WIDTH = (IMAGE_WIDTH + IMAGE_GAP) * ONBOARDING_IMAGES.length;
  const scrollX = useRef(new Animated.Value(0)).current;

  // Auto-scroll animation - seamless infinite loop
  useEffect(() => {
    let isCancelled = false;

    const animate = () => {
      if (isCancelled) return;

      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -TOTAL_WIDTH,
        duration: ONBOARDING_IMAGES.length * 5000,
        useNativeDriver: true,
        easing: (t) => t, // Linear easing for smooth constant speed
      }).start(({ finished }) => {
        if (finished && !isCancelled) {
          animate();
        }
      });
    };

    animate();

    return () => {
      isCancelled = true;
      scrollX.stopAnimation();
    };
  }, [scrollX, TOTAL_WIDTH]);

  useEffect(() => {
    let isMounted = true;

    const ensureProStatus = async () => {
      const isPro = await getCachedProStatus();
      if (isPro && isMounted) {
        router.replace("/(tabs)");
      }
    };

    ensureProStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasPro) {
      router.replace("/(tabs)");
    }
  }, [hasPro]);

  const handleGetStarted = async () => {
    const isPro = await getCachedProStatus();
    if (isPro) {
      router.replace("/(tabs)");
      return;
    }

    router.push("/onboarding");
  };

  const handleOpenTerms = () => {
    Linking.openURL(TERMS_URL);
  };

  const handleOpenPrivacy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  // Duplicate images for seamless loop
  const duplicatedImages = [...ONBOARDING_IMAGES, ...ONBOARDING_IMAGES];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Text - at top */}
        <View style={styles.headerContainer}>
          <Text style={styles.mainText}>
            Expose their{"\n"}true <Text style={styles.heightText}>height</Text>
          </Text>
        </View>

        {/* Image Slideshow */}
        <View style={styles.slideshowContainer}>
          <Animated.View
            style={[
              styles.slideshowTrack,
              {
                transform: [{ translateX: scrollX }],
              },
            ]}
          >
            {duplicatedImages.map((image, index) => (
              <View key={index} style={[styles.imageWrapper, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT }]}>
                <Image
                  source={image}
                  style={styles.slideshowImage}
                  contentFit="cover"
                />
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Get Started Button */}
          <PressableScale
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            haptic="Medium"
          >
            <Text style={styles.getStartedText}>Get started</Text>
          </PressableScale>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By continuing, you're{"\n"}accepting our{" "}
            <Text style={styles.termsLink} onPress={handleOpenTerms}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={styles.termsLink} onPress={handleOpenPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  slideshowContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  slideshowTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapper: {
    marginRight: IMAGE_GAP,
    borderRadius: 8,
    overflow: "hidden",
  },
  slideshowImage: {
    width: "100%",
    height: "100%",
  },
  mainText: {
    fontSize: 42,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    lineHeight: 48,
  },
  heightText: {
    fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "cursive",
    fontWeight: "700",
    fontSize: 46,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 0,
  },
  getStartedButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING["3xl"],
    paddingVertical: 16,
    borderRadius: 30,
    width: "75%",
    marginBottom: SPACING.sm,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  termsText: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: "center",
    lineHeight: 14,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: COLORS.gray600,
  },
});
