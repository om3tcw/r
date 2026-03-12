const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const UOH_ACTIVE_ROW_CLASS = "uohmode-active";
const UOH_TRIGGER_LOOKUP_KEYS = ["uoh", "pebblesob", "pikacryreal"];
// Trusted live control commands: /uoh on | /uoh off | ./uoh on | ./uoh off
const UOH_COMMAND_ALLOWED_USERS = [];
const UOH_COMMAND_MIN_RANK =
  typeof Rank !== "undefined" && Rank && Rank.Moderator != null
    ? Rank.Moderator
    : 2;

const UOH_MODE_REPLACEMENTS = [];

const UOH_USER_WORD_REPLACEMENTS = [...UOH_MODE_REPLACEMENTS];

const UOH_USERNAME_PREFIX_IMAGE_URL = "https://cracklej.win/djtyT473HU.png";
const UOH_OSHI_EYES_IMAGE_URL = "https://cracklej.win/aje2Uww34L.png";
const UOH_USERNAME_PREFIX_IMAGE_WIDTH_PX = 20;
const UOH_USERNAME_PREFIX_IMAGE_HEIGHT_PX = 20;
const UOH_OSHI_EYES_IMAGE_WIDTH_PX = 50;
const UOH_TIMESTAMP_IMAGE_HEIGHT_PX = 15;
const UOH_USERNAME_PREFIX_IMAGE_MARGIN_RIGHT_PX = 4;
const ChatModuleUtils = window.CHAT_MODULE_UTILS;

if (!ChatModuleUtils) {
  throw new Error("[UohMode] CHAT_MODULE_UTILS is not available");
}

const {
  escapeRegExp,
  getEmoteNodesFromRoot,
  getMessageAuthor,
  getMessageContentRootElement,
  getMessageRow,
  isAuthorAllowed,
  isServerMessageRow,
  normalizeUsername,
  postStatusSystemMessage,
  setMessageRowsClassByUsername,
} = ChatModuleUtils;

const UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED = (
  Array.isArray(UOH_TRIGGER_LOOKUP_KEYS)
    ? UOH_TRIGGER_LOOKUP_KEYS
    : [UOH_TRIGGER_LOOKUP_KEYS]
)
  .map((lookupKey) =>
    String(lookupKey || "")
      .trim()
      .toLowerCase(),
  )
  .filter(Boolean)
  .filter((lookupKey, index, values) => values.indexOf(lookupKey) === index);
const UOH_TRIGGER_LOOKUP_KEYS_COMPACT = UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED.map(
  (lookupKey) => lookupKey.replace(/[^a-z0-9]/g, ""),
).filter(Boolean);
const UOH_COMMAND_ALLOWED_USER_SET = new Set(
  UOH_COMMAND_ALLOWED_USERS.map(normalizeUsername).filter(Boolean),
);
const UOH_EMOTE_ORIGINAL_SRC_DATA_KEY = "uohOriginalSrc";
const UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY = "uohOriginalSrcPresent";
const UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY = "uohOriginalTitle";
const UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY = "uohOriginalTitlePresent";
const UOH_EMOTE_ORIGINAL_ALT_DATA_KEY = "uohOriginalAlt";
const UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY = "uohOriginalAltPresent";

const activatedUohUsersByKey = new Map();
const modifiedUohTextNodes = new Set();
const originalUohTextByNode = new WeakMap();
const modifiedUohEmoteElements = new Set();
let isUohModeEnabled = false;
let isUohMessageTapAttached = false;
let isInitialUohMessageScanComplete = false;

function applyUohModeCssVariables() {
  const rootElement = document.documentElement;
  if (!rootElement || !rootElement.style) {
    return;
  }

  rootElement.style.setProperty(
    "--uoh-username-prefix-image-url",
    `url("${UOH_USERNAME_PREFIX_IMAGE_URL}")`,
  );
  rootElement.style.setProperty(
    "--uoh-oshi-eyes-image-url",
    `url("${UOH_OSHI_EYES_IMAGE_URL}")`,
  );
  rootElement.style.setProperty(
    "--uoh-username-prefix-width",
    `${UOH_USERNAME_PREFIX_IMAGE_WIDTH_PX}px`,
  );
  rootElement.style.setProperty(
    "--uoh-username-prefix-height",
    `${UOH_USERNAME_PREFIX_IMAGE_HEIGHT_PX}px`,
  );
  rootElement.style.setProperty(
    "--uoh-username-prefix-margin-right",
    `${UOH_USERNAME_PREFIX_IMAGE_MARGIN_RIGHT_PX}px`,
  );
  rootElement.style.setProperty(
    "--uoh-oshi-eyes-width",
    `${UOH_OSHI_EYES_IMAGE_WIDTH_PX}px`,
  );
  rootElement.style.setProperty(
    "--uoh-timestamp-height",
    `${UOH_TIMESTAMP_IMAGE_HEIGHT_PX}px`,
  );
}

