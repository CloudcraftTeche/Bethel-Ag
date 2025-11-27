import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, SlideInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import apiService from "../../../src/services/api";
import { User } from "../../../src/types";
import { useTheme } from "../../../src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type MenuItem = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
};

export default function ProfileSidebarScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await apiService.logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const isDark = theme === "dark";

  const menuItems: MenuItem[] = [
    {
      icon: "person",
      title: "Profile Settings",
      subtitle: "Edit your information",
      color: "#667eea",
      onPress: () => router.push("/(tabs)/profile/edit-profile"),
    },
    {
      icon: "color-palette",
      title: "Appearance",
      subtitle: "Theme & display",
      color: "#4ECDC4",
      onPress: () => router.push("/(tabs)/profile/theme-settings"),
    },
    {
      icon: "lock-closed",
      title: "Change Password",
      subtitle: "Security settings",
      color: "#FFD700",
      onPress: () => router.push("/(tabs)/profile/change-password"),
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get assistance",
      color: "#FF6B6B",
      onPress: () => router.push("/(tabs)/profile/help-support"),
    },
  ];

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      style={styles.header}
    >
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarInner}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {user?.name}
      </Text>
      <Text
        style={[styles.email, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {user?.email}
      </Text>
    </Animated.View>
  );

  const renderAdminSection = () => {
    if (user?.role !== "admin") return null;

    return (
      <Animated.View
        entering={FadeInDown.delay(300).duration(600).springify()}
        style={styles.adminSection}
      >
        <TouchableOpacity
          style={styles.adminButtonWrapper}
          onPress={() => router.push("/(admin)")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.adminButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.adminButtonIcon}>
              <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.adminButtonContent}>
              <Text style={styles.adminButtonTitle}>Admin Panel</Text>
              <Text style={styles.adminButtonSubtitle} numberOfLines={1}>
                Manage users, events & groups
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMenuItem = ({
    item,
    index,
  }: {
    item: MenuItem;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(450 + index * 50).springify()}
      style={styles.menuItemWrapper}
    >
      <TouchableOpacity onPress={item.onPress} activeOpacity={0.7}>
        <BlurView
          intensity={isDark ? 15 : 25}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.menuItem,
            {
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.5)",
            },
          ]}
        >
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: `${item.color}20` },
            ]}
          >
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={styles.menuContent}>
            <Text
              style={[styles.menuItemText, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFooter = () => (
    <Animated.View
      entering={FadeInDown.delay(700).duration(600).springify()}
      style={styles.logoutSection}
    >
      <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
        <LinearGradient
          colors={["#FF6B6B", "#EE5A6F"]}
          style={styles.logoutButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
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
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <View style={styles.sidebarContainer}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <Animated.View
            entering={SlideInLeft.duration(400)}
            style={styles.sidebar}
          >
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
                    ? "rgba(102, 126, 234, 0.08)"
                    : "rgba(102, 126, 234, 0.15)",
                },
              ]}
            />
            <View
              style={[
                styles.decorativeOrb2,
                {
                  backgroundColor: isDark
                    ? "rgba(78, 205, 196, 0.06)"
                    : "rgba(78, 205, 196, 0.12)",
                },
              ]}
            />

            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.title}
              ListHeaderComponent={
                <>
                  {renderHeader()}
                  {renderAdminSection()}
                </>
              }
              ListFooterComponent={renderFooter}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </SafeAreaView>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.closeButtonContainer}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            activeOpacity={0.7}
            style={styles.closeButtonWrapper}
          >
            <BlurView
              intensity={isDark ? 20 : 30}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.closeButton,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.6)",
                },
              ]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sidebarContainer: {
    width: "80%",
    maxWidth: 360,
    flex: 1,
    height: SCREEN_HEIGHT,
  },
  sidebar: {
    flex: 1,
    position: "relative",
    height: SCREEN_HEIGHT,
  },
  listContent: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorativeOrb1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  decorativeOrb2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 100,
    left: -60,
  },
  closeButtonContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT < 700 ? 50 : 60,
    right: 16,
    zIndex: 10000,
    elevation: 10000,
  },
  closeButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: SCREEN_HEIGHT < 700 ? 8 : 20,
    paddingBottom: SCREEN_HEIGHT < 700 ? 12 : 24,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: SCREEN_HEIGHT < 700 ? 8 : 14,
  },
  avatarGradient: {
    width: SCREEN_HEIGHT < 700 ? 65 : 80,
    height: SCREEN_HEIGHT < 700 ? 65 : 80,
    borderRadius: SCREEN_HEIGHT < 700 ? 32.5 : 40,
    padding: 3,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_HEIGHT < 700 ? 32 : 37,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: SCREEN_HEIGHT < 700 ? 28 : 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: SCREEN_HEIGHT < 700 ? 20 : 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
    paddingHorizontal: 8,
  },
  email: {
    fontSize: SCREEN_HEIGHT < 700 ? 12 : 13,
    fontWeight: "500",
    paddingHorizontal: 8,
  },
  adminSection: {
    paddingHorizontal: 16,
    marginBottom: SCREEN_HEIGHT < 700 ? 16 : 20,
  },
  adminButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: SCREEN_HEIGHT < 700 ? 14 : 16,
    borderRadius: 16,
  },
  adminButtonIcon: {
    width: SCREEN_HEIGHT < 700 ? 36 : 44,
    height: SCREEN_HEIGHT < 700 ? 36 : 44,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  adminButtonContent: {
    flex: 1,
    marginRight: 8,
  },
  adminButtonTitle: {
    fontSize: SCREEN_HEIGHT < 700 ? 15 : 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  adminButtonSubtitle: {
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
  },
  menuItemWrapper: {
    marginBottom: SCREEN_HEIGHT < 700 ? 8 : 10,
    paddingHorizontal: 26,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: SCREEN_HEIGHT < 700 ? 14 : 18,
    overflow: "hidden",
  },
  menuIconContainer: {
    width: SCREEN_HEIGHT < 700 ? 40 : 44,
    height: SCREEN_HEIGHT < 700 ? 40 : 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
    marginRight: 8,
  },
  menuItemText: {
    fontSize: SCREEN_HEIGHT < 700 ? 14 : 15,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  menuItemSubtitle: {
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    fontWeight: "500",
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: SCREEN_HEIGHT < 700 ? 12 : 20,
    paddingBottom: SCREEN_HEIGHT < 700 ? 12 : 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SCREEN_HEIGHT < 700 ? 12 : 15,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: SCREEN_HEIGHT < 700 ? 15 : 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
});
