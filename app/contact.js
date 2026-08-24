import Head from "expo-router/head";
import React from "react";

import {
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useRouter,
} from "expo-router";

import { styles } from "./contact.styles";

const WHATSAPP_URL =
  "https://wa.link/5l6f4m";

export default function ContactPage() {
  const router = useRouter();

  async function contactTeam() {
    try {
      await Linking.openURL(
        WHATSAPP_URL
      );
    } catch {
      // Ignore platform failure.
    }
  }
  <Head>
  <title>
    Contact Mahmoud Nagy Physics | Laytheg
  </title>

  <meta
    name="description"
    content="Contact the Mahmoud Nagy Physics team for course information, registration and support."
  />

  <meta
    name="robots"
    content="index, follow"
  />

  <link
    rel="canonical"
    href="https://laytheg.com/contact"
  />
</Head>
  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            router.push("/")
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.backText
            }
          >
            Home
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View
          style={
            styles.whatsappIcon
          }
        >
          <Ionicons
            name="logo-whatsapp"
            size={42}
            color="#08C8EF"
          />
        </View>

        <Text
          style={styles.eyebrow}
        >
          CONTACT
        </Text>

        <Text
          style={styles.title}
        >
          Contact the Team
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Have a question about
          courses, registration or
          your account? Contact the
          Mahmoud Nagy team directly
          on WhatsApp and we will
          assist you.
        </Text>

        <Pressable
          onPress={contactTeam}
          style={({ pressed }) => [
            styles.whatsappButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="logo-whatsapp"
            size={24}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.whatsappButtonText
            }
          >
            CONTACT US ON WHATSAPP
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}