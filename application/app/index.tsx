import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const router = useRouter();

  const handleStart = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          height: "80%",
          borderBottomRightRadius: 140,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <ImageBackground
          source={require("../assets/bg.png")}
          style={{ width: "100%", height: "100%" }}
          imageStyle={{
            borderBottomRightRadius: 140,
          }}
          resizeMode="cover"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => handleStart()}
        >
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    width: 220,
    height: 220,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 4,
  },
  startButton: {
    backgroundColor: "#0a1f3d",
    paddingVertical: 18,
    paddingHorizontal: 140,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  bottomIndicator: {
    width: 140,
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "#ffff",
    height: "20%",
    width: "100%",
    justifyContent: "flex-end",
  },
});
