import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
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

export default function GroupsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
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

  const groupColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA'];

  const handleGroupPress = (group: Group) => {
    router.push({
      pathname: '/groups/groupMembersScreen',
      params: {
        groupId: group._id,
        groupName: group.name,
      },
    });
  };

  const renderGroup = (group: Group, index: number) => {
    const isDark = theme === 'dark';
    const colorIndex = index % groupColors.length;
    const groupColor = groupColors[colorIndex];

    return (
      <Animated.View
        key={group._id}
        entering={FadeInRight.delay(index * 30).springify()}
      >
        <TouchableOpacity
          style={styles.groupWrapper}
          activeOpacity={0.7}
          onPress={() => handleGroupPress(group)}
        >
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.groupCard,
              {
                borderColor: isDark 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(255,255,255,0.5)',
              }
            ]}
          >
            <LinearGradient
              colors={[`${groupColor}40`, `${groupColor}20`]}
              style={styles.groupIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people" size={28} color={groupColor} />
            </LinearGradient>

            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
                {group.name}
              </Text>
              <View style={styles.membersRow}>
                <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.groupMembers, { color: colors.textSecondary }]}>
                  {Array.isArray(group.members) ? group.members.length : 0} members
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const isDark = theme === 'dark';

  if (loading) {
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
        <Animated.View 
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Groups</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
            </Text>
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
              placeholder="Search groups..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadGroups();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, {
                backgroundColor: colors.backgroundSecondary + '40',
              }]}>
                <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {search ? 'No groups found' : 'No groups available'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {search ? 'Try a different search term' : 'Groups will appear here'}
              </Text>
            </View>
          ) : (
            filteredGroups.map((group, index) => renderGroup(group, index))
          )}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  groupWrapper: {
    marginBottom: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});