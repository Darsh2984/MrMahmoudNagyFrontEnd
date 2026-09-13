import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme";

export function Sidebar({
  items = [],
  footer,
  width = 250,
  title = "Mahmoud Nagy",
  subtitle = "Learning Platform",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef(null);

  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const canScroll = contentHeight > viewportHeight + 8;
  const canScrollUp = canScroll && scrollY > 8;
  const canScrollDown =
    canScroll &&
    scrollY + viewportHeight < contentHeight - 8;

  function isItemActive(route) {
    if (!route) return false;

    if (route === "/dashboard") {
      return pathname === route;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  }

  function navigate(item) {
    if (item.externalUrl) {
      Linking.openURL(item.externalUrl);
      return;
    }

    if (!item.route || isItemActive(item.route)) return;
    router.push(item.route);
  }

  function scrollUp() {
    scrollRef.current?.scrollTo({
      y: Math.max(scrollY - 220, 0),
      animated: true,
    });
  }

  function scrollDown() {
    scrollRef.current?.scrollTo({
      y: Math.min(scrollY + 220, contentHeight),
      animated: true,
    });
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Ionicons
            name="school-outline"
            size={25}
            color={colors.primary}
          />
        </View>

        <View style={styles.brandText}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            {title}
          </Text>

          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuHeader}>
        <Text style={styles.sectionLabel}>MENU</Text>

        {canScroll ? (
          <View style={styles.menuCount}>
            <Text style={styles.menuCountText}>
              {items.length} items
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.navigationContainer}>
        {canScrollUp ? (
          <Pressable
            onPress={scrollUp}
            style={({ pressed }) => [
              styles.scrollIndicator,
              styles.scrollIndicatorTop,
              pressed && styles.scrollIndicatorPressed,
            ]}
          >
            <Ionicons
              name="chevron-up"
              size={16}
              color={colors.cream}
            />
            <Text style={styles.scrollIndicatorText}>
              More items above
            </Text>
          </Pressable>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.navigation,
            canScrollUp && styles.navigationWithTopHint,
            canScrollDown && styles.navigationWithBottomHint,
          ]}
          showsVerticalScrollIndicator
          persistentScrollbar
          scrollEventThrottle={16}
          onLayout={(event) => {
            setViewportHeight(event.nativeEvent.layout.height);
          }}
          onContentSizeChange={(_, height) => {
            setContentHeight(height);
          }}
          onScroll={(event) => {
            setScrollY(event.nativeEvent.contentOffset.y);
          }}
        >
          {items.map((item) => {
            const active = isItemActive(item.route);

            const iconName = active
              ? item.activeIcon || item.icon || "ellipse"
              : item.icon || "ellipse-outline";

            return (
              <Pressable
                key={item.route || item.label}
                onPress={() => navigate(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityHint={
                  item.externalUrl
                    ? "Opens in your browser"
                    : undefined
                }
                style={({ pressed }) => [
                  styles.item,
                  active && styles.itemActive,
                  pressed && styles.itemPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    active && styles.iconContainerActive,
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={
                      active
                        ? colors.primary
                        : "rgba(245, 241, 235, 0.72)"
                    }
                  />
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.itemLabel,
                    active && styles.itemLabelActive,
                  ]}
                >
                  {item.label}
                </Text>

                {item.badge != null ? (
                  <View
                    style={[
                      styles.badge,
                      active && styles.badgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        active && styles.badgeTextActive,
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                ) : null}

                {item.externalUrl ? (
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(245, 241, 235, 0.58)"
                  />
                ) : null}

                {active ? (
                  <View style={styles.activeIndicator} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {canScrollDown ? (
          <Pressable
            onPress={scrollDown}
            style={({ pressed }) => [
              styles.scrollIndicator,
              styles.scrollIndicatorBottom,
              pressed && styles.scrollIndicatorPressed,
            ]}
          >
            <Text style={styles.scrollIndicatorText}>
              Scroll for more
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.cream}
            />
          </Pressable>
        ) : null}
      </View>

      {footer ? (
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.06)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },

  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },

  brandText: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  brandTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: colors.cream,
  },

  brandSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(245, 241, 235, 0.58)",
  },

  divider: {
    height: 1,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "rgba(245, 241, 235, 0.42)",
  },

  menuCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  menuCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(245,241,235,0.62)",
  },

  navigationContainer: {
    flex: 1,
    position: "relative",
    minHeight: 0,
  },

  scrollView: {
    flex: 1,
  },

  navigation: {
    paddingBottom: spacing.md,
    paddingRight: Platform.OS === "web" ? 4 : 0,
  },

  navigationWithTopHint: {
    paddingTop: 42,
  },

  navigationWithBottomHint: {
    paddingBottom: 54,
  },

  scrollIndicator: {
    position: "absolute",
    left: 5,
    right: 5,
    zIndex: 10,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "rgba(6, 38, 47, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",

    ...Platform.select({
      web: {
        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
        cursor: "pointer",
      },
      default: {
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  scrollIndicatorTop: {
    top: 0,
  },

  scrollIndicatorBottom: {
    bottom: 0,
  },

  scrollIndicatorPressed: {
    opacity: 0.78,
  },

  scrollIndicatorText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.cream,
  },

  item: {
    position: "relative",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: radius.md || 12,
    overflow: "hidden",
  },

  itemActive: {
    backgroundColor: colors.cream,
  },

  itemPressed: {
    opacity: 0.76,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  iconContainerActive: {
    backgroundColor: "rgba(11,60,73,0.10)",
  },

  itemLabel: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(245,241,235,0.78)",
  },

  itemLabelActive: {
    fontWeight: "800",
    color: colors.primary,
  },

  badge: {
    minWidth: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 99,
    backgroundColor: colors.warning,
  },

  badgeActive: {
    backgroundColor: "rgba(215,126,66,0.16)",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  badgeTextActive: {
    color: colors.warning,
  },

  activeIndicator: {
    position: "absolute",
    right: 0,
    width: 4,
    height: 24,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: colors.warning,
  },

  footer: {
    flexShrink: 0,
    paddingTop: spacing.sm,
    backgroundColor: colors.primary,
  },

  footerDivider: {
    height: 1,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

export default Sidebar;
