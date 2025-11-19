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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { Contact, Group } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

type RecipientType = 'all' | 'users' | 'groups';
type NotificationType = 'general' | 'meeting' | 'reminder' | 'update' | 'message';

export default function SendNotificationScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [users, setUsers] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as NotificationType,
    recipientType: 'all' as RecipientType,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, groupsData] = await Promise.all([
        apiService.getContacts(),
        apiService.getGroups(),
      ]);
      setUsers(usersData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load users and groups');
    } finally {
      setLoadingData(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const getRecipientCount = () => {
    if (formData.recipientType === 'all') {
      return users.length;
    } else if (formData.recipientType === 'users') {
      return selectedUsers.size;
    } else {
      const groupUsers = new Set<string>();
      groups
        .filter((g) => selectedGroups.has(g._id))
        .forEach((g) => g.members.forEach((m) => groupUsers.add(m.toString())));
      return groupUsers.size;
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.recipientType === 'users' && selectedUsers.size === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    if (formData.recipientType === 'groups' && selectedGroups.size === 0) {
      Alert.alert('Error', 'Please select at least one group');
      return;
    }

    const recipientCount = getRecipientCount();
    
    Alert.alert(
      'Confirm Send',
      `Send notification to ${recipientCount} user${recipientCount !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            try {
              let recipients: string[] = [];
              if (formData.recipientType === 'all') {
                recipients = users.map((u) => u._id);
              } else if (formData.recipientType === 'users') {
                recipients = Array.from(selectedUsers);
              } else {
                const groupUsers = new Set<string>();
                groups
                  .filter((g) => selectedGroups.has(g._id))
                  .forEach((g) => g.members.forEach((m) => groupUsers.add(m.toString())));
                recipients = Array.from(groupUsers);
              }

              await apiService.sendBulkNotifications({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                recipients: recipients,
              });

              Alert.alert('Success', 'Notification sent successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Send notification error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to send notification'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const notificationTypes = [
    { value: 'general', label: 'General', icon: 'notifications', color: '#667eea' },
    { value: 'meeting', label: 'Meeting', icon: 'calendar', color: '#4ECDC4' },
    { value: 'reminder', label: 'Reminder', icon: 'alarm', color: '#FFE66D' },
    { value: 'update', label: 'Update', icon: 'information-circle', color: '#FF8B94' },
    { value: 'message', label: 'Message', icon: 'chatbubble', color: '#A8E6CF' },
  ];

  const recipientTypes = [
    { value: 'all', label: 'All Users', icon: 'people', color: '#667eea' },
    { value: 'users', label: 'Specific Users', icon: 'person', color: '#4ECDC4' },
    { value: 'groups', label: 'Groups', icon: 'home', color: '#FFE66D' },
  ];

  const isDark = theme === 'dark';

  if (loadingData) {
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonWrapper}>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.backButton, {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
              }]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Send Notification</Text>
          <View style={{ width: 44 }} />
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Type</Text>
            <View style={styles.typeGrid}>
              {notificationTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.typeButtonWrapper}
                  onPress={() => updateFormData('type', type.value)}
                >
                  {formData.type === type.value ? (
                    <LinearGradient
                      colors={[type.color, `${type.color}CC`]}
                      style={styles.typeButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={type.icon as any} size={24} color="#FFFFFF" />
                      <Text style={styles.typeButtonTextActive}>{type.label}</Text>
                    </LinearGradient>
                  ) : (
                    <BlurView
                      intensity={isDark ? 15 : 25}
                      tint={isDark ? 'dark' : 'light'}
                      style={[styles.typeButton, {
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                      }]}
                    >
                      <Ionicons name={type.icon as any} size={24} color={type.color} />
                      <Text style={[styles.typeButtonText, { color: colors.text }]}>
                        {type.label}
                      </Text>
                    </BlurView>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Message Content</Text>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.inputWrapper, {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
              }]}
            >
              <Ionicons name="text" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Notification title *"
                placeholderTextColor={colors.textSecondary}
                value={formData.title}
                onChangeText={(value) => updateFormData('title', value)}
              />
            </BlurView>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.inputWrapper, styles.textAreaWrapper, {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
              }]}
            >
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text }]}
                placeholder="Notification message *"
                placeholderTextColor={colors.textSecondary}
                value={formData.message}
                onChangeText={(value) => updateFormData('message', value)}
                multiline
                numberOfLines={4}
              />
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recipients</Text>
            {recipientTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.recipientTypeWrapper}
                onPress={() => updateFormData('recipientType', type.value)}
              >
                {formData.recipientType === type.value ? (
                  <LinearGradient
                    colors={[type.color, `${type.color}CC`]}
                    style={styles.recipientTypeButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={type.icon as any} size={20} color="#FFFFFF" />
                    <Text style={styles.recipientTypeTextActive}>{type.label}</Text>
                  </LinearGradient>
                ) : (
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={[styles.recipientTypeButton, {
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                    }]}
                  >
                    <Ionicons name={type.icon as any} size={20} color={colors.textSecondary} />
                    <Text style={[styles.recipientTypeText, { color: colors.text }]}>
                      {type.label}
                    </Text>
                  </BlurView>
                )}
              </TouchableOpacity>
            ))}

            {formData.recipientType === 'users' && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.selectionContainer, {
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                }]}
              >
                <Text style={[styles.selectionTitle, { color: colors.text }]}>
                  Select Users ({selectedUsers.size} selected)
                </Text>
                <ScrollView style={styles.selectionList} nestedScrollEnabled>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user._id}
                      style={[
                        styles.selectionItem,
                        selectedUsers.has(user._id) && styles.selectionItemActive,
                      ]}
                      onPress={() => toggleUser(user._id)}
                    >
                      <View style={[
                        styles.checkbox,
                        selectedUsers.has(user._id) && { backgroundColor: colors.primary },
                        !selectedUsers.has(user._id) && { borderColor: colors.primary, borderWidth: 2 },
                      ]}>
                        {selectedUsers.has(user._id) && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={[styles.selectionItemText, { color: colors.text }]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </BlurView>
            )}

            {formData.recipientType === 'groups' && (
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.selectionContainer, {
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                }]}
              >
                <Text style={[styles.selectionTitle, { color: colors.text }]}>
                  Select Groups ({selectedGroups.size} selected)
                </Text>
                <ScrollView style={styles.selectionList} nestedScrollEnabled>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group._id}
                      style={[
                        styles.selectionItem,
                        selectedGroups.has(group._id) && styles.selectionItemActive,
                      ]}
                      onPress={() => toggleGroup(group._id)}
                    >
                      <View style={[
                        styles.checkbox,
                        selectedGroups.has(group._id) && { backgroundColor: colors.primary },
                        !selectedGroups.has(group._id) && { borderColor: colors.primary, borderWidth: 2 },
                      ]}>
                        {selectedGroups.has(group._id) && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={[styles.selectionItemText, { color: colors.text }]}>
                        {group.name} ({group.members.length} members)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </BlurView>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
          >
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.previewCard, {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
              }]}
            >
              <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
              <View style={[styles.notificationPreview, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.notificationHeader}>
                  <Ionicons
                    name={notificationTypes.find((t) => t.value === formData.type)?.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.notificationHeaderText}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                      {formData.title || 'Notification Title'}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>Now</Text>
                  </View>
                </View>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                  {formData.message || 'Notification message will appear here'}
                </Text>
                <View style={styles.notificationFooter}>
                  <Ionicons name="people" size={16} color={colors.textSecondary} />
                  <Text style={[styles.notificationRecipients, { color: colors.textSecondary }]}>
                    {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
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
                style={[styles.cancelButton, {
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButtonWrapper}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0066CC'] : ['#667eea', '#764ba2']}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Send Notification</Text>
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
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButtonWrapper: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  typeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
    overflow: 'hidden',
  },
  textAreaWrapper: {
    height: 'auto',
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: 'top',
    marginLeft: 0,
  },
  recipientTypeWrapper: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipientTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    overflow: 'hidden',
  },
  recipientTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientTypeTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectionContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectionList: {
    maxHeight: 200,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  selectionItemActive: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionItemText: {
    fontSize: 14,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  notificationPreview: {
    borderRadius: 12,
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationHeaderText: {
    flex: 1,
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationRecipients: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});