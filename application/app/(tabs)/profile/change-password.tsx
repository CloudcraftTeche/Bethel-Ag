import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import { useTheme } from '../../../src/context/ThemeContext';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(600).springify()}>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.infoCard,
                  {
                    borderColor: `${colors.primary}40`,
                  }
                ]}
              >
                <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Create a strong password with at least 6 characters
                </Text>
              </BlurView>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(100).duration(600).springify()}
              style={styles.inputSection}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Current Password
              </Text>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons
                    name={showCurrent ? 'eye' : 'eye-off'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </BlurView>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(150).duration(600).springify()}
              style={styles.inputSection}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                New Password
              </Text>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons
                    name={showNew ? 'eye' : 'eye-off'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </BlurView>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.inputSection}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Confirm New Password
              </Text>
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: isDark 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.5)',
                  }
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? 'eye' : 'eye-off'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250).duration(600).springify()}>
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={[styles.forgotButtonText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                style={styles.saveButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotButton: {
    marginTop: 8,
  },
  forgotButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButton: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});