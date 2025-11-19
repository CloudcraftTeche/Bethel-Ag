import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import apiService from '../../src/services/api';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../../src/config/constants';

export default function CreateUserScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        role: (formData.isAdmin ? 'admin' : 'user') as 'admin' | 'user',
        children: formData.children ? formData.children.split(',').map(c => c.trim()) : [],
      };
      delete (userData as any).isAdmin;

      const response = await apiService.createContact(userData);
      
      Alert.alert(
        'Success',
        'User created successfully! Login credentials have been sent to their email.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
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
    options?: {
      keyboardType?: any;
      multiline?: boolean;
      required?: boolean;
    }
  ) => (
    <Animated.View
      entering={FadeInDown.springify()}
      style={styles.inputContainer}
    >
      <Text style={styles.label}>
        {label} {options?.required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.inputWrapper, options?.multiline && styles.textAreaWrapper]}>
        <TextInput
          style={[styles.input, options?.multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={formData[key as keyof typeof formData] as string}
          onChangeText={(value) => updateFormData(key, value)}
          keyboardType={options?.keyboardType || 'default'}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
          autoCapitalize={key === 'email' ? 'none' : 'words'}
        />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New User</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.infoBox}
        >
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            A secure password will be automatically generated and sent to the user's email address.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderInput('Full Name', 'name', 'Enter full name', { required: true })}
          {renderInput('Email', 'email', 'Enter email address', {
            keyboardType: 'email-address',
            required: true,
          })}
          {renderInput('Nickname', 'nickname', 'Enter nickname')}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderInput('Mobile', 'mobile', 'Enter mobile number', {
            keyboardType: 'phone-pad',
          })}
          {renderInput('Alternate Mobile', 'alternateMobile', 'Enter alternate number', {
            keyboardType: 'phone-pad',
          })}
          {renderInput('Address', 'address', 'Enter full address', { multiline: true })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Family Information</Text>
          {renderInput('Spouse', 'spouse', 'Enter spouse name')}
          {renderInput('Children', 'children', 'Enter children names (comma separated)')}
          {renderInput('Native Place', 'nativePlace', 'Enter native place')}
          {renderInput('Church', 'church', 'Enter church name')}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Role</Text>
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Administrator Access</Text>
              <Text style={styles.switchDescription}>
                Give this user admin privileges
              </Text>
            </View>
            <Switch
              value={formData.isAdmin}
              onValueChange={(value) => updateFormData('isAdmin', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create User</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600).springify()}
          style={styles.noteBox}
        >
          <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
          <Text style={styles.noteText}>
            The user will receive an email with their login credentials and instructions to change their password.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
    justifyContent: 'center',
  },
  textAreaWrapper: {
    height: 'auto',
    minHeight: 100,
  },
  input: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    paddingVertical: SPACING.md,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  switchLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});