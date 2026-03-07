const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const UOH_TRIGGER_LOOKUP_KEYS = ["uoh"];
// Trusted live control commands: !uoh on | !uoh off
const UOH_COMMAND_ALLOWED_USERS = [];
const UOH_COMMAND_MIN_RANK = typeof Rank !== "undefined" && Rank && Rank.Moderator != null
    ? Rank.Moderator
    : 2;

const UOH_MODE_REPLACEMENTS = [];

const UOH_USER_WORD_REPLACEMENTS = [
    ...UOH_MODE_REPLACEMENTS,

];

const UOH_USERNAME_PREFIX_IMAGE_URL = "https://cracklej.win/djtyT473HU.png";
const UOH_OSHI_EYES_IMAGE_URL = "https://cracklej.win/aje2Uww34L.png";
const UOH_OSHI_EYES_STYLE_ID = "uohmode-oshieyes-style";
const UOH_USERNAME_PREFIX_IMAGE_WIDTH_PX = 20;
const UOH_USERNAME_PREFIX_IMAGE_HEIGHT_PX = 20;
const UOH_OSHI_EYES_IMAGE_WIDTH_PX = 50;
const UOH_TIMESTAMP_IMAGE_HEIGHT_PX = 15;
const UOH_USERNAME_PREFIX_IMAGE_MARGIN_RIGHT_PX = 4;
const UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED = (Array.isArray(UOH_TRIGGER_LOOKUP_KEYS) ? UOH_TRIGGER_LOOKUP_KEYS : [UOH_TRIGGER_LOOKUP_KEYS])
    .map((lookupKey) => String(lookupKey || "").trim().toLowerCase())
    .filter(Boolean)
    .filter((lookupKey, index, values) => values.indexOf(lookupKey) === index);
