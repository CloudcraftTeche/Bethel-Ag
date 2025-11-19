
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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import apiService from '../../src/services/api';
import { Contact } from '../../src/types';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../../src/config/constants';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiService.getContacts();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
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
      await apiService.createGroup({
        name: groupName,
        members: Array.from(selectedMembers),
      });
      Alert.alert('Success', 'Group created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
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
          <Text style={styles.sectionTitle}>Group Information</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="people" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor={COLORS.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.section}
        >
          <View style={styles.membersHeader}>
            <Text style={styles.sectionTitle}>
              Select Members ({selectedMembers.size})
            </Text>
            <View style={styles.selectButtons}>
              <TouchableOpacity onPress={selectAll} style={styles.selectButton}>
                <Text style={styles.selectButtonText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deselectAll} style={styles.selectButton}>
                <Text style={styles.selectButtonText}>None</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {loadingUsers ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View style={styles.membersList}>
              {filteredUsers.map((user, index) => (
                <Animated.View
                  key={user._id}
                  entering={FadeInRight.delay(index * 30).springify()}
                >
                  <TouchableOpacity
                    style={[
                      styles.memberItem,
                      selectedMembers.has(user._id) && styles.memberItemSelected,
                    ]}
                    onPress={() => toggleMember(user._id)}
                  >
                    <View style={styles.checkbox}>
                      {selectedMembers.has(user._id) && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{user.name}</Text>
                      <Text style={styles.memberEmail}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {selectedMembers.size > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.previewCard}
          >
            <Text style={styles.previewTitle}>
              Selected Members ({selectedMembers.size})
            </Text>
            <View style={styles.selectedMembersPreview}>
              {users
                .filter((u) => selectedMembers.has(u._id))
                .slice(0, 5)
                .map((user) => (
                  <View key={user._id} style={styles.selectedMemberChip}>
                    <Text style={styles.selectedMemberName}>{user.name}</Text>
                  </View>
                ))}
              {selectedMembers.size > 5 && (
                <View style={styles.selectedMemberChip}>
                  <Text style={styles.selectedMemberName}>
                    +{selectedMembers.size - 5} more
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
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
                <Text style={styles.submitButtonText}>Create Group</Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
  },
  selectButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  membersList: {
    gap: SPACING.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memberItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
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
  selectedMembersPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  selectedMemberChip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  selectedMemberName: {
    color: '#FFFFFF',
    fontSize: SIZES.sm,
    fontWeight: '600',
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