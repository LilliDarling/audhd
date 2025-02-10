import '../global.css'
import { useColorScheme } from "react-native";
import { Slot } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SessionProvider } from "@/lib/context/SessionProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // <AuthProvider>
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SessionProvider>
    // </AuthProvider>
  );
}