const SHARED_TTS_STORAGE_VERSION = "v2";
const SHARED_TTS_ENABLED_KEY = `${CHANNEL.name}_sharedTtsEnabled_${SHARED_TTS_STORAGE_VERSION}`;
const SHARED_TTS_VOLUME_KEY = `${CHANNEL.name}_sharedTtsVolume_${SHARED_TTS_STORAGE_VERSION}`;
const SHARED_TTS_DEFAULT_ENABLED = true;
const SHARED_TTS_DEFAULT_VOLUME = 0.25;
function normalizeBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
}

function readStoredBoolean(key, fallbackValue) {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null) {
            return fallbackValue;
        }

        return storedValue === "1" || storedValue === "true";
    } catch (error) {
        console.error("[SharedTTS] Failed to read boolean setting:", error);
        return fallbackValue;
    }
}

function readStoredVolume(key, fallbackValue) {
    try {
        const storedValue = Number(localStorage.getItem(key));
        if (!Number.isFinite(storedValue)) {
            return fallbackValue;
        }

        return Math.min(Math.max(storedValue, 0), 1);
    } catch (error) {
        console.error("[SharedTTS] Failed to read volume setting:", error);
        return fallbackValue;
    }
}

const sharedTtsState = {
    audioElement: null,
    currentJobId: "",
    currentStartAt: 0,
    enabled: readStoredBoolean(SHARED_TTS_ENABLED_KEY, SHARED_TTS_DEFAULT_ENABLED),
    eventSource: null,
    playTimer: null,
    serverOffsetMs: 0,
    volume: readStoredVolume(SHARED_TTS_VOLUME_KEY, SHARED_TTS_DEFAULT_VOLUME),
};

function getSharedTtsConfig() {
    const channelConfig = window[CHANNEL.name] && window[CHANNEL.name].sharedTtsConfig
        ? window[CHANNEL.name].sharedTtsConfig
        : {};

    return {
        apiBaseUrl: normalizeBaseUrl(channelConfig.apiBaseUrl),
    };
}

function getAdjustedNow() {
    return Date.now() + sharedTtsState.serverOffsetMs;
}

function persistSharedTtsState() {
    try {
        localStorage.setItem(SHARED_TTS_ENABLED_KEY, sharedTtsState.enabled ? "1" : "0");
        localStorage.setItem(SHARED_TTS_VOLUME_KEY, String(sharedTtsState.volume));
    } catch (error) {
        console.error("[SharedTTS] Failed to persist settings:", error);
    }
}

function updateServerOffset(serverTime) {
    const numericServerTime = Number(serverTime);
    if (!Number.isFinite(numericServerTime)) {
        return;
    }

    sharedTtsState.serverOffsetMs = numericServerTime - Date.now();
}

function stopCurrentPlayback() {
    if (sharedTtsState.playTimer) {
        clearTimeout(sharedTtsState.playTimer);
        sharedTtsState.playTimer = null;
    }

    if (sharedTtsState.audioElement) {
        sharedTtsState.audioElement.pause();
        sharedTtsState.audioElement.src = "";
        sharedTtsState.audioElement = null;
    }

    sharedTtsState.currentJobId = "";
    sharedTtsState.currentStartAt = 0;
}

function applyAudioSettings() {
    if (!sharedTtsState.audioElement) {
        return;
    }

    sharedTtsState.audioElement.volume = sharedTtsState.volume;
    if (!sharedTtsState.enabled) {
        sharedTtsState.audioElement.pause();
    }
}

function schedulePlayback(job) {
    if (!job || !job.jobId || !job.audioUrl) {
        return;
    }

    if (
        sharedTtsState.currentJobId === job.jobId &&
        sharedTtsState.currentStartAt === Number(job.startAt)
    ) {
        return;
    }

    stopCurrentPlayback();
    updateServerOffset(job.serverTime);

    const durationMs = Number(job.durationMs);
    const startAt = Number(job.startAt);
    if (!Number.isFinite(durationMs) || !Number.isFinite(startAt)) {
        return;
    }

    const audioElement = new Audio(job.audioUrl);
    audioElement.preload = "auto";
    audioElement.volume = sharedTtsState.volume;
    sharedTtsState.audioElement = audioElement;
    sharedTtsState.currentJobId = job.jobId;
    sharedTtsState.currentStartAt = startAt;

    audioElement.addEventListener("loadedmetadata", () => {
        const delayMs = Math.max(0, startAt - getAdjustedNow());
        sharedTtsState.playTimer = setTimeout(() => {
            if (!sharedTtsState.audioElement || sharedTtsState.currentJobId !== job.jobId) {
                return;
            }

            const remainingMs = startAt + durationMs - getAdjustedNow();
            if (remainingMs < 1000) {
                stopCurrentPlayback();
                return;
            }

            const offsetSeconds = Math.max(0, (getAdjustedNow() - startAt) / 1000);
            try {
                if (offsetSeconds > 0) {
                    audioElement.currentTime = offsetSeconds;
                }
            } catch (error) {
                console.warn("[SharedTTS] Failed to seek playback:", error);
            }

            if (!sharedTtsState.enabled) {
                return;
            }

            audioElement.play().catch((error) => {
                console.warn("[SharedTTS] Failed to start playback:", error);
            });
        }, delayMs);
    }, { once: true });
}

function applyRemoteState(payload) {
    if (!payload || typeof payload !== "object") {
        return;
    }

    updateServerOffset(payload.serverTime);
    if (payload.currentJob) {
        schedulePlayback(payload.currentJob);
        return;
    }

    if (!payload.isProcessing) {
        stopCurrentPlayback();
    }
}

