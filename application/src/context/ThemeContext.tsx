import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#FFFFFF",
  backgroundSecondary: "#F2F2F7",
  backgroundTertiary: "#FFFFFF",

  text: "#000000",
  textSecondary: "#8E8E93",
  textTertiary: "#C7C7CC",

  primary: "#007AFF",
  secondary: "#5856D6",
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",

  border: "#E5E5EA",
  separator: "#C6C6C8",

  card: "#FFFFFF",
  elevated: "#FFFFFF",

  statusBar: "dark-content" as any,
};

const darkColors = {
  background: "#000000",
  backgroundSecondary: "#1C1C1E",
  backgroundTertiary: "#2C2C2E",

  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",

  primary: "#0A84FF",
  secondary: "#5E5CE6",
  success: "#30D158",
  warning: "#FF9F0A",
  error: "#FF453A",

  border: "#38383A",
  separator: "#38383A",

  card: "#1C1C1E",
  elevated: "#2C2C2E",

  statusBar: "light-content" as const,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<"light" | "dark">(
    systemColorScheme || "light"
  );

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === "system") {
      setTheme(systemColorScheme || "light");
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode");
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export { lightColors, darkColors };
