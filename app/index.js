import React from "react";

import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Redirect,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../src/contexts/AuthContext";
import { colors } from "../src/theme";
import { styles } from "./index.styles";

const landingBackground = require(
  "../assets/images/mahmoud-landing-bg.jpeg"
);

const WHATSAPP_URL = "https://wa.link/5l6f4m";
const EMAIL_ADDRESS = "mahmoudnagy196@gmail.com";

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { user, loading } = useAuth();

  const isPhone = width < 600;
  const isSmallTablet = width >= 600 && width < 900;
  const isTablet = width >= 600 && width < 1100;

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
      </View>
    );
  }

  if (user) {
    const isRegularAssistant =
      user.role === "ASSISTANT" &&
      !user.isHeadAssistant;

    let destination = "/(app)/dashboard";

    if (user.role === "STUDENT") {
      destination = "/(app)/my-dashboard";
    } else if (isRegularAssistant) {
      destination = "/(app)/my-stats";
    }

    return <Redirect href={destination} />;
  }

  function goHome() {
    router.push("/");
  }

  function goToCourses() {
    router.push("/courses");
  }

  function goToContact() {
    router.push("/contact");
  }

  function goToLogin() {
    router.push("/(auth)/login");
  }

  function goToRegister() {
    router.push("/register");
  }

  async function openWhatsApp() {
    try {
      await Linking.openURL(WHATSAPP_URL);
    } catch {}
  }

  async function openEmail() {
    try {
      await Linking.openURL(
        `mailto:${EMAIL_ADDRESS}`
      );
    } catch {}
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        source={landingBackground}
        resizeMode="cover"
        style={[
          styles.background,
          {
            minHeight: height,
          },
        ]}
        imageStyle={[
          styles.backgroundImage,

          isTablet &&
            styles.backgroundImageTablet,

          isPhone &&
            styles.backgroundImagePhone,
        ]}
      >
        <View style={styles.darkOverlay} />

        <View
          style={[
            styles.leftOverlay,
            isTablet &&
              styles.leftOverlayTablet,
            isPhone &&
              styles.leftOverlayPhone,
          ]}
        />

        <View
          style={[
            styles.page,
            isTablet &&
              styles.pageTablet,
            isPhone &&
              styles.pagePhone,
          ]}
        >
          {/* NAVBAR */}

          <View
            style={[
              styles.navbar,
              isTablet &&
                styles.navbarTablet,
              isPhone &&
                styles.navbarPhone,
            ]}
          >
            <Pressable
              onPress={goHome}
              style={[
                styles.brandContainer,
                isPhone &&
                  styles.brandContainerPhone,
              ]}
            >
              <Text
                style={[
                  styles.brandName,
                  isTablet &&
                    styles.brandNameTablet,
                  isPhone &&
                    styles.brandNamePhone,
                ]}
              >
                MAHMOUD NAGY
              </Text>

              {!isPhone && (
                <>
                  <View
                    style={styles.brandDivider}
                  />

                  <Text
                    style={[
                      styles.brandSubject,
                      isTablet &&
                        styles.brandSubjectTablet,
                    ]}
                  >
                    PHYSICS
                  </Text>
                </>
              )}
            </Pressable>

            {!isTablet && (
              <View style={styles.navigation}>
                <Pressable
                  onPress={goHome}
                  style={styles.navItemActive}
                >
                  <Text
                    style={styles.navTextActive}
                  >
                    Home
                  </Text>

                  <View
                    style={styles.navActiveLine}
                  />
                </Pressable>

                <Pressable
                  onPress={goToCourses}
                  style={styles.navItem}
                >
                  <Text style={styles.navText}>
                    Courses
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.navItem}
                >
                  <Text
                    style={[
                      styles.navText,
                      styles.navTextPending,
                    ]}
                  >
                    About Me
                  </Text>
                </Pressable>

                <Pressable
                  onPress={goToContact}
                  style={styles.navItem}
                >
                  <Text style={styles.navText}>
                    Contact
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.authActions}>
              <Pressable
                onPress={goToRegister}
                style={({ pressed }) => [
                  styles.registerButton,
                  isPhone &&
                    styles.registerButtonPhone,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.registerButtonText,
                    isPhone &&
                      styles.registerButtonTextPhone,
                  ]}
                >
                  Register
                </Text>
              </Pressable>

              <Pressable
                onPress={goToLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  isPhone &&
                    styles.loginButtonPhone,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.loginButtonText,
                    isPhone &&
                      styles.loginButtonTextPhone,
                  ]}
                >
                  Login
                </Text>

                {!isPhone && (
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>
            </View>
          </View>

          {/* TABLET / MOBILE NAV */}

          {isTablet && (
            <View
              style={[
                styles.compactNav,
                isPhone &&
                  styles.compactNavPhone,
              ]}
            >
              <Pressable onPress={goHome}>
                <Text
                  style={styles.compactNavActive}
                >
                  Home
                </Text>
              </Pressable>

              <Pressable onPress={goToCourses}>
                <Text
                  style={styles.compactNavText}
                >
                  Courses
                </Text>
              </Pressable>

              <Pressable onPress={goToContact}>
                <Text
                  style={styles.compactNavText}
                >
                  Contact
                </Text>
              </Pressable>
            </View>
          )}

          {/* HERO */}

          <View
            style={[
              styles.hero,
              isSmallTablet &&
                styles.heroSmallTablet,
              isPhone &&
                styles.heroPhone,
            ]}
          >
            <View
              style={[
                styles.heroCopy,
                isTablet &&
                  styles.heroCopyTablet,
                isPhone &&
                  styles.heroCopyPhone,
              ]}
            >
              <Text
                style={[
                  styles.heroTitle,
                  isTablet &&
                    styles.heroTitleTablet,
                  isPhone &&
                    styles.heroTitlePhone,
                ]}
              >
                MASTER{"\n"}
                PHYSICS.{"\n"}
                OWN YOUR{"\n"}
                FUTURE.
              </Text>

              <Text
                style={[
                  styles.heroSubtitle,
                  isTablet &&
                    styles.heroSubtitleTablet,
                  isPhone &&
                    styles.heroSubtitlePhone,
                ]}
              >
                Cambridge & Edexcel
                {"  •  "}
                O Level & AS
              </Text>

              <View
                style={[
                  styles.heroActions,
                  isTablet &&
                    styles.heroActionsTablet,
                  isPhone &&
                    styles.heroActionsPhone,
                ]}
              >
                <Pressable
                  onPress={goToCourses}
                  style={({ pressed }) => [
                    styles.primaryCta,
                    isTablet &&
                      styles.primaryCtaTablet,
                    isPhone &&
                      styles.primaryCtaPhone,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryCtaText,
                      isPhone &&
                        styles.primaryCtaTextPhone,
                    ]}
                  >
                    EXPLORE COURSES
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Text
                  style={[
                    styles.heroStatement,
                    isPhone &&
                      styles.heroStatementPhone,
                  ]}
                >
                  Learn. Understand. Achieve.
                </Text>
              </View>
            </View>

            {!isTablet && (
              <View style={styles.contactRail}>
                <Pressable
                  onPress={openEmail}
                  style={({ pressed }) => [
                    styles.contactButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={27}
                    color="#07161C"
                  />
                </Pressable>

                <Pressable
                  onPress={openWhatsApp}
                  style={({ pressed }) => [
                    styles.contactButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={28}
                    color="#07161C"
                  />
                </Pressable>
              </View>
            )}
          </View>

          {isTablet && (
            <View
              style={[
                styles.mobileContactRow,
                isPhone &&
                  styles.mobileContactRowPhone,
              ]}
            >
              <Pressable
                onPress={openEmail}
                style={styles.mobileContactButton}
              >
                <Ionicons
                  name="mail-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                onPress={openWhatsApp}
                style={styles.mobileContactButton}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}