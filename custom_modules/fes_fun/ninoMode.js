const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const VIDEOWRAP_SELECTOR = "#videowrap";
const MAIN_TAB_CONTAINER_SELECTOR = "#MainTabContainer";
const USERLIST_SELECTOR = "#userlist";
const NINOMODE_PANEL_ID = "ninomode-panel";
const NINOMODE_STATUS_ID = "ninomode-status";
const NINOMODE_EMPTY_STATE_ID = "ninomode-empty-state";
const NINOMODE_BUFFER_ID = "ninomode-buffer";
const NINOMODE_COMMAND_REGEX = /^(?:!|\/|\.\/)ninomode\b/i;
const NINOMODE_DEFAULT_MAX_ROWS = 100;
const NINOMODE_COMMAND_ALLOWED_USERS = [];
const NINOMODE_COMMAND_MIN_RANK =
  typeof Rank !== "undefined" && Rank && Rank.Moderator != null
    ? Rank.Moderator
    : 2;
const NINOMODE_DEFAULT_TARGET_USERNAMES = ["Ninovalt"];
const ChatModuleUtils = window.CHAT_MODULE_UTILS;
const fesFun = window.fesFun;

if (!ChatModuleUtils) {
  throw new Error("[NinoMode] CHAT_MODULE_UTILS is not available");
}

if (!fesFun) {
  throw new Error("[NinoMode] fesFun controller is not available");
}

const {
  findUserlistRowByUsername,
  getMessageAuthor,
  getMessageContentRootElement,
  getMessageRow,
  isAuthorAllowed,
  isServerMessageRow,
  normalizeUsername,
} = ChatModuleUtils;

const NINOMODE_COMMAND_ALLOWED_USER_SET = new Set(
  NINOMODE_COMMAND_ALLOWED_USERS.map(normalizeUsername).filter(Boolean),
);

let isNinoModuleEnabled = true;
let isNinoModeEnabled = false;
let isNinoMessageHandlerAttached = false;
let ninomodeUserlistObserver = null;
let panelElements = null;
let ninoTargetsByKey = createTargetMap(NINOMODE_DEFAULT_TARGET_USERNAMES);
const extractedRows = [];

function createTargetMap(usernames) {
  const targetMap = new Map();

  for (const username of usernames || []) {
    const displayName = String(username || "").trim();
    const userKey = normalizeUsername(displayName);
    if (!displayName || !userKey || targetMap.has(userKey)) {
      continue;
    }

    targetMap.set(userKey, {
      displayName,
    });
  }

  return targetMap;
}

function normalizeTargetListInput(rawInput) {
  const targetList = [];
  const seenTargets = new Set();
  const splitPattern = String(rawInput || "").includes(",") ? "," : /\s+/;

  for (const rawTarget of String(rawInput || "").split(splitPattern)) {
    const displayName = String(rawTarget || "")
      .trim()
      .replace(/^,+|,+$/g, "");
    const userKey = normalizeUsername(displayName);
    if (!displayName || !userKey || seenTargets.has(userKey)) {
      continue;
    }

    seenTargets.add(userKey);
    targetList.push(displayName);
  }

  return targetList;
}

function areTargetMapsEqual(leftTargetsByKey, rightTargetsByKey) {
  if (leftTargetsByKey.size !== rightTargetsByKey.size) {
    return false;
  }

  for (const userKey of leftTargetsByKey.keys()) {
    if (!rightTargetsByKey.has(userKey)) {
      return false;
    }
  }

  return true;
}

function getTrackedTargetUsernames() {
  return Array.from(ninoTargetsByKey.values()).map(
    (targetState) => targetState.displayName,
  );
}

function hasTrackedTargets() {
  return ninoTargetsByKey.size > 0;
}

function isTrackedTargetUsername(username) {
  return ninoTargetsByKey.has(normalizeUsername(username));
}

function isTrackedTargetConnected(username) {
  const $targetRow = findUserlistRowByUsername(username, {
    userlistSelector: `${USERLIST_SELECTOR} .userlist_item`,
  });

  return Boolean($targetRow && $targetRow.length);
}