function normalizeComparableText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeHtmlForLookup(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getChannelEmoteByName(emoteName) {
  const normalizedEmoteName = String(emoteName || "").trim();
  if (!normalizedEmoteName || !window.CHANNEL) {
    return null;
  }

  if (CHANNEL.emoteMap) {
    if (CHANNEL.emoteMap[normalizedEmoteName]) {
      return CHANNEL.emoteMap[normalizedEmoteName];
    }

    const escapedLookupName = escapeHtmlForLookup(normalizedEmoteName);
    if (CHANNEL.emoteMap[escapedLookupName]) {
      return CHANNEL.emoteMap[escapedLookupName];
    }
  }

  if (!Array.isArray(CHANNEL.emotes)) {
    return null;
  }

  const lowercaseLookupName = normalizedEmoteName.toLowerCase();
  return (
    CHANNEL.emotes.find((emote) => {
      const emoteNameFromList = String(
        emote && emote.name != null ? emote.name : "",
      )
        .trim()
        .toLowerCase();
      return emoteNameFromList === lowercaseLookupName;
    }) || null
  );
}

function hasDatasetValue(element, dataKey) {
  return Boolean(
    element &&
    element.dataset &&
    Object.prototype.hasOwnProperty.call(element.dataset, dataKey),
  );
}

function rememberOriginalTextNodeValue(textNode) {
  if (!textNode || originalUohTextByNode.has(textNode)) {
    return;
  }

  originalUohTextByNode.set(textNode, String(textNode.nodeValue || ""));
  modifiedUohTextNodes.add(textNode);
}

function rememberOriginalElementAttribute(
  element,
  valueDataKey,
  presentDataKey,
  attributeName,
) {
  if (
    !element ||
    !element.dataset ||
    hasDatasetValue(element, presentDataKey)
  ) {
    return;
  }

  element.dataset[presentDataKey] = element.hasAttribute(attributeName)
    ? "1"
    : "";
  element.dataset[valueDataKey] = element.getAttribute(attributeName) || "";
}

function rememberOriginalEmoteAttributes(emoteNode) {
  if (!emoteNode || !emoteNode.dataset) {
    return;
  }

  rememberOriginalElementAttribute(
    emoteNode,
    UOH_EMOTE_ORIGINAL_SRC_DATA_KEY,
    UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY,
    "src",
  );
  rememberOriginalElementAttribute(
    emoteNode,
    UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY,
    UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY,
    "title",
  );
  rememberOriginalElementAttribute(
    emoteNode,
    UOH_EMOTE_ORIGINAL_ALT_DATA_KEY,
    UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY,
    "alt",
  );
  modifiedUohEmoteElements.add(emoteNode);
}

function replaceSingleEmoteNode(emoteNode, replacementEntry) {
  if (!emoteNode || !replacementEntry) {
    return;
  }

  const replacementText = replacementEntry.toText;
  const replacementImage = String(replacementEntry.toImage || "").trim();

  if (replacementImage) {
    rememberOriginalEmoteAttributes(emoteNode);
    emoteNode.setAttribute("src", replacementImage);

    const currentTitle = String(emoteNode.getAttribute("title") || "").trim();
    const replacementTitle =
      replacementText != null ? String(replacementText) : currentTitle;

    if (replacementTitle) {
      emoteNode.setAttribute("title", replacementTitle);
      emoteNode.setAttribute("alt", replacementTitle);
    }
    return;
  }

  if (replacementText == null) {
    return;
  }

  const replacementEmote = getChannelEmoteByName(replacementText);
  if (!replacementEmote || !replacementEmote.image) {
    return;
  }

  rememberOriginalEmoteAttributes(emoteNode);
  emoteNode.setAttribute("title", replacementEmote.name);
  emoteNode.setAttribute("alt", replacementEmote.name);
  emoteNode.setAttribute("src", replacementEmote.image);
}

function getReplacementConfig(wordReplacements) {
  const replacements = [];
  const seenLookupKeys = new Set();

  for (const entry of wordReplacements || []) {
    if (!entry || entry.from == null) {
      continue;
    }

    const from = String(entry.from).trim();
    if (!from) {
      continue;
    }

    const hasToText =
      Object.prototype.hasOwnProperty.call(entry, "to") && entry.to != null;
    const toText = hasToText ? String(entry.to) : null;
    const toImage = entry.toImage == null ? "" : String(entry.toImage).trim();
    if (!hasToText && !toImage) {
      continue;
    }

    const lookupKey = from.toLowerCase();
    if (seenLookupKeys.has(lookupKey)) {
      continue;
    }
    seenLookupKeys.add(lookupKey);

    replacements.push({
      from,
      toText,
      toImage,
      lookupKey,
    });
  }

  replacements.sort((a, b) => b.from.length - a.from.length);
  if (!replacements.length) {
    return null;
  }

  const pattern = replacements
    .map((entry) => escapeRegExp(entry.from))
    .join("|");
  const regex = new RegExp(`\\b(${pattern})\\b`, "gi");
  const replacementLookup = Object.fromEntries(
    replacements.map((entry) => [entry.lookupKey, entry]),
  );

  return { regex, replacementLookup };
}

const UOH_REPLACEMENT_CONFIG = getReplacementConfig(UOH_USER_WORD_REPLACEMENTS);

function replaceTextNodes(rootElement, replacementConfig) {
  if (!rootElement || !replacementConfig) {
    return;
  }

  const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node || !node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parentElement = node.parentElement;
      if (!parentElement) {
        return NodeFilter.FILTER_REJECT;
      }

      const tagName = parentElement.tagName;
      if (tagName === "SCRIPT" || tagName === "STYLE") {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const originalText = textNode.nodeValue;
    const newText = originalText.replace(
      replacementConfig.regex,
      (matchedText) => {
        const replacementEntry =
          replacementConfig.replacementLookup[matchedText.toLowerCase()];
        if (!replacementEntry || replacementEntry.toText == null) {
          return matchedText;
        }

        return replacementEntry.toText;
      },
    );

    if (newText !== originalText) {
      rememberOriginalTextNodeValue(textNode);
      textNode.nodeValue = newText;
    }
  }
}

function replaceEmoteNodes(rootElement, replacementConfig) {
  if (
    !rootElement ||
    !replacementConfig ||
    !replacementConfig.replacementLookup
  ) {
    return;
  }

  const emoteNodes = getEmoteNodesFromRoot(rootElement);
  for (const emoteNode of emoteNodes) {
    const emoteTitle = String(emoteNode.getAttribute("title") || "").trim();
    if (!emoteTitle) {
      continue;
    }

    const replacementEntry =
      replacementConfig.replacementLookup[emoteTitle.toLowerCase()];
    if (!replacementEntry) {
      continue;
    }

    replaceSingleEmoteNode(emoteNode, replacementEntry);
  }
}

function applyReplacementConfigToMessageRoot(
  messageRootElement,
  replacementConfig,
) {
  if (!messageRootElement || !replacementConfig) {
    return;
  }

  replaceTextNodes(messageRootElement, replacementConfig);
  replaceEmoteNodes(messageRootElement, replacementConfig);
}

function restoreModifiedTextNodes() {
  for (const textNode of Array.from(modifiedUohTextNodes)) {
    const originalText = originalUohTextByNode.get(textNode);
    if (typeof originalText === "string") {
      textNode.nodeValue = originalText;
    }

    modifiedUohTextNodes.delete(textNode);
  }
}

function restoreElementAttribute(
  element,
  valueDataKey,
  presentDataKey,
  attributeName,
) {
  if (
    !element ||
    !element.dataset ||
    !hasDatasetValue(element, presentDataKey)
  ) {
    return;
  }

  if (element.dataset[presentDataKey] === "1") {
    element.setAttribute(attributeName, element.dataset[valueDataKey] || "");
  } else {
    element.removeAttribute(attributeName);
  }

  delete element.dataset[valueDataKey];
  delete element.dataset[presentDataKey];
}

function restoreModifiedEmoteElements() {
  for (const emoteElement of Array.from(modifiedUohEmoteElements)) {
    restoreElementAttribute(
      emoteElement,
      UOH_EMOTE_ORIGINAL_SRC_DATA_KEY,
      UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY,
      "src",
    );
    restoreElementAttribute(
      emoteElement,
      UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY,
      UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY,
      "title",
    );
    restoreElementAttribute(
      emoteElement,
      UOH_EMOTE_ORIGINAL_ALT_DATA_KEY,
      UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY,
      "alt",
    );
    modifiedUohEmoteElements.delete(emoteElement);
  }
}

function restoreModifiedUohDom() {
  restoreModifiedTextNodes();
  restoreModifiedEmoteElements();
}

function syncUohVisualStateForUser(username, shouldEnable) {
  return setMessageRowsClassByUsername(
    username,
    UOH_ACTIVE_ROW_CLASS,
    shouldEnable,
    { messageBufferSelector: MESSAGE_BUFFER_SELECTOR },
  );
}

function activateUohForUser(username) {
  const displayName = String(username || "").trim();
  const userKey = normalizeUsername(displayName);
  if (!displayName || !userKey) {
    return false;
  }

  const existingState = activatedUohUsersByKey.get(userKey);
  if (existingState) {
    if (displayName && displayName !== existingState.displayName) {
      existingState.displayName = displayName;
      syncUohVisualStateForUser(displayName, true);
    }
    return false;
  }

  activatedUohUsersByKey.set(userKey, {
    displayName,
  });
  syncUohVisualStateForUser(displayName, true);
  return true;
}

function shouldActivateUohFromMessageText(messageText) {
  const normalizedMessageText = normalizeComparableText(messageText);
  if (!normalizedMessageText) {
    return false;
  }

  return UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED.some((triggerKey) => {
    const triggerRegex = new RegExp(
      `(^|\\W)${escapeRegExp(triggerKey)}(\\W|$)`,
      "i",
    );
    return triggerRegex.test(normalizedMessageText);
  });
}

function shouldActivateUohFromEmoteTitles(rootElement) {
  const emoteNodes = getEmoteNodesFromRoot(rootElement);
  if (!emoteNodes.length) {
    return false;
  }

  for (const emoteNode of emoteNodes) {
    const emoteTitleNormalized = normalizeComparableText(
      emoteNode && typeof emoteNode.getAttribute === "function"
        ? emoteNode.getAttribute("title")
        : "",
    );
    if (!emoteTitleNormalized) {
      continue;
    }

    const emoteTitleCompact = emoteTitleNormalized.replace(/[^a-z0-9]/g, "");
    if (
      UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED.some((triggerKey) =>
        emoteTitleNormalized.includes(triggerKey),
      )
    ) {
      return true;
    }

    if (
      UOH_TRIGGER_LOOKUP_KEYS_COMPACT.some((triggerKeyCompact) =>
        emoteTitleCompact.includes(triggerKeyCompact),
      )
    ) {
      return true;
    }
  }

  return false;
}

function shouldActivateUohMode(messageRootElement, messageText) {
  return (
    shouldActivateUohFromMessageText(messageText) ||
    shouldActivateUohFromEmoteTitles(messageRootElement)
  );
}

function applyUohModeForMessageIfActive($row, messageRootElement) {
  const messageAuthorKey = normalizeUsername(getMessageAuthor($row));
  if (!messageAuthorKey || !activatedUohUsersByKey.has(messageAuthorKey)) {
    return;
  }

  if ($row && $row.length) {
    $row[0].classList.add(UOH_ACTIVE_ROW_CLASS);
  }
  applyReplacementConfigToMessageRoot(
    messageRootElement,
    UOH_REPLACEMENT_CONFIG,
  );
}

function postUohStatusSystemMessage(message) {
  postStatusSystemMessage(message, {
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
    rowClass: "uohmode-system-message",
  });
}

function postUohToggleSystemMessage(isEnabled, actorUsername) {
  const safeActor = String(actorUsername || "").trim();
  const actorSuffix = safeActor ? ` by "${safeActor}"` : "";
  postUohStatusSystemMessage(
    `UOH mode ${isEnabled ? "enabled" : "disabled"}${actorSuffix}.`,
  );
}

function isCommandAllowedForAuthor(authorUsername) {
  return isAuthorAllowed(authorUsername, {
    allowedUsers: UOH_COMMAND_ALLOWED_USER_SET,
    minRank: UOH_COMMAND_MIN_RANK,
  });
}

function parseControlCommand(messageText) {
  const trimmedMessage = String(messageText || "").trim();
  if (!trimmedMessage) {
    return null;
  }

  const commandMatch = trimmedMessage.match(
    /^(?:!|\/|\.\/)(?:uoh|uohmode)\s+(on|off|enable|disable)\s*$/i,
  );
  if (!commandMatch) {
    return null;
  }

  const action = String(commandMatch[1] || "")
    .trim()
    .toLowerCase();
  return {
    action: action === "off" || action === "disable" ? "off" : "on",
  };
}

function processMessageRow($row, messageRootElement, messageText = "") {
  const messageAuthor = getMessageAuthor($row);

  if (shouldActivateUohMode(messageRootElement, messageText)) {
    activateUohForUser(messageAuthor);
  }

  applyUohModeForMessageIfActive($row, messageRootElement);
}

function clearRuntimeState() {
  activatedUohUsersByKey.clear();
  $(`${MESSAGE_BUFFER_SELECTOR} > div.${UOH_ACTIVE_ROW_CLASS}`).removeClass(
    UOH_ACTIVE_ROW_CLASS,
  );
}

function rescanExistingMessagesFor() {
  if (!isUohModeEnabled) {
    return;
  }

  $(`${MESSAGE_BUFFER_SELECTOR} > div`).each((_, element) => {
    const $row = $(element);
    if (!$row.length || isServerMessageRow($row)) {
      return;
    }

    const messageRootElement = getMessageContentRootElement(
      $row.children().last(),
      { $row, messageBufferSelector: MESSAGE_BUFFER_SELECTOR },
    );
    if (!messageRootElement) {
      return;
    }

    const messageText = String(messageRootElement.textContent || "");
    if (parseControlCommand(messageText)) {
      return;
    }

    processMessageRow($row, messageRootElement, messageText);
  });
}

function setModeEnabled(nextEnabled, options = {}) {
  const desiredEnabled = Boolean(nextEnabled);
  const announce = Boolean(options.announce);
  const actorUsername = String(options.actorUsername || "").trim();
  const rescanExisting = Boolean(options.rescanExisting);
  if (desiredEnabled === isUohModeEnabled) {
    return isUohModeEnabled;
  }

  isUohModeEnabled = desiredEnabled;
  if (desiredEnabled) {
    if (rescanExisting) {
      rescanExistingMessagesFor();
    }
    if (announce) {
      postUohToggleSystemMessage(true, actorUsername);
    }
    return isUohModeEnabled;
  }

  restoreModifiedUohDom();
  clearRuntimeState();
  if (announce) {
    postUohToggleSystemMessage(false, actorUsername);
  }
  return isUohModeEnabled;
}

function handleModeMessage($messageElement) {
  if (!$messageElement || !$messageElement.length) {
    return;
  }

  const $row = getMessageRow($messageElement);
  if (!$row || isServerMessageRow($row)) {
    return;
  }

  const messageAuthor = getMessageAuthor($row);
  const messageRootElement = getMessageContentRootElement(
    $messageElement,
    { $row, messageBufferSelector: MESSAGE_BUFFER_SELECTOR },
  );
  if (!messageRootElement) {
    return;
  }

  const messageText = String(messageRootElement.textContent || "");
  const parsedCommand = parseControlCommand(messageText);
  if (parsedCommand) {
    if (isCommandAllowedForAuthor(messageAuthor)) {
      const shouldEnable = parsedCommand.action === "on";
      $row.remove();
      setModeEnabled(shouldEnable, {
        announce: isInitialUohMessageScanComplete,
        actorUsername: messageAuthor,
        rescanExisting: isInitialUohMessageScanComplete && shouldEnable,
      });
    }
    return;
  }

  if (!isUohModeEnabled) {
    return;
  }

  processMessageRow($row, messageRootElement, messageText);
}

function getModeState() {
  return {
    enabled: isUohModeEnabled,
    activeUsers: activatedUohUsersByKey.size,
    commandMinRank: UOH_COMMAND_MIN_RANK,
    allowedUsers: Array.from(UOH_COMMAND_ALLOWED_USER_SET),
  };
}

const uohModeApi = {
  getState: getModeState,
  toggle(on) {
    return setModeEnabled(on, { rescanExisting: Boolean(on) });
  },
};

window.uohMode = uohModeApi;
window.Mode = uohModeApi;

async function initializeMode() {
  applyUohModeCssVariables();
  await window.waitForFunc("MESSAGE_PROCESSOR");
  if (isUohMessageTapAttached) {
    return;
  }

  MESSAGE_PROCESSOR.addTap(handleModeMessage);
  isUohMessageTapAttached = true;
  isInitialUohMessageScanComplete = true;
}

(async () => {
  await initializeMode();
})();
