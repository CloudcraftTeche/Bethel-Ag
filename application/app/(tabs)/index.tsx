import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import apiService from "../../src/services/api";
import { Contact } from "../../src/types";
import { useTheme } from "../../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function ContactsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);
  const [sectionedContacts, setSectionedContacts] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [search, contacts]);

  const checkAuthAndLoad = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }
      await loadProfile();
      await loadContacts();
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/(auth)/login");
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setCurrentUser(profile as Contact);
    } catch (error) {
      console.error("Error loading profile:", error);
      router.replace("/(auth)/login");
    }
  };

  const loadContacts = async () => {
    try {
      const data = await apiService.getContacts();
      setContacts(data);
    } catch (error: any) {
      console.error("Error loading contacts:", error);
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterContacts = () => {
    if (!search.trim()) {
      const sorted = [...contacts].sort((a, b) => {
        if (a._id === currentUser?._id) return -1;
        if (b._id === currentUser?._id) return 1;
        return a.name.localeCompare(b.name);
      });
      setFilteredContacts(sorted);
      createSections(sorted);
      return;
    }

    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.nickname?.toLowerCase().includes(search.toLowerCase())
    );
    
    const sorted = filtered.sort((a, b) => {
      if (a._id === currentUser?._id) return -1;
      if (b._id === currentUser?._id) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredContacts(sorted);
    createSections(sorted);
  };

  const createSections = (contactList: Contact[]) => {
    const sections: any[] = [];
    let currentSection = "";

    contactList.forEach((contact, index) => {
      const isCurrentUser = contact._id === currentUser?._id;
      
      if (isCurrentUser) {
        if (sections.length === 0 || sections[sections.length - 1].type !== "header") {
          sections.push({
            type: "header",
            letter: "★",
            index: sections.length,
          });
        }
        sections.push({
          type: "contact",
          data: contact,
          index: sections.length,
        });
      } else {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        const letter = /[A-Z]/.test(firstLetter) ? firstLetter : "#";

        if (letter !== currentSection) {
          currentSection = letter;
          sections.push({
            type: "header",
            letter: letter,
            index: sections.length,
          });
        }

        sections.push({
          type: "contact",
          data: contact,
          index: sections.length,
        });
      }
    });

    setSectionedContacts(sections);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContacts();
  };

  const scrollToLetter = (letter: string) => {
    const index = sectionedContacts.findIndex(
      (item) => item.type === "header" && item.letter === letter
    );
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "header") {
      return (
        <View style={styles.sectionHeader}>
       
        </View>
      );
    }

    const contact = item.data;
    const isCurrentUser = contact._id === currentUser?._id;
    const isDark = theme === "dark";

    return (
      <Animated.View entering={FadeInRight.delay(index * 20).springify()}>
        <TouchableOpacity
          style={styles.contactItemWrapper}
          onPress={() => router.push(`/contact/${contact._id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.contactItem}>
            <View style={styles.avatarContainer}>
              {contact.avatar ? (
                <Image
                  source={{ uri: contact.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <LinearGradient
                  colors={
                    isCurrentUser
                      ? isDark 
                        ? ["#FFD700", "#FFA500"] 
                        : ["#FFD700", "#FF8C00"]
                      : isDark 
                        ? ["#0A84FF", "#0066CC"] 
                        : ["#667eea", "#764ba2"]
                  }
                  style={styles.avatarPlaceholder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              {isCurrentUser && (
                <View style={styles.starBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                </View>
              )}
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.contactName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {contact.name}
                </Text>
                {isCurrentUser && (
                  <View style={[styles.youBadge, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.youBadgeText, { color: colors.primary }]}>
                      You
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => {
    const isDark = theme === "dark";

    return (
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Contacts
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              {filteredContacts.length}{" "}
              {filteredContacts.length === 1 ? "person" : "people"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.menuButton}
          >
            <BlurView
              intensity={isDark ? 15 : 25}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.menuButtonInner,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.5)",
                },
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={colors.text}
              />
            </BlurView>
          </TouchableOpacity>
        </View>

        <BlurView
          intensity={isDark ? 15 : 25}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.searchContainer,
            {
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.5)",
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </BlurView>
      </Animated.View>
    );
  };

  const renderAlphabetIndex = () => {
    const isDark = theme === "dark";
    
    const availableLetters = new Set(
      sectionedContacts
        .filter(item => item.type === "header")
        .map(item => item.letter)
    );

    return (
      <View style={styles.alphabetContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.alphabetScroll}
        >
          {["★", ...ALPHABET].map((letter) => {
            const isAvailable = availableLetters.has(letter);
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => isAvailable && scrollToLetter(letter)}
                style={styles.alphabetItem}
                disabled={!isAvailable}
              >
                <Text
                  style={[
                    styles.alphabetText,
                    {
                      color: isAvailable 
                        ? colors.primary 
                        : colors.textSecondary + "100",
                      fontWeight: isAvailable ? "600" : "400",
                    },
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const isDark = theme === "dark";

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            isDark
              ? ["#0f0f0f", "#1a1a2e", "#16213e"]
              : ["#f5f7fa", "#c3cfe2", "#667eea"]
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
        colors={
          isDark
            ? ["#0f0f0f", "#1a1a2e", "#16213e"]
            : ["#f5f7fa", "#c3cfe2", "#667eea"]
        }
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.decorativeOrb1,
          {
            backgroundColor: isDark
              ? "rgba(10,132,255,0.08)"
              : "rgba(102,126,234,0.12)",
          },
        ]}
      />
      <View
        style={[
          styles.decorativeOrb2,
          {
            backgroundColor: isDark
              ? "rgba(94,92,230,0.06)"
              : "rgba(249,147,251,0.1)",
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {renderHeader()}

        {filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                {
                  backgroundColor: colors.backgroundSecondary + "40",
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {search ? "No contacts found" : "No contacts yet"}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {search
                ? "Try a different search term"
                : "Contacts will appear here"}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              ref={flatListRef}
              data={sectionedContacts}
              renderItem={renderItem}
              keyExtractor={(item) => `${item.type}-${item.index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              }
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              scrollEnabled={true}
              pagingEnabled={false}
            />
            {!search && renderAlphabetIndex()}
          </View>
        )}
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
    justifyContent: "center",
    alignItems: "center",
  },
  decorativeOrb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  decorativeOrb2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -80,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  menuButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  menuButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
    position: "relative",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 140,
  },
  contactItemWrapper: {
    marginBottom: 0,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "transparent",
  },
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  starBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f0f0f",
  },
  contactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    marginRight: 8,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginTop: 0,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
  },
  alphabetContainer: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 24,
    maxHeight:400
  },
  alphabetScroll: {
    alignItems: "center",
    paddingVertical: 4,
  },
  alphabetItem: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  alphabetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
});