function getConnectedTargetUsernames() {
  return getTrackedTargetUsernames().filter((username) =>
    isTrackedTargetConnected(username),
  );
}

function hasConnectedTrackedTargets() {
  return getConnectedTargetUsernames().length > 0;
}

function getMessageBufferElement() {
  return document.querySelector(MESSAGE_BUFFER_SELECTOR);
}

function getVideoWrapElement() {
  return document.querySelector(VIDEOWRAP_SELECTOR);
}

function isNinoModeCommandAttempt(messageText) {
  return NINOMODE_COMMAND_REGEX.test(String(messageText || "").trim());
}

function isCommandAllowedForAuthor(authorUsername) {
  return isAuthorAllowed(authorUsername, {
    allowedUsers: NINOMODE_COMMAND_ALLOWED_USER_SET,
    minRank: NINOMODE_COMMAND_MIN_RANK,
  });
}

function isRowAlreadyExtracted(rowElement) {
  return extractedRows.some((entry) => entry.rowElement === rowElement);
}

function formatTrackedTargetsForDisplay(usernames = getTrackedTargetUsernames()) {
  if (!Array.isArray(usernames) || !usernames.length) {
    return "nobody";
  }

  if (usernames.length <= 3) {
    return usernames.join(", ");
  }

  const visibleTargets = usernames.slice(0, 3).join(", ");
  return `${visibleTargets} (+${usernames.length - 3} more)`;
}

function getPanelInsertionAnchor() {
  const mainTabContainer = document.querySelector(MAIN_TAB_CONTAINER_SELECTOR);
  if (mainTabContainer) {
    return {
      parentNode: mainTabContainer.parentNode,
      referenceNode: mainTabContainer,
    };
  }

  const videoWrap = getVideoWrapElement();
  if (!videoWrap) {
    return null;
  }

  return {
    parentNode: videoWrap,
    referenceNode: null,
  };
}

function createPanelElement() {
  const panel = document.createElement("div");
  panel.id = NINOMODE_PANEL_ID;
  panel.className = "panel panel-default";

  const heading = document.createElement("div");
  heading.className = "panel-heading";
  heading.textContent = "Nino Containment";

  const statusLabel = document.createElement("span");
  statusLabel.id = NINOMODE_STATUS_ID;
  statusLabel.className = "label pull-right";
  heading.appendChild(statusLabel);

  const body = document.createElement("div");
  body.className = "panel-body";

  const emptyState = document.createElement("div");
  emptyState.id = NINOMODE_EMPTY_STATE_ID;
  body.appendChild(emptyState);

  const buffer = document.createElement("div");
  buffer.id = NINOMODE_BUFFER_ID;
  buffer.className = "linewrap";
  body.appendChild(buffer);

  panel.append(heading, body);
  return {
    panel,
    statusLabel,
    emptyState,
    buffer,
  };
}

function ensurePanel() {
  if (panelElements && panelElements.panel && panelElements.panel.isConnected) {
    return panelElements;
  }

  const insertionAnchor = getPanelInsertionAnchor();
  if (!insertionAnchor || !insertionAnchor.parentNode) {
    return null;
  }

  panelElements = createPanelElement();
  insertionAnchor.parentNode.insertBefore(
    panelElements.panel,
    insertionAnchor.referenceNode,
  );
  updatePanelState();
  return panelElements;
}

function removePanel() {
  if (!panelElements) {
    return;
  }

  if (panelElements.panel && panelElements.panel.parentNode) {
    panelElements.panel.remove();
  }

  panelElements = null;
}

