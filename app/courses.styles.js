import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#041015",
  },

  content: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    paddingHorizontal: 48,
    paddingTop: 28,
    paddingBottom: 70,
  },

  contentTablet: {
    paddingHorizontal: 30,
  },

  contentPhone: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 45,
  },

  navbar: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  navbarPhone: {
    minHeight: 44,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  brandNamePhone: {
    fontSize: 16,
  },

  brandDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.60)",
  },

  brandSubject: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 18,
  },

  navigation: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },

  navText: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 15,
  },

  navTextActive: {
    color: "#08C8EF",
    fontSize: 15,
    fontWeight: "800",
  },

  navTextPending: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 15,
  },

  loginButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    borderRadius: 4,
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  compactNav: {
    flexDirection: "row",
    gap: 24,
    marginTop: 18,
  },

  compactNavText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    fontWeight: "600",
  },

  compactNavActive: {
    color: "#08C8EF",
    fontSize: 14,
    fontWeight: "800",
  },

  hero: {
    maxWidth: 720,
    marginTop: 70,
    marginBottom: 42,
  },

  heroPhone: {
    marginTop: 48,
    marginBottom: 30,
  },

  eyebrow: {
    color: "#08C8EF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 58,
    lineHeight: 64,
    fontWeight: "900",
    marginBottom: 12,
  },

  titleTablet: {
    fontSize: 50,
    lineHeight: 56,
  },

  titlePhone: {
    fontSize: 38,
    lineHeight: 44,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 18,
    lineHeight: 28,
  },

  subtitlePhone: {
    fontSize: 15,
    lineHeight: 23,
  },

  courseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },

  courseGridTablet: {
    gap: 16,
  },

  courseGridPhone: {
    flexDirection: "column",
    gap: 13,
  },

  courseCard: {
    flexGrow: 1,
    flexBasis: 350,
    maxWidth: "49%",
    minHeight: 260,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(0,200,240,0.18)",
    borderRadius: 8,
    backgroundColor: "rgba(7,27,35,0.90)",
  },

  courseCardTablet: {
    flexBasis: 280,
    maxWidth: "48%",
  },

  courseCardPhone: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 0,
    padding: 20,
  },

  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,200,239,0.10)",
  },

  courseNumber: {
    color: "rgba(255,255,255,0.22)",
    fontSize: 13,
    fontWeight: "800",
  },

  courseTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    marginBottom: 11,
  },

  courseTitlePhone: {
    fontSize: 19,
    lineHeight: 25,
  },

  courseDescription: {
    flex: 1,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 22,
  },

  courseFooter: {
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  courseTeacher: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },

  courseSubject: {
    color: "#08C8EF",
    fontSize: 12,
    fontWeight: "700",
  },
});