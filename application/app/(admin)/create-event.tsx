
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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import apiService from '../../src/services/api';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../../src/config/constants';

export default function CreateEventScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await apiService.createEvent({
        ...formData,
        date: new Date(formData.date),
      });
      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderInput = (
    label: string,
    key: string,
    placeholder: string,
    options?: {
      multiline?: boolean;
      required?: boolean;
      iconName?: string;
    }
  ) => (
    <Animated.View entering={FadeInDown.springify()} style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {options?.required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.inputWrapper, options?.multiline && styles.textAreaWrapper]}>
        {options?.iconName && (
          <Ionicons
            name={options.iconName as any}
            size={20}
            color={COLORS.textSecondary}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            options?.multiline && styles.textArea,
            options?.iconName && styles.inputWithIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={formData[key as keyof typeof formData]}
          onChangeText={(value) => updateFormData(key, value)}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
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
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Event Details</Text>
          {renderInput('Event Title', 'title', 'e.g., Sunday Prayer', {
            required: true,
            iconName: 'calendar',
          })}
          {renderInput('Description', 'description', 'Enter event description', {
            multiline: true,
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Date & Time</Text>
          {renderInput('Date', 'date', 'YYYY-MM-DD (e.g., 2025-07-12)', {
            required: true,
            iconName: 'calendar-outline',
          })}
          <Text style={styles.hint}>Format: YYYY-MM-DD (Year-Month-Day)</Text>
          
          {renderInput('Time', 'time', 'e.g., 9:30 AM', {
            required: true,
            iconName: 'time-outline',
          })}
          <Text style={styles.hint}>Format: HH:MM AM/PM</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Location</Text>
          {renderInput('Location', 'location', 'Enter event location', {
            iconName: 'location-outline',
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
          style={styles.previewCard}
        >
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewContent}>
            <View style={styles.previewRow}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.previewText}>
                {formData.title || 'Event Title'}
              </Text>
            </View>
            {formData.date && (
              <View style={styles.previewRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.previewSecondaryText}>{formData.date}</Text>
              </View>
            )}
            {formData.time && (
              <View style={styles.previewRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.previewSecondaryText}>{formData.time}</Text>
              </View>
            )}
            {formData.location && (
              <View style={styles.previewRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.previewSecondaryText}>{formData.location}</Text>
              </View>
            )}
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
                <Text style={styles.submitButtonText}>Create Event</Text>
              </>
            )}
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  textAreaWrapper: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  previewCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  previewTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  previewContent: {
    gap: SPACING.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  previewText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  previewSecondaryText: {
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
});