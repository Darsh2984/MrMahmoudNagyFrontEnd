module.exports = {
  expo: {
    name: "Mahmoud Nagy Physics",
    slug: "mahmoud-nagy-physics",

    icon: "./assets/icon.png",


    version: "2.0.0",

    orientation: "default",
    userInterfaceStyle: "automatic",

    scheme: "laytheg",

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mahmoudnagy.platform",
    },

    android: {
      package: "com.mahmoudnagy.platform",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },

    web: {
      bundler: "metro",
      output: "static",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-asset",
      "@react-native-community/datetimepicker",
      "expo-secure-store",  
      "expo-sharing",
      "expo-status-bar",
      "expo-audio",
      "expo-video",
    ],

    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:6000",
      "eas": {
        "projectId": "90eb2cf0-5907-4cce-b605-d08d4a9515c1"
      }
    },
  },
};