// List of usernames to target
const TARGET_USERNAMES = ["iTako"];

// Anything here will only be replaced if the sender is included in TARGET_USERNAMES
const TARGET_USER_WORD_REPLACEMENTS = [
    { from: "nigga", to: "I'm racist" },
    { from: "niggas", to: "I'm racist" },
    { from: "nigger", to: "I'm very racist" },
    { from: "niggers", to: "I'm very racist" },
    { from: "faggot", to: "I'm homophobic" },
    { from: "faggots", to: "I'm homophobic" },
    { from: "fag", to: "I'm homophobic" },
    { from: "fagg", to: "I'm homophobic" },
    { from: "fuck", to: "****" },
    { from: "fucking", to: "****" },
    { from: "fucked", to: "****" },
    { from: "fucker", to: "****" },
    { from: "shit", to: "****" },
    { from: "bullshit", to: "****" },
    { from: "crap", to: "****" },
    { from: "asshole", to: "****" },
    { from: "ass", to: "****" },
    { from: "bitch", to: "****" },
    { from: "bastard", to: "****" },
    { from: "cunt", to: "****" },
    { from: "dick", to: "****" },
    { from: "cock", to: "****" },
    { from: "pussy", to: "****" },
    { from: "damn", to: "****" },
    { from: "hell", to: "****" },
    { from: "motherfucker", to: "****" },
    { from: "cazzo", to: "****" },
    { from: "cazzi", to: "****" },
    { from: "vaffanculo", to: "****" },
    { from: "vaffa", to: "****" },
    { from: "stronzo", to: "****" },
    { from: "stronza", to: "****" },
    { from: "merda", to: "****" },
    { from: "coglione", to: "****" },
    { from: "coglioni", to: "****" },
    { from: "porca puttana", to: "****" },
    { from: "porca troia", to: "****" },
    { from: "figlio di puttana", to: "****" },
    { from: "minchia", to: "****" },
    { from: "che cazzo", to: "****" },
    { from: "testa di cazzo", to: "****" },
    { from: "porco dio", to: "****" },
    { from: "madonna", to: "****" }
];

// Anything here will be replaced globally regardless of username
const GLOBAL_WORD_REPLACEMENTS = [
    {from: "uoh", to:"I miss the good old days where I would spend weeks on the Epstein Island **** and eating children"}
];

const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const UOH_TRIGGER_LOOKUP_KEY = "uoh";
const UOH_OSHI_EYES_IMAGE_URL = "https://cracklej.win/7OwAi9DnfA.png";
const UOH_OSHI_EYES_STYLE_ID = "user-word-replacement-uoh-eyes-style";
const uohOshiEyesRulesByKey = new Map();

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        return;
    }

    if (uohOshiEyesRulesByKey.has(messageAuthor)) {
        return;
    }

    const escapedMessageClass = escapeCssIdentifier(messageClass);
    const cssRule = [
        `.${escapedMessageClass} .timestamp {`,
        "    color: transparent !important;",
        "    background-size: 50px 15px !important;",
        `    background-image: url('${UOH_OSHI_EYES_IMAGE_URL}') !important;`,
        "    background-position: center !important;",
        "    background-repeat: no-repeat !important;",
        "}"
    ].join("\n");

    uohOshiEyesRulesByKey.set(messageAuthor, cssRule);
    renderUohEyesCssRules();
}

const UOH_GLOBAL_REPLACEMENT_ENTRY =
    getWordReplacementEntryByLookupKey(GLOBAL_WORD_REPLACEMENTS, UOH_TRIGGER_LOOKUP_KEY);
const UOH_FROM_TEXT = String(
    UOH_GLOBAL_REPLACEMENT_ENTRY && UOH_GLOBAL_REPLACEMENT_ENTRY.from != null
        ? UOH_GLOBAL_REPLACEMENT_ENTRY.from
        : UOH_TRIGGER_LOOKUP_KEY
).trim();
const UOH_TO_TEXT = String(
    UOH_GLOBAL_REPLACEMENT_ENTRY && UOH_GLOBAL_REPLACEMENT_ENTRY.to != null
        ? UOH_GLOBAL_REPLACEMENT_ENTRY.to
        : ""
).trim();
const UOH_FROM_REGEX = UOH_FROM_TEXT
    ? new RegExp(`\\b${escapeRegExp(UOH_FROM_TEXT)}\\b`, "i")
    : /\buoh\b/i;
