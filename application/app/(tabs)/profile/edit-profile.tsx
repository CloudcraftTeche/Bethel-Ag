import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import imageUploadService from '../../../src/services/imageUpload';
import { useTheme } from '../../../src/context/ThemeContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    location: '',
    mapsLink: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
        location: profile.address || '',
        mapsLink: profile.nativePlace || '',
      });
      if (profile.avatar) {
        setAvatarUri(profile.avatar);
      }
      if (profile.photos && Array.isArray(profile.photos)) {
        setPhotos(profile.photos);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const pickAndUploadAvatar = async () => {
    try {
      setUploadingAvatar(true);
      
      const imageUri = await imageUploadService.pickImage();
      if (!imageUri) {
        setUploadingAvatar(false);
        return;
      }

      setAvatarUri(imageUri);

      const cloudinaryUrl = await imageUploadService.uploadAvatar(imageUri);
      
      if (cloudinaryUrl) {
        setAvatarUri(cloudinaryUrl);
        Alert.alert('Success', 'Avatar uploaded successfully');
      } else {
        const profile = await apiService.getProfile();
        setAvatarUri(profile.avatar || null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const pickAndUploadPhotos = async () => {
    try {
      setUploadingPhotos(true);
      
      const remainingSlots = 4 - photos.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', 'You can only upload up to 4 photos');
        setUploadingPhotos(false);
        return;
      }

      const imageUris = await imageUploadService.pickMultipleImages(remainingSlots);
      if (imageUris.length === 0) {
        setUploadingPhotos(false);
        return;
      }

      setPhotos((prev) => [...prev, ...imageUris]);

      const cloudinaryUrls = await imageUploadService.uploadPhotos(imageUris);
      
      if (cloudinaryUrls.length > 0) {
        setPhotos((prev) => {
          const newPhotos = [...prev];
          newPhotos.splice(prev.length - imageUris.length, imageUris.length);
          return [...newPhotos, ...cloudinaryUrls];
        });
        Alert.alert('Success', `${cloudinaryUrls.length} photo(s) uploaded successfully`);
      } else {
        setPhotos((prev) => prev.slice(0, prev.length - imageUris.length));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setLoading(true);
    try {
      await apiService.updateProfile({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.location,
        nativePlace: formData.mapsLink,
        avatar: avatarUri || undefined,
        photos: photos.length > 0 ? photos : undefined,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  if (loadingProfile) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.avatarSection}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.avatarInner}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.avatarPlaceholder}
                  >
                    <Ionicons name="person" size={48} color={colors.textSecondary} />
                  </BlurView>
                )}
                {uploadingAvatar && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={pickAndUploadAvatar}
                disabled={uploadingAvatar}
              >
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                  style={styles.editAvatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
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
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(600).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
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
                placeholder="+1 123 456 7890"
                placeholderTextColor={colors.textSecondary}
                value={formData.mobile}
                onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                keyboardType="phone-pad"
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mail ID</Text>
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
                placeholder="john.doe@example.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(600).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.inputWrapper,
                styles.multilineWrapper,
                {
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(255,255,255,0.5)',
                }
              ]}
            >
              <TextInput
                style={[styles.input, styles.multilineInput, { color: colors.text }]}
                placeholder="123 Main Street, Anytown, USA"
                placeholderTextColor={colors.textSecondary}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                multiline
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Link to Maps</Text>
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
                placeholder="https://maps.app.goo.gl/..."
                placeholderTextColor={colors.textSecondary}
                value={formData.mapsLink}
                onChangeText={(text) => setFormData({ ...formData, mapsLink: text })}
                autoCapitalize="none"
              />
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Photos</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 4 && (
                <TouchableOpacity
                  onPress={pickAndUploadPhotos}
                  disabled={uploadingPhotos}
                >
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.addPhotoButton,
                      {
                        borderColor: isDark 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'rgba(255,255,255,0.5)',
                      }
                    ]}
                  >
                    {uploadingPhotos ? (
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                        <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>
                          Add Photo
                        </Text>
                      </>
                    )}
                  </BlurView>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleSave}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarInner: {
    width: 120,
    height: 120,
    margin: 8,
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
    overflow: 'hidden',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  multilineWrapper: {
    height: 80,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  saveButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 32,
    marginBottom: 32,
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