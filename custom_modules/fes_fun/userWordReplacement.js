// Username-scoped and global chat word replacement module.
// List of usernames to target
const TARGET_USERNAMES = [];

// Anything here will only be replaced if the sender is included in TARGET_USERNAMES.
// Emotes can be matched by their exact title (e.g. ":uoh:").
// For emote-only image swaps, use toImage: { from: ":uoh:", toImage: "https://..." }.
const TARGET_USER_WORD_REPLACEMENTS = [
    { from: "Fuck", to: "Fork" },
    { from: "Fucking", to: "Forking" },
    { from: "Ass", to: "Ash" },
    { from: "Asshole", to: "Ashhole" },
    { from: "Shit", to: "Shoot" },
    { from: "Slop", to: "Kino" }
    
];

// Anything here will be replaced globally regardless of username.
// Emotes can be matched by their exact title (e.g. ":uoh:").
// For emote-only image swaps, use toImage: { from: ":uoh:", toImage: "https://..." }.
const GLOBAL_WORD_REPLACEMENTS = [
    { from: "football", to: "headball" },
    { from: "futball", to: "headball" },
    { from: "f o o t b a l l", to: "headball" },
    { from: "f  o  o  t  b  a  l  l", to: "headball" },
    { from: "f00tball", to: "headball" },
    { from: "f0otball", to: "headball" },
    { from: "fo0tball", to: "headball" },
    { from: "footb&ll", to: "headball" },
    { from: "soccer", to: "headball" },
    { from: "footy", to: "heady" },
    { from: "footie", to: "headie" }
];

const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const fesFun = window.fesFun;

if (!fesFun) {
    throw new Error("[UserWordReplacement] fesFun controller is not available");
}

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
const GLOBAL_REPLACEMENT_CONFIG = getReplacementConfig(GLOBAL_WORD_REPLACEMENTS);
const TARGET_USERNAME_SET = new Set(
    (Array.isArray(TARGET_USERNAMES) ? TARGET_USERNAMES : [TARGET_USERNAMES])
        .map(normalizeUsername)
        .filter(Boolean)
);
const HAS_ANY_TARGET_REPLACEMENTS =
    TARGET_USERNAME_SET.size > 0 && TARGET_USER_REPLACEMENT_CONFIG != null;
const HAS_ANY_GLOBAL_REPLACEMENTS = GLOBAL_REPLACEMENT_CONFIG != null;
const SHOULD_ATTACH_WORD_REPLACEMENT =
    HAS_ANY_TARGET_REPLACEMENTS || HAS_ANY_GLOBAL_REPLACEMENTS;

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

    replaceWordsForTargetUser($messageElement, $row, messageRootElement);
    replaceWordsForAllUsers($messageElement, messageRootElement);
}

(async () => {
    if (!SHOULD_ATTACH_WORD_REPLACEMENT) {
        return;
    }

    await window.waitForFunc("MESSAGE_PROCESSOR");
    fesFun.registerLiveMessageHandler(replaceWords);
})();
