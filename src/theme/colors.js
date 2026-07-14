// Brand colors — locked in as Mr. Nagy's established identity, carried over
// from the old system exactly, but defined ONCE here instead of being
// hand-copied into 40+ separate CSS files like the old frontend did.

export const colors = {
  teal: "#0B3C49", // primary brand color — headers, nav, primary buttons
  green: "#8BAA91", // secondary/accent — borders, hover states, success
  cream: "#F5F1EB", // page background
  red: "#C85D47", // danger/destructive actions
  orange: "#D77E42", // warning/attention
  charcoal: "#33312E", // body text

  white: "#FFFFFF",
  border: "#E4E0D8", // neutral hairline border derived from cream, for cards/dividers
  textMuted: "#6B6862", // secondary/muted text derived from charcoal

  // Semantic aliases — components should reference THESE, not raw color names,
  // so if a semantic meaning ever needs to shift color independently of the
  // brand palette, it's a one-line change here rather than a hunt through screens.
  primary: "#0B3C49", // teal
  secondary: "#8BAA91", // green
  danger: "#C85D47", // red
  warning: "#D77E42", // orange
  background: "#F5F1EB", // cream
  surface: "#FFFFFF",
  textPrimary: "#33312E", // charcoal
};

export default colors;
