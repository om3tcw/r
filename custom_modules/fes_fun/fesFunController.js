const FES_FUN_STORAGE_KEY = "fesFunEnabled";
const LEGACY_FES_FUN_STORAGE_KEY = "disableMikuBeam";
const FES_FUN_BACKLOG_CHUNK_SIZE = 25;
const MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const registeredFesFunModules = new Map();
const registeredFesFunLiveMessageHandlers = new Set();
const queuedFesFunBacklogScans = [];
let isFesFunBacklogScanRunning = false;
let isFesFunLiveChatListenerAttached = false;

function getInitialFesFunEnabledState() {
  try {
    if (!window.localStorage) {
      return true;
    }

    const storedValue = localStorage.getItem(FES_FUN_STORAGE_KEY);
    if (storedValue === "1" || storedValue === "true") {
      return true;
    }
    if (storedValue === "0" || storedValue === "false") {
      return false;
    }

    // clean up old key
    if (localStorage.getItem(LEGACY_FES_FUN_STORAGE_KEY) != null) {
      localStorage.removeItem(LEGACY_FES_FUN_STORAGE_KEY);
    }

    return true;
  } catch (error) {
    console.error("[fesFun] Failed to read initial state:", error);
    return true;
  }
}

let isFesFunEnabled = getInitialFesFunEnabledState();

function persistFesFunEnabledState() {
  try {
    if (!window.localStorage) {
      return;
    }

    localStorage.setItem(FES_FUN_STORAGE_KEY, isFesFunEnabled ? "1" : "0");
    localStorage.removeItem(LEGACY_FES_FUN_STORAGE_KEY);
  } catch (error) {
    console.error("[fesFun] Failed to persist state:", error);
  }
}

function applyFesFunStateToModule(moduleRegistration) {
  if (
    !moduleRegistration ||
    typeof moduleRegistration.setEnabled !== "function"
  ) {
    return;
  }

  moduleRegistration.setEnabled(isFesFunEnabled);
}

function registerFesFunModule(moduleRegistration) {
  if (
    !moduleRegistration ||
    typeof moduleRegistration !== "object" ||
    !String(moduleRegistration.id || "").trim() ||
    typeof moduleRegistration.setEnabled !== "function"
  ) {
    throw new Error("[fesFun] registerModule requires an id and setEnabled()");
  }

  const moduleId = String(moduleRegistration.id).trim();
  const normalizedRegistration = {
    id: moduleId,
    getState:
      typeof moduleRegistration.getState === "function"
        ? moduleRegistration.getState
        : null,
    setEnabled: moduleRegistration.setEnabled,
  };

  registeredFesFunModules.set(moduleId, normalizedRegistration);
  applyFesFunStateToModule(normalizedRegistration);
  return normalizedRegistration;
}

function setFesFunEnabled(nextEnabled) {
  isFesFunEnabled = Boolean(nextEnabled);
  persistFesFunEnabledState();

  for (const moduleRegistration of registeredFesFunModules.values()) {
    applyFesFunStateToModule(moduleRegistration);
  }

  return isFesFunEnabled;
}

function setFesFunModuleEnabled(moduleId, nextEnabled) {
  const normalizedModuleId = String(moduleId || "").trim();
  if (!normalizedModuleId) {
    return null;
  }

  const moduleRegistration = registeredFesFunModules.get(normalizedModuleId);
  if (!moduleRegistration) {
    return null;
  }

  return moduleRegistration.setEnabled(Boolean(nextEnabled));
}

function getFesFunState() {
  return {
    enabled: isFesFunEnabled,
    modules: Array.from(registeredFesFunModules.values()).map(
      (moduleRegistration) => ({
        id: moduleRegistration.id,
        state: moduleRegistration.getState
          ? moduleRegistration.getState()
          : null,
      }),
    ),
    storageKey: FES_FUN_STORAGE_KEY,
  };
}

function getLatestChatMessageElement() {
  if (typeof window.fetchLastChatElement !== "function") {
    return null;
  }

  try {
    const $messageElement = window.fetchLastChatElement();
    if ($messageElement && $messageElement.length) {
      return $messageElement;
    }
  } catch (error) {
    console.error("[fesFun] Failed to resolve latest chat element:", error);
  }

  return null;
}

