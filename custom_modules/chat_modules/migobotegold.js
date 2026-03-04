const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const GOLD_STYLE_ID = "migobotegold-style";
const GOLD_TRIGGER_EMOTE_TITLE = ":gargolden:";
const GOLD_TIMESTAMP_ICON_URL = "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/gargolden.png";
const GOLD_ICON_SIZE_PX = 16;
const GOLD_ICON_OFFSET_PX = 3;
const GOLD_ICON_GAP_PX = 3;

const GOLD_COMMAND_ALLOWED_USERS = [
    "Crackerjack"
];

const GOLD_COMMAND_ALLOW_SELF = false;

const goldUsersByKey = new Map();
const goldRulesByKey = new Map();
const knownMessageClassByUserKey = new Map();
let isInitialMessageScanComplete = false;

const GOLD_USERNAME_SHEEN_KEYFRAMES = "migobotegold-username-sheen";
const GOLD_EYES_SHEEN_KEYFRAMES = "migobotegold-eyes-sheen";
const GOLD_SHARED_CSS_RULES = [
    `@keyframes ${GOLD_USERNAME_SHEEN_KEYFRAMES} {`,
    "    0% { background-position: 200% 50%; }",
    "    100% { background-position: -200% 50%; }",
    "}",
    `@keyframes ${GOLD_EYES_SHEEN_KEYFRAMES} {`,
    "    0% { filter: sepia(1) saturate(4.2) hue-rotate(-8deg) brightness(1.02) contrast(1.05); }",
    "    55% { filter: sepia(1) saturate(5.0) hue-rotate(-10deg) brightness(1.28) contrast(1.08); }",
    "    100% { filter: sepia(1) saturate(4.2) hue-rotate(-8deg) brightness(1.02) contrast(1.05); }",
    "}"
].join("\n");

