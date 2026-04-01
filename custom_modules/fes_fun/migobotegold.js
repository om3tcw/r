const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const GOLD_ACTIVE_ROW_CLASS = "migobotegold-active";
const GOLD_ACTIVE_USERLIST_CLASS = "migobotegold-userlist-active";
const GOLD_TRIGGER_EMOTE_TITLE = ":gargolden:";
const GOLD_TIMESTAMP_ICON_URL = "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/gargolden.png";
const GOLD_ICON_SIZE_PX = 16;
const GOLD_ICON_OFFSET_PX = 3;
const GOLD_ICON_GAP_PX = 3;
const GOLD_EMOTE_TRIGGER_ENABLED = false;
const ChatModuleUtils = window.CHAT_MODULE_UTILS;
const fesFun = window.fesFun;

if (!ChatModuleUtils) {
    throw new Error("[MigoboteGold] CHAT_MODULE_UTILS is not available");
}
if (!fesFun) {
    throw new Error("[MigoboteGold] fesFun controller is not available");
}

const {
    escapeRegExp,
    getEmoteNodesFromRoot,
    getMessageAuthor,
    getMessageContentRootElement,
    getMessageRow,
    getTextWithEmoteTitles,
    isAuthorAllowed,
    isServerMessageRow,
    normalizeUsername,
    postStatusSystemMessage,
    setMessageRowsClassByUsername,
    setUserlistNameClassByUsername
} = ChatModuleUtils;

const GOLD_COMMAND_ALLOWED_USERS = [];
const GOLD_COMMAND_MIN_RANK =
    typeof Rank !== "undefined" && Rank && Rank.Moderator != null
        ? Rank.Moderator
        : 2;
const GOLD_COMMAND_ALLOW_SELF = false;

const goldUsersByKey = new Map();
let isMigoboteGoldEnabled = true;
let isGoldMessageHandlerAttached = false;

const GOLD_COMMAND_ALLOWED_USER_SET = new Set(
    GOLD_COMMAND_ALLOWED_USERS
        .map(normalizeUsername)
        .filter(Boolean)
);
let goldUserlistObserver = null;

function applyMigoboteGoldCssVariables() {
    const rootElement = document.documentElement;
    if (!rootElement || !rootElement.style) {
        return;
    }

    rootElement.style.setProperty(
        "--migobotegold-timestamp-icon-url",
        `url("${GOLD_TIMESTAMP_ICON_URL}")`
    );
    rootElement.style.setProperty(
        "--migobotegold-icon-size",
        `${GOLD_ICON_SIZE_PX}px`
    );
    rootElement.style.setProperty(
        "--migobotegold-icon-offset",
        `${GOLD_ICON_OFFSET_PX}px`
    );
    rootElement.style.setProperty(
        "--migobotegold-icon-gap",
        `${GOLD_ICON_GAP_PX}px`
    );
}

function normalizeGoldCommandTarget(rawTarget) {
    const trimmedTarget = String(rawTarget || "").trim();
    if (!trimmedTarget) {
        return "";
    }

    const emoteWrappedTargetMatch = trimmedTarget.match(/^:([^:\s]+):$/);
    if (emoteWrappedTargetMatch) {
        return String(emoteWrappedTargetMatch[1] || "").trim();
    }

    return trimmedTarget;
}

const GOLD_TRIGGER_TEXT_REGEX = new RegExp(
    `(^|\\s)${escapeRegExp(GOLD_TRIGGER_EMOTE_TITLE)}($|\\s)`,
    "i"
);

function syncGoldVisualStateForUser(username, shouldEnable) {
    setMessageRowsClassByUsername(
        username,
        GOLD_ACTIVE_ROW_CLASS,
        shouldEnable,
        { messageBufferSelector: MESSAGE_BUFFER_SELECTOR }
    );
    setUserlistNameClassByUsername(
        username,
        GOLD_ACTIVE_USERLIST_CLASS,
        shouldEnable
    );
}

function syncAllGoldUserlistState() {
  for (const userState of goldUsersByKey.values()) {
    if (!userState || !userState.displayName) {
      continue;
    }

    setUserlistNameClassByUsername(
        userState.displayName,
        GOLD_ACTIVE_USERLIST_CLASS,
        true
    );
  }
}

function clearGoldVisualState() {
    $(`${MESSAGE_BUFFER_SELECTOR} > div.${GOLD_ACTIVE_ROW_CLASS}`).removeClass(
        GOLD_ACTIVE_ROW_CLASS
    );
    $(`#userlist .${GOLD_ACTIVE_USERLIST_CLASS}`).removeClass(
        GOLD_ACTIVE_USERLIST_CLASS
    );
}

