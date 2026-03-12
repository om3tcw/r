const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const MIKU_MIKU_BEAM_OVERLAY_ID = "miku-miku-beam-overlay";
const MIKU_MIKU_BEAM_TARGETING_CLASS = "miku-miku-beam-targeting";
const MIKU_MIKU_BEAM_DISINTEGRATING_CLASS = "miku-miku-beam-disintegrating";
const MIKU_MIKU_BEAM_PENDING_DATA_KEY = "mikuMikuBeamPending";
const MIKU_MIKU_BEAM_EMITTER_IMAGE_URL =
  "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/takomiku.png";
const MIKU_MIKU_BEAM_SOUND_URL = "https://cracklej.win/uejeSDeTSX.mp3";
const MIKU_MIKU_BEAM_SOUND_VOLUME = 0.2;
const MIKU_MIKU_BEAM_COMMAND_REGEX =
  /^(?:!|\/|\.\/)(?:mikubeam|mikumikubeam)\b/i;
const MIKU_MIKU_BEAM_COMMAND_WITH_TARGET_REGEX =
  /^(?:!|\/|\.\/)(?:mikubeam|mikumikubeam)\s+(.+)$/i;
const MIKU_MIKU_BEAM_FINAL_CALLOUT_PREFIX = "miku miku";
const MIKU_MIKU_BEAM_COUNTDOWN_STEPS = [
  { atMs: 0, text: "And now its time for the moment you've been waiting for" },
  { atMs: 5000, text: "1" },
  { atMs: 6300, text: "2" },
  { atMs: 7500, text: "3" },
  { atMs: 8700, text: "Ready?" },
  { atMs: 9700, text: "Miku Miku Beeeeeeeeeeeeeeeeeeeeeeeeeeam" },
];
const MIKU_MIKU_BEAM_FINAL_CALL_HOLD_MS = 650;
const MIKU_MIKU_BEAM_ACTIVE_DURATION_MS = 8000;
const MIKU_MIKU_BEAM_POST_FIRE_CLEANUP_MS = 150;
const MIKU_MIKU_BEAM_FINAL_COUNTDOWN_AT_MS = Math.max(
  0,
  ...MIKU_MIKU_BEAM_COUNTDOWN_STEPS.map((step) => Number(step?.atMs) || 0),
);
const MIKU_MIKU_BEAM_FIRE_DELAY_MS =
  MIKU_MIKU_BEAM_FINAL_COUNTDOWN_AT_MS + MIKU_MIKU_BEAM_FINAL_CALL_HOLD_MS;
const MIKU_MIKU_BEAM_EFFECT_END_MS =
  MIKU_MIKU_BEAM_FIRE_DELAY_MS + MIKU_MIKU_BEAM_ACTIVE_DURATION_MS;
const MIKU_MIKU_BEAM_SHOT_DURATION_MS =
  MIKU_MIKU_BEAM_EFFECT_END_MS + MIKU_MIKU_BEAM_POST_FIRE_CLEANUP_MS;
const MIKU_MIKU_BEAM_COOLDOWN_MS = 20000;
const MIKU_MIKU_BEAM_DISINTEGRATION_DELAY_MS = MIKU_MIKU_BEAM_FIRE_DELAY_MS;
const MIKU_MIKU_BEAM_ROW_REMOVAL_DELAY_MS = MIKU_MIKU_BEAM_EFFECT_END_MS;
const MIKU_MIKU_BEAM_EMITTER_VERTICAL_OFFSET_PX = 64;
const MIKU_MIKU_BEAM_LABEL_VERTICAL_GAP_PX = 132;
const MIKU_MIKU_BEAM_COMMAND_ALLOWED_USERS = [];
const MIKU_MIKU_BEAM_COMMAND_MIN_RANK =
  typeof Rank !== "undefined" && Rank && Rank.Moderator != null
    ? Rank.Moderator
    : 2;
const ChatModuleUtils = window.CHAT_MODULE_UTILS;

if (!ChatModuleUtils) {
  throw new Error("[MikuMikuBeam] CHAT_MODULE_UTILS is not available");
}

const {
  getMessageContentRootElement,
  getMessageAuthor,
  getMessageRow,
  getTextWithEmoteTitles,
  isAuthorAllowed,
  isServerMessageRow,
  normalizeUsername,
  postStatusSystemMessage,
} = ChatModuleUtils;

