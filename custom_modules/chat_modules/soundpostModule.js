let RARE_SOUNDPOSTS = {};
let SOUNDPOST_PLAYBACK_STATE = {};
let PLAYED_SOUNDPOSTS = [];
const ACTIVE_CHAT_SOUNDPOST_AUDIO = new Set();
const SOUNDPOST_VOLUME_CONTROL_ID = "soundposts";
const SOUNDPOST_PREVIEW_URL =
    "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/mambo.ogg";
const defaultVolume = 0.1;
const defaultAdditionalPlayTime = 3;

function getSoundpostVolume() {
    if (typeof window.getVolumeControlValue === "function") {
        return window.getVolumeControlValue(SOUNDPOST_VOLUME_CONTROL_ID);
    }

    return defaultVolume;
}

function applySoundpostVolume(audioElement) {
    if (!audioElement) {
        return audioElement;
    }

    if (typeof window.applyVolumeControl === "function") {
        return window.applyVolumeControl(SOUNDPOST_VOLUME_CONTROL_ID, audioElement);
    }

    audioElement.volume = getSoundpostVolume();
    return audioElement;
}

function stopChatSoundpostAudio(audioElement) {
    if (!audioElement) return;

    try {
        audioElement.pause();
        audioElement.currentTime = 0;
    } catch (err) {
        console.error('[Soundpost] Stop failed:', err);
    }

    ACTIVE_CHAT_SOUNDPOST_AUDIO.delete(audioElement);
}

function playChatSoundpostAudio(audioElement, errorLabel = "Soundpost") {
    if (!audioElement || !window.SOUNDPOST_STATE) return false;

    applySoundpostVolume(audioElement);
    ACTIVE_CHAT_SOUNDPOST_AUDIO.add(audioElement);
    audioElement.addEventListener(
        "ended",
        () => ACTIVE_CHAT_SOUNDPOST_AUDIO.delete(audioElement),
        { once: true }
    );
    audioElement.play().catch((err) => {
        ACTIVE_CHAT_SOUNDPOST_AUDIO.delete(audioElement);
        console.error(`[${errorLabel}] Play failed:`, err);
    });
    return true;
}

function stopAllChatSoundposts() {
    Array.from(ACTIVE_CHAT_SOUNDPOST_AUDIO).forEach(stopChatSoundpostAudio);

    Object.values(SOUNDPOST_PLAYBACK_STATE).forEach((state) => {
        if (!state) return;
        if (state.timeout !== null) {
            clearTimeout(state.timeout);
        }
        state.timeout = null;
        state.isPlaying = false;
        state.totalPlayTime = 0;
    });
}

function playSoundpost(emote, additionalPlayTime = defaultAdditionalPlayTime) {
    if (!window.SOUNDPOST_STATE) return;

    const soundpost = SOUNDPOST_PLAYBACK_STATE[emote];
    if (!soundpost) return;

    soundpost.totalPlayTime += additionalPlayTime;
    if (!soundpost.isPlaying && soundpost.isPreloaded) {
        soundpost.isPlaying = true;
        playChatSoundpostAudio(soundpost.audio);
    }
    clearTimeout(soundpost.timeout);
    const remainingTime = soundpost.audio.duration - soundpost.audio.currentTime;
    const playDuration = Math.min(soundpost.totalPlayTime, remainingTime);
    soundpost.timeout = setTimeout(() => {
        stopChatSoundpostAudio(soundpost.audio);
        soundpost.isPlaying = false;
        soundpost.totalPlayTime = 0;
        soundpost.timeout = null;
    }, playDuration * 1000);
}

function playLongRare(emote, rareSound, additionalPlayTime = defaultAdditionalPlayTime) {
    const stateKey = `${emote}_rare`;

    if (!SOUNDPOST_PLAYBACK_STATE[stateKey]) {
        initializeSoundpost(stateKey, rareSound.soundurl, true);

        SOUNDPOST_PLAYBACK_STATE[stateKey].audio.addEventListener(
            "canplaythrough",
            () => {
                SOUNDPOST_PLAYBACK_STATE[stateKey].isPreloaded = true;
                playSoundpost(stateKey, additionalPlayTime);
            },
            { once: true }
        );
    } else {
        const state = SOUNDPOST_PLAYBACK_STATE[stateKey];

        if (state.isPreloaded && state.audio.duration) {
            const remainingTime = state.audio.duration - state.audio.currentTime;
            const timeToAdd = Math.min(additionalPlayTime, remainingTime);

            if (timeToAdd > 0) {
                playSoundpost(stateKey, timeToAdd);
            }
        }
    }
}

function isLongRarePlaying(emote) {
    const stateKey = `${emote}_rare`;
    const state = SOUNDPOST_PLAYBACK_STATE[stateKey];
    return state && state.isPlaying;
}

