// Father forgive me for this file jesus wept, the uoh mode shit is ugly but its a meme so it'll be short lived
// List of usernames to target
const TARGET_USERNAMES = ["NinoValt"];

// Anything here will only be replaced if the sender is included in TARGET_USERNAMES.
// Emotes can be matched by their exact title (e.g. ":uoh:").
// For emote-only image swaps, use toImage: { from: ":uoh:", toImage: "https://..." }.
const TARGET_USER_WORD_REPLACEMENTS = [
    { from: "nigga", to: "I'm racist" },
    { from: "niggas", to: "I'm racist" },
    { from: "nigger", to: "I'm very racist" },
    { from: "niggers", to: "I'm very racist" },
    { from: ":muteninovaltifhecumstothis:", to: "[moderation has been enacted on this post]"},
    { from: ":mikojork:", to: "[moderation has been enacted on this post]"},
    { from: ":biboojorking:", to: "[moderation has been enacted on this post]"},
    { from: ":gigijorkin:", to: "[moderation has been enacted on this post]"},
    { from: ":jorkingit:", to: "[moderation has been enacted on this post]"},
    { from: ":shotacum:", to: "[moderation has been enacted on this post]"},
    { from: ":lamyokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":sheaskedfornocucumber:", to: "[moderation has been enacted on this post]"},
    { from: ":coniokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":rocaokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":junaokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":ariaokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":rosemiokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":fbkokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":inaokcumsherfootlong:", to: "[moderation has been enacted on this post]"},
    { from: ":moriokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":bijouokcums:", to: "[moderation has been enacted on this post]"},
    { from: ":irysactualsex:", to: "[moderation has been enacted on this post]"},
    { from: ":sexpout:", to: "[moderation has been enacted on this post]"},
    { from: ":sexsmug:", to: "[moderation has been enacted on this post]"},
    { from: ":sexblush:", to: "[moderation has been enacted on this post]"},
    { from: ":sexceiling:", to: "[moderation has been enacted on this post]"},
    { from: ":sex:", to: "[moderation has been enacted on this post]"},
    { from: ":sex...:", to: "[moderation has been enacted on this post]"},
    { from: ":irysex:", to: "[moderation has been enacted on this post]"},
    { from: ":havesex:", to: "[moderation has been enacted on this post]"},
    { from: ":anyasex:", to: "[moderation has been enacted on this post]"},
    { from: ":sexsexsex:", to: "[moderation has been enacted on this post]"},
    { from: ":sexsex:", to: "[moderation has been enacted on this post]"},
    { from: ":muyuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":kobouoh:", to: "[moderation has been enacted on this post]"},
    { from: ":baeuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":irysuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":lapuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":okayuuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":uohdepraved:", to: "[moderation has been enacted on this post]"},
    { from: ":faunauoh:", to: "[moderation has been enacted on this post]"},
    { from: ":takuoh:", to: "[moderation has been enacted on this post]"},
    { from: ":pikauoh:", to: "[moderation has been enacted on this post]"},
    { from: ":35puoh:", to: "[moderation has been enacted on this post]"},
    { from: ":mikouoh:", to: "[moderation has been enacted on this post]"},
    { from: ":pekouoh:", to: "[moderation has been enacted on this post]"},
    { from: ":kiauoh:", to: "[moderation has been enacted on this post]"},
    { from: ":guoh:", to: "[moderation has been enacted on this post]"},
    { from: ":marineNUT:", to: "[moderation has been enacted on this post]"},
    { from: ":amelaugh:", to: "[moderation has been enacted on this post]"},
    { from: ":shiogey:", to: "[moderation has been enacted on this post]"},
    { from: ":shiorineutralexpression:", to: "[moderation has been enacted on this post]"},
    { from: ":marinelaugh:", to: "[moderation has been enacted on this post]"},
    { from: ":gurascared:", to: "[moderation has been enacted on this post]"},
    { from: ":amewave:", to: "[moderation has been enacted on this post]"},
    { from: ":kronieawe:", to: "[moderation has been enacted on this post]"}
];

// Anything here will be replaced globally regardless of username.
// Emotes can be matched by their exact title (e.g. ":uoh:").
// For emote-only image swaps, use toImage: { from: ":uoh:", toImage: "https://..." }.
const GLOBAL_WORD_REPLACEMENTS = [];

// UOH mode configuration.
const UOH_MODE_REPLACEMENTS = [
    {from: "uoh", to:"I miss the good old days where I would spend weeks on the Epstein Island **** and eating children"},
    {from: ":lapuoh:", toImage:"https://cracklej.win/gzldV61DX6.jpg"}
];

const UOH_MODE_ON = true;
const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const UOH_TRIGGER_LOOKUP_KEYS = ["uoh"];
const ACTIVE_GLOBAL_WORD_REPLACEMENTS = UOH_MODE_ON
    ? [...GLOBAL_WORD_REPLACEMENTS, ...UOH_MODE_REPLACEMENTS]
    : GLOBAL_WORD_REPLACEMENTS;
const UOH_USERNAME_PREFIX_IMAGE_URL = "https://cracklej.win/bTrlUfti2F.jpg";
const UOH_OSHI_EYES_IMAGE_URL = "https://cracklej.win/7OwAi9DnfA.png";
const UOH_OSHI_EYES_STYLE_ID = "user-word-replacement-uoh-eyes-style";
const UOH_USERNAME_PREFIX_IMAGE_WIDTH_PX = 50;
const UOH_USERNAME_PREFIX_IMAGE_HEIGHT_PX = 50;
const UOH_OSHI_EYES_IMAGE_WIDTH_PX = 50;
const UOH_TIMESTAMP_IMAGE_HEIGHT_PX = 25;
const UOH_USERNAME_PREFIX_IMAGE_MARGIN_RIGHT_PX = 4;
const UOH_USERNAME_REPLACEMENT_FIRST_WORDS = [
    "David",
    "Isaac",
    "Daniel",
    "Jacob",
    "Abigail",
    "Omer",
    "Adam",
    "Samuel",
    "Abihu",
    "Miriam",
    "Benjamin",
    "Shlomo",
    "Noncey",
    "Schnozz"
];
const UOH_USERNAME_REPLACEMENT_SECOND_WORDS = [
    "Goldstein",
    "Silverman",
    "Goldberg",
    "Finkelstein",
    "Goldman",
    "Katz",
    "Horowitz",
    "Bernstein",
    "Teitelbaum",
    "Schwartz",
    "Diamond",
    "Rothstein",
    "Fiddlestein",
    "Moneylover"
];
const UOH_USERNAME_REPLACEMENT_FIRST_WORDS_NORMALIZED = UOH_USERNAME_REPLACEMENT_FIRST_WORDS
    .map((word) => String(word || "").trim())
    .filter(Boolean);
const UOH_USERNAME_REPLACEMENT_SECOND_WORDS_NORMALIZED = UOH_USERNAME_REPLACEMENT_SECOND_WORDS
    .map((word) => String(word || "").trim())
    .filter(Boolean);
const uohOshiEyesRulesByKey = new Map();

// Shared utility helpers.
function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    return CHANNEL.emotes.find((emote) => {
        const emoteNameFromList = String(emote && emote.name != null ? emote.name : "").trim().toLowerCase();
        return emoteNameFromList === lowercaseLookupName;
    }) || null;
}

function replaceSingleEmoteNode(emoteNode, replacementEntry) {
    if (!emoteNode || !replacementEntry) {
        return;
    }

    const replacementText = replacementEntry.toText;
    const replacementImage = String(replacementEntry.toImage || "").trim();

    if (replacementImage) {
        const replacementNode = emoteNode.cloneNode(true);
        replacementNode.setAttribute("src", replacementImage);

        const currentTitle = String(emoteNode.getAttribute("title") || "").trim();
        const replacementTitle = replacementText != null
            ? String(replacementText)
            : currentTitle;

        if (replacementTitle) {
            replacementNode.setAttribute("title", replacementTitle);
            replacementNode.setAttribute("alt", replacementTitle);
        }

        emoteNode.replaceWith(replacementNode);
        return;
    }

    if (replacementText == null) {
        return;
    }

    const replacementEmote = getChannelEmoteByName(replacementText);

    if (!replacementEmote || !replacementEmote.image) {
        emoteNode.replaceWith(document.createTextNode(String(replacementText)));
        return;
    }

    const replacementNode = emoteNode.cloneNode(true);
    replacementNode.setAttribute("title", replacementEmote.name);
    replacementNode.setAttribute("alt", replacementEmote.name);
    replacementNode.setAttribute("src", replacementEmote.image);
    emoteNode.replaceWith(replacementNode);
}

function getWordReplacementEntryByLookupKey(wordReplacements, lookupKey) {
    const targetLookupKey = String(lookupKey || "").trim().toLowerCase();
    if (!targetLookupKey) {
        return null;
    }

    for (const entry of wordReplacements || []) {
        if (!entry || entry.from == null) {
            continue;
        }

        const entryLookupKey = String(entry.from).trim().toLowerCase();
        if (entryLookupKey === targetLookupKey) {
            return entry;
        }
    }

    return null;
}

function normalizeLookupKeys(lookupKeys) {
    return (Array.isArray(lookupKeys) ? lookupKeys : [lookupKeys])
        .map((lookupKey) => String(lookupKey || "").trim().toLowerCase())
        .filter(Boolean)
        .filter((lookupKey, index, values) => values.indexOf(lookupKey) === index);
}

function normalizeComparableText(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function escapeCssIdentifier(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
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

    return $messageElement[0];
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

const UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED = normalizeLookupKeys(UOH_TRIGGER_LOOKUP_KEYS);
const UOH_GLOBAL_REPLACEMENT_ENTRIES = UOH_MODE_ON
    ? UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED
        .map((lookupKey) => getWordReplacementEntryByLookupKey(UOH_MODE_REPLACEMENTS, lookupKey))
        .filter(Boolean)
    : [];
const UOH_FROM_TEXTS = UOH_GLOBAL_REPLACEMENT_ENTRIES.length
    ? UOH_GLOBAL_REPLACEMENT_ENTRIES
        .map((entry) => String(entry && entry.from != null ? entry.from : "").trim())
        .filter(Boolean)
    : UOH_TRIGGER_LOOKUP_KEYS_NORMALIZED;
const UOH_TO_TEXTS = UOH_GLOBAL_REPLACEMENT_ENTRIES
    .map((entry) => String(entry && entry.to != null ? entry.to : "").trim())
    .filter(Boolean);
const UOH_FROM_REGEX = UOH_FROM_TEXTS.length
    ? new RegExp(`\\b(${UOH_FROM_TEXTS.map((fromText) => escapeRegExp(fromText)).join("|")})\\b`, "i")
    : /\buoh\b/i;
const UOH_TO_TEXTS_NORMALIZED = UOH_TO_TEXTS
    .map(normalizeComparableText)
    .filter(Boolean);
const UOH_FROM_TEXTS_NORMALIZED = UOH_FROM_TEXTS
    .map(normalizeComparableText)
    .filter(Boolean);
const UOH_FROM_TEXTS_COMPACT = UOH_FROM_TEXTS_NORMALIZED
    .map((fromTextNormalized) => fromTextNormalized.replace(/:/g, ""))
    .filter(Boolean);

// UOH mode runtime logic.
function getUohUsernameReplacementPrefixWord(username) {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
        return "";
    }

    const firstWordPool = UOH_USERNAME_REPLACEMENT_FIRST_WORDS_NORMALIZED;
    const secondWordPool = UOH_USERNAME_REPLACEMENT_SECOND_WORDS_NORMALIZED;
    if (!firstWordPool.length && !secondWordPool.length) {
        return "";
    }

    const usernameLength = normalizedUsername.length;
    const lastCharacter = normalizedUsername.charAt(usernameLength - 1);
    const lastCharacterCode = lastCharacter ? lastCharacter.charCodeAt(0) : 0;

    const firstWord = firstWordPool.length
        ? String(firstWordPool[usernameLength % firstWordPool.length] || "").trim()
        : "";
    const secondWord = secondWordPool.length
        ? String(secondWordPool[(lastCharacterCode + usernameLength) % secondWordPool.length] || "").trim()
        : "";

    if (firstWord && secondWord) {
        return `${firstWord} ${secondWord}`;
    }

    return firstWord || secondWord || "";
}

function applyUohUsernameReplacementPrefixToRow($row, normalizedMessageAuthor) {
    if (!$row || !$row.length || !normalizedMessageAuthor) {
        return;
    }

    if (!uohOshiEyesRulesByKey.has(normalizedMessageAuthor)) {
        return;
    }

    const $usernameElement = $row.find(".timestamp + span > strong.username").first();
    if (!$usernameElement.length) {
        return;
    }

    const replacementPrefixWord = getUohUsernameReplacementPrefixWord(normalizedMessageAuthor);
    if (!replacementPrefixWord) {
        return;
    }

    const currentUsernameText = String($usernameElement.text() || "");
    const alreadyUsesReplacementWordRegex = new RegExp(`^${escapeRegExp(replacementPrefixWord)}:\\s*$`, "i");
    if (alreadyUsesReplacementWordRegex.test(currentUsernameText)) {
        return;
    }

    $usernameElement.text(`${replacementPrefixWord}: `);
}

function applyUohUsernameReplacementPrefixToExistingRows(normalizedMessageAuthor) {
    if (!normalizedMessageAuthor) {
        return;
    }

    $(`${MESSAGE_BUFFER_SELECTOR} > div`).each((_, element) => {
        const $row = $(element);
        if (!$row.length || isServerMessageRow($row)) {
            return;
        }

        const rowAuthor = normalizeUsername(getMessageAuthor($row));
        if (rowAuthor !== normalizedMessageAuthor) {
            return;
        }

        applyUohUsernameReplacementPrefixToRow($row, normalizedMessageAuthor);
    });
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
    styleElement.textContent = Array.from(uohOshiEyesRulesByKey.values()).join("\n");
}

function applyUohOshiEyesOverride($row) {
    const messageAuthor = normalizeUsername(getMessageAuthor($row));
    const messageClass = getMessageClassName($row);
    if (!messageAuthor || !messageClass) {
        return false;
    }

    if (uohOshiEyesRulesByKey.has(messageAuthor)) {
        return false;
    }

    const escapedMessageClass = escapeCssIdentifier(messageClass);
    const cssRuleLines = [
        `.${escapedMessageClass} .timestamp {`,
        "    color: transparent !important;",
        `    background-size: ${UOH_OSHI_EYES_IMAGE_WIDTH_PX}px ${UOH_TIMESTAMP_IMAGE_HEIGHT_PX}px !important;`,
        `    background-image: url('${UOH_OSHI_EYES_IMAGE_URL}') !important;`,
        "    background-position: center !important;",
        "    background-repeat: no-repeat !important;",
        "}",
        `.${escapedMessageClass} .timestamp + span > strong.username::before {`,
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
    ];

    const cssRule = cssRuleLines.join("\n");

    uohOshiEyesRulesByKey.set(messageAuthor, cssRule);
    renderUohEyesCssRules();
    return true;
}

function shouldApplyUohEyesFromEmoteTitles(rootElement) {
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

        const emoteTitleCompact = emoteTitleNormalized.replace(/:/g, "");
        if (UOH_FROM_TEXTS_NORMALIZED.some((fromTextNormalized) => emoteTitleNormalized.includes(fromTextNormalized))) {
            return true;
        }

        if (UOH_FROM_TEXTS_COMPACT.some((fromTextCompact) => emoteTitleCompact.includes(fromTextCompact))) {
            return true;
        }

        if (UOH_TO_TEXTS_NORMALIZED.some((toTextNormalized) => emoteTitleNormalized.includes(toTextNormalized))) {
            return true;
        }
    }

    return false;
}

function shouldApplyUohEyesFromMessageText(messageText) {
    if (!messageText) {
        return false;
    }

    if (UOH_FROM_REGEX.test(messageText)) {
        return true;
    }

    if (!UOH_TO_TEXTS_NORMALIZED.length) {
        return false;
    }

    const normalizedMessageText = normalizeComparableText(messageText);
    return UOH_TO_TEXTS_NORMALIZED.some((toTextNormalized) => normalizedMessageText.includes(toTextNormalized));
}

// Replacement engine.
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

const TARGET_USER_REPLACEMENT_CONFIG = getReplacementConfig(TARGET_USER_WORD_REPLACEMENTS);
const GLOBAL_REPLACEMENT_CONFIG = getReplacementConfig(ACTIVE_GLOBAL_WORD_REPLACEMENTS);
const TARGET_USERNAME_SET = new Set(
    (Array.isArray(TARGET_USERNAMES) ? TARGET_USERNAMES : [TARGET_USERNAMES])
        .map(normalizeUsername)
        .filter(Boolean)
);

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

function replaceWordsForTargetUser($messageElement, $row = null, messageRootElement = null) {
    if (!TARGET_USER_REPLACEMENT_CONFIG || !TARGET_USERNAME_SET.size) {
        return;
    }

    const $messageRow = $row || getMessageRow($messageElement);
    if (!$messageRow) {
        return;
    }

    const messageAuthor = normalizeUsername(getMessageAuthor($messageRow));
    if (!TARGET_USERNAME_SET.has(messageAuthor)) {
        return;
    }

    const rootElement = messageRootElement || getMessageContentRootElement($messageElement, $messageRow);
    if (!rootElement) {
        return;
    }

    applyReplacementConfigToMessageRoot(rootElement, TARGET_USER_REPLACEMENT_CONFIG);
}

function replaceWordsForAllUsers($messageElement, messageRootElement = null) {
    if (!GLOBAL_REPLACEMENT_CONFIG) {
        return;
    }

    if (!$messageElement || !$messageElement.length) {
        return;
    }

    const rootElement = messageRootElement || getMessageContentRootElement($messageElement);
    if (!rootElement) {
        return;
    }

    applyReplacementConfigToMessageRoot(rootElement, GLOBAL_REPLACEMENT_CONFIG);
}

function replaceWords($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    const messageRootElement = getMessageContentRootElement($messageElement, $row);
    if (!messageRootElement) {
        return;
    }

    const normalizedMessageAuthor = normalizeUsername(getMessageAuthor($row));
    const messageText = messageRootElement.textContent || "";
    if (UOH_MODE_ON) {
        if (
            shouldApplyUohEyesFromMessageText(messageText) ||
            shouldApplyUohEyesFromEmoteTitles(messageRootElement)
        ) {
            const wasActivatedNow = applyUohOshiEyesOverride($row);
            if (wasActivatedNow) {
                applyUohUsernameReplacementPrefixToExistingRows(normalizedMessageAuthor);
            }
        }
    }

    replaceWordsForTargetUser($messageElement, $row, messageRootElement);
    replaceWordsForAllUsers($messageElement, messageRootElement);
    if (UOH_MODE_ON) {
        applyUohUsernameReplacementPrefixToRow($row, normalizedMessageAuthor);
    }
}

(async () => {
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(replaceWords);
})();
