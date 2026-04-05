export const VOLUME_CONTROL_DEFAULT_VOLUME = 0.1;

const VOLUME_CONTROL_GROUP_NAME = "Volume Controls";
const VOLUME_CONTROL_PANEL_ID = "volume-control-panel";
const VOLUME_CONTROL_PREVIEW_NOT_ALLOWED_ERROR = "NotAllowedError";
const volumeControlPanelSubscribers = new Set();
let currentPreviewAudio = null;

function getSafeStorage(providedStorage) {
  if (
    providedStorage &&
    typeof providedStorage.getItem === "function" &&
    typeof providedStorage.setItem === "function" &&
    typeof providedStorage.removeItem === "function"
  ) {
    return providedStorage;
  }

  if (
    typeof window !== "undefined" &&
    window.localStorage &&
    typeof window.localStorage.getItem === "function"
  ) {
    return window.localStorage;
  }

  return null;
}

export function clampVolumeControlValue(
  value,
  fallbackValue = VOLUME_CONTROL_DEFAULT_VOLUME,
) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return Math.min(Math.max(Number(fallbackValue) || 0, 0), 1);
  }

  return Math.min(Math.max(numericValue, 0), 1);
}

function readStoredValue(storage, key) {
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch (error) {
    console.error("[VolumeControl] Failed to read storage value:", error);
    return null;
  }
}

function writeStoredValue(storage, key, value) {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, String(value));
    return true;
  } catch (error) {
    console.error("[VolumeControl] Failed to write storage value:", error);
    return false;
  }
}

function removeStoredValue(storage, key) {
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error("[VolumeControl] Failed to remove storage value:", error);
    return false;
  }
}

function normalizeChoiceMap(choices) {
  if (!choices || typeof choices !== "object") {
    return {};
  }

  return { ...choices };
}

function getFallbackChoiceId(choices) {
  const choiceKeys = Object.keys(choices || {});
  return choiceKeys.length ? choiceKeys[0] : "";
}

function normalizeDefinition(definition) {
  const id = String(definition?.id || "").trim();
  if (!id) {
    throw new Error("[VolumeControl] Definitions require a stable id.");
  }

  const choices = normalizeChoiceMap(definition.choices);
  const fallbackChoiceId = getFallbackChoiceId(choices);
  const hasExplicitDefaultChoiceId = Object.prototype.hasOwnProperty.call(
    definition || {},
    "defaultChoiceId",
  );
  const requestedDefaultChoiceId = hasExplicitDefaultChoiceId
    ? String(definition.defaultChoiceId || "").trim()
    : "";
  let defaultChoiceId = fallbackChoiceId;
  if (hasExplicitDefaultChoiceId) {
    defaultChoiceId =
      requestedDefaultChoiceId && choices[requestedDefaultChoiceId] != null
        ? requestedDefaultChoiceId
        : requestedDefaultChoiceId;
  }

  return {
    id,
    label: String(definition.label || id),
    order: Number.isFinite(Number(definition.order)) ? Number(definition.order) : 0,
    choices,
    defaultChoiceId,
    defaultVolume: clampVolumeControlValue(
      definition.defaultVolume,
      VOLUME_CONTROL_DEFAULT_VOLUME,
    ),
    previewUrl:
      definition.previewUrl == null ? "" : String(definition.previewUrl).trim(),
    previewFactory:
      typeof definition.previewFactory === "function"
        ? definition.previewFactory
        : null,
  };
}

