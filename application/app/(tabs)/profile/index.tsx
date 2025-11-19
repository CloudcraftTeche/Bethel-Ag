import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from "expo-image";

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import { User } from '../../../src/types';
import { useTheme } from '../../../src/context/ThemeContext';

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
      console.error('Error loading profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await apiService.logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const isDark = theme === 'dark';

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark 
            ? ['#0f0f0f', '#1a1a2e', '#16213e']
            : ['#f5f7fa', '#c3cfe2', '#667eea']
          }
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const menuItems = [
    {
      icon: 'person',
      title: 'Profile Settings',
      subtitle: 'Edit your information',
      color: '#667eea',
      onPress: () => router.push('/(tabs)/profile/edit-profile'),
    },
    {
      icon: 'color-palette',
      title: 'Appearance',
      subtitle: 'Theme & display',
      color: '#4ECDC4',
      onPress: () => router.push('/(tabs)/profile/theme-settings'),
    },
    {
      icon: 'lock-closed',
      title: 'Change Password',
      subtitle: 'Security settings',
      color: '#FFD700',
      onPress: () => router.push('/(tabs)/profile/change-password'),
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      color: '#FF6B6B',
      onPress: () => router.push('/(tabs)/profile/help-support'),
    },
  ];

  return (
    <View style={styles.wrapper}>
   
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <SafeAreaView style={styles.sidebarContainer} edges={['top', 'bottom']}>
        <Animated.View entering={SlideInLeft.duration(400)} style={styles.sidebar}>
          <LinearGradient
            colors={isDark 
              ? ['#0f0f0f', '#1a1a2e', '#16213e']
              : ['#f5f7fa', '#c3cfe2', '#667eea']
            }
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={[styles.decorativeOrb1, {
            backgroundColor: isDark 
              ? 'rgba(102, 126, 234, 0.08)' 
              : 'rgba(102, 126, 234, 0.15)',
          }]} />
          <View style={[styles.decorativeOrb2, {
            backgroundColor: isDark 
              ? 'rgba(78, 205, 196, 0.06)' 
              : 'rgba(78, 205, 196, 0.12)',
          }]} />

          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.closeButtonContainer}
          >
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.closeButtonWrapper}
            >
              <BlurView
                intensity={isDark ? 20 : 30}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.closeButton,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.6)',
                  }
                ]}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.header}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarInner}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
          </Animated.View>

          {user.role === 'admin' && (
            <Animated.View
              entering={FadeInDown.delay(300).duration(600).springify()}
              style={styles.adminSection}
            >
              <TouchableOpacity
                style={styles.adminButtonWrapper}
                onPress={() => router.push('/(admin)')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.adminButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.adminButtonIcon}>
                    <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminButtonContent}>
                    <Text style={styles.adminButtonTitle}>Admin Panel</Text>
                    <Text style={styles.adminButtonSubtitle}>
                      Manage users, events & groups
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.menuSection}
          >
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.title}
                entering={FadeInDown.delay(450 + index * 50).springify()}
                style={styles.menuItemWrapper}
              >
                <TouchableOpacity
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.menuItem,
                      {
                        borderColor: isDark 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'rgba(255,255,255,0.5)',
                      }
                    ]}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={[styles.menuItemText, { color: colors.text }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View 
            entering={FadeInDown.delay(700).duration(600).springify()}
            style={styles.logoutSection}
          >
            <TouchableOpacity 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F']}
                style={styles.logoutButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  

  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sidebarContainer: {
    width: '85%',
    maxWidth: 360,

  },
  sidebar: {
    flex: 1,
    position: 'relative',
    minHeight:"100%",
    overflow: "scroll"
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeOrb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  decorativeOrb2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 100,
    left: -60,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 41,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  adminSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  adminButtonWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
  },
  adminButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  adminButtonContent: {
    flex: 1,
  },
  adminButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  adminButtonSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});