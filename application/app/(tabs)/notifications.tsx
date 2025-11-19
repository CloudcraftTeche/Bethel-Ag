import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification: any) => {
    router.push({
      pathname: '/notifications/notificationDetailScreen',
      params: {
        notifId: notification._id,
      },
    });

    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'event':
        return 'calendar';
      case 'message':
        return 'chatbubble';
      case 'group':
        return 'people';
      case 'meeting':
        return 'videocam';
      case 'reminder':
        return 'alarm';
      case 'update':
        return 'refresh';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type?: string, index?: number) => {
    const colorArray = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'];
    if (type === 'event') return '#667eea';
    if (type === 'message') return '#4ECDC4';
    if (type === 'group') return '#FF6B6B';
    if (type === 'meeting') return '#667eea';
    if (type === 'reminder') return '#FFE66D';
    if (type === 'update') return '#A8E6CF';
    return colorArray[index! % colorArray.length];
  };

  const renderNotification = (notification: any, index: number) => {
    const isDark = theme === 'dark';
    const notifColor = getNotificationColor(notification.type, index);
    const icon = getNotificationIcon(notification.type);

    return (
      <Animated.View
        key={notification._id}
        entering={FadeInRight.delay(index * 30).springify()}
      >
        <TouchableOpacity
          style={styles.notificationWrapper}
          activeOpacity={0.7}
          onPress={() => handleNotificationPress(notification)}
        >
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.notificationCard,
              {
                borderColor: notification.read
                  ? isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)'
                  : `${notifColor}40`,
                borderWidth: notification.read ? 1 : 2,
              }
            ]}
          >
            <LinearGradient
              colors={[`${notifColor}40`, `${notifColor}20`]}
              style={styles.notificationIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={icon as any} size={24} color={notifColor} />
            </LinearGradient>

            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                {notification.message}
              </Text>
              {notification.createdAt && (
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                  {formatNotificationTime(notification.createdAt)}
                </Text>
              )}
            </View>

            {!notification.read && (
              <View style={[styles.unreadDot, { backgroundColor: notifColor }]} />
            )}
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
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
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {unreadCount} unread
            </Text>
          </View>

          {notifications.length > 0 && unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.markAllButtonInner,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Text style={[styles.markAllText, { color: colors.primary }]}>
                  Mark all read
                </Text>
              </BlurView>
            </TouchableOpacity>
          )}
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, {
                backgroundColor: colors.backgroundSecondary + '40',
              }]}>
                <Ionicons name="notifications-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notifications
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You're all caught up!
              </Text>
            </View>
          ) : (
            notifications.map((notification, index) => renderNotification(notification, index))
          )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  markAllButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  markAllButtonInner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  notificationWrapper: {
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});