export function createVolumeControlStore({
  channelName = "",
  storage: providedStorage = null,
} = {}) {
  const definitions = new Map();
  const storage = getSafeStorage(providedStorage);
  const storagePrefix = `${String(channelName || "global")}_VolumeControl_`;

  function getVolumeKey(id) {
    return `${storagePrefix}${id}_volume`;
  }

  function getChoiceKey(id) {
    return `${storagePrefix}${id}_choice`;
  }

  function getDefinition(id) {
    return definitions.get(String(id || "").trim()) || null;
  }

  function getStoredVolume(id, fallbackValue) {
    const storedValue = readStoredValue(storage, getVolumeKey(id));
    if (storedValue == null) {
      return fallbackValue;
    }

    return clampVolumeControlValue(storedValue, fallbackValue);
  }

  function getStoredChoiceId(definition) {
    if (!definition) {
      return "";
    }

    if (!shouldRenderChoiceSelector(definition)) {
      removeStoredValue(storage, getChoiceKey(definition.id));
      return definition.defaultChoiceId;
    }

    const storedChoiceId = String(
      readStoredValue(storage, getChoiceKey(definition.id)) || "",
    ).trim();
    if (storedChoiceId && definition.choices[storedChoiceId] != null) {
      return storedChoiceId;
    }

    return definition.defaultChoiceId;
  }

  return {
    registerDefinition(definition) {
      const normalizedDefinition = normalizeDefinition(definition);
      definitions.set(normalizedDefinition.id, normalizedDefinition);
      return normalizedDefinition;
    },
    getDefinition,
    getDefinitions() {
      return Array.from(definitions.values());
    },
    getVolume(id) {
      const definition = getDefinition(id);
      if (!definition) {
        return VOLUME_CONTROL_DEFAULT_VOLUME;
      }

      return getStoredVolume(id, definition.defaultVolume);
    },
    setVolume(id, nextVolume) {
      const definition = getDefinition(id);
      if (!definition) {
        return VOLUME_CONTROL_DEFAULT_VOLUME;
      }

      const normalizedVolume = clampVolumeControlValue(
        nextVolume,
        definition.defaultVolume,
      );
      writeStoredValue(storage, getVolumeKey(id), normalizedVolume);
      return normalizedVolume;
    },
    getChoiceId(id) {
      const definition = getDefinition(id);
      return getStoredChoiceId(definition);
    },
    setChoiceId(id, nextChoiceId) {
      const definition = getDefinition(id);
      if (!definition) {
        return "";
      }

      if (!shouldRenderChoiceSelector(definition)) {
        removeStoredValue(storage, getChoiceKey(id));
        return definition.defaultChoiceId;
      }

      const normalizedChoiceId = String(nextChoiceId || "").trim();
      if (!normalizedChoiceId || definition.choices[normalizedChoiceId] == null) {
        removeStoredValue(storage, getChoiceKey(id));
        return definition.defaultChoiceId;
      }

      writeStoredValue(storage, getChoiceKey(id), normalizedChoiceId);
      return normalizedChoiceId;
    },
    getResolvedUrl(id) {
      const definition = getDefinition(id);
      if (!definition) {
        return "";
      }

      const choiceId = getStoredChoiceId(definition);
      if (choiceId && definition.choices[choiceId] != null) {
        return String(definition.choices[choiceId] || "");
      }

      return String(definition.previewUrl || "");
    },
    applyToAudio(id, audioElement) {
      if (!audioElement || typeof audioElement !== "object") {
        return audioElement;
      }

      audioElement.volume = this.getVolume(id);
      return audioElement;
    },
    createPreviewAudio(id) {
      const definition = getDefinition(id);
      if (!definition) {
        return null;
      }

      if (definition.previewFactory) {
        return definition.previewFactory({
          definition,
          store: this,
        });
      }

      const resolvedUrl = this.getResolvedUrl(id);
      if (!resolvedUrl || typeof Audio === "undefined") {
        return null;
      }

      try {
        return new Audio(resolvedUrl);
      } catch (error) {
        console.error("[VolumeControl] Failed to create preview audio:", error);
        return null;
      }
    },
    resetAll() {
      for (const definition of definitions.values()) {
        removeStoredValue(storage, getVolumeKey(definition.id));
        removeStoredValue(storage, getChoiceKey(definition.id));
      }
    },
  };
}

function getRuntimeChannelName() {
  if (
    typeof CHANNEL !== "undefined" &&
    CHANNEL &&
    typeof CHANNEL.name === "string" &&
    CHANNEL.name.trim()
  ) {
    return CHANNEL.name.trim();
  }

  return "global";
}

const runtimeVolumeControlStore = createVolumeControlStore({
  channelName: getRuntimeChannelName(),
});

