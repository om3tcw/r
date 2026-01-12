let SOUNDPOSTS = {};
let RARE_SOUNDPOSTS = {};
let SOUNDPOST_PLAYBACK_STATE = {};
let PLAYED_SOUNDPOSTS = [];
const defaultVolume = 0.1;
const defaultAdditionalPlayTime = 3;
function playSoundpost(emote, additionalPlayTime = defaultAdditionalPlayTime) {
    const soundpost = SOUNDPOST_PLAYBACK_STATE[emote];
    if (!soundpost) return;
   
    soundpost.totalPlayTime += additionalPlayTime;
    if (!soundpost.isPlaying && soundpost.isPreloaded) {
        soundpost.isPlaying = true;
        soundpost.audio.play().catch(err => console.error('[Soundpost] Play failed:', err));
    }
    clearTimeout(soundpost.timeout);
    const remainingTime = soundpost.audio.duration - soundpost.audio.currentTime;
    const playDuration = Math.min(soundpost.totalPlayTime, remainingTime);
    soundpost.timeout = setTimeout(() => {
        soundpost.audio.pause();
        soundpost.isPlaying = false;
        soundpost.audio.currentTime = 0;
        soundpost.totalPlayTime = 0;
    }, playDuration * 1000);
}
function playLongRare(emote, rareSound, additionalPlayTime = defaultAdditionalPlayTime) {
    const stateKey = `${emote}_rare`;
   
    if (!SOUNDPOST_PLAYBACK_STATE[stateKey]) {
        // Initialize rare long sound
        initializeSoundpost(stateKey, rareSound.soundurl, true);
       
        // Wait for audio to be ready before playing
        SOUNDPOST_PLAYBACK_STATE[stateKey].audio.addEventListener(
            "canplaythrough",
            () => {
                SOUNDPOST_PLAYBACK_STATE[stateKey].isPreloaded = true;
                playSoundpost(stateKey, additionalPlayTime);
            },
            { once: true }
        );
    } else {
        // Extend existing rare long sound
        const state = SOUNDPOST_PLAYBACK_STATE[stateKey];
       
        if (state.isPreloaded && state.audio.duration) {
            // Calculate how much time we can actually add
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
    let hasRolledForRare = false; // Track if any emote has rolled for rare yet
   
    $emotes.each((index, element) => {
        const $emote = $(element);
        const emoteTitle = $emote.attr("title");
       
        const soundpost = SOUNDPOSTS[emoteTitle];
        const rareSound = RARE_SOUNDPOSTS[emoteTitle];
        const longEmotes = [":homuhomu:", ":rratate:", "bakushin", "calliboy"];
        // === RARE SOUND LOGIC ===
       
        // Check if this emote should roll for rare (first emote with rare entry)
        if (rareSound && !hasRolledForRare) {
            hasRolledForRare = true;
           
            if (shouldPlayRareDeterministic($message, emoteTitle, RARE_SOUNDPOSTS)) {
                console.log(`[Rare Triggered] ${emoteTitle} - deterministic roll succeeded`);
                try {
                    if (rareSound.isLong) {
                        playLongRare(emoteTitle, rareSound, 5);
                    } else {
                        // One-shot rare (can overlap - no deduplication)
                        const myaudio = new Audio(rareSound.soundurl);
                        myaudio.volume = defaultVolume;
                        myaudio.play().catch(err => console.error('[Rare Soundpost] Play failed:', err));
                    }
                    return; // Skip normal sound for this emote
                } catch (err) {
                    console.error('[Rare Soundpost] Error:', err);
                }
            }
        }
       
        // If a long rare is currently playing for this emote, extend it
        if (rareSound && rareSound.isLong && isLongRarePlaying(emoteTitle)) {
            playLongRare(emoteTitle, rareSound, 3);
            return; // Skip normal sound
        }
        // === NORMAL SOUNDPOST LOGIC ===
       
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
                    myaudio.volume = defaultVolume;
                    myaudio.play().catch(err => console.error('[Soundpost] Play failed:', err));
                    PLAYED_SOUNDPOSTS.push(soundpost.soundurl);
                }
            } catch (err) {
                console.error('[Soundpost] Error:', err);
            }
        }
    });
   
    // Reset tracking for next message
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
                state.audio.pause();
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
        SOUNDPOST_PLAYBACK_STATE[emote].audio.volume = defaultVolume;
       
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
        // ⚠️ PRODUCTION REMINDER: Change this URL to https://raw.githubusercontent.com/om3tcw/r/emotes/soundposts/raresoundposts.json
        const response = await fetch(
            "https://conzz97.github.io/test/soundposts/raresoundposts.json"
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
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(injectSoundpost);
    const soundpostButton = document.createElement("button");
    soundpostButton.style.backgroundSize = "cover";
    await window.waitForFunc("DOMrebuiltPromise");
    await window.DOMrebuiltPromise;
    $(chatinputrow).append(soundpostButton);
    $(soundpostButton).on("click.schizo", () => {
        window.SOUNDPOST_STATE = !window.SOUNDPOST_STATE;
        localStorage.setItem("SOUNDPOST_STATE", window.SOUNDPOST_STATE);
        toggleSoundpostButtonImage(soundpostButton);
    });
    // Load both regular and rare soundposts
    const [soundpostsData, rareSoundpostsData] = await Promise.all([
        loadSoundposts(),
        loadRareSoundposts()
    ]);
   
    SOUNDPOSTS = soundpostsData;
    RARE_SOUNDPOSTS = rareSoundpostsData;
   
    const bufferFetch = localStorage.getItem("SOUNDPOST_STATE");
    if (bufferFetch !== null) {
        window.SOUNDPOST_STATE = JSON.parse(bufferFetch);
    }
   
    toggleSoundpostButtonImage(soundpostButton);
})()
