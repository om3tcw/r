const MOBILE_USER_AGENT_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
const MOBILE_VIEWPORT_MEDIA_QUERIES = [
  "(pointer: coarse)",
  "(hover: none)",
  "(max-width: 900px)",
];

export function isUserAgentMobile() {
  try {
    if (
      navigator.userAgentData &&
      typeof navigator.userAgentData.mobile === "boolean"
    ) {
      return navigator.userAgentData.mobile;
    }

    return MOBILE_USER_AGENT_REGEX.test(String(navigator.userAgent || ""));
  } catch (error) {
    console.error(
      "[clientEnvironmentUtils] Failed to inspect user agent:",
      error,
    );
    return false;
  }
}

export function isMobileLikeViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return MOBILE_VIEWPORT_MEDIA_QUERIES.some((mediaQuery) => {
    try {
      return window.matchMedia(mediaQuery).matches;
    } catch (error) {
      console.error(
        `[clientEnvironmentUtils] Failed to evaluate media query "${mediaQuery}":`,
        error,
      );
      return false;
    }
  });
}

export function shouldTreatAsMobileClient() {
  return isUserAgentMobile() || isMobileLikeViewport();
}

if (typeof window !== "undefined") {
  window.CLIENT_ENVIRONMENT_UTILS = {
    isMobileLikeViewport,
    isUserAgentMobile,
    shouldTreatAsMobileClient,
  };
}