function stopCurrentPreviewAudio() {
  if (!currentPreviewAudio) {
    return;
  }

  try {
    currentPreviewAudio.pause();
    currentPreviewAudio.currentTime = 0;
  } catch (error) {
    console.warn("[VolumeControl] Failed to stop preview audio:", error);
  }

  currentPreviewAudio = null;
}

function notifyVolumeControlPanelSubscribers() {
  for (const subscriber of Array.from(volumeControlPanelSubscribers)) {
    try {
      subscriber(runtimeVolumeControlStore.getDefinitions());
    } catch (error) {
      console.error("[VolumeControl] Panel subscriber failed:", error);
    }
  }
}

export function registerVolumeControl(definition) {
  const normalizedDefinition =
    runtimeVolumeControlStore.registerDefinition(definition);
  notifyVolumeControlPanelSubscribers();
  return normalizedDefinition;
}

export function getVolumeControlValue(id) {
  return runtimeVolumeControlStore.getVolume(id);
}

export function getVolumeControlUrl(id) {
  return runtimeVolumeControlStore.getResolvedUrl(id);
}

export function applyVolumeControl(id, audioElement) {
  return runtimeVolumeControlStore.applyToAudio(id, audioElement);
}

export function previewVolumeControl(id) {
  const definition = runtimeVolumeControlStore.getDefinition(id);
  if (!definition) {
    return null;
  }

  stopCurrentPreviewAudio();
  const previewAudio = runtimeVolumeControlStore.createPreviewAudio(id);
  if (!previewAudio) {
    return null;
  }

  runtimeVolumeControlStore.applyToAudio(id, previewAudio);
  currentPreviewAudio = previewAudio;

  const cleanup = () => {
    if (currentPreviewAudio === previewAudio) {
      currentPreviewAudio = null;
    }
  };

  if (typeof previewAudio.addEventListener === "function") {
    previewAudio.addEventListener("ended", cleanup, { once: true });
    previewAudio.addEventListener("error", cleanup, { once: true });
  }

  try {
    const playPromise = previewAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        cleanup();
        if (error?.name === VOLUME_CONTROL_PREVIEW_NOT_ALLOWED_ERROR) {
          return;
        }

        console.error("[VolumeControl] Preview playback failed:", error);
      });
    }
  } catch (error) {
    cleanup();
    console.error("[VolumeControl] Preview playback setup failed:", error);
  }

  return previewAudio;
}

export function shouldRenderChoiceSelector() {
  return false;
}

function updateRowPreviewButtonState(rowElement, definition) {
  if (!(rowElement instanceof Element)) {
    return;
  }

  const previewButton = rowElement.querySelector(".volume-control-play");
  if (!(previewButton instanceof HTMLButtonElement)) {
    return;
  }

  const hasPreviewSource =
    Boolean(runtimeVolumeControlStore.getResolvedUrl(definition.id)) ||
    Boolean(definition.previewFactory);
  previewButton.disabled = !hasPreviewSource;
}