const GOLD_COMMAND_ALLOWED_USER_SET = new Set(
    GOLD_COMMAND_ALLOWED_USERS
        .map(normalizeUsername)
        .filter(Boolean)
);

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function escapeRegExp(text) {
    return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeCssIdentifier(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

function getMessageRow($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return null;
    }

    const $row = $messageElement.closest(`${MESSAGE_BUFFER_SELECTOR} > div`);
    return $row.length ? $row : null;
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

function getMessageAuthor($row) {
    if (!$row || !$row.length) {
        return "";
    }

    const classDerivedAuthor = getMessageAuthorFromClassName($row);
    if (classDerivedAuthor) {
        return classDerivedAuthor;
    }

    const usernameText = $row.find("strong.username").first().text();
    if (!usernameText) {
        return "";
    }

    return usernameText.replace(/:\s*$/, "").trim();
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
    if (rootElement.matches && rootElement.matches("img.channel-emote[title]")) {
        emoteNodes.push(rootElement);
    }

    if (typeof rootElement.querySelectorAll === "function") {
        emoteNodes.push(...rootElement.querySelectorAll("img.channel-emote[title]"));
    }

    return emoteNodes;
}

const GOLD_TRIGGER_TEXT_REGEX = new RegExp(
    `(^|\\s)${escapeRegExp(GOLD_TRIGGER_EMOTE_TITLE)}($|\\s)`,
    "i"
);

function getOrCreateGoldStyleElement() {
    let styleElement = document.getElementById(GOLD_STYLE_ID);
    if (styleElement) {
        return styleElement;
    }

    styleElement = document.createElement("style");
    styleElement.id = GOLD_STYLE_ID;
    document.head.appendChild(styleElement);
    return styleElement;
}

function renderGoldCssRules() {
    const styleElement = getOrCreateGoldStyleElement();
    styleElement.textContent = [
        GOLD_SHARED_CSS_RULES,
        Array.from(goldRulesByKey.values()).join("\n")
    ].join("\n");
}

function getUserlistClassName(username, messageClassName = "") {
    const safeUsername = String(username || "").trim();
    if (safeUsername) {
        return `userlist-${safeUsername.replace(/[^\w-]/g, "\\$")}`;
    }

    const classSuffix = String(messageClassName || "").trim().replace(/^chat-msg-/, "");
    if (!classSuffix) {
        return "";
    }

    return `userlist-${classSuffix.replace(/[^\w-]/g, "\\$")}`;
}

function buildGoldCssRuleForClass(messageClassName, username = "") {
    const escapedClass = escapeCssIdentifier(messageClassName);
    const userlistClassName = getUserlistClassName(username, messageClassName);
    const escapedUserlistClass = userlistClassName ? escapeCssIdentifier(userlistClassName) : "";
    const iconSpanPaddingPx = GOLD_ICON_SIZE_PX + GOLD_ICON_OFFSET_PX + GOLD_ICON_GAP_PX;

    const cssRuleLines = [
        `.${escapedClass} .timestamp {`,
        "    position: relative !important;",
        `    animation: ${GOLD_EYES_SHEEN_KEYFRAMES} 2.2s ease-in-out infinite !important;`,
        "    text-shadow: 0 0 3px rgba(255, 214, 122, 0.7) !important;",
        "}",
        `.${escapedClass} .timestamp::after {`,
        "    content: '' !important;",
        "    position: absolute !important;",
        "    top: 50% !important;",
        "    left: 100% !important;",
        `    width: ${GOLD_ICON_SIZE_PX}px !important;`,
        `    height: ${GOLD_ICON_SIZE_PX}px !important;`,
        `    transform: translate(${GOLD_ICON_OFFSET_PX}px, -50%) !important;`,
        `    background: url('${GOLD_TIMESTAMP_ICON_URL}') center / contain no-repeat !important;`,
        "    pointer-events: none !important;",
        "}",
        `.${escapedClass} .timestamp + span {`,
        `    padding-left: ${iconSpanPaddingPx}px !important;`,
        "}",
        `.${escapedClass} .timestamp + span > strong.username {`,
        "    color: #f6dd9a !important;",
        "    background-image: linear-gradient(115deg, #7d5a1b 0%, #fff4cd 42%, #e0ae4f 52%, #fff8da 60%, #7d5a1b 100%) !important;",
        "    background-size: 220% 100% !important;",
        "    background-repeat: no-repeat !important;",
        "    -webkit-background-clip: text !important;",
        "    background-clip: text !important;",
        "    -webkit-text-fill-color: transparent !important;",
        `    animation: ${GOLD_USERNAME_SHEEN_KEYFRAMES} 2.5s linear infinite !important;`,
        "    filter: drop-shadow(0.5px 0.5px 0.5px #d6a441) !important;",
        "    text-shadow: 0 0 1.5px rgba(255, 213, 118, 0.35) !important;",
        "}"
    ];

    if (escapedUserlistClass) {
        cssRuleLines.push(
            `.${escapedUserlistClass} {`,
            "    color: rgb(255, 214, 122) !important;",
            "}"
        );
    }

    return cssRuleLines.join("\n");
}

function postGoldSystemMessage(username) {
    const safeUsername = String(username || "").trim();
    if (!safeUsername) {
        return;
    }

    const message = `System: "${safeUsername}" has purchased Mikobote Gold! Thanks for your support!`;
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
        class: "chat-msg-$server$ migobotegold-system-message"
    });

    $("<span>", {
        class: "timestamp server-whisper",
        text: formattedTimestamp
    }).appendTo($fakeSystemRow);

    $("<span>", {
        class: "server-whisper",
        text: message
    }).appendTo($fakeSystemRow);

    $messageBuffer.append($fakeSystemRow);
    if (shouldAutoScroll) {
        messageBufferElement.scrollTop = messageBufferElement.scrollHeight;
    }
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

function getFallbackMessageClassForUsername(username) {
    return `chat-msg-${String(username || "").trim()}`;
}

function upsertGoldRuleForUser(userKey) {
    const userState = goldUsersByKey.get(userKey);
    if (!userState || !userState.messageClassName) {
        return;
    }

    const cssRule = buildGoldCssRuleForClass(userState.messageClassName, userState.displayName);
    goldRulesByKey.set(userKey, cssRule);
    renderGoldCssRules();
}

function activateGoldForUser(username, messageClassName = "", shouldAnnounce = true) {
    const displayName = String(username || "").trim();
    const userKey = normalizeUsername(displayName);
    if (!displayName || !userKey) {
        return false;
    }

    const existingState = goldUsersByKey.get(userKey);
    const resolvedClassName = String(
        messageClassName ||
        (existingState && existingState.messageClassName) ||
        findMessageClassForUsername(displayName) ||
        getFallbackMessageClassForUsername(displayName)
    ).trim();

    if (existingState) {
        const needsClassUpdate = resolvedClassName && resolvedClassName !== existingState.messageClassName;
        if (!needsClassUpdate) {
            return false;
        }

        existingState.messageClassName = resolvedClassName;
        upsertGoldRuleForUser(userKey);
        return false;
    }

    goldUsersByKey.set(userKey, {
        displayName,
        messageClassName: resolvedClassName
    });

    upsertGoldRuleForUser(userKey);
    if (shouldAnnounce) {
        postGoldSystemMessage(displayName);
    }

    return true;
}

function isGoldCommandAllowedForAuthor(authorUsername) {
    const normalizedAuthor = normalizeUsername(authorUsername);
    if (!normalizedAuthor) {
        return false;
    }

    if (GOLD_COMMAND_ALLOWED_USER_SET.has(normalizedAuthor)) {
        return true;
    }

    if (!GOLD_COMMAND_ALLOW_SELF) {
        return false;
    }

    const normalizedClientName = normalizeUsername(window.CLIENT && CLIENT.name ? CLIENT.name : "");
    return normalizedClientName && normalizedClientName === normalizedAuthor;
}

function parseSetGoldCommand(messageText) {
    const trimmedMessage = String(messageText || "").trim();
    const commandMatch = trimmedMessage.match(/^\/setgold\s+(.+)$/i);
    if (!commandMatch) {
        return "";
    }

    const commandArgument = String(commandMatch[1] || "").trim();
    if (!commandArgument) {
        return "";
    }

    // Cytube usernames generally do not contain spaces; keep the parser strict.
    const firstToken = commandArgument.split(/\s+/)[0];
    return String(firstToken || "").trim();
}

function messageContainsGoldTrigger(messageRootElement, messageText) {
    const normalizedTriggerTitle = normalizeUsername(GOLD_TRIGGER_EMOTE_TITLE);
    const emoteNodes = getEmoteNodesFromRoot(messageRootElement);

    for (const emoteNode of emoteNodes) {
        const emoteTitle = normalizeUsername(
            emoteNode && typeof emoteNode.getAttribute === "function"
                ? emoteNode.getAttribute("title")
                : ""
        );

        if (emoteTitle && emoteTitle === normalizedTriggerTitle) {
            return true;
        }
    }

    return GOLD_TRIGGER_TEXT_REGEX.test(String(messageText || ""));
}

function rememberObservedMessageClass(authorUsername, messageClassName) {
    const authorKey = normalizeUsername(authorUsername);
    if (!authorKey || !messageClassName) {
        return;
    }

    knownMessageClassByUserKey.set(authorKey, messageClassName);

    const existingState = goldUsersByKey.get(authorKey);
    if (!existingState) {
        return;
    }

    if (existingState.messageClassName === messageClassName) {
        return;
    }

    existingState.messageClassName = messageClassName;
    upsertGoldRuleForUser(authorKey);
}

function handleGoldStateMessage($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    const messageAuthor = getMessageAuthor($row);
    const messageClassName = getMessageClassName($row);
    rememberObservedMessageClass(messageAuthor, messageClassName);

    const messageRootElement = getMessageContentRootElement($messageElement, $row);
    if (!messageRootElement) {
        return;
    }

    const messageText = String(messageRootElement.textContent || "");
    const targetFromCommand = parseSetGoldCommand(messageText);

    if (!isInitialMessageScanComplete) {
        // Hide historic /setgold commands from backlog on first attach.
        if (targetFromCommand) {
            $row.remove();
        }
        return;
    }

    if (targetFromCommand) {
        if (isGoldCommandAllowedForAuthor(messageAuthor)) {
            activateGoldForUser(targetFromCommand, findMessageClassForUsername(targetFromCommand), true);
            // Hide successfully applied gold commands from local chat view.
            $row.remove();
        }
        return;
    }

    if (messageContainsGoldTrigger(messageRootElement, messageText)) {
        activateGoldForUser(messageAuthor, messageClassName, true);
    }
}

(async () => {
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(handleGoldStateMessage);
    isInitialMessageScanComplete = true;
})();
