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
import { Group } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminGroupsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [search, groups]);

  const loadGroups = async () => {
    try {
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterGroups = () => {
    if (!search.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteGroup(group._id);
              Alert.alert('Success', 'Group deleted successfully');
              loadGroups();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const isDark = theme === 'dark';

  const renderGroup = ({ item, index }: { item: Group; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <BlurView
        intensity={isDark ? 15 : 25}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.groupCard,
          { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.groupIcon}
        >
          <Ionicons name="home" size={28} color="#FFFFFF" />
        </LinearGradient>
        
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.membersContainer}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={[styles.membersText, { color: colors.textSecondary }]}>
              {item.members.length} member{item.members.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButtonWrapper}
            onPress={() => router.push(`/(admin)/edit-group/${item._id}`)}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButtonWrapper}
            onPress={() => handleDeleteGroup(item)}
          >
            <LinearGradient
              colors={['#FF6B6B', '#EE5A6F']}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Animated.View 
        entering={FadeInDown.duration(400).springify()}
        style={styles.headerTop}
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
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Groups</Text>
        
        <TouchableOpacity
          style={styles.addButtonWrapper}
          onPress={() => router.push('/(admin)/create-group')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
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
            placeholder="Search groups..."
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
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <BlurView
          intensity={isDark ? 15 : 25}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.statsRow,
            { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)' }
          ]}
        >
          <View style={styles.statItem}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.statIconBg}
            >
              <Ionicons name="home" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>{groups.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Groups</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
          
          <View style={styles.statItem}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.statIconBg}
            >
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {groups.reduce((sum, g) => sum + g.members.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Members</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
          
          <View style={styles.statItem}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.statIconBg}
            >
              <Ionicons name="eye" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>{filteredGroups.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Showing</Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );

  if (loading) {
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
        backgroundColor: isDark ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 215, 0, 0.12)',
      }]} />
      <View style={[styles.decorativeOrb2, {
        backgroundColor: isDark ? 'rgba(78, 205, 196, 0.06)' : 'rgba(78, 205, 196, 0.1)',
      }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {renderHeader()}
        <FlatList
          data={filteredGroups}
          renderItem={renderGroup}
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
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.emptyIconBg}
                >
                  <Ionicons name="home-outline" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>No groups found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Create your first group to get started
              </Text>
              <TouchableOpacity
                style={styles.createButtonWrapper}
                onPress={() => router.push('/(admin)/create-group')}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.createButton}
                >
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Group</Text>
                </LinearGradient>
              </TouchableOpacity>
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
  decorativeOrb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -80,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  addButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    borderRadius: 16,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    marginVertical: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersText: {
    fontSize: 13,
    fontWeight: '500',
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
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 28,
    textAlign: 'center',
  },
  createButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});