const MIKU_MIKU_BEAM_COMMAND_ALLOWED_USER_SET = new Set(
  MIKU_MIKU_BEAM_COMMAND_ALLOWED_USERS.map(normalizeUsername).filter(Boolean),
);

function applyMikuMikuBeamCssVariables() {
  const rootElement = document.documentElement;
  if (!rootElement || !rootElement.style) {
    return;
  }

  rootElement.style.setProperty(
    "--miku-miku-beam-emitter-image-url",
    `url("${MIKU_MIKU_BEAM_EMITTER_IMAGE_URL}")`,
  );
  rootElement.style.setProperty(
    "--miku-miku-beam-active-duration",
    `${MIKU_MIKU_BEAM_ACTIVE_DURATION_MS}ms`,
  );
  rootElement.style.setProperty(
    "--miku-miku-beam-fire-delay",
    `${MIKU_MIKU_BEAM_FIRE_DELAY_MS}ms`,
  );
  rootElement.style.setProperty(
    "--miku-miku-beam-impact-spark-delay",
    `${MIKU_MIKU_BEAM_FIRE_DELAY_MS + 170}ms`,
  );
}

let isInitialBeamMessageScanComplete = false;
let isBeamMessageTapAttached = false;
let beamSoundTemplate = null;
let beamCooldownUntilMs = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getViewportDimensions() {
  const documentElement = document.documentElement;

  return {
    width:
      window.innerWidth ||
      (documentElement && documentElement.clientWidth) ||
      0,
    height:
      window.innerHeight ||
      (documentElement && documentElement.clientHeight) ||
      0,
  };
}

function isNodeStillConnected(node) {
  if (!node) {
    return false;
  }

  if (typeof node.isConnected === "boolean") {
    return node.isConnected;
  }

  if (document.body && typeof document.body.contains === "function") {
    return document.body.contains(node);
  }

  return Boolean(
    document.documentElement &&
    typeof document.documentElement.contains === "function" &&
    document.documentElement.contains(node),
  );
}

function positionBeamLabelWithinViewport(
  labelElement,
  preferredLeft,
  preferredTop,
) {
  if (!isNodeStillConnected(labelElement)) {
    return;
  }

  const { width: viewportWidth, height: viewportHeight } =
    getViewportDimensions();
  if (!viewportWidth || !viewportHeight) {
    return;
  }

  const labelRect = labelElement.getBoundingClientRect();
  const clampedLeft = clamp(
    preferredLeft,
    16,
    Math.max(16, viewportWidth - labelRect.width - 16),
  );
  const clampedTop = clamp(
    preferredTop,
    16,
    Math.max(16, viewportHeight - labelRect.height - 16),
  );

  labelElement.style.left = `${clampedLeft}px`;
  labelElement.style.top = `${clampedTop}px`;
}

function normalizeBeamCommandTarget(rawTarget) {
  const trimmedTarget = String(rawTarget || "").trim();
  if (!trimmedTarget) {
    return "";
  }

  const emoteWrappedTargetMatch = trimmedTarget.match(/^:([^:\s]+):$/);
  if (emoteWrappedTargetMatch) {
    return String(emoteWrappedTargetMatch[1] || "").trim();
  }

  return trimmedTarget.replace(/^@+/, "").trim();
}

function parseBeamCommand(messageText, messageRootElement = null) {
  const candidateMessages = [
    String(messageText || ""),
    getTextWithEmoteTitles(messageRootElement),
  ];

  for (const rawCandidate of candidateMessages) {
    const trimmedMessage = String(rawCandidate || "").trim();
    if (!trimmedMessage) {
      continue;
    }

    const commandMatch = trimmedMessage.match(
      MIKU_MIKU_BEAM_COMMAND_WITH_TARGET_REGEX,
    );
    if (!commandMatch) {
      continue;
    }

    const commandArgument = String(commandMatch[1] || "").trim();
    if (!commandArgument) {
      continue;
    }

    const firstToken = commandArgument.split(/\s+/)[0];
    const targetUsername = normalizeBeamCommandTarget(firstToken);
    if (!targetUsername) {
      continue;
    }

    return {
      targetUsername,
    };
  }

  return null;
}

function isBeamCommandAttempt(messageText, messageRootElement = null) {
  const candidateMessages = [
    String(messageText || ""),
    getTextWithEmoteTitles(messageRootElement),
  ];

  return candidateMessages.some((rawCandidate) =>
    MIKU_MIKU_BEAM_COMMAND_REGEX.test(String(rawCandidate || "").trim()),
  );
}

