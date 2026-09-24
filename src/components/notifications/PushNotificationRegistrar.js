import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PushNotificationRegistrar() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || Platform.OS === "web") return undefined;

    let active = true;
    async function register() {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Platform notifications",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
          });
        }

        let permission = await Notifications.getPermissionsAsync();
        if (permission.status !== "granted") {
          permission = await Notifications.requestPermissionsAsync();
        }
        if (!active || permission.status !== "granted") return;

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId;
        if (!projectId) throw new Error("EAS project ID is missing.");

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!active) return;
        await api.post("/notifications/push-token", {
          expoToken: token.data,
          platform: Platform.OS,
        });
      } catch (error) {
        console.warn("Push notification registration failed:", error?.message || error);
      }
    }

    register();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const link = response.notification.request.content.data?.link;
      if (typeof link === "string" && link.startsWith("/")) router.push(link);
    });
    return () => subscription.remove();
  }, [router]);

  return null;
}
