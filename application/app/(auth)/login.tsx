import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,

} from "react-native";
import { Image } from "expo-image";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import apiService from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await apiService.login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark
            ? ["#0f0f0f", "#1a1a2e", "#16213e"]
            : ["#f5f7fa", "#c3cfe2", "#667eea"]
        }
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.decorativeOrb1,
          {
            backgroundColor: isDark
              ? "rgba(10,132,255,0.15)"
              : "rgba(102,126,234,0.2)",
          },
        ]}
      />
      <View
        style={[
          styles.decorativeOrb2,
          {
            backgroundColor: isDark
              ? "rgba(94,92,230,0.12)"
              : "rgba(249,147,251,0.18)",
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.logoContainer}
        >
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(200).duration(1000).springify()}
          style={[styles.title, { color: colors.text }]}
        >
          Welcome Back
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(300).duration(1000).springify()}
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Sign in to continue to Bethel Community
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={styles.inputContainer}
        >
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.inputWrapper,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.5)",
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </BlurView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(1000).springify()}
          style={styles.inputContainer}
        >
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.inputWrapper,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.5)",
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(1000).springify()}
          style={styles.forgotPasswordContainer}
        >
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={[styles.forgotPassword, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(1000).springify()}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDark ? ["#0A84FF", "#0066CC"] : ["#667eea", "#764ba2"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Log In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(800).duration(1000).springify()}
          style={styles.footer}
        >
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeOrb1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  decorativeOrb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: -80,
    left: -80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 60,
    overflow: "hidden",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
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
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  version: {
    fontSize: 13,
  },
});