function updatePanelState() {
  if (!panelElements) {
    return;
  }

  const trackedTargetUsernames = getTrackedTargetUsernames();
  const connectedTargetUsernames = getConnectedTargetUsernames();
  const connectedTargetCount = connectedTargetUsernames.length;
  const trackedTargetCount = trackedTargetUsernames.length;
  const hasExtractedRows = extractedRows.length > 0;

  panelElements.statusLabel.textContent = !trackedTargetCount
    ? "Idle"
    : `${connectedTargetCount}/${trackedTargetCount} Online`;
  panelElements.statusLabel.className = `label pull-right ${
    connectedTargetCount > 0 ? "label-success" : "label-default"
  }`;

  if (hasExtractedRows) {
    panelElements.emptyState.style.display = "none";
    return;
  }

  panelElements.emptyState.style.display = "";
  if (!trackedTargetCount) {
    panelElements.emptyState.textContent = "No Nino targets configured.";
    return;
  }

  if (connectedTargetCount > 0) {
    panelElements.emptyState.textContent = `Waiting for ${formatTrackedTargetsForDisplay(
      trackedTargetUsernames,
    )} messages.`;
    return;
  }

  panelElements.emptyState.textContent = `${formatTrackedTargetsForDisplay(
    trackedTargetUsernames,
  )} ${
    trackedTargetCount === 1 ? "is" : "are"
  } offline.`;
}

function scrollPanelBufferToBottom() {
  if (!panelElements || !panelElements.buffer) {
    return;
  }

  panelElements.buffer.scrollTop = panelElements.buffer.scrollHeight;
}

function getMaxExtractedRows() {
  const configuredMaxRows = Number(window.CHATMAXSIZE);
  if (Number.isFinite(configuredMaxRows) && configuredMaxRows > 0) {
    return Math.floor(configuredMaxRows);
  }

  return NINOMODE_DEFAULT_MAX_ROWS;
}

function shouldExtractRow($row) {
  if (!$row || !$row.length) {
    return false;
  }

  if (isServerMessageRow($row)) {
    return false;
  }

  const rowElement = $row[0];
  if (!rowElement || isRowAlreadyExtracted(rowElement)) {
    return false;
  }

  if (
    !rowElement.parentNode ||
    rowElement.parentNode !== getMessageBufferElement()
  ) {
    return false;
  }

  const messageAuthor = normalizeUsername(getMessageAuthor($row));
  return Boolean(messageAuthor) && isTrackedTargetUsername(messageAuthor);
}

function extractRow(rowElement) {
  if (!rowElement || isRowAlreadyExtracted(rowElement)) {
    return false;
  }

  const messageBufferElement = getMessageBufferElement();
  if (!messageBufferElement || rowElement.parentNode !== messageBufferElement) {
    return false;
  }

  const panel = ensurePanel();
  if (!panel || !panel.buffer) {
    return false;
  }

  const placeholderNode = document.createComment("ninomode-placeholder");
  rowElement.parentNode.replaceChild(placeholderNode, rowElement);
  panel.buffer.appendChild(rowElement);
  scrollPanelBufferToBottom();
  extractedRows.push({
    placeholderNode,
    rowElement,
  });
  trimExtractedRows();
  updatePanelState();
  return true;
}

function removeExtractedEntry(entry) {
  if (!entry) {
    return;
  }

  const { placeholderNode, rowElement } = entry;
  if (placeholderNode && placeholderNode.parentNode) {
    placeholderNode.remove();
  }

  if (rowElement && rowElement.parentNode) {
    rowElement.remove();
  }
}

function trimExtractedRows() {
  const maxExtractedRows = getMaxExtractedRows();
  if (!Number.isFinite(maxExtractedRows) || maxExtractedRows < 1) {
    return 0;
  }

  let removedCount = 0;
  while (extractedRows.length > maxExtractedRows) {
    const oldestEntry = extractedRows.shift();
    removeExtractedEntry(oldestEntry);
    removedCount += 1;
  }

  return removedCount;
}

function processBacklogMessage($messageElement) {
  if (!$messageElement || !$messageElement.length) {
    return;
  }

  if (
    !isNinoModuleEnabled ||
    !isNinoModeEnabled ||
    !hasTrackedTargets() ||
    !hasConnectedTrackedTargets()
  ) {
    return;
  }

  const $row = getMessageRow($messageElement, {
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
  });
  if (!$row || isServerMessageRow($row)) {
    return;
  }

  const messageRootElement = getMessageContentRootElement($messageElement, {
    $row,
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
  });
  if (!messageRootElement) {
    return;
  }

  const messageText = String(messageRootElement.textContent || "").trim();
  if (isNinoModeCommandAttempt(messageText)) {
    return;
  }

  if (shouldExtractRow($row)) {
    extractRow($row[0]);
  }
}

