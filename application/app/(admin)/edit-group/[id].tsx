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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../../src/services/api';
import { Contact, Group } from '../../../src/types';
import { useTheme } from '../../../src/context/ThemeContext';

export default function EditGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [group, allUsers] = await Promise.all([
        apiService.getGroup(id as string),
        apiService.getContacts(),
      ]);

      setGroupName(group.name);
      setUsers(allUsers);
      
      const memberIds = new Set(group.members.map((m: any) => 
        typeof m === 'string' ? m : m._id
      ));
      setSelectedMembers(memberIds);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load group');
    } finally {
      setLoadingData(false);
    }
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const selectAll = () => {
    const filteredUsers = getFilteredUsers();
    const newSelected = new Set(selectedMembers);
    filteredUsers.forEach((user) => newSelected.add(user._id));
    setSelectedMembers(newSelected);
  };

  const deselectAll = () => {
    setSelectedMembers(new Set());
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setLoading(true);
    try {
      await apiService.updateGroup(id as string, {
        name: groupName,
        members: Array.from(selectedMembers),
      });
      Alert.alert('Success', 'Group updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (!searchQuery.trim()) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredUsers = getFilteredUsers();
  const isDark = theme === 'dark';

  if (loadingData) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Group</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Information</Text>
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.inputWrapper,
                { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.inputIcon}
              >
                <Ionicons name="home" size={20} color="#FFFFFF" />
              </LinearGradient>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter group name"
                placeholderTextColor={colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
              />
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.section}
          >
            <View style={styles.membersHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Members ({selectedMembers.size})
              </Text>
              <View style={styles.selectButtons}>
                <TouchableOpacity onPress={selectAll}>
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.selectButton,
                      { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
                    ]}
                  >
                    <Text style={[styles.selectButtonText, { color: colors.primary }]}>All</Text>
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity onPress={deselectAll}>
                  <BlurView
                    intensity={isDark ? 15 : 25}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.selectButton,
                      { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
                    ]}
                  >
                    <Text style={[styles.selectButtonText, { color: colors.primary }]}>None</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>

            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.searchContainer,
                { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
              ]}
            >
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search members..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </BlurView>

            <View style={styles.membersList}>
              {filteredUsers.map((user, index) => (
                <Animated.View
                  key={user._id}
                  entering={FadeInRight.delay(index * 30).springify()}
                >
                  <TouchableOpacity
                    onPress={() => toggleMember(user._id)}
                    activeOpacity={0.7}
                  >
                    <BlurView
                      intensity={isDark ? 15 : 25}
                      tint={isDark ? 'dark' : 'light'}
                      style={[
                        styles.memberItem,
                        {
                          borderColor: selectedMembers.has(user._id) 
                            ? colors.primary 
                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)')
                        }
                      ]}
                    >
                      <View style={[
                        styles.checkbox, 
                        { 
                          borderColor: colors.primary, 
                          backgroundColor: selectedMembers.has(user._id) ? colors.primary : 'transparent' 
                        }
                      ]}>
                        {selectedMembers.has(user._id) && (
                          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        )}
                      </View>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text }]}>{user.name}</Text>
                        <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {selectedMembers.size > 0 && (
            <Animated.View
              entering={FadeInDown.delay(300).duration(600).springify()}
            >
              <BlurView
                intensity={isDark ? 15 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.previewCard,
                  { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
                ]}
              >
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  Selected Members ({selectedMembers.size})
                </Text>
                <View style={styles.selectedMembersPreview}>
                  {users
                    .filter((u) => selectedMembers.has(u._id))
                    .slice(0, 5)
                    .map((user) => (
                      <LinearGradient
                        key={user._id}
                        colors={['#4ECDC4', '#44A08D']}
                        style={styles.selectedMemberChip}
                      >
                        <Text style={styles.selectedMemberName}>{user.name}</Text>
                      </LinearGradient>
                    ))}
                  {selectedMembers.size > 5 && (
                    <LinearGradient
                      colors={['#4ECDC4', '#44A08D']}
                      style={styles.selectedMemberChip}
                    >
                      <Text style={styles.selectedMemberName}>
                        +{selectedMembers.size - 5} more
                      </Text>
                    </LinearGradient>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          )}

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
                colors={['#FFD700', '#FFA500']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Update Group</Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',
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
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    overflow: 'hidden',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  memberEmail: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  selectedMembersPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedMemberChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedMemberName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    shadowColor: '#FFD700',
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