const UOH_TRIGGER_LOOKUP_KEYS_COMPACT = UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED
    .map((lookupKey) => lookupKey.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
const UOH_COMMAND_ALLOWED_USER_SET = new Set(
    UOH_COMMAND_ALLOWED_USERS
        .map(normalizeUsername)
        .filter(Boolean)
);
const UOH_EMOTE_ORIGINAL_SRC_DATA_KEY = "uohOriginalSrc";
const UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY = "uohOriginalSrcPresent";
const UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY = "uohOriginalTitle";
const UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY = "uohOriginalTitlePresent";
const UOH_EMOTE_ORIGINAL_ALT_DATA_KEY = "uohOriginalAlt";
const UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY = "uohOriginalAltPresent";

const activatedUohUsersByKey = new Map();
const uohRulesByKey = new Map();
const knownMessageClassByUserKey = new Map();
const modifiedUohTextNodes = new Set();
const originalUohTextByNode = new WeakMap();
const modifiedUohEmoteElements = new Set();
let isUohModeEnabled = false;
let isUohMessageTapAttached = false;
let isInitialUohMessageScanComplete = false;

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function normalizeComparableText(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function escapeRegExp(text) {
    return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtmlForLookup(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeCssIdentifier(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
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
    return CHANNEL.emotes.find((emote) => {
        const emoteNameFromList = String(emote && emote.name != null ? emote.name : "").trim().toLowerCase();
        return emoteNameFromList === lowercaseLookupName;
    }) || null;
}

function hasDatasetValue(element, dataKey) {
    return Boolean(
        element &&
        element.dataset &&
        Object.prototype.hasOwnProperty.call(element.dataset, dataKey)
    );
}

function rememberOriginalTextNodeValue(textNode) {
    if (!textNode || originalUohTextByNode.has(textNode)) {
        return;
    }

    originalUohTextByNode.set(textNode, String(textNode.nodeValue || ""));
    modifiedUohTextNodes.add(textNode);
}

function rememberOriginalElementAttribute(element, valueDataKey, presentDataKey, attributeName) {
    if (!element || !element.dataset || hasDatasetValue(element, presentDataKey)) {
        return;
    }

    element.dataset[presentDataKey] = element.hasAttribute(attributeName) ? "1" : "";
    element.dataset[valueDataKey] = element.getAttribute(attributeName) || "";
}

function rememberOriginalEmoteAttributes(emoteNode) {
    if (!emoteNode || !emoteNode.dataset) {
        return;
    }

    rememberOriginalElementAttribute(emoteNode, UOH_EMOTE_ORIGINAL_SRC_DATA_KEY, UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY, "src");
    rememberOriginalElementAttribute(emoteNode, UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY, UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY, "title");
    rememberOriginalElementAttribute(emoteNode, UOH_EMOTE_ORIGINAL_ALT_DATA_KEY, UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY, "alt");
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
        const replacementTitle = replacementText != null
            ? String(replacementText)
            : currentTitle;

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

function getMessageClassName($row) {
    if (!$row || !$row.length) {
        return "";
    }

    return ($row.attr("class") || "")
        .split(/\s+/)
        .find((cls) => cls.startsWith("chat-msg-") && cls !== "chat-msg-$server$") || "";
}

function getMessageAuthorFromClassName($row) {
    const messageClass = getMessageClassName($row);
    if (!messageClass) {
        return "";
    }

    return messageClass.slice("chat-msg-".length).trim();
}

function getMessageRow($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return null;
    }

    const $row = $messageElement.closest(`${MESSAGE_BUFFER_SELECTOR} > div`);
    return $row.length ? $row : null;
}

function getMessageAuthor($row) {
    if (!$row || !$row.length) {
        return "";
    }

    const classDerivedAuthor = getMessageAuthorFromClassName($row);
    if (classDerivedAuthor) {
        return classDerivedAuthor;
    }

    const usernameText = $row.find("strong.username").first().text();
    if (usernameText) {
        return usernameText.replace(/:\s*$/, "").trim();
    }

    return "";
}

function isServerMessageRow($row) {
    if (!$row || !$row.length) {
        return false;
    }

    return ($row.attr("class") || "")
        .split(/\s+/)
        .some((cls) => cls === "chat-msg-$server$");
}

function getMessageContentRootElement($messageElement, $row = null) {
    if (!$messageElement || !$messageElement.length) {
        return null;
    }

    const $messageRow = $row || getMessageRow($messageElement);
    if ($messageRow && $messageRow.length) {
        const $messageContentSpan = $messageRow.children("span").last();
        if ($messageContentSpan.length) {
            return $messageContentSpan[0];
        }
    }

    return $messageElement[0] || null;
}

function getEmoteNodesFromRoot(rootElement) {
    if (!rootElement) {
        return [];
    }

    const emoteNodes = [];
    if (rootElement.matches && rootElement.matches(".channel-emote[title]")) {
        emoteNodes.push(rootElement);
    }

    if (typeof rootElement.querySelectorAll === "function") {
        emoteNodes.push(...rootElement.querySelectorAll(".channel-emote[title]"));
    }

    return emoteNodes;
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

        const hasToText = Object.prototype.hasOwnProperty.call(entry, "to") && entry.to != null;
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
            lookupKey
        });
    }

    replacements.sort((a, b) => b.from.length - a.from.length);
    if (!replacements.length) {
        return null;
    }

    const pattern = replacements.map((entry) => escapeRegExp(entry.from)).join("|");
    const regex = new RegExp(`\\b(${pattern})\\b`, "gi");
    const replacementLookup = Object.fromEntries(
        replacements.map((entry) => [entry.lookupKey, entry])
    );

    return { regex, replacementLookup };
}

const UOH_REPLACEMENT_CONFIG = getReplacementConfig(UOH_USER_WORD_REPLACEMENTS);

function replaceTextNodes(rootElement, replacementConfig) {
    if (!rootElement || !replacementConfig) {
        return;
    }

    const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        {
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
            }
        }
    );

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
                const replacementEntry = replacementConfig.replacementLookup[matchedText.toLowerCase()];
                if (!replacementEntry || replacementEntry.toText == null) {
                    return matchedText;
                }

                return replacementEntry.toText;
            }
        );

        if (newText !== originalText) {
            rememberOriginalTextNodeValue(textNode);
            textNode.nodeValue = newText;
        }
    }
}

