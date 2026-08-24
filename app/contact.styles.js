import {
  StyleSheet,
} from "react-native";

export const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      minHeight: "100%",

      backgroundColor:
        "#041015",

      paddingHorizontal: 28,
      paddingVertical: 25,
    },

    topBar: {
      width: "100%",

      maxWidth: 1300,

      alignSelf: "center",
    },

    backButton: {
      alignSelf: "flex-start",

      flexDirection: "row",

      alignItems: "center",

      gap: 7,

      paddingVertical: 10,
    },

    backText: {
      color: "#FFFFFF",

      fontWeight: "700",
    },

    content: {
      flex: 1,

      width: "100%",

      maxWidth: 650,

      alignSelf: "center",

      alignItems: "center",

      justifyContent: "center",

      paddingVertical: 60,
    },

    whatsappIcon: {
      width: 82,
      height: 82,

      borderRadius: 41,

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 24,

      backgroundColor:
        "rgba(8,200,239,0.10)",

      borderWidth: 1,

      borderColor:
        "rgba(8,200,239,0.25)",
    },

    eyebrow: {
      color: "#08C8EF",

      fontSize: 12,

      fontWeight: "800",

      letterSpacing: 1.6,

      marginBottom: 10,
    },

    title: {
      color: "#FFFFFF",

      fontSize: 46,

      lineHeight: 54,

      fontWeight: "900",

      textAlign: "center",

      marginBottom: 18,
    },

    description: {
      color:
        "rgba(255,255,255,0.67)",

      fontSize: 17,

      lineHeight: 27,

      textAlign: "center",

      marginBottom: 32,
    },

    whatsappButton: {
      minHeight: 60,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 13,

      paddingHorizontal: 27,

      backgroundColor:
        "#08C8EF",
    },

    whatsappButtonText: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "800",

      letterSpacing: 0.35,
    },

    pressed: {
      opacity: 0.78,
    },
  });