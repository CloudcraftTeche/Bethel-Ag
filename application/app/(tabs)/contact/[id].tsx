import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,

  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from "expo-image";

import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import { Contact } from '../../../src/types';
import { useTheme } from '../../../src/context/ThemeContext';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme, colors } = useTheme();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      const data = await apiService.getContact(id as string);
      setContact(data);
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleMessage = (phone: string) => {
    Linking.openURL(`sms:${phone}`);
  };

  const handleMap = (address: string) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
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

  if (!contact) {
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
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Contact not found
        </Text>
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

      <View style={[styles.decorativeOrb, {
        backgroundColor: isDark 
          ? 'rgba(10,132,255,0.08)' 
          : 'rgba(102,126,234,0.12)',
      }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.headerButtonInner,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Contact</Text>

          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/profile/edit-profile`)}
            style={styles.headerButton}
          >
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.headerButtonInner,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Ionicons name="create-outline" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.profileSection}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.avatarInner}>
                {contact.avatar ? (
                  <Image source={{ uri: contact.avatar }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                    style={styles.avatarPlaceholder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
            {contact.nickname && (
              <Text style={[styles.nickname, { color: colors.textSecondary }]}>
                {contact.nickname}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.actionsSection}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => contact.mobile && handleCall(contact.mobile)}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.actionIcon,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="call" size={24} color="#4ECDC4" />
              </BlurView>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => contact.mobile && handleMessage(contact.mobile)}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.actionIcon,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="chatbubble" size={24} color="#FFE66D" />
              </BlurView>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEmail(contact.email)}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.actionIcon,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="mail" size={24} color="#FF6B6B" />
              </BlurView>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => contact.address && handleMap(contact.address)}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.actionIcon,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <Ionicons name="location" size={24} color="#A8E6CF" />
              </BlurView>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Map</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
            style={styles.detailsContainer}
          >
            {contact.mobile && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#4ECDC420' }]}>
                  <Ionicons name="call" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Phone
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.mobile}
                  </Text>
                </View>
              </BlurView>
            )}

            {contact.alternateMobile && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#4ECDC420' }]}>
                  <Ionicons name="call-outline" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Alternate Mobile
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.alternateMobile}
                  </Text>
                </View>
              </BlurView>
            )}

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.detailCard,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <View style={[styles.detailIconContainer, { backgroundColor: '#FF6B6B20' }]}>
                <Ionicons name="mail" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Email
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {contact.email}
                </Text>
              </View>
            </BlurView>

            {contact.address && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#A8E6CF20' }]}>
                  <Ionicons name="home" size={20} color="#A8E6CF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Address
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.address}
                  </Text>
                </View>
              </BlurView>
            )}

            {contact.spouse && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#FF8B9420' }]}>
                  <Ionicons name="people" size={20} color="#FF8B94" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Spouse
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.spouse}
                  </Text>
                </View>
              </BlurView>
            )}

            {contact.children && contact.children.length > 0 && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#FFE66D20' }]}>
                  <Ionicons name="happy" size={20} color="#FFE66D" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Children
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.children.join(', ')}
                  </Text>
                </View>
              </BlurView>
            )}

            {contact.nativePlace && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: '#C7CEEA20' }]}>
                  <Ionicons name="flag" size={20} color="#C7CEEA" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Native Place
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.nativePlace}
                  </Text>
                </View>
              </BlurView>
            )}

            {contact.church && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.detailCard,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Church
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {contact.church}
                  </Text>
                </View>
              </BlurView>
            )}
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
  errorText: {
    fontSize: 16,
  },
  decorativeOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  headerButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },

  avatarInner: {
    width: 120,
    height: 120,
    margin: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  nickname: {
    fontSize: 16,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});