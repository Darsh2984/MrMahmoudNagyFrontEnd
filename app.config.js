module.exports = {
  expo: {
    name: "Mahmoud Nagy Platform",
    slug: "mahmoud-nagy-platform",
    scheme: "mahmoudnagy",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    ios: { supportsTablet: true, bundleIdentifier: "com.mahmoudnagy.platform" },
    android: { package: "com.mahmoudnagy.platform" },
    web: { bundler: "metro", output: "single" },
    plugins: ["expo-router", "expo-font"],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:6000",
    },
  },
};