function clearGoldRuntimeState() {
    goldUsersByKey.clear();
    clearGoldVisualState();
}

function postGoldStatusSystemMessage(message) {
    postStatusSystemMessage(message, {
        messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
        rowClass: "migobotegold-system-message"
    });
}

function postGoldSystemMessage(username) {
    const safeUsername = String(username || "").trim();
    if (!safeUsername) {
        return;
    }

    postGoldStatusSystemMessage(
        `System: "${safeUsername}" has purchased Mikobote Gold! Thanks for your support!`
    );
}

function postGoldRemovalSystemMessage(username) {
    const safeUsername = String(username || "").trim();
    if (!safeUsername) {
        return;
    }

    postGoldStatusSystemMessage(
        `System: "${safeUsername}'s" Card bounced, as such they are no longer a Mikobote Gold member. Broke ass.`
    );
}

function activateGoldForUser(username, shouldAnnounce = true) {
    const displayName = String(username || "").trim();
    const userKey = normalizeUsername(displayName);
    if (!displayName || !userKey) {
        return false;
    }

    const existingState = goldUsersByKey.get(userKey);
    if (existingState) {
        if (displayName && displayName !== existingState.displayName) {
            existingState.displayName = displayName;
            syncGoldVisualStateForUser(displayName, true);
        }
        return false;
    }

    goldUsersByKey.set(userKey, {
        displayName
    });

    syncGoldVisualStateForUser(displayName, true);
    if (shouldAnnounce) {
        postGoldSystemMessage(displayName);
    }

    return true;
}

function deactivateGoldForUser(usernameOrKey, shouldAnnounce = true) {
    const userKey = normalizeUsername(usernameOrKey);
    if (!userKey || !goldUsersByKey.has(userKey)) {
        return false;
    }

    const existingState = goldUsersByKey.get(userKey);
    goldUsersByKey.delete(userKey);
    syncGoldVisualStateForUser(
        existingState && existingState.displayName
            ? existingState.displayName
            : usernameOrKey,
        false
    );

    if (shouldAnnounce) {
        postGoldRemovalSystemMessage(
            existingState && existingState.displayName ? existingState.displayName : String(usernameOrKey || "").trim()
        );
    }

    return true;
}

function isGoldCommandAllowedForAuthor(authorUsername) {
    return isAuthorAllowed(authorUsername, {
        allowedUsers: GOLD_COMMAND_ALLOWED_USER_SET,
        minRank: GOLD_COMMAND_MIN_RANK,
        allowSelf: GOLD_COMMAND_ALLOW_SELF
    });
}

function parseGoldCommand(messageText, messageRootElement = null) {
    const candidateMessages = [
        String(messageText || ""),
        getTextWithEmoteTitles(messageRootElement)
    ];

    for (const rawCandidate of candidateMessages) {
        const trimmedMessage = String(rawCandidate || "").trim();
        if (!trimmedMessage) {
            continue;
        }

        const commandMatch = trimmedMessage.match(/^\/(setgold|unsetgold)\s+(.+)$/i);
        if (!commandMatch) {
            continue;
        }

        const action = String(commandMatch[1] || "").trim().toLowerCase();
        const commandArgument = String(commandMatch[2] || "").trim();
        if (!commandArgument) {
            continue;
        }

        // Cytube usernames generally do not contain spaces; keep the parser strict.
        const firstToken = commandArgument.split(/\s+/)[0];
        const normalizedTarget = normalizeGoldCommandTarget(firstToken);
        if (normalizedTarget) {
            return {
                action: action === "unsetgold" ? "unset" : "set",
                targetUsername: normalizedTarget
            };
        }
    }

    return null;
}

