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

} from 'react-native';
import { Image } from "expo-image";

import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import imageUploadService from '../../../src/services/imageUpload';
import { useTheme } from '../../../src/context/ThemeContext';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const event = await apiService.getEvent(id as string);
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];

      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
        time: event.time || '',
        location: event.location || '',
      });
      
      if (event.image) {
        setImageUri(event.image);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event');
    } finally {
      setLoadingEvent(false);
    }
  };

  const pickAndUploadImage = async () => {
    try {
      const uri = await imageUploadService.pickImage();
      if (!uri) return;

      setUploadingImage(true);
      const uploadedUrl = await imageUploadService.uploadEventImage(uri, id as string);
      
      if (uploadedUrl) {
        setImageUri(uploadedUrl);
        Alert.alert('Success', 'Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await apiService.updateEvent(id as string, {
        ...formData,
        date: new Date(formData.date),
        image: imageUri || undefined,
      });
      Alert.alert('Success', 'Event updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update event');
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
    iconName: string,
    options?: {
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
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.inputIcon}
        >
          <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
        </LinearGradient>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            options?.multiline && styles.textArea,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={formData[key as keyof typeof formData]}
          onChangeText={(value) => updateFormData(key, value)}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
        />
      </BlurView>
    </Animated.View>
  );

  const isDark = theme === 'dark';

  if (loadingEvent) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Event</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            style={styles.imageSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Image</Text>
            <TouchableOpacity
              style={styles.imageContainerWrapper}
              onPress={pickAndUploadImage}
              disabled={uploadingImage}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.imageContainer,
                  { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
                ]}
              >
                {imageUri ? (
                  <>
                    <Image source={{ uri: imageUri }} style={styles.eventImage} />
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    {uploadingImage ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                      <>
                        <LinearGradient
                          colors={['#4ECDC4', '#44A08D']}
                          style={styles.imagePlaceholderIcon}
                        >
                          <Ionicons name="images" size={32} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={[styles.imagePlaceholderText, { color: colors.text }]}>
                          Tap to upload image
                        </Text>
                        <Text style={[styles.imagePlaceholderHint, { color: colors.textSecondary }]}>
                          Recommended: 1200x600px
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Details</Text>
            {renderInput('Event Title', 'title', 'e.g., Sunday Prayer', 'calendar', {
              required: true,
            })}
            {renderInput('Description', 'description', 'Enter event description', 'document-text', {
              multiline: true,
            })}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Date & Time</Text>
            {renderInput('Date', 'date', 'YYYY-MM-DD', 'calendar-outline', {
              required: true,
            })}
            <BlurView
              intensity={isDark ? 10 : 20}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.hint,
                { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)' }
              ]}
            >
              <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Format: YYYY-MM-DD (e.g., 2025-07-12)
              </Text>
            </BlurView>
            
            {renderInput('Time', 'time', 'e.g., 9:30 AM', 'time-outline', {
              required: true,
            })}
            <BlurView
              intensity={isDark ? 10 : 20}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.hint,
                { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)' }
              ]}
            >
              <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Format: HH:MM AM/PM
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            {renderInput('Location', 'location', 'Enter event location', 'location-outline')}
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
                colors={['#4ECDC4', '#44A08D']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Update Event</Text>
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
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  imageContainerWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  imagePlaceholderHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
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
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
    overflow: 'hidden',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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
    shadowColor: '#4ECDC4',
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