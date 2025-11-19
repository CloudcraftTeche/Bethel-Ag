import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { Contact } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [users, setUsers] = useState<Contact[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, users]);

  const loadUsers = async () => {
    try {
      const data = await apiService.getContacts();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.nickname?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = (user: Contact) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteContact(user._id);
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const isDark = theme === 'dark';

  const renderUser = ({ item, index }: { item: Contact; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 30).springify()}>
      <BlurView
        intensity={isDark ? 15 : 25}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.userCard,
          {
            borderColor: isDark 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(255,255,255,0.5)',
          }
        ]}
      >
        <View style={styles.userInfo}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {item.email}
            </Text>
            {item.nickname && (
              <Text style={[styles.userNickname, { color: colors.primary }]}>
                @{item.nickname}
              </Text>
            )}
            <View style={styles.roleContainer}>
              <View style={[
                styles.roleBadge, 
                { backgroundColor: item.role === 'admin' ? '#FFE66D20' : colors.backgroundSecondary }
              ]}>
                <Text style={[
                  styles.roleText,
                  { color: item.role === 'admin' ? '#FFD700' : colors.textSecondary }
                ]}>
                  {item.role.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButtonWrapper}
            onPress={() => router.push(`/(admin)/edit-user/${item._id}`)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonWrapper}
            onPress={() => handleDeleteUser(item)}
          >
            <LinearGradient
              colors={['#FF6B6B', '#EE5A6F']}
              style={styles.actionButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()}
      style={styles.header}
    >
      <View style={styles.headerTop}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Users</Text>
        <TouchableOpacity
          style={styles.addButtonWrapper}
          onPress={() => router.push('/(admin)/create-user')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.addButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <BlurView
        intensity={isDark ? 15 : 25}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.searchContainer,
          {
            borderColor: isDark 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(255,255,255,0.5)',
          }
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </BlurView>

      <BlurView
        intensity={isDark ? 15 : 25}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.statsRow,
          {
            borderColor: isDark 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(255,255,255,0.5)',
          }
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{users.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>
            {users.filter((u) => u.role === 'admin').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {filteredUsers.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Showing</Text>
        </View>
      </BlurView>
    </Animated.View>
  );

  if (loading) {
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
        {renderHeader()}
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, {
                backgroundColor: colors.backgroundSecondary + '40',
              }]}>
                <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>No users found</Text>
            </View>
          }
        />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    flex: 1,
    textAlign: 'center',
  },
  addButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  userNickname: {
    fontSize: 13,
    marginBottom: 4,
  },
  roleContainer: {
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});