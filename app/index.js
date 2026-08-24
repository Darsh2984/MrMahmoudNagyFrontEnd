import React from "react";

import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
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

  const {
    width,
    height,
  } = useWindowDimensions();

  const {
    user,
    loading,
  } = useAuth();

  const isPortrait =
    height > width;

  const isPhone =
    width < 700 ||
    (
      isPortrait &&
      width < 950
    );

  const isVerySmallPhone =
    width < 390;

  const isTablet =
    !isPhone &&
    (
      width < 1180 ||
      (
        isPortrait &&
        width < 1300
      )
    );

  const isSmallTablet =
    isTablet &&
    width < 900;

  const isCompactDesktop =
    !isPhone &&
    !isTablet &&
    width < 1400;

  const isLandscapePhone =
    width < 950 &&
    height < 600;

  const isShortScreen =
    height < 720;

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

    let destination =
      "/(app)/dashboard";

    if (user.role === "STUDENT") {
      destination =
        "/(app)/my-dashboard";
    } else if (isRegularAssistant) {
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
    router.push("/(auth)/login");
  }

  function goToRegister() {
    router.push("/register");
  }

  async function openWhatsApp() {
    try {
      await Linking.openURL(
        WHATSAPP_URL
      );
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

          isCompactDesktop &&
            styles.backgroundImageCompactDesktop,

          isTablet &&
            styles.backgroundImageTablet,

          isPhone &&
            styles.backgroundImagePhone,

          isLandscapePhone &&
            styles.backgroundImageLandscapePhone,
        ]}
      >
        <View
          style={styles.darkOverlay}
        />

        <View
          style={[
            styles.leftOverlay,

            isCompactDesktop &&
              styles.leftOverlayCompactDesktop,

            isTablet &&
              styles.leftOverlayTablet,

            isPhone &&
              styles.leftOverlayPhone,
          ]}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.page,

              isCompactDesktop &&
                styles.pageCompactDesktop,

              isTablet &&
                styles.pageTablet,

              isPhone &&
                styles.pagePhone,

              isVerySmallPhone &&
                styles.pageVerySmallPhone,

              isLandscapePhone &&
                styles.pageLandscapePhone,
            ]}
          >
            {/* HEADER */}

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
                  numberOfLines={1}
                  style={[
                    styles.brandName,

                    isCompactDesktop &&
                      styles.brandNameCompactDesktop,

                    isTablet &&
                      styles.brandNameTablet,

                    isPhone &&
                      styles.brandNamePhone,

                    isVerySmallPhone &&
                      styles.brandNameVerySmallPhone,
                  ]}
                >
                  MAHMOUD NAGY
                </Text>

                {!isPhone && (
                  <>
                    <View
                      style={[
                        styles.brandDivider,

                        isTablet &&
                          styles.brandDividerTablet,
                      ]}
                    />

                    <Text
                      style={[
                        styles.brandSubject,

                        isCompactDesktop &&
                          styles.brandSubjectCompactDesktop,

                        isTablet &&
                          styles.brandSubjectTablet,
                      ]}
                    >
                      PHYSICS
                    </Text>
                  </>
                )}
              </Pressable>

              {!isTablet &&
                !isPhone && (
                  <View
                    style={[
                      styles.navigation,

                      isCompactDesktop &&
                        styles.navigationCompactDesktop,
                    ]}
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
                      onPress={goToCourses}
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
                      onPress={goToContact}
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
                )}

              {!isPhone && (
                <View
                  style={
                    styles.authActions
                  }
                >
                  <Pressable
                    onPress={
                      goToRegister
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.registerButton,

                      isTablet &&
                        styles.registerButtonTablet,

                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.registerButtonText
                      }
                    >
                      Register
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={goToLogin}
                    style={({
                      pressed,
                    }) => [
                      styles.loginButton,

                      isTablet &&
                        styles.loginButtonTablet,

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
              )}
            </View>

            {/* MOBILE AUTH */}

            {isPhone && (
              <View
                style={
                  styles.mobileHeaderActions
                }
              >
                <Pressable
                  onPress={
                    goToRegister
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.mobileRegisterButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.mobileRegisterText
                    }
                  >
                    Register
                  </Text>
                </Pressable>

                <Pressable
                  onPress={goToLogin}
                  style={({
                    pressed,
                  }) => [
                    styles.mobileLoginButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.mobileLoginText
                    }
                  >
                    Login
                  </Text>
                </Pressable>
              </View>
            )}

            {/* COMPACT NAV */}

            {(isTablet ||
              isPhone) && (
              <View
                style={[
                  styles.compactNav,

                  isPhone &&
                    styles.compactNavPhone,

                  isLandscapePhone &&
                    styles.compactNavLandscapePhone,
                ]}
              >
                <Pressable
                  onPress={goHome}
                >
                  <Text
                    style={
                      styles.compactNavActive
                    }
                  >
                    Home
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    goToCourses
                  }
                >
                  <Text
                    style={
                      styles.compactNavText
                    }
                  >
                    Courses
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    goToContact
                  }
                >
                  <Text
                    style={
                      styles.compactNavText
                    }
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

                isCompactDesktop &&
                  styles.heroCompactDesktop,

                isTablet &&
                  styles.heroTablet,

                isSmallTablet &&
                  styles.heroSmallTablet,

                isPhone &&
                  styles.heroPhone,

                isVerySmallPhone &&
                  styles.heroVerySmallPhone,

                isShortScreen &&
                  styles.heroShortScreen,

                isLandscapePhone &&
                  styles.heroLandscapePhone,
              ]}
            >
              <View
                style={[
                  styles.heroCopy,

                  isCompactDesktop &&
                    styles.heroCopyCompactDesktop,

                  isTablet &&
                    styles.heroCopyTablet,

                  isPhone &&
                    styles.heroCopyPhone,

                  isLandscapePhone &&
                    styles.heroCopyLandscapePhone,
                ]}
              >
                <Text
                  style={[
                    styles.heroTitle,

                    isCompactDesktop &&
                      styles.heroTitleCompactDesktop,

                    isTablet &&
                      styles.heroTitleTablet,

                    isPhone &&
                      styles.heroTitlePhone,

                    isVerySmallPhone &&
                      styles.heroTitleVerySmallPhone,

                    isLandscapePhone &&
                      styles.heroTitleLandscapePhone,
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

                    isVerySmallPhone &&
                      styles.heroSubtitleVerySmallPhone,

                    isLandscapePhone &&
                      styles.heroSubtitleLandscapePhone,
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

                    isLandscapePhone &&
                      styles.heroActionsLandscapePhone,
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

                      isCompactDesktop &&
                        styles.primaryCtaCompactDesktop,

                      isTablet &&
                        styles.primaryCtaTablet,

                      isPhone &&
                        styles.primaryCtaPhone,

                      isVerySmallPhone &&
                        styles.primaryCtaVerySmallPhone,

                      isLandscapePhone &&
                        styles.primaryCtaLandscapePhone,

                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.primaryCtaText,

                        isPhone &&
                          styles.primaryCtaTextPhone,

                        isVerySmallPhone &&
                          styles.primaryCtaTextVerySmallPhone,
                      ]}
                    >
                      EXPLORE COURSES
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={
                        isPhone
                          ? 19
                          : 22
                      }
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <Text
                    style={[
                      styles.heroStatement,

                      isPhone &&
                        styles.heroStatementPhone,

                      isVerySmallPhone &&
                        styles.heroStatementVerySmallPhone,
                    ]}
                  >
                    Learn. Understand. Achieve.
                  </Text>
                </View>
              </View>

              {!isTablet &&
                !isPhone && (
                  <View
                    style={
                      styles.contactRail
                    }
                  >
                    <Pressable
                      onPress={
                        openEmail
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
                )}
            </View>

            {/* MOBILE/TABLET CONTACT */}

            {(isTablet ||
              isPhone) && (
              <View
                style={[
                  styles.mobileContactRow,

                  isPhone &&
                    styles.mobileContactRowPhone,

                  isLandscapePhone &&
                    styles.mobileContactRowLandscapePhone,
                ]}
              >
                <Pressable
                  onPress={openEmail}
                  style={({
                    pressed,
                  }) => [
                    styles.mobileContactButton,

                    pressed &&
                      styles.pressed,
                  ]}
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
                  style={({
                    pressed,
                  }) => [
                    styles.mobileContactButton,

                    pressed &&
                      styles.pressed,
                  ]}
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
        </ScrollView>
      </ImageBackground>
    </View>
  );
}