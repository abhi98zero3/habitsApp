import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthContextProvider, useAuth } from "@/lib/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loadingUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    if (!user && !inAuthGroup && !loadingUser) {
      router.replace("/auth");
    } else if (user && inAuthGroup && !loadingUser) {
      router.replace("/");
    }
  }, [loadingUser, user, router, segments]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex : 1}}>
      <AuthContextProvider>
        <PaperProvider theme={MD3LightTheme}>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthContextProvider>
    </GestureHandlerRootView>
  );
}