function replaceEmoteNodes(rootElement, replacementConfig) {
    if (!rootElement || !replacementConfig || !replacementConfig.replacementLookup) {
        return;
    }

    const emoteNodes = getEmoteNodesFromRoot(rootElement);
    for (const emoteNode of emoteNodes) {
        const emoteTitle = String(emoteNode.getAttribute("title") || "").trim();
        if (!emoteTitle) {
            continue;
        }

        const replacementEntry = replacementConfig.replacementLookup[emoteTitle.toLowerCase()];
        if (!replacementEntry) {
            continue;
        }

        replaceSingleEmoteNode(emoteNode, replacementEntry);
    }
}

function applyReplacementConfigToMessageRoot(messageRootElement, replacementConfig) {
    if (!messageRootElement || !replacementConfig) {
        return;
    }

    replaceTextNodes(messageRootElement, replacementConfig);
    replaceEmoteNodes(messageRootElement, replacementConfig);
}

function getOrCreateUohEyesStyleElement() {
    let styleElement = document.getElementById(UOH_OSHI_EYES_STYLE_ID);
    if (styleElement) {
        return styleElement;
    }

    styleElement = document.createElement("style");
    styleElement.id = UOH_OSHI_EYES_STYLE_ID;
    document.head.appendChild(styleElement);
    return styleElement;
}

