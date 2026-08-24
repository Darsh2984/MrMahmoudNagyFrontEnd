import {
  Platform,
  StyleSheet,
} from "react-native";

export const styles = StyleSheet.create({
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
    transform: [{ scale: 0.94 }],
  },

  backgroundImageTablet: {
    transform: [{ scale: 1 }],
  },

  backgroundImagePhone: {
    transform: [{ scale: 1.07 }],
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 7, 11, 0.25)",
  },

  leftOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "58%",
    backgroundColor: "rgba(0, 5, 8, 0.40)",
  },

  leftOverlayTablet: {
    width: "72%",
    backgroundColor: "rgba(0, 5, 8, 0.48)",
  },

  leftOverlayPhone: {
    width: "100%",
    backgroundColor: "rgba(0, 5, 8, 0.51)",
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center",
    paddingHorizontal: 60,
    paddingTop: 28,
    paddingBottom: 36,
  },

  pageTablet: {
    paddingHorizontal: 34,
    paddingTop: 24,
    paddingBottom: 28,
  },

  pagePhone: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
  },

  navbar: {
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },

  navbarTablet: {
    minHeight: 56,
  },

  navbarPhone: {
    minHeight: 46,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandContainerPhone: {
    flex: 1,
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  brandNameTablet: {
    fontSize: 19,
  },

  brandNamePhone: {
    fontSize: 16,
  },

  brandDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 11,
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  brandSubject: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 19,
    fontWeight: "300",
  },

  brandSubjectTablet: {
    fontSize: 16,
  },

  navigation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 42,
    paddingHorizontal: 24,
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
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontWeight: "500",
  },

  navTextPending: {
    opacity: 0.55,
  },

  navTextActive: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  navActiveLine: {
    position: "absolute",
    bottom: 0,
    width: 52,
    height: 3,
    borderRadius: 4,
    backgroundColor: "#09C9F3",
  },

  loginButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  loginButtonPhone: {
    minHeight: 38,
    paddingHorizontal: 14,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  loginButtonTextPhone: {
    fontSize: 13,
  },

  compactNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
    paddingTop: 16,
  },

  compactNavPhone: {
    gap: 22,
    paddingTop: 13,
  },

  compactNavText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 14,
    fontWeight: "600",
  },

  compactNavActive: {
    color: "#09C9F3",
    fontSize: 14,
    fontWeight: "800",
  },

  hero: {
    flex: 1,
    minHeight: 620,
    justifyContent: "center",
    position: "relative",
    paddingTop: 36,
  },

  heroSmallTablet: {
    minHeight: 590,
  },

  heroPhone: {
    minHeight: 560,
    justifyContent: "flex-end",
    paddingTop: 130,
    paddingBottom: 24,
  },

  heroCopy: {
    width: "48%",
    maxWidth: 680,
    zIndex: 4,
  },

  heroCopyTablet: {
    width: "66%",
    maxWidth: 570,
  },

  heroCopyPhone: {
    width: "100%",
    maxWidth: 430,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 86,
    lineHeight: 80,
    fontWeight: "900",
    letterSpacing: -4.1,

    ...(Platform.OS === "web"
      ? {
          textShadow:
            "0 5px 20px rgba(0,0,0,0.38)",
        }
      : {
          textShadowColor: "rgba(0,0,0,0.38)",
          textShadowOffset: {
            width: 0,
            height: 4,
          },
          textShadowRadius: 10,
        }),
  },

  heroTitleTablet: {
    fontSize: 64,
    lineHeight: 61,
    letterSpacing: -2.8,
  },

  heroTitlePhone: {
    fontSize: 41,
    lineHeight: 40,
    letterSpacing: -1.7,
  },

  heroSubtitle: {
    marginTop: 20,
    color: "rgba(255,255,255,0.92)",
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "400",
  },

  heroSubtitleTablet: {
    fontSize: 17,
  },

  heroSubtitlePhone: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },

  heroActions: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  heroActionsTablet: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },

  heroActionsPhone: {
    width: "100%",
    marginTop: 22,
    gap: 13,
  },

  primaryCta: {
    width: 320,
    minHeight: 58,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#09C8EE",
  },

  primaryCtaTablet: {
    width: 290,
  },

  primaryCtaPhone: {
    width: "100%",
    maxWidth: 360,
    minHeight: 54,
    paddingHorizontal: 20,
  },

  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.35,
  },

  primaryCtaTextPhone: {
    fontSize: 14,
  },

  heroStatement: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 16,
    fontWeight: "400",
  },

  heroStatementPhone: {
    fontSize: 14,
  },

  contactRail: {
    position: "absolute",
    right: 4,
    top: "34%",
    gap: 30,
    alignItems: "center",
  },

  contactButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  mobileContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
  },

  mobileContactRowPhone: {
    paddingTop: 0,
  },

  mobileContactButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(0,0,0,0.34)",
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.78,
  },
});