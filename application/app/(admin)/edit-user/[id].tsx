import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import { useTheme } from '../../../src/context/ThemeContext';

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nickname: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    spouse: '',
    children: '',
    nativePlace: '',
    church: '',
    isAdmin: false,
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const user = await apiService.getContact(id as string);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        nickname: user.nickname || '',
        mobile: user.mobile || '',
        alternateMobile: user.alternateMobile || '',
        address: user.address || '',
        spouse: user.spouse || '',
        children: user.children?.join(', ') || '',
        nativePlace: user.nativePlace || '',
        church: user.church || '',
        isAdmin: user.role === 'admin',
      });
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        nickname: formData.nickname,
        role: formData.isAdmin ? 'admin' : 'user',
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile,
        address: formData.address,
        spouse: formData.spouse,
        children: formData.children ? formData.children.split(',').map(c => c.trim()) : [],
        nativePlace: formData.nativePlace,
        church: formData.church,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      await apiService.updateContact(id as string, userData);
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderInput = (
    label: string,
    key: string,
    placeholder: string,
    iconName: string,
    options?: {
      secure?: boolean;
      keyboardType?: any;
      multiline?: boolean;
      required?: boolean;
    }
  ) => (
    <Animated.View entering={FadeInDown.springify()} style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label} {options?.required && <Text style={styles.required}>*</Text>}
      </Text>
      <BlurView
        intensity={isDark ? 15 : 25}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.inputWrapper,
          options?.multiline && styles.textAreaWrapper,
          { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
        ]}
      >
        <Ionicons name={iconName as any} size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }, options?.multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={formData[key as keyof typeof formData] as string}
          onChangeText={(value) => updateFormData(key, value)}
          secureTextEntry={options?.secure}
          keyboardType={options?.keyboardType || 'default'}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
        />
      </BlurView>
    </Animated.View>
  );

  const isDark = theme === 'dark';

  if (loadingUser) {
    return (
      <View style={styles.centered}>
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
        backgroundColor: isDark ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.12)',
      }]} />
      <View style={[styles.decorativeOrb2, {
        backgroundColor: isDark ? 'rgba(78, 205, 196, 0.06)' : 'rgba(78, 205, 196, 0.1)',
      }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButtonWrapper}
          >
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.backButton,
                { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit User</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
            {renderInput('Full Name', 'name', 'Enter full name', 'person', { required: true })}
            {renderInput('Email', 'email', 'Enter email address', 'mail', {
              keyboardType: 'email-address',
              required: true,
            })}
            {renderInput('New Password', 'password', 'Leave empty to keep current', 'lock-closed', {
              secure: true,
            })}
            {renderInput('Nickname', 'nickname', 'Enter nickname', 'star')}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            {renderInput('Mobile', 'mobile', 'Enter mobile number', 'call', {
              keyboardType: 'phone-pad',
            })}
            {renderInput('Alternate Mobile', 'alternateMobile', 'Enter alternate number', 'phone-portrait', {
              keyboardType: 'phone-pad',
            })}
            {renderInput('Address', 'address', 'Enter full address', 'location', { multiline: true })}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Family Information</Text>
            {renderInput('Spouse', 'spouse', 'Enter spouse name', 'heart')}
            {renderInput('Children', 'children', 'Enter children names (comma separated)', 'people')}
            {renderInput('Native Place', 'nativePlace', 'Enter native place', 'home')}
            {renderInput('Church', 'church', 'Enter church name', 'business')}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Role</Text>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.switchContainer,
                { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
              ]}
            >
              <View style={styles.switchIcon}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.switchIconGradient}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.switchContent}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Administrator Access</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                  Give this user admin privileges
                </Text>
              </View>
              <Switch
                value={formData.isAdmin}
                onValueChange={(value) => updateFormData('isAdmin', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(600).springify()}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={styles.cancelButtonWrapper}
              onPress={() => router.back()}
              disabled={loading}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.button,
                  { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButtonWrapper, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Update User</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
    paddingVertical: 16,
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: {
    color: '#FF6B6B',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',
  },
  textAreaWrapper: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  switchIcon: {
    marginRight: 14,
  },
  switchIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  switchDescription: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});