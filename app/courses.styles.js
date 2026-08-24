import {
  StyleSheet,
} from "react-native";

export const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        "#041015",
    },

    content: {
      width: "100%",

      maxWidth: 1500,

      alignSelf: "center",

      paddingHorizontal: 48,
      paddingVertical: 28,
      paddingBottom: 70,
    },

    navbar: {
      minHeight: 58,

      flexDirection: "row",

      alignItems: "center",

      marginBottom: 70,
    },

    navbarCompact: {
      marginBottom: 48,
    },

    brandContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    brandName: {
      color: "#FFFFFF",

      fontSize: 20,

      fontWeight: "900",
    },

    brandDivider: {
      width: 1,
      height: 28,

      marginHorizontal: 10,

      backgroundColor:
        "rgba(255,255,255,0.60)",
    },

    brandSubject: {
      color:
        "rgba(255,255,255,0.82)",

      fontSize: 18,
    },

    navigation: {
      flex: 1,

      flexDirection: "row",

      justifyContent: "center",

      alignItems: "center",

      gap: 42,
    },

    navText: {
      color:
        "rgba(255,255,255,0.80)",

      fontSize: 15,
    },

    navTextPending: {
      color:
        "rgba(255,255,255,0.45)",

      fontSize: 15,
    },

    activeNav: {
      minHeight: 40,

      justifyContent: "center",

      position: "relative",
    },

    navTextActive: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "800",
    },

    activeLine: {
      position: "absolute",

      bottom: 0,

      width: "100%",
      height: 3,

      backgroundColor:
        "#08C8EF",
    },

    loginButton: {
      paddingVertical: 10,
      paddingHorizontal: 18,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.30)",

      borderRadius: 4,
    },

    loginText: {
      color: "#FFFFFF",

      fontWeight: "700",
    },

    hero: {
      maxWidth: 720,

      marginBottom: 42,
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

    titleCompact: {
      fontSize: 42,
      lineHeight: 48,
    },

    subtitle: {
      color:
        "rgba(255,255,255,0.68)",

      fontSize: 18,

      lineHeight: 28,
    },

    courseGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 18,
    },

    courseGridCompact: {
      flexDirection: "column",
    },

    courseCard: {
      flexGrow: 1,

      flexBasis: 360,

      minWidth: 280,

      padding: 25,

      borderWidth: 1,

      borderColor:
        "rgba(0,200,240,0.18)",

      borderRadius: 8,

      backgroundColor:
        "rgba(7,27,35,0.90)",
    },

    courseNumber: {
      marginBottom: 20,
    },

    courseNumberText: {
      color:
        "rgba(255,255,255,0.22)",

      fontSize: 13,

      fontWeight: "800",
    },

    courseIcon: {
      width: 51,
      height: 51,

      borderRadius: 26,

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 20,

      backgroundColor:
        "rgba(8,200,239,0.10)",
    },

    courseTitle: {
      color: "#FFFFFF",

      fontSize: 21,

      lineHeight: 27,

      fontWeight: "800",

      marginBottom: 12,
    },

    courseDescription: {
      flex: 1,

      color:
        "rgba(255,255,255,0.62)",

      fontSize: 14,

      lineHeight: 22,
    },

    courseFooter: {
      marginTop: 26,

      paddingTop: 15,

      borderTopWidth: 1,

      borderTopColor:
        "rgba(255,255,255,0.08)",

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    courseTeacher: {
      color:
        "rgba(255,255,255,0.85)",

      fontSize: 12,

      fontWeight: "700",
    },

    courseSubject: {
      color: "#08C8EF",

      fontSize: 12,

      fontWeight: "700",
    },
  });