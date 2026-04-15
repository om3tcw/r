export const HOLOPEEK_NAVBAR_LIST_SELECTOR =
  "#nav-collapsible .nav.navbar-nav";

export function shouldMountHoloPeekInNavbar(environmentUtils) {
  if (
    !environmentUtils ||
    typeof environmentUtils.shouldTreatAsMobileClient !== "function"
  ) {
    return false;
  }

  try {
    return Boolean(environmentUtils.shouldTreatAsMobileClient());
  } catch (error) {
    console.error("[HoloPeek] Failed to inspect mobile client state:", error);
    return false;
  }
}