function extractExistingTargetRows() {
  if (!hasTrackedTargets() || !hasConnectedTrackedTargets()) {
    updatePanelState();
    return Promise.resolve(0);
  }

  const messageBufferElement = getMessageBufferElement();
  if (!messageBufferElement) {
    updatePanelState();
    return Promise.resolve(0);
  }

  ensurePanel();
  return fesFun.runBacklogScan(processBacklogMessage).then((processedCount) => {
    updatePanelState();
    return processedCount;
  });
}

function restoreExtractedRows() {
  const messageBufferElement = getMessageBufferElement();

  for (const entry of extractedRows) {
    if (!entry || !entry.rowElement) {
      continue;
    }

    const { placeholderNode, rowElement } = entry;
    if (placeholderNode && placeholderNode.parentNode) {
      placeholderNode.parentNode.replaceChild(rowElement, placeholderNode);
      continue;
    }

    if (messageBufferElement) {
      messageBufferElement.appendChild(rowElement);
    }
  }

  extractedRows.length = 0;
}

function setTrackedTargetUsernames(targetUsernames) {
  const nextTargetsByKey = createTargetMap(targetUsernames);
  const didTargetSetChange = !areTargetMapsEqual(nextTargetsByKey, ninoTargetsByKey);

  if (!didTargetSetChange) {
    ninoTargetsByKey = nextTargetsByKey;
    updatePanelState();
    return false;
  }

  if (extractedRows.length) {
    restoreExtractedRows();
  }

  ninoTargetsByKey = nextTargetsByKey;
  updatePanelState();
  return true;
}

function syncUserlistState() {
  if (!isNinoModeEnabled || !panelElements) {
    return;
  }

  updatePanelState();
}

function attachUserlistObserver() {
  const userlistElement = document.querySelector(USERLIST_SELECTOR);
  if (!userlistElement || ninomodeUserlistObserver) {
    return;
  }

  ninomodeUserlistObserver = new MutationObserver(() => {
    syncUserlistState();
  });
  ninomodeUserlistObserver.observe(userlistElement, {
    childList: true,
    subtree: true,
  });
}

function setModeEnabled(nextEnabled, options = {}) {
  const desiredEnabled = Boolean(nextEnabled);
  const shouldExtractExisting = Boolean(options.extractExisting);
  const shouldForceRefresh = Boolean(options.forceRefresh);

  if (desiredEnabled === isNinoModeEnabled) {
    if (desiredEnabled) {
      ensurePanel();
      if (shouldExtractExisting && shouldForceRefresh) {
        extractExistingTargetRows();
      } else {
        updatePanelState();
      }
    }
    return isNinoModeEnabled;
  }

  isNinoModeEnabled = desiredEnabled;

  if (isNinoModeEnabled) {
    ensurePanel();
    if (shouldExtractExisting) {
      extractExistingTargetRows();
    } else {
      updatePanelState();
    }
    return isNinoModeEnabled;
  }

  restoreExtractedRows();
  removePanel();
  return isNinoModeEnabled;
}

function setNinoModuleEnabled(nextEnabled) {
  const desiredEnabled = Boolean(nextEnabled);
  if (desiredEnabled === isNinoModuleEnabled) {
    return isNinoModuleEnabled;
  }

  isNinoModuleEnabled = desiredEnabled;
  if (!isNinoModuleEnabled) {
    setModeEnabled(false, {
      extractExisting: false,
    });
  }

  return isNinoModuleEnabled;
}

function getNinoModeState() {
  const targetUsernames = getTrackedTargetUsernames();
  return {
    moduleEnabled: isNinoModuleEnabled,
    enabled: isNinoModeEnabled,
    targetUsername: targetUsernames[0] || "",
    targetUsernames,
    connectedTargetUsernames: getConnectedTargetUsernames(),
    isTargetConnected: targetUsernames.some((username) =>
      isTrackedTargetConnected(username),
    ),
    extractedCount: extractedRows.length,
    commandMinRank: NINOMODE_COMMAND_MIN_RANK,
    allowedUsers: Array.from(NINOMODE_COMMAND_ALLOWED_USER_SET),
  };
}

