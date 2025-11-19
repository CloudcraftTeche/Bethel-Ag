import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/context/ThemeContext';

const SUPPORT_EMAIL = 'support@bethelagdubai.com';
const SUPPORT_PHONE = '+971-50-123-4567';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const isDark = theme === 'dark';

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonWrapper}>
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
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <Text style={[styles.title, { color: colors.text }]}>Need Assistance?</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              If you're facing any issues or have questions, feel free to reach out to our
              support team. We're here to help you!
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
          >
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.card,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="headset" size={48} color="#FFFFFF" />
              </LinearGradient>

              <Text style={[styles.cardTitle, { color: colors.text }]}>Reach out to us</Text>
              <Text style={[styles.cardEmail, { color: colors.textSecondary }]}>
                {SUPPORT_EMAIL}
              </Text>

              <TouchableOpacity style={styles.contactButtonWrapper} onPress={handleEmailSupport}>
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                  style={styles.contactButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="mail" size={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>Contact Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Other Ways to Contact
            </Text>

            <TouchableOpacity onPress={handleCallSupport}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.infoItem,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.infoIcon, { backgroundColor: '#4ECDC420' }]}>
                  <Ionicons name="call" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Phone Support</Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {SUPPORT_PHONE}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://bethelagdubai.com')}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.infoItem,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <View style={[styles.infoIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Ionicons name="globe" size={24} color="#FF6B6B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Visit Website</Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    bethelagdubai.com
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </BlurView>
            </TouchableOpacity>

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.infoItem,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <View style={[styles.infoIcon, { backgroundColor: '#FFE66D20' }]}>
                <Ionicons name="time" size={24} color="#FFE66D" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Support Hours</Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                  Mon-Fri, 9 AM - 6 PM GST
                </Text>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Frequently Asked Questions
            </Text>

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.faqItem,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I reset my password?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Go to Profile → Change Password or use "Forgot Password" on the login screen.
              </Text>
            </BlurView>

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.faqItem,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I update my profile?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Navigate to Profile → Profile Settings to update your information.
              </Text>
            </BlurView>

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.faqItem,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                Where can I see upcoming events?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Check the Events tab at the bottom navigation bar.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backButton: {
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardEmail: {
    fontSize: 16,
    marginBottom: 24,
  },
  contactButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});