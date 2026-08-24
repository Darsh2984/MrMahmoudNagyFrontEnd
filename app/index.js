import Head from "expo-router/head";
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

const WHATSAPP_URL =
  "https://wa.link/5l6f4m";

const EMAIL_ADDRESS =
  "mahmoudnagy196@gmail.com";

export default function Index() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const { user, loading } =
    useAuth();

  const isMobile = width < 700;

  const isTablet =
    width >= 700 &&
    width < 1050;

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

  /*
   * Keep the existing authenticated-user
   * redirect behavior.
   */
  if (user) {
    const isRegularAssistant =
      user.role === "ASSISTANT" &&
      !user.isHeadAssistant;

    let destination =
      "/(app)/dashboard";

    if (
      user.role === "STUDENT"
    ) {
      destination =
        "/(app)/my-dashboard";
    } else if (
      isRegularAssistant
    ) {
      destination =
        "/(app)/my-stats";
    }

    return (
      <Redirect
        href={destination}
      />
    );
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
    router.push(
      "/(auth)/login"
    );
  }

  async function openWhatsApp() {
    try {
      await Linking.openURL(
        WHATSAPP_URL
      );
    } catch {
      // Ignore OS/browser failure.
    }
  }

  async function openEmail() {
    try {
      await Linking.openURL(
        `mailto:${EMAIL_ADDRESS}`
      );
    } catch {
      // Ignore OS/browser failure.
    }
  }
  <Head>
  <title>
    Mahmoud Nagy Physics | IGCSE, O Level & AS Physics Courses
  </title>

  <meta
    name="description"
    content="Learn Physics with Mahmoud Nagy. Physics courses for Year 9 Core, Cambridge O Level, Edexcel O Level, Combined Science O Level, and Cambridge AS Physics."
  />

  <meta
    name="keywords"
    content="Mahmoud Nagy, Mahmoud Nagy Physics, Laytheg, IGCSE Physics, Physics courses IGCSE, O Level Physics, Cambridge Physics, Edexcel Physics, AS Physics, Physics tutor, Year 9 Physics, Combined Science Physics"
  />

  <meta
    name="robots"
    content="index, follow"
  />

  <link
    rel="canonical"
    href="https://laytheg.com/"
  />

  <meta
    property="og:title"
    content="Mahmoud Nagy Physics | IGCSE, O Level & AS Physics"
  />

  <meta
    property="og:description"
    content="Physics courses with Mahmoud Nagy for Cambridge, Edexcel, O Level, Combined Science and AS students."
  />

  <meta
    property="og:url"
    content="https://laytheg.com/"
  />

  <meta
    property="og:type"
    content="website"
  />

  <meta
    property="og:site_name"
    content="Mahmoud Nagy Physics"
  />
</Head>
  return (
    <View style={styles.root}>
      <ImageBackground
        source={landingBackground}
        /*
         * On desktop/tablet we use contain rather
         * than cover. This reveals more of the
         * original background and gives the
         * requested slightly zoomed-out appearance.
         *
         * Mobile continues using cover so we don't
         * get large empty strips around the image.
         */
        resizeMode={
          isMobile
            ? "cover"
            : "contain"
        }
        style={[
          styles.background,
          {
            minHeight: height,
          },
        ]}
        imageStyle={
          styles.backgroundImage
        }
      >
        <View
          style={
            styles.darkOverlay
          }
        />

        <View
          style={
            styles.leftOverlay
          }
        />

        <View
          style={[
            styles.page,
            isMobile &&
              styles.pageMobile,
          ]}
        >
          {/* NAVBAR */}

          <View
            style={[
              styles.navbar,
              isMobile &&
                styles.navbarMobile,
            ]}
          >
            <Pressable
              onPress={goHome}
              style={
                styles.brandContainer
              }
            >
              <Text
                style={
                  styles.brandName
                }
              >
                MAHMOUD NAGY
              </Text>

              <View
                style={
                  styles.brandDivider
                }
              />

              <Text
                style={
                  styles.brandSubject
                }
              >
                PHYSICS
              </Text>
            </Pressable>

            {!isMobile ? (
              <View
                style={
                  styles.navigation
                }
              >
                <Pressable
                  onPress={goHome}
                  style={
                    styles.navItemActive
                  }
                >
                  <Text
                    style={
                      styles.navTextActive
                    }
                  >
                    Home
                  </Text>

                  <View
                    style={
                      styles.navActiveLine
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={
                    goToCourses
                  }
                  style={
                    styles.navItem
                  }
                >
                  <Text
                    style={
                      styles.navText
                    }
                  >
                    Courses
                  </Text>
                </Pressable>

                {/*
                  About Me intentionally has no
                  destination yet until the client
                  decides what should be shown.
                */}
                <Pressable
                  style={
                    styles.navItem
                  }
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
                  onPress={
                    goToContact
                  }
                  style={
                    styles.navItem
                  }
                >
                  <Text
                    style={
                      styles.navText
                    }
                  >
                    Contact
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              onPress={goToLogin}
              style={({
                pressed,
              }) => [
                styles.loginButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                Login
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* HERO */}

          <View
            style={[
              styles.hero,
              isMobile &&
                styles.heroMobile,
              isTablet &&
                styles.heroTablet,
            ]}
          >
            <View
              style={[
                styles.heroCopy,
                isMobile &&
                  styles.heroCopyMobile,
              ]}
            >
              <Text
                style={[
                  styles.heroTitle,
                  isTablet &&
                    styles.heroTitleTablet,
                  isMobile &&
                    styles.heroTitleMobile,
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
                  isMobile &&
                    styles.heroSubtitleMobile,
                ]}
              >
                Cambridge & Edexcel
                {"  •  "}
                O Level & AS
              </Text>

              <View
                style={[
                  styles.heroActions,
                  isMobile &&
                    styles.heroActionsMobile,
                ]}
              >
                <Pressable
                  onPress={
                    goToCourses
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.primaryCta,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.primaryCtaText
                    }
                  >
                    EXPLORE COURSES
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Text
                  style={
                    styles.heroStatement
                  }
                >
                  Learn. Understand.
                  Achieve.
                </Text>
              </View>
            </View>

            {/* CONTACT BUTTONS */}

            {!isMobile ? (
              <View
                style={
                  styles.contactRail
                }
              >
                <Pressable
                  onPress={openEmail}
                  style={({
                    pressed,
                  }) => [
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
                  onPress={
                    openWhatsApp
                  }
                  style={({
                    pressed,
                  }) => [
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
            ) : null}
          </View>

          {/* MOBILE CONTACTS */}

          {isMobile ? (
            <View
              style={
                styles.mobileContactRow
              }
            >
              <Pressable
                onPress={openEmail}
                style={
                  styles.mobileContactButton
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                onPress={
                  openWhatsApp
                }
                style={
                  styles.mobileContactButton
                }
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
}