const UOH_TO_TEXT_NORMALIZED = normalizeComparableText(UOH_TO_TEXT);

function shouldApplyUohEyesFromMessageText(messageText) {
    if (!messageText) {
        return false;
    }

    if (UOH_FROM_REGEX.test(messageText)) {
        return true;
    }

    if (!UOH_TO_TEXT_NORMALIZED) {
        return false;
    }

    const normalizedMessageText = normalizeComparableText(messageText);
    return normalizedMessageText.includes(UOH_TO_TEXT_NORMALIZED);
}

function getReplacementConfig(wordReplacements) {
    const replacements = [];
    const seenLookupKeys = new Set();

    for (const entry of wordReplacements || []) {
        if (!entry || entry.from == null || entry.to == null) {
            continue;
        }

        const from = String(entry.from).trim();
        if (!from) {
            continue;
        }

        const lookupKey = from.toLowerCase();
        if (seenLookupKeys.has(lookupKey)) {
            continue;
        }
        seenLookupKeys.add(lookupKey);

        replacements.push({
            from,
            to: String(entry.to),
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
        replacements.map((entry) => [entry.lookupKey, entry.to])
    );

    return { regex, replacementLookup };
}

const TARGET_USER_REPLACEMENT_CONFIG = getReplacementConfig(TARGET_USER_WORD_REPLACEMENTS);
const GLOBAL_REPLACEMENT_CONFIG = getReplacementConfig(GLOBAL_WORD_REPLACEMENTS);
const TARGET_USERNAME_SET = new Set(
    (Array.isArray(TARGET_USERNAMES) ? TARGET_USERNAMES : [TARGET_USERNAMES])
        .map(normalizeUsername)
        .filter(Boolean)
);

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

    const usernameText = $row.find("strong.username").first().text();
    if (usernameText) {
        return usernameText.replace(/:\s*$/, "").trim();
    }

    const className = ($row.attr("class") || "")
        .split(/\s+/)
        .find((cls) => cls.startsWith("chat-msg-"));

    if (!className) {
        return "";
    }

    return className.slice("chat-msg-".length).trim();
}

function isServerMessageRow($row) {
    if (!$row || !$row.length) {
        return false;
    }

    return ($row.attr("class") || "")
        .split(/\s+/)
        .some((cls) => cls === "chat-msg-$server$");
}

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
            (matchedText) =>
                replacementConfig.replacementLookup[matchedText.toLowerCase()] || matchedText
        );

        if (newText !== originalText) {
            textNode.nodeValue = newText;
        }
    }
}

function replaceWordsForTargetUser($messageElement) {
    if (!TARGET_USER_REPLACEMENT_CONFIG) {
        return;
    }

    if (!TARGET_USERNAME_SET.size) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row) {
        return;
    }

    const messageAuthor = normalizeUsername(getMessageAuthor($row));
    if (!TARGET_USERNAME_SET.has(messageAuthor)) {
        return;
    }

    replaceTextNodes($messageElement[0], TARGET_USER_REPLACEMENT_CONFIG);
}

function replaceWordsForAllUsers($messageElement) {
    if (!GLOBAL_REPLACEMENT_CONFIG) {
        return;
    }

    if (!$messageElement || !$messageElement.length) {
        return;
    }

    replaceTextNodes($messageElement[0], GLOBAL_REPLACEMENT_CONFIG);
}

function replaceWords($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    if (shouldApplyUohEyesFromMessageText($messageElement.text())) {
        applyUohOshiEyesOverride($row);
    }

    replaceWordsForTargetUser($messageElement);
    replaceWordsForAllUsers($messageElement);
}

(async () => {
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(replaceWords);
})();