function getOrCreateBeamOverlayElement() {
  let overlayElement = document.getElementById(MIKU_MIKU_BEAM_OVERLAY_ID);
  if (overlayElement) {
    return overlayElement;
  }

  overlayElement = document.createElement("div");
  overlayElement.id = MIKU_MIKU_BEAM_OVERLAY_ID;
  document.body.appendChild(overlayElement);
  return overlayElement;
}

function postBeamStatusSystemMessage(message) {
  postStatusSystemMessage(message, {
    messageBufferSelector: MESSAGE_BUFFER_SELECTOR,
    rowClass: "miku-miku-beam-system-message",
  });
}

function getBeamCooldownRemainingMs(nowMs = Date.now()) {
  return Math.max(0, beamCooldownUntilMs - Number(nowMs || 0));
}

function startBeamCooldown(nowMs = Date.now()) {
  beamCooldownUntilMs =
    Number(nowMs || 0) + Math.max(0, MIKU_MIKU_BEAM_COOLDOWN_MS);
}

function formatBeamCooldownRemaining(remainingMs) {
  const roundedTenths = Math.ceil(Math.max(0, Number(remainingMs) || 0) / 100);
  return `${(roundedTenths / 10).toFixed(1)}s`;
}

function getOrCreateBeamSoundTemplate() {
  if (!MIKU_MIKU_BEAM_SOUND_URL) {
    return null;
  }

  if (beamSoundTemplate) {
    return beamSoundTemplate;
  }

  try {
    beamSoundTemplate = new Audio(MIKU_MIKU_BEAM_SOUND_URL);
    beamSoundTemplate.preload = "auto";
    return beamSoundTemplate;
  } catch (error) {
    console.error("[MikuMikuBeam] Audio setup failed:", error);
    beamSoundTemplate = null;
    return null;
  }
}

function preloadMikuMikuBeamSound() {
  const soundTemplate = getOrCreateBeamSoundTemplate();
  if (!soundTemplate || typeof soundTemplate.load !== "function") {
    return;
  }

  try {
    soundTemplate.load();
  } catch (error) {
    console.error("[MikuMikuBeam] Audio preload failed:", error);
  }
}

function playMikuMikuBeamSound() {
  const soundTemplate = getOrCreateBeamSoundTemplate();
  if (!soundTemplate) {
    return;
  }

  try {
    const beamAudio =
      typeof soundTemplate.cloneNode === "function"
        ? soundTemplate.cloneNode()
        : new Audio(MIKU_MIKU_BEAM_SOUND_URL);
    beamAudio.volume = MIKU_MIKU_BEAM_SOUND_VOLUME;
    const playPromise = beamAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        if (error && error.name === "NotAllowedError") {
          return;
        }

        console.error("[MikuMikuBeam] Audio play failed:", error);
      });
    }
  } catch (error) {
    console.error("[MikuMikuBeam] Audio play setup failed:", error);
  }
}

function getBeamShotGeometry(rowElement) {
  if (!isNodeStillConnected(rowElement)) {
    return null;
  }

  const { width: viewportWidth, height: viewportHeight } =
    getViewportDimensions();
  if (!viewportWidth || !viewportHeight) {
    return null;
  }

  const targetRect = rowElement.getBoundingClientRect();
  const targetX = clamp(
    targetRect.left + targetRect.width * 0.55,
    80,
    viewportWidth - 80,
  );
  const targetY = clamp(
    targetRect.top + targetRect.height * 0.5,
    64,
    viewportHeight - 64,
  );
  const originX = Math.max(56, viewportWidth - 68);
  const originY = clamp(
    targetY -
      Math.min(118, viewportHeight * 0.18) +
      MIKU_MIKU_BEAM_EMITTER_VERTICAL_OFFSET_PX,
    74,
    viewportHeight - 74,
  );
  const deltaX = targetX - originX;
  const deltaY = targetY - originY;
  const length = Math.max(120, Math.hypot(deltaX, deltaY));

  return {
    angleDeg: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
    labelLeft: clamp(originX - 222, 16, viewportWidth - 190),
    labelTop: clamp(
      originY - MIKU_MIKU_BEAM_LABEL_VERTICAL_GAP_PX,
      16,
      viewportHeight - 38,
    ),
    length,
    originX,
    originY,
    targetX,
    targetY,
  };
}