function injectSoundpost($message) {
    if (!window.SOUNDPOST_STATE) return;

    const $emotes = $message.find(".channel-emote[title]");
    let hasRolledForRare = false;

    $emotes.each((index, element) => {
        const $emote = $(element);
        const emoteTitle = $emote.attr("title");

        const soundpost = SOUNDPOSTS[emoteTitle];
        const rareSound = RARE_SOUNDPOSTS[emoteTitle];
        const longEmotes = [":homuhomu:", ":rratate:", "bakushin", "calliboy", ":mocohoeh:"];

        if (rareSound && !hasRolledForRare) {
            hasRolledForRare = true;

            if (shouldPlayRareDeterministic($message, emoteTitle, RARE_SOUNDPOSTS)) {
                console.log(`[Rare Triggered] ${emoteTitle} - deterministic roll succeeded`);
                try {
                    if (rareSound.isLong) {
                        playLongRare(emoteTitle, rareSound, 5);
                    } else {
                        const myaudio = new Audio(rareSound.soundurl);
                        playChatSoundpostAudio(myaudio, "Rare Soundpost");
                    }
                    return;
                } catch (err) {
                    console.error('[Rare Soundpost] Error:', err);
                }
            }
        }

        if (rareSound && rareSound.isLong && isLongRarePlaying(emoteTitle)) {
            playLongRare(emoteTitle, rareSound, 3);
            return;
        }

        if (soundpost) {
            try {
                const preload = longEmotes.includes(emoteTitle);
                initializeSoundpost(emoteTitle, soundpost.soundurl, preload);
                if (preload && SOUNDPOST_PLAYBACK_STATE[emoteTitle].isPreloaded) {
                    playSoundpost(emoteTitle, 5);
                } else if (preload) {
                    SOUNDPOST_PLAYBACK_STATE[emoteTitle].audio.addEventListener(
                        "canplaythrough",
                        () => {
                            playSoundpost(emoteTitle, 3);
                        },
                        { once: true }
                    );
                } else if (!PLAYED_SOUNDPOSTS.includes(soundpost.soundurl)) {
                    const myaudio = new Audio(soundpost.soundurl);
                    playChatSoundpostAudio(myaudio);
                    PLAYED_SOUNDPOSTS.push(soundpost.soundurl);
                }
            } catch (err) {
                console.error('[Soundpost] Error:', err);
            }
        }
    });

    PLAYED_SOUNDPOSTS = [];
    cleanupSoundpostPlaybackState();
}

function cleanupSoundpostPlaybackState() {
    const limit = 40;
    const keys = Object.keys(SOUNDPOST_PLAYBACK_STATE);
    if (keys.length > limit) {
        const toDelete = keys.slice(0, keys.length - limit);
        toDelete.forEach((key) => {
            const state = SOUNDPOST_PLAYBACK_STATE[key];
            if (state && state.audio) {
                stopChatSoundpostAudio(state.audio);
                state.audio.src = "";
            }
            delete SOUNDPOST_PLAYBACK_STATE[key];
        });
    }
}

function initializeSoundpost(emote, soundurl, preload = false) {
    if (!SOUNDPOST_PLAYBACK_STATE[emote]) {
        SOUNDPOST_PLAYBACK_STATE[emote] = {
            audio: new Audio(soundurl),
            totalPlayTime: 0,
            isPlaying: false,
            timeout: null,
            isPreloaded: false,
        };
        applySoundpostVolume(SOUNDPOST_PLAYBACK_STATE[emote].audio);

        if (preload) {
            SOUNDPOST_PLAYBACK_STATE[emote].audio.addEventListener(
                "canplaythrough",
                () => {
                    SOUNDPOST_PLAYBACK_STATE[emote].isPreloaded = true;
                },
                { once: true }
            );
        }
    }
}

async function loadSoundposts() {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/om3tcw/r/emotes/soundposts/soundposts.json"
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Soundpost] Failed to load soundposts.json:', err);
        return {};
    }
}

async function loadRareSoundposts() {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/om3tcw/r/emotes/soundposts/raresoundposts.json"
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Rare Soundpost] Failed to load raresoundposts.json:', err);
        return {};
    }
}

function toggleSoundpostButtonImage(soundpostButton) {
    if (window.SOUNDPOST_STATE) {
        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/schizo.gif')";
    } else {
        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/medicated.png')";
    }
}

(async () => {
    await window.waitForFunc("registerVolumeControl");
    window.registerVolumeControl({
        id: SOUNDPOST_VOLUME_CONTROL_ID,
        label: "Soundposts",
        order: 50,
        defaultVolume,
        previewUrl: SOUNDPOST_PREVIEW_URL,
    });

    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(injectSoundpost);
    const soundpostButton = document.createElement("button");
    soundpostButton.style.backgroundSize = "cover";
    await window.waitForFunc("DOMrebuiltPromise");
    await window.DOMrebuiltPromise;
    $(chatinputrow).append(soundpostButton);
    $(soundpostButton).on("click.schizo", () => {
        window.SOUNDPOST_STATE = !window.SOUNDPOST_STATE;
        if (!window.SOUNDPOST_STATE) {
            stopAllChatSoundposts();
        }
        localStorage.setItem("SOUNDPOST_STATE", window.SOUNDPOST_STATE);
        toggleSoundpostButtonImage(soundpostButton);
    });
    const [soundpostsData, rareSoundpostsData] = await Promise.all([
        loadSoundposts(),
        loadRareSoundposts()
    ]);

    window.SOUNDPOSTS = soundpostsData;
    RARE_SOUNDPOSTS = rareSoundpostsData;

    const bufferFetch = localStorage.getItem("SOUNDPOST_STATE");
    if (bufferFetch !== null) {
        window.SOUNDPOST_STATE = JSON.parse(bufferFetch);
    }

    toggleSoundpostButtonImage(soundpostButton);
})()
