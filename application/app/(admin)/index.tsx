import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  upcomingEvents: number;
  pastEvents: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGroups: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [user, contacts, groups, upcomingEvents, pastEvents] = await Promise.all([
        apiService.getProfile(),
        apiService.getContacts(),
        apiService.getGroups(),
        apiService.getEvents('upcoming'),
        apiService.getEvents('past'),
      ]);

      setUserName(user?.name || 'Admin');
      setStats({
        totalUsers: contacts?.length || 0,
        totalGroups: groups?.length || 0,
        upcomingEvents: upcomingEvents?.length || 0,
        pastEvents: pastEvents?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const isDark = theme === 'dark';

  const statCards = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'people-outline',
      color: '#667eea',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: 'active-groups',
      title: 'Active Groups',
      value: stats.totalGroups,
      icon: 'home-outline',
      color: '#FFE66D',
      gradient: ['#FFD700', '#FFA500'],
    },
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: 'calendar-outline',
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      id: 'past-events',
      title: 'Past Events',
      value: stats.pastEvents,
      icon: 'time-outline',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#EE5A6F'],
    },
  ];

  const menuItems = [
    {
      id: 'users',
      title: 'Manage Users',
      icon: 'people',
      color: '#667eea',
      route: '/(admin)/users',
      count: stats.totalUsers,
    },
    {
      id: 'events',
      title: 'Manage Events',
      icon: 'calendar',
      color: '#4ECDC4',
      route: '/(admin)/events',
      count: stats.upcomingEvents + stats.pastEvents,
    },
    {
      id: 'groups',
      title: 'Manage Groups',
      icon: 'home',
      color: '#FFE66D',
      route: '/(admin)/groups',
      count: stats.totalGroups,
    },
    {
      id: 'notifications',
      title: 'Send Notifications',
      icon: 'notifications',
      color: '#FF6B6B',
      route: '/(admin)/send-notification',
      count: null,
    },
  ];

  const quickCreateButtons = [
    {
      id: 'new-user',
      title: 'New User',
      icon: 'person-add',
      gradient: ['#667eea', '#764ba2'],
      route: '/(admin)/create-user',
    },
    {
      id: 'new-event',
      title: 'New Event',
      icon: 'calendar',
      gradient: ['#4ECDC4', '#44A08D'],
      route: '/(admin)/create-event',
    },
    {
      id: 'new-group',
      title: 'New Group',
      icon: 'people',
      gradient: ['#FFD700', '#FFA500'],
      route: '/(admin)/create-group',
    },
  ];

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading dashboard...
          </Text>
        </View>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Animated.View 
            entering={FadeInDown.duration(500).springify()}
            style={styles.header}
          >
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.roleBadge,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={[styles.role, { color: colors.primary }]}>Administrator</Text>
              </BlurView>
            </View>
            <TouchableOpacity 
              style={styles.backButtonWrapper}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.backButton,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.statsSection}>
            {statCards.map((stat, index) => (
              <Animated.View
                key={stat.id}
                entering={FadeInRight.delay(index * 80).springify()}
                style={styles.statCardWrapper}
              >
                <BlurView
                  intensity={isDark ? 15 : 25}
                  tint={isDark ? 'dark' : 'light'}
                  style={[
                    styles.statCard,
                    {
                      borderColor: isDark 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(255,255,255,0.5)',
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[`${stat.color}40`, `${stat.color}20`]}
                    style={styles.statIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={stat.icon as any} size={26} color={stat.color} />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                    {stat.title}
                  </Text>
                </BlurView>
              </Animated.View>
            ))}
          </View>

          <Animated.View 
            entering={FadeInDown.delay(300).duration(500).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(400 + index * 80).springify()}
                style={styles.menuItemWrapper}
              >
                <TouchableOpacity
                  onPress={() => router.push(item.route as any)}
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
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                    {item.count !== null && (
                      <View style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>{item.count}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).duration(500).springify()}
            style={[styles.section, styles.lastSection]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Create</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickCreateContainer}
            >
              {quickCreateButtons.map((button, index) => (
                <Animated.View
                  key={button.id}
                  entering={FadeInDown.delay(700 + index * 80).springify()}
                >
                  <TouchableOpacity
                    onPress={() => router.push(button.route as any)}
                    activeOpacity={0.85}
                    style={styles.quickCreateWrapper}
                  >
                    <LinearGradient
                      colors={button.gradient as any}
                      style={styles.quickCreateButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.quickCreateIconContainer}>
                        <Ionicons name={button.icon as any} size={26} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickCreateText}>{button.title}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
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
  decorativeOrb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  userName: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  role: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  backButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCardWrapper: {
    width: '48%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  statCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  menuItemWrapper: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickCreateContainer: {
    gap: 12,
  },
  quickCreateWrapper: {
    width: 110,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickCreateButton: {
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  quickCreateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickCreateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});