function createVolumeControlRow(definition) {
  const rowElement = document.createElement("div");
  rowElement.className = "volume-control-row";
  rowElement.dataset.volumeControlId = definition.id;

  const topRow = document.createElement("div");
  topRow.className = "volume-control-row-main";

  const labelElement = document.createElement("label");
  labelElement.className = "volume-control-label";
  labelElement.textContent = definition.label;
  labelElement.htmlFor = `${definition.id}-volume-range`;

  const percentElement = document.createElement("span");
  percentElement.className = "volume-control-value";

  const previewButton = document.createElement("button");
  previewButton.className = "btn btn-xs btn-default volume-control-play";
  previewButton.type = "button";
  previewButton.textContent = "Play";
  previewButton.title = `Play ${definition.label}`;
  previewButton.addEventListener("click", () => {
    previewVolumeControl(definition.id);
  });

  topRow.append(labelElement, percentElement, previewButton);

  const rangeElement = document.createElement("input");
  rangeElement.id = `${definition.id}-volume-range`;
  rangeElement.className = "volume-control-range";
  rangeElement.type = "range";
  rangeElement.min = "0";
  rangeElement.max = "100";
  rangeElement.step = "1";

  const syncVolumeDisplay = () => {
    const nextVolume = runtimeVolumeControlStore.getVolume(definition.id);
    const percentValue = Math.round(nextVolume * 100);
    rangeElement.value = String(percentValue);
    percentElement.textContent = `${percentValue}%`;
  };

  rangeElement.addEventListener("input", (event) => {
    const nextVolume = Number(event.currentTarget.value) / 100;
    runtimeVolumeControlStore.setVolume(definition.id, nextVolume);
    syncVolumeDisplay();
  });

  rowElement.append(topRow, rangeElement);

  if (shouldRenderChoiceSelector(definition) && Object.keys(definition.choices).length) {
    const selectElement = document.createElement("select");
    selectElement.className = "form-control input-sm volume-control-choice";
    selectElement.setAttribute("aria-label", `${definition.label} sound choice`);

    for (const [choiceId, choiceUrl] of Object.entries(definition.choices)) {
      if (!choiceUrl) {
        continue;
      }

      const optionElement = document.createElement("option");
      optionElement.value = choiceId;
      optionElement.textContent = choiceId;
      selectElement.append(optionElement);
    }

    selectElement.value = runtimeVolumeControlStore.getChoiceId(definition.id);
    selectElement.addEventListener("change", (event) => {
      runtimeVolumeControlStore.setChoiceId(definition.id, event.currentTarget.value);
      updateRowPreviewButtonState(rowElement, definition);
    });

    rowElement.append(selectElement);
  }

  syncVolumeDisplay();
  updateRowPreviewButtonState(rowElement, definition);
  return rowElement;
}

function renderVolumeControlPanel(panelElement, definitions) {
  if (!(panelElement instanceof Element)) {
    return;
  }

  stopCurrentPreviewAudio();
  panelElement.replaceChildren();

  const sortedDefinitions = [...definitions].sort((left, right) =>
    left.order - right.order || left.label.localeCompare(right.label),
  );

  for (const definition of sortedDefinitions) {
    panelElement.append(createVolumeControlRow(definition));
  }
}

function subscribeVolumeControlPanel(subscriber) {
  volumeControlPanelSubscribers.add(subscriber);
  subscriber(runtimeVolumeControlStore.getDefinitions());

  return () => {
    volumeControlPanelSubscribers.delete(subscriber);
  };
}

async function waitForHoloPeekVolumeGroup(timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (
    typeof window.appendToHoloPeekGroup !== "function" &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return typeof window.appendToHoloPeekGroup === "function";
}

async function mountVolumeControlPanel() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof window.appendToHoloPeekGroup !== "function"
  ) {
    return;
  }

  if (document.querySelector(`#${VOLUME_CONTROL_PANEL_ID}`)) {
    return;
  }

  const panelElement = document.createElement("div");
  panelElement.id = VOLUME_CONTROL_PANEL_ID;
  panelElement.className = "volume-control-panel";
  window.appendToHoloPeekGroup(VOLUME_CONTROL_GROUP_NAME, panelElement);
  subscribeVolumeControlPanel((definitions) => {
    renderVolumeControlPanel(panelElement, definitions);
  });
}

function registerResetHook() {
  if (typeof window?.registerHoloPeekResetHandler !== "function") {
    return false;
  }

  window.registerHoloPeekResetHandler(() => {
    runtimeVolumeControlStore.resetAll();
    stopCurrentPreviewAudio();
  });
  return true;
}

async function initializeVolumeControlRuntime() {
  if (typeof window === "undefined") {
    return;
  }

  const hasHoloPeekHelpers = await waitForHoloPeekVolumeGroup();
  if (hasHoloPeekHelpers) {
    await mountVolumeControlPanel();
    registerResetHook();
  }
}

if (typeof window !== "undefined") {
  window.registerVolumeControl = registerVolumeControl;
  window.getVolumeControlValue = getVolumeControlValue;
  window.getVolumeControlUrl = getVolumeControlUrl;
  window.applyVolumeControl = applyVolumeControl;
  window.previewVolumeControl = previewVolumeControl;
  window.volumeControlStore = runtimeVolumeControlStore;
  initializeVolumeControlRuntime();
}
