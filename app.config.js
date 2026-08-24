module.exports = {
  expo: {
    name: "Mahmoud Nagy Physics",
    slug: "mahmoud-nagy-physics",

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
    },

    web: {
      bundler: "metro",
      output: "static",
    },

    plugins: [
      "expo-router",
      "expo-font",
    ],

    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        "http://localhost:6000",
    },
  },
};