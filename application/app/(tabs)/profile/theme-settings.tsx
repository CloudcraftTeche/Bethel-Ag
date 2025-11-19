
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../src/context/ThemeContext';

type ThemeOption = {
  mode: 'light' | 'dark' | 'system';
  title: string;
  description: string;
  icon: string;
};

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, colors } = useTheme();

  const themeOptions: ThemeOption[] = [
    {
      mode: 'light',
      title: 'Light Mode',
      description: 'Always use light theme',
      icon: 'sunny',
    },
    {
      mode: 'dark',
      title: 'Dark Mode',
      description: 'Always use dark theme',
      icon: 'moon',
    },
    {
      mode: 'system',
      title: 'System Default',
      description: 'Follow system appearance settings',
      icon: 'phone-portrait',
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.sectionTitle}>Choose your theme</Text>
          <Text style={styles.sectionDescription}>
            Select how the app should appear on your device
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {themeOptions.map((option, index) => (
            <Animated.View
              key={option.mode}
              entering={FadeInDown.delay(100 * (index + 1))
                .duration(600)
                .springify()}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  themeMode === option.mode && styles.optionCardActive,
                ]}
                onPress={() => setThemeMode(option.mode)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    themeMode === option.mode && styles.iconContainerActive,
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={32}
                    color={themeMode === option.mode ? '#FFFFFF' : colors.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {themeMode === option.mode && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.previewSection}
        >
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar} />
              <View style={styles.previewHeaderText}>
                <View style={styles.previewLine} />
                <View style={[styles.previewLine, styles.previewLineShort]} />
              </View>
            </View>
            <View style={styles.previewBody}>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
              <View style={[styles.previewLine, styles.previewLineShort]} />
            </View>
            <View style={styles.previewActions}>
              <View style={styles.previewButton} />
              <View style={styles.previewButton} />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600).springify()}
          style={styles.infoSection}
        >
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Changes will be applied immediately throughout the app
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 24,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    optionsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.border,
    },
    optionCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundSecondary,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    iconContainerActive: {
      backgroundColor: colors.primary,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    previewSection: {
      marginBottom: 32,
    },
    previewTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    previewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    previewAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      marginRight: 12,
    },
    previewHeaderText: {
      flex: 1,
      gap: 8,
    },
    previewLine: {
      height: 12,
      backgroundColor: colors.textSecondary,
      borderRadius: 6,
      opacity: 0.3,
    },
    previewLineShort: {
      width: '60%',
    },
    previewBody: {
      gap: 8,
      marginBottom: 16,
    },
    previewActions: {
      flexDirection: 'row',
      gap: 12,
    },
    previewButton: {
      flex: 1,
      height: 40,
      backgroundColor: colors.primary,
      borderRadius: 8,
      opacity: 0.7,
    },
    infoSection: {
      marginBottom: 32,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.primary}15`,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });