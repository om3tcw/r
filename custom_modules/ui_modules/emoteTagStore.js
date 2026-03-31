const TAG_MANIFEST_FILE = "emote-tags.json";
const TAG_DRAFT_STORAGE_KEY = `${CHANNEL.name}_EmoteTagDraft`;

let remoteTagManifest = {};
let localDraftManifest = {};

function getChannelEmoteNames() {
    return new Set(
        (Array.isArray(CHANNEL.emotes) ? CHANNEL.emotes : [])
            .map((emote) => emote && emote.name)
            .filter(Boolean)
    );
}

function normalizeTag(tag) {
    if (typeof tag !== "string") {
        return null;
    }

    const normalizedTag = tag.trim().toLowerCase();
    return normalizedTag || null;
}

function normalizeTagList(tagList) {
    if (!Array.isArray(tagList)) {
        return [];
    }

    const uniqueTags = new Set();

    tagList.forEach((tag) => {
        const normalizedTag = normalizeTag(tag);
        if (normalizedTag) {
            uniqueTags.add(normalizedTag);
        }
    });

    return Array.from(uniqueTags);
}

function parseTagInput(rawTagInput) {
    if (typeof rawTagInput !== "string") {
        return [];
    }

    return normalizeTagList(rawTagInput.split(","));
}

function sanitizeRemoteManifest(rawManifest) {
    const validEmotes = getChannelEmoteNames();
    const sanitizedManifest = {};

    if (!rawManifest || typeof rawManifest !== "object") {
        return sanitizedManifest;
    }

    Object.entries(rawManifest).forEach(([emoteName, tagList]) => {
        if (!validEmotes.has(emoteName)) {
            return;
        }

        const normalizedTags = normalizeTagList(tagList);
        if (normalizedTags.length) {
            sanitizedManifest[emoteName] = normalizedTags;
        }
    });

    return sanitizedManifest;
}

function sanitizeDraftManifest(rawManifest) {
    const validEmotes = getChannelEmoteNames();
    const sanitizedManifest = {};

    if (!rawManifest || typeof rawManifest !== "object") {
        return sanitizedManifest;
    }

    Object.entries(rawManifest).forEach(([emoteName, tagList]) => {
        if (!validEmotes.has(emoteName)) {
            return;
        }

        if (tagList === null) {
            sanitizedManifest[emoteName] = null;
            return;
        }

        const normalizedTags = normalizeTagList(tagList);
        sanitizedManifest[emoteName] = normalizedTags.length ? normalizedTags : null;
    });

    return sanitizedManifest;
}

function mergeTagManifests() {
    const mergedManifest = { ...remoteTagManifest };

    Object.entries(localDraftManifest).forEach(([emoteName, tagList]) => {
        if (tagList === null) {
            delete mergedManifest[emoteName];
            return;
        }

        mergedManifest[emoteName] = tagList;
    });

    return sanitizeRemoteManifest(mergedManifest);
}

function syncGlobalTagState() {
    window.EMOTE_TAGS = mergeTagManifests();
    window.dispatchEvent(new CustomEvent("emote-tags-updated", {
        detail: {
            tags: window.EMOTE_TAGS,
        },
    }));
}

function persistDraftManifest() {
    try {
        if (!Object.keys(localDraftManifest).length) {
            localStorage.removeItem(TAG_DRAFT_STORAGE_KEY);
            return;
        }

        localStorage.setItem(
            TAG_DRAFT_STORAGE_KEY,
            JSON.stringify(localDraftManifest)
        );
    } catch (err) {
        console.warn("[Emote Tags] Failed to persist local draft:", err);
    }
}

function loadDraftManifest() {
    try {
        const savedDraft = localStorage.getItem(TAG_DRAFT_STORAGE_KEY);
        if (!savedDraft) {
            return {};
        }

        return sanitizeDraftManifest(JSON.parse(savedDraft));
    } catch (err) {
        console.warn("[Emote Tags] Failed to load local draft:", err);
        return {};
    }
}

async function loadRemoteManifest() {
    try {
        const response = await fetch(makeLiveCDNLink(TAG_MANIFEST_FILE));
        if (!response.ok) {
            if (response.status === 404) {
                return {};
            }

            throw new Error(`HTTP ${response.status}`);
        }

        return sanitizeRemoteManifest(await response.json());
    } catch (err) {
        console.warn("[Emote Tags] Failed to load emote tag manifest:", err);
        return {};
    }
}

function exportTagManifest() {
    return mergeTagManifests();
}

function setTagsForEmote(emoteName, rawTagInput) {
    if (!getChannelEmoteNames().has(emoteName)) {
        return [];
    }

    const normalizedTags = Array.isArray(rawTagInput)
        ? normalizeTagList(rawTagInput)
        : parseTagInput(rawTagInput);

    localDraftManifest[emoteName] = normalizedTags.length ? normalizedTags : null;
    persistDraftManifest();
    syncGlobalTagState();

    return getTagsForEmote(emoteName);
}

function clearTagsForEmote(emoteName) {
    if (!getChannelEmoteNames().has(emoteName)) {
        return;
    }

    localDraftManifest[emoteName] = null;
    persistDraftManifest();
    syncGlobalTagState();
}

function getTagsForEmote(emoteName) {
    return window.EMOTE_TAGS[emoteName] || [];
}

function clearDraftManifest() {
    localDraftManifest = {};
    persistDraftManifest();
    syncGlobalTagState();
}

function getDraftManifest() {
    return { ...localDraftManifest };
}

async function initializeTagStore() {
    remoteTagManifest = await loadRemoteManifest();
    localDraftManifest = loadDraftManifest();
    syncGlobalTagState();
}

window.EMOTE_TAGS = {};

export const EMOTE_TAG_STORE = {
    clearDraft: clearDraftManifest,
    clearTagsForEmote,
    exportManifest: exportTagManifest,
    getDraftManifest,
    getTagsForEmote,
    parseTagInput,
    ready: initializeTagStore(),
    setTagsForEmote,
};
