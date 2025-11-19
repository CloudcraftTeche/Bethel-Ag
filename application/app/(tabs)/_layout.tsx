import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Linking, Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

const AnimatedIcon = ({ name, color, size, focused, gradient }: any) => {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const translateY = useSharedValue(focused ? -2 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, {
      damping: 12,
      stiffness: 180,
    });
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 12,
      stiffness: 180,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
    
      <Ionicons 
        name={focused ? name : name} 
        size={24} 
        color={focused ? gradient[0] : color} 
      />
    
    </Animated.View>
  );
};

export default function TabsLayout() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const tabConfig = [
    {
      name: 'index',
      title: 'Contacts',
      icon: 'people',
      iconOutline: 'people-outline',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      name: 'events',
      title: 'Events',
      icon: 'calendar',
      iconOutline: 'calendar-outline',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      name: 'groups',
      title: 'Groups',
      icon: 'home',
      iconOutline: 'home-outline',
      gradient: ['#FFD700', '#FFA500'],
    },
    {
      name: 'youtube',
      title: 'YouTube',
      icon: 'logo-youtube',
      iconOutline: 'logo-youtube',
      gradient: ['#FF0000', '#CC0000'],
    },
    {
      name: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      iconOutline: 'notifications-outline',
      gradient: ['#FF6B6B', '#EE5A6F'],
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 16,
          right: 16,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          marginLeft: 15,
          marginRight: 15,
          paddingHorizontal: 8,
          elevation: 0,
          borderRadius: 24,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={isDark 
                ? ['#1e1e28', '#2a2a3e', '#1a1a2e']
                : ['#e8eef5', '#d4dff0', '#c8d5e8']
              }
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <BlurView
              intensity={isDark ? 60 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFillObject}
            />

            <LinearGradient
              colors={['#667eea40', '#4ECDC440', '#FFD70040', '#FF6B6B40']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topAccent}
            />

            <View style={[styles.innerBorder, { 
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)' 
            }]} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      {tabConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon
                name={focused ? tab.icon : tab.iconOutline}
                color={color}
                size={size}
                focused={focused}
                gradient={tab.gradient}
              />
            ),
            tabBarActiveTintColor: tab.gradient[0],
          }}
          listeners={tab.name === 'youtube' ? {
            tabPress: (e) => {
              e.preventDefault();
              Linking.openURL('https://www.youtube.com/@bethelagdubai');
            },
          } : undefined}
        />
      ))}
      
      <Tabs.Screen
        name="contact/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  innerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 23,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 42,
    height: 48,
  },
  activeBackground: {
    position: 'absolute',
    width: 42,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },


});