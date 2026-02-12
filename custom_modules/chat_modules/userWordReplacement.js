const TARGET_USERNAME = "iTako";

const WORD_REPLACEMENTS = [
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

const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getReplacementConfig() {
    const replacements = WORD_REPLACEMENTS
        .filter((entry) => entry && entry.from && entry.to)
        .map((entry) => ({
            from: String(entry.from),
            to: String(entry.to),
            lookupKey: String(entry.from).toLowerCase()
        }))
        .sort((a, b) => b.from.length - a.from.length);

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

const REPLACEMENT_CONFIG = getReplacementConfig();
const TARGET_USERNAME_NORMALIZED = normalizeUsername(TARGET_USERNAME);

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
    if (!REPLACEMENT_CONFIG) {
        return;
    }

    if (!TARGET_USERNAME_NORMALIZED) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row) {
        return;
    }

    const messageAuthor = normalizeUsername(getMessageAuthor($row));
    if (messageAuthor !== TARGET_USERNAME_NORMALIZED) {
        return;
    }

    replaceTextNodes($messageElement[0], REPLACEMENT_CONFIG);
}

(async () => {
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(replaceWordsForTargetUser);
})();
