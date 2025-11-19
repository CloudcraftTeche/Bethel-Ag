import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from "expo-image";

import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import apiService from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function GroupMembersScreen() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams();
  const { theme, colors } = useTheme();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      if (!groupId || groupId === 'undefined') {
        setError('Invalid group ID');
        setLoading(false);
        return;
      }

      const data = await apiService.getGroupMembers(groupId as string);
      setMembers(data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading members:', error);
      setError(error.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const memberColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA'];

  const renderMember = (member: any, index: number) => {
    const isDark = theme === 'dark';
    const colorIndex = index % memberColors.length;
    const memberColor = memberColors[colorIndex];
    const initials = member.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

    return (
      <Animated.View
        key={member._id}
        entering={FadeInRight.delay(index * 30).springify()}
      >
        <TouchableOpacity style={styles.memberWrapper}
           onPress={() => router.push(`/contact/${member._id}`)}
        activeOpacity={0.7}>
          <BlurView
            intensity={isDark ? 15 : 25}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.memberCard,
              {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.5)',
              }
            ]}
          >
            <LinearGradient
              colors={[`${memberColor}40`, `${memberColor}20`]}
              style={styles.memberAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.initials, { color: memberColor }]}>
                  {initials}
                </Text>
              )}
            </LinearGradient>

            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={[styles.memberEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {member.email}
              </Text>
              {member.role && (
                <View style={[styles.roleBadge, { backgroundColor: `${memberColor}20` }]}>
                  <Text style={[styles.roleText, { color: memberColor }]}>
                    {member.role}
                  </Text>
                </View>
              )}
            </View>

            {member.status && (
              <View style={[styles.statusIndicator, {
                backgroundColor: member.status === 'active' ? '#10B981' : '#6B7280'
              }]} />
            )}
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {groupName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMembers();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, {
                backgroundColor: colors.backgroundSecondary + '40',
              }]}>
                <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {error ? 'Error loading members' : 'No members'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {error || 'Members will appear here'}
              </Text>
            </View>
          ) : (
            members.map((member, index) => renderMember(member, index))
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  memberWrapper: {
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 20,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
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