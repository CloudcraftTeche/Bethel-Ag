import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../src/context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const scale = useSharedValue(1);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const rotate = useSharedValue(0);
  const twinkle = useSharedValue(0.3);

  useEffect(() => {
    checkAuth();

    scale.value = withRepeat(
      withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    float1.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );

    twinkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const handleStart = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const float1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));

  const float2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={
          isDark
            ? ["#0f0f0f", "#1a1a2e", "#16213e"]
            : ["#f5f7fa", "#c3cfe2", "#667eea"]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.orb1, float1Style]}>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(10,132,255,0.15)", "transparent"]
              : ["rgba(102,126,234,0.2)", "transparent"]
          }
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.orb2, float2Style, rotateStyle]}>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(94,92,230,0.12)", "transparent"]
              : ["rgba(249,147,251,0.18)", "transparent"]
          }
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {[...Array(8)].map((_, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(500 + i * 200).duration(1500)}
          style={[
            styles.particle,
            twinkleStyle,
            {
              top: `${15 + i * 12}%`,
              left: `${5 + i * 11}%`,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.8)",
            },
          ]}
        />
      ))}

      <View style={styles.content}>
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.logoSection}
        >
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>

          <Animated.Text
            entering={FadeIn.delay(600).duration(1000)}
            style={[styles.welcomeText, { color: colors.textSecondary }]}
          >
            WELCOME TO
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(800).duration(1000)}
            style={[styles.appName, { color: colors.text }]}
          >
            Bethel Community
          </Animated.Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View
          entering={FadeInDown.delay(1200).duration(800).springify()}
          style={styles.featuresGrid}
        >
          {[
            { icon: "👥", label: "Connect", color: "#FF6B6B" },
            { icon: "📅", label: "Events", color: "#4ECDC4" },
            { icon: "🔔", label: "Updates", color: "#FFE66D" },
          ].map((feature, index) => (
            <BlurView
              key={index}
              intensity={isDark ? 15 : 25}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.featureCard,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.5)",
                },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${feature.color}20` },
                ]}
              >
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>
                {feature.label}
              </Text>
            </BlurView>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(1400).duration(1000).springify()}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDark ? ["#0A84FF", "#0066CC"] : ["#667eea", "#764ba2"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1600).duration(1000)}
          style={styles.footer}
        >
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.textSecondary + "30" },
            ]}
          />
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orb1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  orb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: -80,
    left: -80,
  },
  orbGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  glassContainer: {
    width: 140,
    height: 140,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureEmoji: {
    fontSize: 22,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
  divider: {
    width: 50,
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  version: {
    fontSize: 12,
    fontWeight: "500",
  },
});