function ensureFesFunLiveChatListener() {
  if (isFesFunLiveChatListenerAttached) {
    return true;
  }

  if (!window.socket || typeof window.socket.on !== "function") {
    return false;
  }

  window.socket.on("chatMsg", () => {
    const $messageElement = getLatestChatMessageElement();
    if (!$messageElement || !$messageElement.length) {
      return;
    }

    for (const handler of Array.from(registeredFesFunLiveMessageHandlers)) {
      try {
        handler($messageElement);
      } catch (error) {
        console.error("[fesFun] Live chat handler failed:", error);
      }
    }
  });

  isFesFunLiveChatListenerAttached = true;
  return true;
}

function registerLiveMessageHandler(handler) {
  if (typeof handler !== "function") {
    throw new Error("[fesFun] registerLiveMessageHandler requires a function");
  }

  registeredFesFunLiveMessageHandlers.add(handler);
  ensureFesFunLiveChatListener();
  return handler;
}

function unregisterLiveMessageHandler(handler) {
  registeredFesFunLiveMessageHandlers.delete(handler);
}

function normalizeBacklogHandlers(handlersOrHandler) {
  const handlers = Array.isArray(handlersOrHandler)
    ? handlersOrHandler
    : [handlersOrHandler];

  return handlers.filter((handler) => typeof handler === "function");
}

function scheduleBacklogStep(step) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => {
      step();
    });
    return;
  }

  window.setTimeout(step, 0);
}

function processQueuedBacklogScans() {
  if (isFesFunBacklogScanRunning || !queuedFesFunBacklogScans.length) {
    return;
  }

  const scanTask = queuedFesFunBacklogScans.shift();
  if (!scanTask) {
    return;
  }

  const messageBufferElement = document.querySelector(MESSAGE_BUFFER_SELECTOR);
  if (!messageBufferElement) {
    scanTask.resolve(0);
    processQueuedBacklogScans();
    return;
  }

  isFesFunBacklogScanRunning = true;
  const rowElements = Array.from(messageBufferElement.children);
  let index = 0;
  let processedCount = 0;

  const finishScan = () => {
    isFesFunBacklogScanRunning = false;
    scanTask.resolve(processedCount);
    processQueuedBacklogScans();
  };

  const step = () => {
    const maxIndex = Math.min(
      index + scanTask.chunkSize,
      rowElements.length,
    );

    for (; index < maxIndex; index += 1) {
      const rowElement = rowElements[index];
      if (!(rowElement instanceof Element)) {
        continue;
      }

      const $row = $(rowElement);
      if (!$row.length) {
        continue;
      }

      const $messageElement = $row.children().last();
      if (!$messageElement.length) {
        continue;
      }

      for (const handler of scanTask.handlers) {
        try {
          handler($messageElement);
        } catch (error) {
          console.error("[fesFun] Backlog handler failed:", error);
        }
      }

      processedCount += 1;
    }

    if (index < rowElements.length) {
      scheduleBacklogStep(step);
      return;
    }

    finishScan();
  };

  scheduleBacklogStep(step);
}

function runBacklogScan(handlersOrHandler, options = {}) {
  const handlers = normalizeBacklogHandlers(handlersOrHandler);
  if (!handlers.length) {
    return Promise.resolve(0);
  }

  const requestedChunkSize = Number(options.chunkSize);
  const chunkSize =
    Number.isFinite(requestedChunkSize) && requestedChunkSize > 0
      ? Math.floor(requestedChunkSize)
      : FES_FUN_BACKLOG_CHUNK_SIZE;

  return new Promise((resolve) => {
    queuedFesFunBacklogScans.push({
      chunkSize,
      handlers,
      resolve,
    });
    processQueuedBacklogScans();
  });
}

window.fesFun = {
  getState: getFesFunState,
  isEnabled() {
    return isFesFunEnabled;
  },
  registerModule: registerFesFunModule,
  registerLiveMessageHandler,
  runBacklogScan,
  setEnabled: setFesFunEnabled,
  setModuleEnabled: setFesFunModuleEnabled,
  unregisterLiveMessageHandler,
};
