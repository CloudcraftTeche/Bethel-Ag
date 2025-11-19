import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { notifId } = useLocalSearchParams();
  const { theme, colors } = useTheme();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationDetail();
  }, [notifId]);

  const loadNotificationDetail = async () => {
    try {
      if (!notifId || notifId === 'undefined') {
        setError('Invalid notification ID');
        setLoading(false);
        return;
      }

      const data = await apiService.getNotificationDetail(notifId as string);
      setNotification(data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading notification:', error);
      setError(error.response?.data?.message || 'Failed to load notification');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  if (loading) {
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!notification) {
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.text, marginTop: 12 }}>
            {error || 'Notification not found'}
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
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
          ? 'rgba(10,132,255,0.08)'
          : 'rgba(102,126,234,0.12)',
      }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notification</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.titleCard,
                {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {notification.title}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.messageCard,
                {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {notification.message}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.dateCard,
                {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                  Received on
                </Text>
              </View>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(notification.createdAt || notification.timestamp)}
              </Text>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeOrb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  titleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  messageCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 28,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});