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
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  backgroundImageCompactDesktop: {
    transform: [
      {
        scale: 1,
      },
    ],
  },

  backgroundImageTablet: {
    transform: [
      {
        scale: 1,
      },
    ],
  },

  backgroundImagePhone: {
    transform: [
      {
        scale: 1,
      },
    ],
  },

  backgroundImageLandscapePhone: {
    transform: [
      {
        scale: 1,
      },
    ],
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(0, 7, 11, 0.26)",
  },

  leftOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "56%",
    backgroundColor:
      "rgba(0, 5, 8, 0.43)",
  },

  leftOverlayCompactDesktop: {
    width: "61%",
  },

  leftOverlayTablet: {
    width: "80%",
    backgroundColor:
      "rgba(0, 5, 8, 0.54)",
  },

  leftOverlayPhone: {
    width: "100%",
    backgroundColor:
      "rgba(0, 7, 11, 0.70)",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center",
    paddingHorizontal: 60,
    paddingTop: 26,
    paddingBottom: 34,
  },

  pageCompactDesktop: {
    paddingHorizontal: 42,
  },

  pageTablet: {
    paddingHorizontal: 30,
    paddingTop: 22,
    paddingBottom: 28,
  },

  pagePhone: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  pageVerySmallPhone: {
    paddingHorizontal: 16,
  },

  pageLandscapePhone: {
    paddingTop: 12,
    paddingBottom: 16,
  },

  navbar: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },

  navbarTablet: {
    minHeight: 54,
  },

  navbarPhone: {
    minHeight: 42,
    width: "100%",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  brandContainerPhone: {
    flex: 1,
    minWidth: 0,
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  brandNameCompactDesktop: {
    fontSize: 19,
  },

  brandNameTablet: {
    fontSize: 18,
  },

  brandNamePhone: {
    fontSize: 18,
    lineHeight: 22,
  },

  brandNameVerySmallPhone: {
    fontSize: 16,
  },

  brandDivider: {
    width: 1,
    height: 27,
    marginHorizontal: 10,
    backgroundColor:
      "rgba(255,255,255,0.60)",
  },

  brandDividerTablet: {
    height: 23,
    marginHorizontal: 8,
  },

  brandSubject: {
    color:
      "rgba(255,255,255,0.90)",
    fontSize: 18,
    fontWeight: "300",
  },

  brandSubjectCompactDesktop: {
    fontSize: 16,
  },

  brandSubjectTablet: {
    fontSize: 15,
  },

  navigation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 38,
    paddingHorizontal: 20,
  },

  navigationCompactDesktop: {
    gap: 24,
    paddingHorizontal: 14,
  },

  navItem: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  navItemActive: {
    minHeight: 42,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    color:
      "rgba(255,255,255,0.88)",
    fontSize: 14,
    fontWeight: "500",
  },

  navTextPending: {
    opacity: 0.55,
  },

  navTextActive: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  navActiveLine: {
    position: "absolute",
    bottom: 0,
    width: 48,
    height: 3,
    borderRadius: 4,
    backgroundColor: "#09C9F3",
  },

  authActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flexShrink: 0,
  },

  registerButton: {
    minHeight: 41,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 5,
    backgroundColor: "#09C8EE",
  },

  registerButtonTablet: {
    paddingHorizontal: 15,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  loginButton: {
    minHeight: 41,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.35)",
    borderRadius: 5,
    backgroundColor:
      "rgba(0,0,0,0.28)",
  },

  loginButtonTablet: {
    paddingHorizontal: 14,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  mobileHeaderActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  mobileRegisterButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#09C8EE",
  },

  mobileRegisterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  mobileLoginButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.40)",
    borderRadius: 5,
    backgroundColor:
      "rgba(0,0,0,0.30)",
  },

  mobileLoginText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  compactNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
    paddingTop: 14,
  },

  compactNavPhone: {
    width: "100%",
    justifyContent: "space-between",
    gap: 0,
    paddingTop: 18,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },

  compactNavLandscapePhone: {
    paddingTop: 8,
  },

  compactNavText: {
    color:
      "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
  },

  compactNavActive: {
    color: "#09C9F3",
    fontSize: 13,
    fontWeight: "800",
  },

  hero: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 50,
  },

  heroCompactDesktop: {
    paddingTop: 42,
    paddingBottom: 42,
  },

  heroTablet: {
    justifyContent: "center",
    paddingTop: 54,
    paddingBottom: 42,
  },

  heroSmallTablet: {
    paddingTop: 48,
  },

  heroPhone: {
    flex: 0,
    justifyContent: "flex-start",
    paddingTop: 72,
    paddingBottom: 38,
  },

  heroVerySmallPhone: {
    paddingTop: 58,
    paddingBottom: 30,
  },

  heroShortScreen: {
    paddingTop: 36,
    paddingBottom: 24,
  },

  heroLandscapePhone: {
    paddingTop: 22,
    paddingBottom: 20,
  },

  heroCopy: {
    width: "49%",
    maxWidth: 680,
    zIndex: 4,
  },

  heroCopyCompactDesktop: {
    width: "52%",
    maxWidth: 610,
  },

  heroCopyTablet: {
    width: "72%",
    maxWidth: 580,
  },

  heroCopyPhone: {
    width: "100%",
    maxWidth: 390,
  },

  heroCopyLandscapePhone: {
    width: "60%",
    maxWidth: 470,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 82,
    lineHeight: 77,
    fontWeight: "900",
    letterSpacing: -3.8,

    ...(Platform.OS === "web"
      ? {
          textShadow:
            "0 5px 20px rgba(0,0,0,0.38)",
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

  heroTitleCompactDesktop: {
    fontSize: 70,
    lineHeight: 66,
    letterSpacing: -3,
  },

  heroTitleTablet: {
    fontSize: 58,
    lineHeight: 55,
    letterSpacing: -2.4,
  },

  heroTitlePhone: {
    fontSize: 46,
    lineHeight: 44,
    letterSpacing: -1.8,
  },

  heroTitleVerySmallPhone: {
    fontSize: 39,
    lineHeight: 38,
    letterSpacing: -1.4,
  },

  heroTitleLandscapePhone: {
    fontSize: 40,
    lineHeight: 38,
    letterSpacing: -1.6,
  },

  heroSubtitle: {
    marginTop: 20,
    color:
      "rgba(255,255,255,0.92)",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "400",
  },

  heroSubtitleTablet: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 23,
  },

  heroSubtitlePhone: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },

  heroSubtitleVerySmallPhone: {
    fontSize: 13,
  },

  heroSubtitleLandscapePhone: {
    marginTop: 10,
    fontSize: 13,
  },

  heroActions: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },

  heroActionsTablet: {
    marginTop: 24,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 15,
  },

  heroActionsPhone: {
    width: "100%",
    marginTop: 24,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
  },

  heroActionsLandscapePhone: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  primaryCta: {
    width: 310,
    minHeight: 56,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 2,
    backgroundColor: "#09C8EE",
  },

  primaryCtaCompactDesktop: {
    width: 285,
  },

  primaryCtaTablet: {
    width: 280,
  },

  primaryCtaPhone: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 54,
    paddingHorizontal: 20,
  },

  primaryCtaVerySmallPhone: {
    minHeight: 50,
  },

  primaryCtaLandscapePhone: {
    width: 235,
    minHeight: 48,
  },

  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.35,
  },

  primaryCtaTextPhone: {
    fontSize: 13,
  },

  primaryCtaTextVerySmallPhone: {
    fontSize: 12,
  },

  heroStatement: {
    color:
      "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "400",
  },

  heroStatementPhone: {
    width: "100%",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
  },

  heroStatementVerySmallPhone: {
    fontSize: 12,
  },

  contactRail: {
    position: "absolute",
    right: 4,
    top: "34%",
    gap: 26,
    alignItems: "center",
  },

  contactButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  mobileContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingTop: 2,
  },

  mobileContactRowPhone: {
    paddingTop: 0,
    paddingBottom: 8,
    marginTop: -100,
  },

  mobileContactRowLandscapePhone: {
    paddingTop: 0,
  },

  mobileContactButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.30)",
    backgroundColor:
      "rgba(0,0,0,0.34)",
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.78,
  },
});