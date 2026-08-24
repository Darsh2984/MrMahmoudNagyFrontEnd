import React from "react";

import {
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { styles } from "./contact.styles";

const WHATSAPP_URL = "https://wa.link/5l6f4m";

export default function ContactPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isPhone = width < 600;

  async function contactTeam() {
    try {
      await Linking.openURL(WHATSAPP_URL);
    } catch {}
  }

  return (
    <View
      style={[
        styles.screen,
        isPhone &&
          styles.screenPhone,
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.push("/")}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.backText}>
            Home
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.content,
          isPhone &&
            styles.contentPhone,
        ]}
      >
        <View
          style={[
            styles.whatsappIcon,
            isPhone &&
              styles.whatsappIconPhone,
          ]}
        >
          <Ionicons
            name="logo-whatsapp"
            size={isPhone ? 34 : 42}
            color="#08C8EF"
          />
        </View>

        <Text style={styles.eyebrow}>
          CONTACT
        </Text>

        <Text
          style={[
            styles.title,
            isPhone &&
              styles.titlePhone,
          ]}
        >
          Contact the Team
        </Text>

        <Text
          style={[
            styles.description,
            isPhone &&
              styles.descriptionPhone,
          ]}
        >
          Have a question about courses,
          registration or your account?
          Contact the Mahmoud Nagy team
          directly on WhatsApp.
        </Text>

        <Pressable
          onPress={contactTeam}
          style={({ pressed }) => [
            styles.whatsappButton,
            isPhone &&
              styles.whatsappButtonPhone,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="logo-whatsapp"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={[
              styles.whatsappButtonText,
              isPhone &&
                styles.whatsappButtonTextPhone,
            ]}
          >
            CONTACT US ON WHATSAPP
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}