function findLatestMessageRowByUsername(username, options = {}) {
  const normalizedTarget = normalizeUsername(username);
  if (!normalizedTarget) {
    return null;
  }

  const excludedRowElement =
    options && options.excludeRowElement ? options.excludeRowElement : null;
  const messageRows = document.querySelectorAll(
    `${MESSAGE_BUFFER_SELECTOR} > div`,
  );
  for (let index = messageRows.length - 1; index >= 0; index -= 1) {
    const rowElement = messageRows[index];
    if (!rowElement || rowElement === excludedRowElement) {
      continue;
    }

    const $row = $(rowElement);
    if (!$row.length || isServerMessageRow($row)) {
      continue;
    }

    if (
      rowElement.dataset &&
      rowElement.dataset[MIKU_MIKU_BEAM_PENDING_DATA_KEY] === "1"
    ) {
      continue;
    }

    const authorUsername = normalizeUsername(getMessageAuthor($row));
    if (authorUsername !== normalizedTarget) {
      continue;
    }

    return $row;
  }

  return null;
}

function cleanupTargetRowState(rowElement) {
  if (!rowElement) {
    return;
  }

  rowElement.classList.remove(
    MIKU_MIKU_BEAM_TARGETING_CLASS,
    MIKU_MIKU_BEAM_DISINTEGRATING_CLASS,
  );

  if (rowElement.dataset) {
    delete rowElement.dataset[MIKU_MIKU_BEAM_PENDING_DATA_KEY];
  }
}

function applyBeamShotGeometry(beamShotElements, shotConfig) {
  if (!beamShotElements || !shotConfig) {
    return;
  }

  beamShotElements.currentShotGeometry = shotConfig;
  beamShotElements.labelElement.style.left = `${shotConfig.labelLeft}px`;
  beamShotElements.labelElement.style.top = `${shotConfig.labelTop}px`;
  beamShotElements.emitterElement.style.left = `${shotConfig.originX}px`;
  beamShotElements.emitterElement.style.top = `${shotConfig.originY}px`;
  beamShotElements.pivotElement.style.left = `${shotConfig.originX}px`;
  beamShotElements.pivotElement.style.top = `${shotConfig.originY}px`;
  beamShotElements.pivotElement.style.transform = `translateY(-50%) rotate(${shotConfig.angleDeg}deg)`;
  beamShotElements.rayElement.style.width = `${shotConfig.length}px`;
  beamShotElements.impactElement.style.left = `${shotConfig.targetX}px`;
  beamShotElements.impactElement.style.top = `${shotConfig.targetY}px`;
  positionBeamLabelWithinViewport(
    beamShotElements.labelElement,
    shotConfig.labelLeft,
    shotConfig.labelTop,
  );
}