function renderUohEyesCssRules() {
    const styleElement = getOrCreateUohEyesStyleElement();
    styleElement.textContent = Array.from(uohRulesByKey.values()).join("\n");
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

function restoreElementAttribute(element, valueDataKey, presentDataKey, attributeName) {
    if (!element || !element.dataset || !hasDatasetValue(element, presentDataKey)) {
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
        restoreElementAttribute(emoteElement, UOH_EMOTE_ORIGINAL_SRC_DATA_KEY, UOH_EMOTE_ORIGINAL_SRC_PRESENT_DATA_KEY, "src");
        restoreElementAttribute(emoteElement, UOH_EMOTE_ORIGINAL_TITLE_DATA_KEY, UOH_EMOTE_ORIGINAL_TITLE_PRESENT_DATA_KEY, "title");
        restoreElementAttribute(emoteElement, UOH_EMOTE_ORIGINAL_ALT_DATA_KEY, UOH_EMOTE_ORIGINAL_ALT_PRESENT_DATA_KEY, "alt");
        modifiedUohEmoteElements.delete(emoteElement);
    }
}

function restoreModifiedUohDom() {
    restoreModifiedTextNodes();
    restoreModifiedEmoteElements();
}

function getFallbackMessageClassForUsername(username) {
    return `chat-msg-${String(username || "").trim()}`;
}

function findMessageClassForUsername(username) {
    const normalizedTarget = normalizeUsername(username);
    if (!normalizedTarget) {
        return "";
    }

    const cached = knownMessageClassByUserKey.get(normalizedTarget);
    if (cached) {
        return cached;
    }

    let foundClassName = "";
    $(`${MESSAGE_BUFFER_SELECTOR} > div`).each((_, element) => {
        const $row = $(element);
        if (!$row.length || isServerMessageRow($row)) {
            return;
        }

        const rowAuthor = normalizeUsername(getMessageAuthor($row));
        if (rowAuthor !== normalizedTarget) {
            return;
        }

        foundClassName = getMessageClassName($row);
        if (foundClassName) {
            return false;
        }
    });

    return foundClassName;
}

function buildUohCssRuleForClass(messageClassName) {
    const escapedMessageClass = escapeCssIdentifier(messageClassName);

    return [
        `.${escapedMessageClass} .timestamp {`,
        "    color: transparent !important;",
        `    background-size: ${UOH_OSHI_EYES_IMAGE_WIDTH_PX}px ${UOH_TIMESTAMP_IMAGE_HEIGHT_PX}px !important;`,
        `    background-image: url('${UOH_OSHI_EYES_IMAGE_URL}') !important;`,
        "    background-position: center !important;",
        "    background-repeat: no-repeat !important;",
        "}",
        `.${escapedMessageClass} .timestamp + span > strong.username::before,`,
        `.${escapedMessageClass} > span > strong.username::before,`,
        `.${escapedMessageClass} strong.username::before {`,
        "    content: '' !important;",
        "    display: inline-block !important;",
        `    width: ${UOH_USERNAME_PREFIX_IMAGE_WIDTH_PX}px !important;`,
        `    height: ${UOH_USERNAME_PREFIX_IMAGE_HEIGHT_PX}px !important;`,
        `    margin-right: ${UOH_USERNAME_PREFIX_IMAGE_MARGIN_RIGHT_PX}px !important;`,
        "    vertical-align: middle !important;",
        `    background-image: url('${UOH_USERNAME_PREFIX_IMAGE_URL}') !important;`,
        "    background-size: contain !important;",
        "    background-position: center !important;",
        "    background-repeat: no-repeat !important;",
        "}"
    ].join("\n");
}

function upsertUohRuleForUser(userKey) {
    const userState = activatedUohUsersByKey.get(userKey);
    if (!userState || !userState.messageClassName) {
        return;
    }

    uohRulesByKey.set(userKey, buildUohCssRuleForClass(userState.messageClassName));
    renderUohEyesCssRules();
}

function activateUohForUser(username, messageClassName = "") {
    const displayName = String(username || "").trim();
    const userKey = normalizeUsername(displayName);
    if (!displayName || !userKey) {
        return false;
    }

    const existingState = activatedUohUsersByKey.get(userKey);
    const resolvedClassName = String(
        messageClassName ||
        (existingState && existingState.messageClassName) ||
        findMessageClassForUsername(displayName) ||
        getFallbackMessageClassForUsername(displayName)
    ).trim();

    if (existingState) {
        let changed = false;

        if (resolvedClassName && resolvedClassName !== existingState.messageClassName) {
            existingState.messageClassName = resolvedClassName;
            changed = true;
        }

        if (displayName && displayName !== existingState.displayName) {
            existingState.displayName = displayName;
            changed = true;
        }

        if (changed) {
            upsertUohRuleForUser(userKey);
        }
        return false;
    }

    activatedUohUsersByKey.set(userKey, {
        displayName,
        messageClassName: resolvedClassName
    });

    upsertUohRuleForUser(userKey);
    return true;
}

function rememberObservedMessageClass(authorUsername, messageClassName) {
    const authorKey = normalizeUsername(authorUsername);
    if (!authorKey || !messageClassName) {
        return;
    }

    knownMessageClassByUserKey.set(authorKey, messageClassName);

    const existingState = activatedUohUsersByKey.get(authorKey);
    if (!existingState) {
        return;
    }

    if (existingState.messageClassName === messageClassName) {
        return;
    }

    existingState.messageClassName = messageClassName;
    upsertUohRuleForUser(authorKey);
}

function shouldActivateUohFromMessageText(messageText) {
    const normalizedMessageText = normalizeComparableText(messageText);
    if (!normalizedMessageText) {
        return false;
    }

    return UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED.some((triggerKey) => {
        const triggerRegex = new RegExp(`(^|\\W)${escapeRegExp(triggerKey)}(\\W|$)`, "i");
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
                : ""
        );
        if (!emoteTitleNormalized) {
            continue;
        }

        const emoteTitleCompact = emoteTitleNormalized.replace(/[^a-z0-9]/g, "");
        if (UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED.some((triggerKey) => emoteTitleNormalized.includes(triggerKey))) {
            return true;
        }

        if (UOH_TRIGGER_LOOKUP_KEYS_COMPACT.some((triggerKeyCompact) => emoteTitleCompact.includes(triggerKeyCompact))) {
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

    applyReplacementConfigToMessageRoot(messageRootElement, UOH_REPLACEMENT_CONFIG);
}

function postUohStatusSystemMessage(message) {
    const safeMessage = String(message || "").trim();
    if (!safeMessage) {
        return;
    }

    const $messageBuffer = $(MESSAGE_BUFFER_SELECTOR);
    if (!$messageBuffer.length) {
        return;
    }

    const messageBufferElement = $messageBuffer[0];
    const shouldAutoScroll = (
        messageBufferElement.scrollHeight -
        messageBufferElement.scrollTop -
        messageBufferElement.clientHeight
    ) < 20;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const formattedTimestamp = `[${hours}:${minutes}:${seconds}] `;

    const $fakeSystemRow = $("<div>", {
        class: "chat-msg-$server$ uohmode-system-message"
    });

    $("<span>", {
        class: "timestamp server-whisper",
        text: formattedTimestamp
    }).appendTo($fakeSystemRow);

    $("<span>", {
        class: "server-whisper",
        text: safeMessage
    }).appendTo($fakeSystemRow);

    $messageBuffer.append($fakeSystemRow);
    if (shouldAutoScroll) {
        messageBufferElement.scrollTop = messageBufferElement.scrollHeight;
    }
}

function postUohToggleSystemMessage(isEnabled, actorUsername) {
    const safeActor = String(actorUsername || "").trim();
    const actorSuffix = safeActor ? ` by "${safeActor}"` : "";
    postUohStatusSystemMessage(
        `uoh`
    );
}

function getUserlistNameElement($userlistRow) {
    if (!$userlistRow || !$userlistRow.length) {
        return $();
    }

    return $userlistRow.children().eq(1);
}

function getUserlistUsernameFromRow($userlistRow) {
    if (!$userlistRow || !$userlistRow.length) {
        return "";
    }

    const dataName = String($userlistRow.data("name") || "").trim();
    if (dataName) {
        return dataName;
    }

    return String(getUserlistNameElement($userlistRow).text() || "").trim();
}

function findUserlistRowByUsername(username) {
    const normalizedTarget = normalizeUsername(username);
    if (!normalizedTarget) {
        return null;
    }

    let foundRow = null;
    $("#userlist .userlist_item").each((_, element) => {
        const $row = $(element);
        const rowUsername = normalizeUsername(getUserlistUsernameFromRow($row));
        if (rowUsername !== normalizedTarget) {
            return;
        }

        foundRow = $row;
        return false;
    });

    return foundRow;
}

function getUohCommandAuthorRank(username) {
    const $userlistRow = findUserlistRowByUsername(username);
    if (!$userlistRow || !$userlistRow.length) {
        const normalizedClientName = normalizeUsername(window.CLIENT && CLIENT.name ? CLIENT.name : "");
        const normalizedUsername = normalizeUsername(username);
        if (normalizedClientName && normalizedClientName === normalizedUsername) {
            return Number(window.CLIENT && CLIENT.rank);
        }

        return;
    }

    const dataRank = Number($userlistRow.data("rank"));
    if (Number.isFinite(dataRank)) {
        return dataRank;
    }

    const $nameElement = getUserlistNameElement($userlistRow);
    if ($nameElement.hasClass("userlist_owner")) {
        return typeof Rank !== "undefined" && Rank && Rank.Owner != null ? Rank.Owner : 10;
    }
    if ($nameElement.hasClass("userlist_admin")) {
        return typeof Rank !== "undefined" && Rank && Rank.Admin != null ? Rank.Admin : 3;
    }
    if ($nameElement.hasClass("userlist_op")) {
        return typeof Rank !== "undefined" && Rank && Rank.Moderator != null ? Rank.Moderator : 2;
    }
    if ($nameElement.hasClass("userlist_guest")) {
        return typeof Rank !== "undefined" && Rank && Rank.Guest != null ? Rank.Guest : 0;
    }

    return typeof Rank !== "undefined" && Rank && Rank.Member != null ? Rank.Member : 1;
}

function isUohCommandAllowedForAuthor(authorUsername) {
    const normalizedAuthor = normalizeUsername(authorUsername);
    if (!normalizedAuthor) {
        return false;
    }

    if (UOH_COMMAND_ALLOWED_USER_SET.has(normalizedAuthor)) {
        return true;
    }

    const authorRank = getUohCommandAuthorRank(authorUsername);
    return Number.isFinite(authorRank) && authorRank >= UOH_COMMAND_MIN_RANK;
}

function parseUohControlCommand(messageText) {
    const trimmedMessage = String(messageText || "").trim();
    if (!trimmedMessage) {
        return null;
    }

    const commandMatch = trimmedMessage.match(/^(?:!|\/)(?:uoh|uohmode)\s+(on|off|enable|disable)\s*$/i);
    if (!commandMatch) {
        return null;
    }

    const action = String(commandMatch[1] || "").trim().toLowerCase();
    return {
        action: action === "off" || action === "disable" ? "off" : "on"
    };
}

function processUohMessageRow($row, messageRootElement, messageText = "") {
    const messageAuthor = getMessageAuthor($row);
    const messageClassName = getMessageClassName($row);
    rememberObservedMessageClass(messageAuthor, messageClassName);

    if (shouldActivateUohMode(messageRootElement, messageText)) {
        activateUohForUser(messageAuthor, messageClassName);
    }

    applyUohModeForMessageIfActive($row, messageRootElement);
}

function clearUohRuntimeState() {
    activatedUohUsersByKey.clear();
    uohRulesByKey.clear();
    knownMessageClassByUserKey.clear();
    renderUohEyesCssRules();
}

function rescanExistingMessagesForUoh() {
    if (!isUohModeEnabled) {
        return;
    }

    $(`${MESSAGE_BUFFER_SELECTOR} > div`).each((_, element) => {
        const $row = $(element);
        if (!$row.length || isServerMessageRow($row)) {
            return;
        }

        const messageRootElement = getMessageContentRootElement($row.children().last(), $row);
        if (!messageRootElement) {
            return;
        }

        const messageText = String(messageRootElement.textContent || "");
        if (parseUohControlCommand(messageText)) {
            return;
        }

        processUohMessageRow($row, messageRootElement, messageText);
    });
}

function setUohModeEnabled(nextEnabled, options = {}) {
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
            rescanExistingMessagesForUoh();
        }
        if (announce) {
            postUohToggleSystemMessage(true, actorUsername);
        }
        return isUohModeEnabled;
    }

    restoreModifiedUohDom();
    clearUohRuntimeState();
    if (announce) {
        postUohToggleSystemMessage(false, actorUsername);
    }
    return isUohModeEnabled;
}

function handleUohModeMessage($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    const messageAuthor = getMessageAuthor($row);
    const messageRootElement = getMessageContentRootElement($messageElement, $row);
    if (!messageRootElement) {
        return;
    }

    const messageText = String(messageRootElement.textContent || "");
    const parsedCommand = parseUohControlCommand(messageText);
    if (parsedCommand) {
        if (isUohCommandAllowedForAuthor(messageAuthor)) {
            const shouldEnable = parsedCommand.action === "on";
            $row.remove();
            setUohModeEnabled(shouldEnable, {
                announce: isInitialUohMessageScanComplete,
                actorUsername: messageAuthor,
                rescanExisting: isInitialUohMessageScanComplete && shouldEnable
            });
        }
        return;
    }

    if (!isUohModeEnabled) {
        return;
    }

    processUohMessageRow($row, messageRootElement, messageText);
}

function getUohModeState() {
    return {
        enabled: isUohModeEnabled,
        activeUsers: activatedUohUsersByKey.size,
        commandMinRank: UOH_COMMAND_MIN_RANK,
        allowedUsers: Array.from(UOH_COMMAND_ALLOWED_USER_SET)
    };
}

window.uohMode = {
    getState: getUohModeState,
    toggle(on) {
        return setUohModeEnabled(on, { rescanExisting: Boolean(on) });
    }
};

async function initializeUohMode() {
    await window.waitForFunc("MESSAGE_PROCESSOR");
    if (isUohMessageTapAttached) {
        return;
    }

    MESSAGE_PROCESSOR.addTap(handleUohModeMessage);
    isUohMessageTapAttached = true;
    isInitialUohMessageScanComplete = true;
}

(async () => {
    await initializeUohMode();
})();
