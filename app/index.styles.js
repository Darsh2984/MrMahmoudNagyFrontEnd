import {
  Platform,
  StyleSheet,
} from "react-native";

export const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "#02070A",
    },

    centeredScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#02070A",
    },

    background: {
      flex: 1,
      width: "100%",
      backgroundColor: "#02070A",
    },

    backgroundImage: {
      /*
       * Actual scaling is controlled by
       * resizeMode in index.js.
       */
    },

    darkOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(0, 7, 11, 0.18)",
    },

    leftOverlay: {
      position: "absolute",

      top: 0,
      bottom: 0,
      left: 0,

      width: "57%",

      backgroundColor:
        "rgba(0, 5, 8, 0.34)",
    },

    page: {
      flex: 1,

      width: "100%",
      maxWidth: 1600,

      alignSelf: "center",

      paddingHorizontal: 60,
      paddingTop: 30,
      paddingBottom: 42,
    },

    pageMobile: {
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 24,
    },

    /* NAV */

    navbar: {
      width: "100%",
      minHeight: 62,

      flexDirection: "row",
      alignItems: "center",

      zIndex: 10,
    },

    navbarMobile: {
      minHeight: 54,
    },

    brandContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    brandName: {
      color: "#FFFFFF",

      fontSize: 22,
      lineHeight: 27,

      fontWeight: "900",

      letterSpacing: 0.25,
    },

    brandDivider: {
      width: 1,
      height: 29,

      marginHorizontal: 12,

      backgroundColor:
        "rgba(255,255,255,0.72)",
    },

    brandSubject: {
      color:
        "rgba(255,255,255,0.90)",

      fontSize: 20,
      fontWeight: "300",

      letterSpacing: 0.4,
    },

    navigation: {
      flex: 1,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 44,

      paddingHorizontal: 30,
    },

    navItem: {
      minHeight: 44,

      alignItems: "center",
      justifyContent: "center",
    },

    navItemActive: {
      minHeight: 44,

      position: "relative",

      alignItems: "center",
      justifyContent: "center",
    },

    navText: {
      color:
        "rgba(255,255,255,0.88)",

      fontSize: 16,
      fontWeight: "500",
    },

    navTextPending: {
      opacity: 0.68,
    },

    navTextActive: {
      color: "#FFFFFF",

      fontSize: 16,
      fontWeight: "800",
    },

    navActiveLine: {
      position: "absolute",
      bottom: 0,

      width: 54,
      height: 3,

      borderRadius: 4,

      backgroundColor:
        "#09C9F3",
    },

    loginButton: {
      height: 42,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 7,

      paddingHorizontal: 18,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.35)",

      borderRadius: 4,

      backgroundColor:
        "rgba(0,0,0,0.25)",
    },

    loginButtonText: {
      color: "#FFFFFF",

      fontSize: 14,
      fontWeight: "700",
    },

    /* HERO */

    hero: {
      flex: 1,

      minHeight: 640,

      justifyContent: "center",

      position: "relative",

      paddingTop: 40,
    },

    heroTablet: {
      minHeight: 600,
    },

    heroMobile: {
      minHeight: 620,

      justifyContent: "flex-end",

      paddingTop: 160,
      paddingBottom: 30,
    },

    heroCopy: {
      width: "47%",

      maxWidth: 670,
      minWidth: 520,

      zIndex: 4,
    },

    heroCopyMobile: {
      width: "100%",

      minWidth: 0,
      maxWidth: 460,
    },

    heroTitle: {
      color: "#FFFFFF",

      fontSize: 88,
      lineHeight: 82,

      fontWeight: "900",

      letterSpacing: -4.3,

      textTransform:
        "uppercase",

      ...(Platform.OS === "web"
        ? {
            textShadow:
              "0px 5px 20px rgba(0,0,0,0.38)",
          }
        : {
            textShadowColor:
              "rgba(0,0,0,0.38)",

            textShadowOffset: {
              width: 0,
              height: 4,
            },

            textShadowRadius: 10,
          }),
    },

    heroTitleTablet: {
      fontSize: 70,
      lineHeight: 67,

      letterSpacing: -3.3,
    },

    heroTitleMobile: {
      fontSize: 47,
      lineHeight: 45,

      letterSpacing: -2.1,
    },

    heroSubtitle: {
      marginTop: 20,

      color:
        "rgba(255,255,255,0.92)",

      fontSize: 20,
      lineHeight: 26,

      fontWeight: "400",
    },

    heroSubtitleMobile: {
      fontSize: 15,
      lineHeight: 21,

      marginTop: 14,
    },

    heroActions: {
      marginTop: 30,

      flexDirection: "row",
      alignItems: "center",

      gap: 28,
    },

    heroActionsMobile: {
      flexDirection: "column",

      alignItems: "flex-start",

      gap: 15,

      marginTop: 22,
    },

    primaryCta: {
      minWidth: 330,
      minHeight: 60,

      paddingHorizontal: 27,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#09C8EE",

      ...(Platform.OS === "web"
        ? {
            boxShadow:
              "0px 8px 24px rgba(0, 200, 240, 0.20)",
          }
        : {
            elevation: 5,

            shadowColor:
              "#00C8F0",

            shadowOpacity: 0.25,

            shadowRadius: 12,
          }),
    },

    primaryCtaText: {
      color: "#FFFFFF",

      fontSize: 17,
      fontWeight: "600",

      letterSpacing: 0.4,
    },

    heroStatement: {
      color:
        "rgba(255,255,255,0.90)",

      fontSize: 17,
      fontWeight: "400",
    },

    /* CONTACT RAIL */

    contactRail: {
      position: "absolute",

      right: 4,
      top: "34%",

      gap: 35,

      alignItems: "center",
    },

    contactButton: {
      width: 52,
      height: 52,

      borderRadius: 26,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#FFFFFF",

      ...(Platform.OS === "web"
        ? {
            boxShadow:
              "0 8px 22px rgba(0,0,0,0.25)",
          }
        : {
            elevation: 6,

            shadowColor: "#000",

            shadowOpacity: 0.2,

            shadowRadius: 8,
          }),
    },

    /* MOBILE CONTACTS */

    mobileContactRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: 12,

      paddingTop: 6,
    },

    mobileContactButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.35)",

      backgroundColor:
        "rgba(0,0,0,0.28)",

      alignItems: "center",
      justifyContent: "center",
    },

    pressed: {
      opacity: 0.78,
    },
  });