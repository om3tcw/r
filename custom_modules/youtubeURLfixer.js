// If youtube ever decides to force /live/ links for live streams load this in main.js

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

const YOUTUBE_LIVE_PATH_REGEX = /^\/live\/([^/?#]+)/i;
const PLAYLIST_URL_INPUT_SELECTOR = "#mediaurl";
const PLAYLIST_QUEUE_BUTTON_SELECTOR = "#queue_end, #queue_next";

function normalizeYoutubeLiveUrl(rawValue) {
  if (typeof rawValue !== "string") {
    return rawValue;
  }

  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return rawValue;
  }

  let candidateValue = trimmedValue;
  if (/^(?:www\.|m\.)?youtube\.com\/live\//i.test(candidateValue)) {
    candidateValue = `https://${candidateValue}`;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(candidateValue);
  } catch {
    return rawValue;
  }

  if (!YOUTUBE_HOSTS.has(parsedUrl.hostname.toLowerCase())) {
    return rawValue;
  }

  const livePathMatch = parsedUrl.pathname.match(YOUTUBE_LIVE_PATH_REGEX);
  if (!livePathMatch) {
    return rawValue;
  }

  const videoId = livePathMatch[1];
  const remainingParams = new URLSearchParams(parsedUrl.search);
  remainingParams.delete("v");

  const normalizedParams = new URLSearchParams([["v", videoId]]);
  for (const [key, value] of remainingParams) {
    normalizedParams.append(key, value);
  }

  parsedUrl.hostname = "www.youtube.com";
  parsedUrl.pathname = "/watch";
  parsedUrl.search = `?${normalizedParams.toString()}`;

  return parsedUrl.toString();
}

function normalizePlaylistUrlInput() {
  const mediaUrlInput = document.querySelector(PLAYLIST_URL_INPUT_SELECTOR);
  if (!mediaUrlInput) {
    return;
  }

  const normalizedValue = normalizeYoutubeLiveUrl(mediaUrlInput.value);
  if (normalizedValue !== mediaUrlInput.value) {
    mediaUrlInput.value = normalizedValue;
  }
}

document.addEventListener(
  "click",
  (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const queueButton = event.target.closest(PLAYLIST_QUEUE_BUTTON_SELECTOR);
    if (queueButton) {
      normalizePlaylistUrlInput();
    }
  },
  true,
);

document.addEventListener(
  "keydown",
  (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (event.key === "Enter" && event.target.matches(PLAYLIST_URL_INPUT_SELECTOR)) {
      normalizePlaylistUrlInput();
    }
  },
  true,
);

document.addEventListener(
  "change",
  (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (event.target.matches(PLAYLIST_URL_INPUT_SELECTOR)) {
      normalizePlaylistUrlInput();
    }
  },
  true,
);

export { normalizeYoutubeLiveUrl };