function parseNinoModeCommand(messageText) {
  const trimmedMessage = String(messageText || "").trim();
  if (!trimmedMessage) {
    return null;
  }

  const commandMatch = trimmedMessage.match(
    /^(?:!|\/|\.\/)ninomode(?:\s+(.+))?$/i,
  );
  if (!commandMatch) {
    return null;
  }

  const commandArgument = String(commandMatch[1] || "").trim();
  if (!commandArgument) {
    return {
      action: "toggle",
    };
  }

  if (/^(?:off|disable)$/i.test(commandArgument)) {
    return {
      action: "off",
    };
  }

  const targetUsernames = normalizeTargetListInput(commandArgument);
  if (!targetUsernames.length) {
    return null;
  }

  return {
    action: "setTargets",
    targetUsernames,
  };
}

function handleNinoModeMessage($messageElement) {
  if (!$messageElement || !$messageElement.length) {
    return;
  }

  if (!isNinoModuleEnabled) {
    return;
  }

  const $row = getMessageRow($messageElement, {
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
  });
  if (!$row || isServerMessageRow($row)) {
    return;
  }

  const messageRootElement = getMessageContentRootElement($messageElement, {
    $row,
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
  });
  if (!messageRootElement) {
    return;
  }

  const messageText = String(messageRootElement.textContent || "").trim();
  const isCommandAttempt = isNinoModeCommandAttempt(messageText);

  if (isCommandAttempt) {
    const messageAuthor = getMessageAuthor($row);
    const parsedCommand = parseNinoModeCommand(messageText);
    const authorIsAllowed = isCommandAllowedForAuthor(messageAuthor);

    $row.remove();
    if (!authorIsAllowed || !parsedCommand) {
      return;
    }

    if (parsedCommand.action === "off") {
      setModeEnabled(false, {
        extractExisting: false,
      });
      return;
    }

    if (parsedCommand.action === "setTargets") {
      const didChangeTargets = setTrackedTargetUsernames(
        parsedCommand.targetUsernames,
      );
      setModeEnabled(true, {
        extractExisting: hasConnectedTrackedTargets(),
        forceRefresh: didChangeTargets,
      });
      return;
    }

    setModeEnabled(!isNinoModeEnabled, {
      extractExisting: !isNinoModeEnabled && hasConnectedTrackedTargets(),
    });
    return;
  }

  if (!isNinoModeEnabled) {
    return;
  }

  if (shouldExtractRow($row)) {
    extractRow($row[0]);
  }
}

const ninoModeApi = {
  getState: getNinoModeState,
  setModuleEnabled(on) {
    return setNinoModuleEnabled(on);
  },
  setTargets(targetUsernames) {
    const normalizedTargets = Array.isArray(targetUsernames)
      ? targetUsernames
      : normalizeTargetListInput(targetUsernames);
    const didChangeTargets = setTrackedTargetUsernames(normalizedTargets);

    if (isNinoModeEnabled) {
      setModeEnabled(true, {
        extractExisting: hasConnectedTrackedTargets(),
        forceRefresh: didChangeTargets,
      });
    }

    return getTrackedTargetUsernames();
  },
  toggle(on) {
    const desiredEnabled = Boolean(on);
    if (desiredEnabled && !fesFun.isEnabled()) {
      return false;
    }

    return setModeEnabled(desiredEnabled, {
      extractExisting: desiredEnabled && hasConnectedTrackedTargets(),
    });
  },
};

window.ninoMode = ninoModeApi;

function initializeNinoMode() {
  fesFun.registerModule({
    id: "ninoMode",
    setEnabled: setNinoModuleEnabled,
    getState: getNinoModeState,
  });
  attachUserlistObserver();
  if (
    isNinoMessageHandlerAttached
  ) {
    return;
  }

  fesFun.registerLiveMessageHandler(handleNinoModeMessage);
  isNinoMessageHandlerAttached = true;
}

(async function startNinoMode() {
  await window.waitForFunc("MESSAGE_PROCESSOR");
  await window.waitForFunc("allModulesReady");
  window.allModulesReady.then(() => {
    initializeNinoMode();
  });
})();