function createBeamShot(shotConfig, targetRowElement = null) {
  const overlayElement = getOrCreateBeamOverlayElement();
  const shotElement = document.createElement("div");
  shotElement.className = "miku-miku-beam-shot";

  const labelElement = document.createElement("div");
  labelElement.className = "miku-miku-beam-label is-counting";
  const labelTextElement = document.createElement("span");
  labelTextElement.className = "miku-miku-beam-label-text";
  labelTextElement.textContent =
    MIKU_MIKU_BEAM_COUNTDOWN_STEPS[0] && MIKU_MIKU_BEAM_COUNTDOWN_STEPS[0].text
      ? MIKU_MIKU_BEAM_COUNTDOWN_STEPS[0].text
      : "Ready?";
  labelElement.style.left = `${shotConfig.labelLeft}px`;
  labelElement.style.top = `${shotConfig.labelTop}px`;
  labelElement.appendChild(labelTextElement);

  const emitterElement = document.createElement("div");
  emitterElement.className = "miku-miku-beam-emitter";
  emitterElement.style.left = `${shotConfig.originX}px`;
  emitterElement.style.top = `${shotConfig.originY}px`;

  const pivotElement = document.createElement("div");
  pivotElement.className = "miku-miku-beam-pivot";
  pivotElement.style.left = `${shotConfig.originX}px`;
  pivotElement.style.top = `${shotConfig.originY}px`;
  pivotElement.style.transform = `translateY(-50%) rotate(${shotConfig.angleDeg}deg)`;

  const rayElement = document.createElement("div");
  rayElement.className = "miku-miku-beam-ray";
  rayElement.style.width = `${shotConfig.length}px`;
  pivotElement.appendChild(rayElement);

  const impactElement = document.createElement("div");
  impactElement.className = "miku-miku-beam-impact";
  shotElement.append(labelElement, emitterElement, pivotElement, impactElement);
  overlayElement.appendChild(shotElement);

  const beamShotElements = {
    currentShotGeometry: shotConfig,
    emitterElement,
    impactElement,
    labelElement,
    pivotElement,
    rayElement,
    shotElement,
    trackingHandle: 0,
  };
  applyBeamShotGeometry(beamShotElements, shotConfig);

  const stopTracking = () => {
    if (!beamShotElements.trackingHandle) {
      return;
    }

    if (typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(beamShotElements.trackingHandle);
    } else {
      window.clearTimeout(beamShotElements.trackingHandle);
    }
    beamShotElements.trackingHandle = 0;
  };

  const trackBeamTarget = () => {
    beamShotElements.trackingHandle = 0;
    if (
      !isNodeStillConnected(shotElement) ||
      !targetRowElement ||
      !isNodeStillConnected(targetRowElement)
    ) {
      return;
    }

    const nextShotGeometry = getBeamShotGeometry(targetRowElement);
    if (nextShotGeometry) {
      applyBeamShotGeometry(beamShotElements, nextShotGeometry);
    }

    if (typeof window.requestAnimationFrame === "function") {
      beamShotElements.trackingHandle =
        window.requestAnimationFrame(trackBeamTarget);
      return;
    }

    beamShotElements.trackingHandle = window.setTimeout(trackBeamTarget, 33);
  };

  if (targetRowElement) {
    trackBeamTarget();
  }

  for (const step of MIKU_MIKU_BEAM_COUNTDOWN_STEPS.slice(1)) {
    if (!step || typeof step.text !== "string") {
      continue;
    }

    window.setTimeout(
      () => {
        if (!isNodeStillConnected(labelElement)) {
          return;
        }

        labelTextElement.textContent = step.text;
        labelTextElement.classList.toggle(
          "miku-miku-beam-callout",
          String(step.text)
            .toLowerCase()
            .startsWith(MIKU_MIKU_BEAM_FINAL_CALLOUT_PREFIX),
        );
        labelTextElement.classList.remove("miku-miku-beam-step-pop");
        void labelTextElement.offsetWidth;
        labelTextElement.classList.add("miku-miku-beam-step-pop");
        applyBeamShotGeometry(
          beamShotElements,
          beamShotElements.currentShotGeometry,
        );
      },
      Math.max(0, Number(step.atMs) || 0),
    );
  }

  window.setTimeout(() => {
    stopTracking();
    shotElement.remove();
  }, MIKU_MIKU_BEAM_SHOT_DURATION_MS);
}

function fireMikuMikuBeamAtRow($targetRow) {
  if (!$targetRow || !$targetRow.length) {
    return false;
  }

  const rowElement = $targetRow[0];
  if (!isNodeStillConnected(rowElement)) {
    return false;
  }

  if (
    rowElement.dataset &&
    rowElement.dataset[MIKU_MIKU_BEAM_PENDING_DATA_KEY] === "1"
  ) {
    return false;
  }

  const shotGeometry = getBeamShotGeometry(rowElement);
  if (!shotGeometry) {
    return false;
  }

  if (rowElement.dataset) {
    rowElement.dataset[MIKU_MIKU_BEAM_PENDING_DATA_KEY] = "1";
  }

  rowElement.classList.add(MIKU_MIKU_BEAM_TARGETING_CLASS);
  createBeamShot(shotGeometry, rowElement);

  window.setTimeout(() => {
    if (!isNodeStillConnected(rowElement)) {
      cleanupTargetRowState(rowElement);
      return;
    }

    rowElement.classList.remove(MIKU_MIKU_BEAM_TARGETING_CLASS);
    rowElement.classList.add(MIKU_MIKU_BEAM_DISINTEGRATING_CLASS);
  }, MIKU_MIKU_BEAM_DISINTEGRATION_DELAY_MS);

  window.setTimeout(() => {
    cleanupTargetRowState(rowElement);
    if (isNodeStillConnected(rowElement)) {
      rowElement.remove();
    }
  }, MIKU_MIKU_BEAM_ROW_REMOVAL_DELAY_MS);

  return true;
}

function fireMikuMikuBeamAtUsername(username, options = {}) {
  const $targetRow = findLatestMessageRowByUsername(username, options);
  if (!$targetRow || !$targetRow.length) {
    return false;
  }

  return fireMikuMikuBeamAtRow($targetRow);
}

