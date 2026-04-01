const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const VIDEOWRAP_SELECTOR = "#videowrap";
const MAIN_TAB_CONTAINER_SELECTOR = "#MainTabContainer";
const USERLIST_SELECTOR = "#userlist";
const NINOMODE_PANEL_ID = "ninomode-panel";
const NINOMODE_STATUS_ID = "ninomode-status";
const NINOMODE_EMPTY_STATE_ID = "ninomode-empty-state";
const NINOMODE_BUFFER_ID = "ninomode-buffer";
const NINOMODE_TARGET_USERNAME = "Ninovalt";
const NINOMODE_COMMAND_REGEX = /^(?:!|\/|\.\/)ninomode\b/i;
const NINOMODE_EXACT_COMMAND_REGEX = /^(?:!|\/|\.\/)ninomode\s*$/i;
const NINOMODE_DEFAULT_MAX_ROWS = 100;
const NINOMODE_COMMAND_ALLOWED_USERS = [];
const NINOMODE_COMMAND_MIN_RANK =
  typeof Rank !== "undefined" && Rank && Rank.Moderator != null
    ? Rank.Moderator
    : 2;
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

const NINOMODE_TARGET_USERNAME_NORMALIZED = normalizeUsername(
  NINOMODE_TARGET_USERNAME,
);
const NINOMODE_COMMAND_ALLOWED_USER_SET = new Set(
  NINOMODE_COMMAND_ALLOWED_USERS.map(normalizeUsername).filter(Boolean),
);

let isNinoModuleEnabled = true;
let isNinoModeEnabled = false;
let isNinoMessageHandlerAttached = false;
let ninomodeUserlistObserver = null;
let panelElements = null;
const extractedRows = [];

function isTargetConnected() {
  const $targetRow = findUserlistRowByUsername(NINOMODE_TARGET_USERNAME, {
    userlistSelector: `${USERLIST_SELECTOR} .userlist_item`,
  });

  return Boolean($targetRow && $targetRow.length);
}

function getMessageBufferElement() {
  return document.querySelector(MESSAGE_BUFFER_SELECTOR);
}

function getVideoWrapElement() {
  return document.querySelector(VIDEOWRAP_SELECTOR);
}

function isExactNinoModeCommand(messageText) {
  return NINOMODE_EXACT_COMMAND_REGEX.test(String(messageText || "").trim());
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

  const targetIsConnected = isTargetConnected();
  const hasExtractedRows = extractedRows.length > 0;

  panelElements.statusLabel.textContent = targetIsConnected
    ? "Online"
    : "Offline";
  panelElements.statusLabel.className = `label pull-right ${
    targetIsConnected ? "label-success" : "label-default"
  }`;

  if (hasExtractedRows) {
    panelElements.emptyState.style.display = "none";
    return;
  }

  panelElements.emptyState.style.display = "";
  panelElements.emptyState.textContent = targetIsConnected
    ? `Waiting for ${NINOMODE_TARGET_USERNAME} messages.`
    : `${NINOMODE_TARGET_USERNAME} is offline.`;
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
  return messageAuthor === NINOMODE_TARGET_USERNAME_NORMALIZED;
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

  if (!isNinoModuleEnabled || !isNinoModeEnabled || !isTargetConnected()) {
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
  if (!isTargetConnected()) {
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

  if (desiredEnabled === isNinoModeEnabled) {
    if (desiredEnabled) {
      ensurePanel();
      updatePanelState();
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
  return {
    moduleEnabled: isNinoModuleEnabled,
    enabled: isNinoModeEnabled,
    targetUsername: NINOMODE_TARGET_USERNAME,
    isTargetConnected: isTargetConnected(),
    extractedCount: extractedRows.length,
    commandMinRank: NINOMODE_COMMAND_MIN_RANK,
    allowedUsers: Array.from(NINOMODE_COMMAND_ALLOWED_USER_SET),
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
    const isAuthorAllowed = isCommandAllowedForAuthor(messageAuthor);
    const isExactCommand = isExactNinoModeCommand(messageText);

    $row.remove();
    if (isAuthorAllowed && isExactCommand) {
      setModeEnabled(!isNinoModeEnabled, {
        extractExisting: !isNinoModeEnabled && isTargetConnected(),
      });
    }
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
  toggle(on) {
    const desiredEnabled = Boolean(on);
    if (desiredEnabled && !fesFun.isEnabled()) {
      return false;
    }

    return setModeEnabled(desiredEnabled, {
      extractExisting: desiredEnabled && isTargetConnected(),
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
