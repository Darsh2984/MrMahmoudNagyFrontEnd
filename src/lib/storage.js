import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

// expo-secure-store has no web implementation, so we fall back to
// AsyncStorage (which itself uses localStorage under react-native-web).
// This split is the ONLY place platform-specific storage logic should live.
export async function setToken(token) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