function tryTriggerMikuMikuBeamAtUsername(username, options = {}) {
  const nowMs = Date.now();
  const cooldownRemainingMs = getBeamCooldownRemainingMs(nowMs);
  if (cooldownRemainingMs > 0) {
    return {
      didFire: false,
      reason: "cooldown",
      cooldownRemainingMs,
    };
  }

  const beamOptions = Object.assign({}, options);
  const shouldPlaySound = beamOptions.playSound !== false;
  delete beamOptions.playSound;

  const didFire = fireMikuMikuBeamAtUsername(username, beamOptions);
  if (!didFire) {
    return {
      didFire: false,
      reason: "missingTarget",
      cooldownRemainingMs: 0,
    };
  }

  startBeamCooldown(nowMs);
  if (shouldPlaySound) {
    playMikuMikuBeamSound();
  }

  return {
    didFire: true,
    reason: "fired",
    cooldownRemainingMs: getBeamCooldownRemainingMs(nowMs),
  };
}

function triggerMikuMikuBeamAtUsername(username, options = {}) {
  return tryTriggerMikuMikuBeamAtUsername(username, options).didFire;
}

function handleMikuMikuBeamMessage($messageElement) {
  if (!$messageElement || !$messageElement.length) {
    return;
  }

  const $row = getMessageRow($messageElement);
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

  const messageAuthor = getMessageAuthor($row);
  const messageText = String(messageRootElement.textContent || "");
  const parsedCommand = parseBeamCommand(messageText, messageRootElement);
  const isCommandAttempt = isBeamCommandAttempt(
    messageText,
    messageRootElement,
  );
  const isAuthorAllowed = isAuthorAllowedForBeam(messageAuthor);

  if (!isInitialBeamMessageScanComplete) {
    if (parsedCommand || isCommandAttempt) {
      $row.remove();
    }
    return;
  }

  if (parsedCommand) {
    $row.remove();

    if (!isAuthorAllowed) {
      return;
    }

    const triggerResult = tryTriggerMikuMikuBeamAtUsername(
      parsedCommand.targetUsername,
      {
        excludeRowElement: $row[0],
        playSound: true,
      },
    );

    if (!triggerResult.didFire && triggerResult.reason === "cooldown") {
      postBeamStatusSystemMessage(
        `Miku Miku Beam is cooling down for ${formatBeamCooldownRemaining(triggerResult.cooldownRemainingMs)}.`,
      );
      return;
    }

    if (!triggerResult.didFire) {
      postBeamStatusSystemMessage(
        `Miku Miku Beam missed: no recent message from "${parsedCommand.targetUsername}".`,
      );
    }
    return;
  }

  if (isCommandAttempt) {
    $row.remove();

    if (isAuthorAllowed) {
      postBeamStatusSystemMessage("Usage: /mikubeam <username>");
    }
  }
}

function isAuthorAllowedForBeam(authorUsername) {
  return isAuthorAllowed(authorUsername, {
    allowedUsers: MIKU_MIKU_BEAM_COMMAND_ALLOWED_USER_SET,
    minRank: MIKU_MIKU_BEAM_COMMAND_MIN_RANK,
  });
}

function getBeamState() {
  return {
    commandMinRank: MIKU_MIKU_BEAM_COMMAND_MIN_RANK,
    allowedUsers: Array.from(MIKU_MIKU_BEAM_COMMAND_ALLOWED_USER_SET),
    cooldownMs: MIKU_MIKU_BEAM_COOLDOWN_MS,
    cooldownRemainingMs: getBeamCooldownRemainingMs(),
  };
}

const mikuMikuBeamApi = {
  fireAtUser(username, options = {}) {
    return triggerMikuMikuBeamAtUsername(username, options);
  },
  getState: getBeamState,
};

window.mikuMikuBeam = mikuMikuBeamApi;

(async function initializeMikuMikuBeam() {
  applyMikuMikuBeamCssVariables();
  preloadMikuMikuBeamSound();
  await window.waitForFunc("MESSAGE_PROCESSOR");
  if (
    isBeamMessageTapAttached ||
    typeof MESSAGE_PROCESSOR === "undefined" ||
    !MESSAGE_PROCESSOR ||
    typeof MESSAGE_PROCESSOR.addTap !== "function"
  ) {
    return;
  }

  MESSAGE_PROCESSOR.addTap(handleMikuMikuBeamMessage);
  isBeamMessageTapAttached = true;
  isInitialBeamMessageScanComplete = true;
})();
