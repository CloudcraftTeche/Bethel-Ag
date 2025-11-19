
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import apiService from '../../src/services/api';
import { COLORS } from '../../src/config/constants';

export default function AdminLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await apiService.getProfile();
      if (user.role !== 'admin') {
        router.replace('/(tabs)');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="create-user" />
      <Stack.Screen name="edit-user/[id]" />
      <Stack.Screen name="events" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="edit-event/[id]" />
      <Stack.Screen name="groups" />
      <Stack.Screen name="create-group" />
      <Stack.Screen name="edit-group/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="send-notification" />
    </Stack>
  );
}