async function fetchSharedTtsState() {
    const config = getSharedTtsConfig();
    if (!config.apiBaseUrl) {
        return null;
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/v1/tts/state`);
        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        applyRemoteState(payload);
        return payload;
    } catch (error) {
        console.warn("[SharedTTS] Failed to fetch state:", error);
        return null;
    }
}

function connectSharedTtsEvents() {
    const config = getSharedTtsConfig();
    if (!config.apiBaseUrl || typeof EventSource === "undefined") {
        return;
    }

    if (sharedTtsState.eventSource) {
        sharedTtsState.eventSource.close();
        sharedTtsState.eventSource = null;
    }

    const eventSource = new EventSource(`${config.apiBaseUrl}/v1/tts/events`);
    sharedTtsState.eventSource = eventSource;

    eventSource.addEventListener("open", () => {
        fetchSharedTtsState();
    });

    eventSource.addEventListener("hello", (event) => {
        try {
            applyRemoteState(JSON.parse(event.data));
        } catch (error) {
            console.warn("[SharedTTS] Failed to parse hello event:", error);
        }
    });

    eventSource.addEventListener("play", (event) => {
        try {
            schedulePlayback(JSON.parse(event.data));
        } catch (error) {
            console.warn("[SharedTTS] Failed to parse play event:", error);
        }
    });

    eventSource.addEventListener("stop", (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (!payload.jobId || payload.jobId === sharedTtsState.currentJobId) {
                stopCurrentPlayback();
            }
        } catch (error) {
            console.warn("[SharedTTS] Failed to parse stop event:", error);
        }
    });

    eventSource.addEventListener("idle", (event) => {
        try {
            const payload = JSON.parse(event.data);
            updateServerOffset(payload.serverTime);
        } catch (error) {
            console.warn("[SharedTTS] Failed to parse idle event:", error);
        }
        stopCurrentPlayback();
    });

    eventSource.onerror = () => {
        console.warn("[SharedTTS] Event stream disconnected; browser will retry.");
    };
}

function retrySharedTtsConnection() {
    stopCurrentPlayback();
    connectSharedTtsEvents();
    fetchSharedTtsState();
}

async function waitForHoloPeekGroupHelper(timeoutMs = 2000) {
    const deadline = Date.now() + timeoutMs;
    while (typeof window.appendToHoloPeekGroup !== "function" && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 25));
    }
}

function buildSharedTtsControls() {
    const config = getSharedTtsConfig();
    if (!config.apiBaseUrl) {
        console.warn("[SharedTTS] No API base URL configured; skipping client controls.");
        return;
    }

    if (document.querySelector("#shared-tts-controls")) {
        return;
    }

    const container = document.createElement("div");
    container.id = "shared-tts-controls";

    const toggleButton = document.createElement("button");
    toggleButton.className = "btn btn-sm btn-default";
    toggleButton.type = "button";
    toggleButton.title = "Toggle shared TTS playback";

    const volumeInput = document.createElement("input");
    volumeInput.type = "range";
    volumeInput.min = "0";
    volumeInput.max = "100";
    volumeInput.value = String(Math.round(sharedTtsState.volume * 100));
    volumeInput.title = "Shared TTS volume";

    const primaryRow = document.createElement("div");
    primaryRow.className = "shared-tts-row";

    const retryButton = document.createElement("button");
    retryButton.className = "btn btn-sm btn-default";
    retryButton.type = "button";
    retryButton.textContent = "Retry Connection";
    retryButton.title = "Reconnect to shared TTS";

    function syncToggleLabel() {
        toggleButton.textContent = sharedTtsState.enabled ? "TTS On" : "TTS Off";
        toggleButton.className = sharedTtsState.enabled
            ? "btn btn-sm btn-success"
            : "btn btn-sm btn-default";
    }

    syncToggleLabel();

    toggleButton.addEventListener("click", () => {
        sharedTtsState.enabled = !sharedTtsState.enabled;
        syncToggleLabel();
        persistSharedTtsState();
        applyAudioSettings();
    });

    volumeInput.addEventListener("input", () => {
        sharedTtsState.volume = Number(volumeInput.value) / 100;
        persistSharedTtsState();
        applyAudioSettings();
    });

    retryButton.addEventListener("click", () => {
        retrySharedTtsConnection();
    });

    primaryRow.append(toggleButton, retryButton);
    container.append(primaryRow, volumeInput);

    if (typeof window.appendToHoloPeekGroup === "function") {
        window.appendToHoloPeekGroup("April Fools", container);
        return;
    }

    document.querySelector("#chatinputrow")?.append(container);
}

function normalizeSharedTtsMessageText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function isSharedTtsCommandMessage(messageText) {
    return /^!dec[a-z]*\b/i.test(messageText);
}

function shouldKeepSharedTtsBotMessage(messageText) {
    return /\bqueue\s+full\b/i.test(messageText) ||
        /\berror\b/i.test(messageText) ||
        /\bfailed\b/i.test(messageText);
}

function getChatRowUsername(rowElement) {
    const usernameElement = rowElement?.querySelector("strong.username");
    return normalizeSharedTtsMessageText(
        String(usernameElement?.textContent || "").replace(/:\s*$/, ""),
    );
}

function getChatRowMessageText(rowElement) {
    if (!(rowElement instanceof Element)) {
        return "";
    }

    const directSpanChildren = Array.from(rowElement.children).filter(
        (child) => child.tagName === "SPAN",
    );
    const messageSpan = directSpanChildren[directSpanChildren.length - 1];
    return normalizeSharedTtsMessageText(messageSpan?.textContent || rowElement.textContent);
}

function shouldHideSharedTtsChatRow(rowElement) {
    const messageText = getChatRowMessageText(rowElement);
    if (!messageText) {
        return false;
    }

    if (isSharedTtsCommandMessage(messageText)) {
        return true;
    }

    return getChatRowUsername(rowElement) === "MigoBot" &&
        !shouldKeepSharedTtsBotMessage(messageText);
}

function pruneSharedTtsChatRow(rowElement) {
    if (!(rowElement instanceof Element) || rowElement.dataset.sharedTtsPruned === "1") {
        return;
    }

    rowElement.dataset.sharedTtsPruned = "1";
    if (shouldHideSharedTtsChatRow(rowElement)) {
        rowElement.remove();
    }
}

function watchSharedTtsChatMessages() {
    const messageBuffer = document.querySelector("#messagebuffer");
    if (!(messageBuffer instanceof Element) || messageBuffer.dataset.sharedTtsObserverAttached === "1") {
        return;
    }

    messageBuffer.dataset.sharedTtsObserverAttached = "1";
    Array.from(messageBuffer.children).forEach(pruneSharedTtsChatRow);

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                pruneSharedTtsChatRow(node);
            }
        }
    });

    observer.observe(messageBuffer, { childList: true });
}

(async () => {
    await window.waitForFunc("DOMrebuiltPromise");
    await window.DOMrebuiltPromise;
    await waitForHoloPeekGroupHelper();
    persistSharedTtsState();
    buildSharedTtsControls();
    watchSharedTtsChatMessages();
    connectSharedTtsEvents();
    fetchSharedTtsState();
})();