function isGoldCommandAttempt(messageText, messageRootElement = null) {
    const candidateMessages = [
        String(messageText || ""),
        getTextWithEmoteTitles(messageRootElement)
    ];

    return candidateMessages.some((rawCandidate) => {
        const trimmedMessage = String(rawCandidate || "").trim();
        if (!trimmedMessage) {
            return false;
        }

        return /^\/(?:setgold|unsetgold)\b/i.test(trimmedMessage);
    });
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

function processBacklogMessage($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    if (!isMigoboteGoldEnabled || !goldUsersByKey.size) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    const messageRootElement = getMessageContentRootElement($messageElement, {
        $row,
        messageBufferSelector: MESSAGE_BUFFER_SELECTOR
    });
    if (!messageRootElement) {
        return;
    }

    const messageText = String(messageRootElement.textContent || "");
    if (parseGoldCommand(messageText, messageRootElement)) {
        return;
    }

    const messageAuthor = getMessageAuthor($row);
    if (!goldUsersByKey.has(normalizeUsername(messageAuthor))) {
        return;
    }

    $row[0].classList.add(GOLD_ACTIVE_ROW_CLASS);
    setUserlistNameClassByUsername(
        messageAuthor,
        GOLD_ACTIVE_USERLIST_CLASS,
        true
    );
}

function rescanExistingMessagesForGoldState() {
    if (!isMigoboteGoldEnabled || !goldUsersByKey.size) {
        return Promise.resolve(0);
    }

    return fesFun.runBacklogScan(processBacklogMessage);
}

function handleGoldStateMessage($messageElement) {
    if (!$messageElement || !$messageElement.length) {
        return;
    }

    if (!isMigoboteGoldEnabled) {
        return;
    }

    const $row = getMessageRow($messageElement);
    if (!$row || isServerMessageRow($row)) {
        return;
    }

    const messageAuthor = getMessageAuthor($row);
    const messageRootElement = getMessageContentRootElement($messageElement, {
        $row,
        messageBufferSelector: MESSAGE_BUFFER_SELECTOR
    });
    if (!messageRootElement) {
        return;
    }

    if (goldUsersByKey.has(normalizeUsername(messageAuthor))) {
        $row[0].classList.add(GOLD_ACTIVE_ROW_CLASS);
        setUserlistNameClassByUsername(
            messageAuthor,
            GOLD_ACTIVE_USERLIST_CLASS,
            true
        );
    }

    const messageText = String(messageRootElement.textContent || "");
    const isCommandAttempt = isGoldCommandAttempt(messageText, messageRootElement);
    const parsedCommand = parseGoldCommand(messageText, messageRootElement);
    const isAuthorAllowed = isGoldCommandAllowedForAuthor(messageAuthor);

    if (parsedCommand) {
        if (isAuthorAllowed) {
            if (parsedCommand.action === "set") {
                activateGoldForUser(parsedCommand.targetUsername, true);
            } else {
                deactivateGoldForUser(parsedCommand.targetUsername, true);
            }
        }
        // Hide gold commands from local chat view (authorized or unauthorized).
        $row.remove();
        return;
    }

    if (isCommandAttempt && !isAuthorAllowed) {
        // Hide unauthorized command attempts even when malformed (e.g. /setgold with no target).
        $row.remove();
        return;
    }

    if (GOLD_EMOTE_TRIGGER_ENABLED && messageContainsGoldTrigger(messageRootElement, messageText)) {
        activateGoldForUser(messageAuthor, true);
    }
}

function setMigoboteGoldEnabled(nextEnabled) {
    const desiredEnabled = Boolean(nextEnabled);
    if (desiredEnabled === isMigoboteGoldEnabled) {
        return isMigoboteGoldEnabled;
    }

    isMigoboteGoldEnabled = desiredEnabled;
    if (isMigoboteGoldEnabled) {
        syncAllGoldUserlistState();
        rescanExistingMessagesForGoldState();
        return isMigoboteGoldEnabled;
    }

    clearGoldVisualState();
    return isMigoboteGoldEnabled;
}

function getGoldState() {
    return {
        enabled: isMigoboteGoldEnabled,
        activeUsers: goldUsersByKey.size,
        commandMinRank: GOLD_COMMAND_MIN_RANK,
        allowedUsers: Array.from(GOLD_COMMAND_ALLOWED_USER_SET),
        allowSelf: GOLD_COMMAND_ALLOW_SELF
    };
}

const migoboteGoldApi = {
    getState: getGoldState,
    toggle(on) {
        const desiredEnabled = Boolean(on);
        if (desiredEnabled && !fesFun.isEnabled()) {
            return false;
        }

        return setMigoboteGoldEnabled(desiredEnabled);
    }
};

window.migoboteGold = migoboteGoldApi;

function attachGoldUserlistObserver() {
    const userlistElement = document.getElementById("userlist");
    if (!userlistElement || goldUserlistObserver) {
        return;
    }

    goldUserlistObserver = new MutationObserver(() => {
        if (!goldUsersByKey.size) {
            return;
        }

        syncAllGoldUserlistState();
    });
    goldUserlistObserver.observe(userlistElement, {
        childList: true,
        subtree: true,
    });
}

(async () => {
    applyMigoboteGoldCssVariables();
    fesFun.registerModule({
        id: "migoboteGold",
        setEnabled: setMigoboteGoldEnabled,
        getState: getGoldState
    });
    await window.waitForFunc("MESSAGE_PROCESSOR");
    attachGoldUserlistObserver();
    if (isGoldMessageHandlerAttached) {
        return;
    }

    fesFun.registerLiveMessageHandler(handleGoldStateMessage);
    isGoldMessageHandlerAttached = true;
})();
