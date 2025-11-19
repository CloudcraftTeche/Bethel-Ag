import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from "expo-image";

import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const { theme, colors } = useTheme();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEventDetail();
  }, [eventId]);

  const loadEventDetail = async () => {
    try {
      if (!eventId || eventId === 'undefined') {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }

      const data = await apiService.getEvent(eventId as string);
      setEvent(data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading event:', error);
      setError(error.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = event && new Date(event.date) > new Date();
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

  if (!event) {
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
            {error || 'Event not found'}
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
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Event</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {event.image && (
            <Animated.View entering={FadeInUp.delay(100).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.imageCard,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Image
                  source={{ uri: event.image }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              </BlurView>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(150).springify()}>
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
              <View style={styles.titleWithBadge}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {event.title}
                </Text>
                {isUpcoming && (
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>Upcoming</Text>
                  </View>
                )}
                {!isUpcoming && (
                  <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.15)' }]}>
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Past</Text>
                  </View>
                )}
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.infoCard,
                {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatDate(event.date)}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="time" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Time</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {event.time}
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {event.location && (
            <Animated.View entering={FadeInUp.delay(250).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.infoCard,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="location" size={20} color="#FF6B6B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {event.location}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          )}

          {event.description && (
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.descriptionCard,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  About Event
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {event.description}
                </Text>
              </BlurView>
            </Animated.View>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.infoCard,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="people" size={20} color="#A8E6CF" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Attendees</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {event.attendees.length} {event.attendees.length === 1 ? 'person' : 'people'}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          )}

          {event.createdBy && (
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.creatorCard,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={styles.creatorIcon}>
                  <Ionicons name="person-circle" size={40} color="#667eea" />
                </View>
                <View style={styles.creatorContent}>
                  <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>
                    Organized by
                  </Text>
                  <Text style={[styles.creatorName, { color: colors.text }]}>
                    {event.createdBy.name}
                  </Text>
                  <Text style={[styles.creatorEmail, { color: colors.textSecondary }]}>
                    {event.createdBy.email}
                  </Text>
                </View>
              </BlurView>
            </Animated.View>
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
  imageCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  titleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(102,126,234,0.1)',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  descriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  creatorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  creatorIcon: {
    marginRight: 12,
  },
  creatorContent: {
    flex: 1,
  },
  creatorLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  creatorEmail: {
    fontSize: 13,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});