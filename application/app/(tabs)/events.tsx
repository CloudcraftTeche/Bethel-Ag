import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { Event } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

export default function EventsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        apiService.getEvents('upcoming'),
        apiService.getEvents('past'),
      ]);
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/events/EventDetailScreen",
      params: {
        eventId: event._id,
      },
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEvent = (event: Event, index: number) => {
    const isDark = theme === 'dark';
    const isUpcoming = activeTab === 'upcoming';

    return (
      <Animated.View
        key={event._id}
        entering={FadeInRight.delay(index * 30).springify()}
      >
        <TouchableOpacity
          style={styles.eventWrapper}
          activeOpacity={0.7}
          onPress={() => handleEventPress(event)}
        >
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.eventCard,
              {
                borderColor: isDark 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(255,255,255,0.5)',
              }
            ]}
          >
            <LinearGradient
              colors={isDark
                ? isUpcoming 
                  ? ['#0A84FF', '#0066CC']
                  : ['rgba(142,142,147,0.4)', 'rgba(142,142,147,0.2)']
                : isUpcoming
                  ? ['#667eea', '#764ba2']
                  : ['rgba(142,142,147,0.3)', 'rgba(142,142,147,0.15)']
              }
              style={styles.eventIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={isUpcoming ? "calendar" : "calendar-outline"} 
                size={28} 
                color="#FFFFFF" 
              />
            </LinearGradient>

            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                {event.title}
              </Text>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.eventDateTime, { color: colors.textSecondary }]}>
                  {formatDate(event.date)} • {event.time}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const isDark = theme === 'dark';
  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

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
      <View style={[styles.decorativeOrb2, {
        backgroundColor: isDark 
          ? 'rgba(94,92,230,0.06)' 
          : 'rgba(249,147,251,0.1)',
      }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View 
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {currentEvents.length} {currentEvents.length === 1 ? 'event' : 'events'}
            </Text>
          </View>

          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.tabsContainer,
              {
                borderColor: isDark 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(255,255,255,0.5)',
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
              onPress={() => setActiveTab('upcoming')}
            >
              {activeTab === 'upcoming' && (
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'upcoming' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'past' && styles.activeTab]}
              onPress={() => setActiveTab('past')}
            >
              {activeTab === 'past' && (
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'past' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Past
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEvents();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {currentEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, {
                backgroundColor: colors.backgroundSecondary + '40',
              }]}>
                <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No {activeTab} events
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeTab === 'upcoming' 
                  ? 'Check back later for new events' 
                  : 'Past events will appear here'}
              </Text>
            </View>
          ) : (
            currentEvents.map((event, index) => renderEvent(event, index))
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
  decorativeOrb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -80,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  activeTab: {
    overflow: 'hidden',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  eventWrapper: {
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateTime: {
    fontSize: 14,
    marginLeft: 6,
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