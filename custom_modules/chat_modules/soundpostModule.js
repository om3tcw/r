let SOUNDPOSTS = {};
let SOUNDPOST_PLAYBACK_STATE = {};
let PLAYED_SOUNDPOSTS = [];
const defaultVolume = 0.1;
const defaultAdditionalPlayTime = 3;

function playSoundpost(emote, additionalPlayTime = defaultAdditionalPlayTime) {
    const soundpost = SOUNDPOST_PLAYBACK_STATE[emote];
    soundpost.totalPlayTime += additionalPlayTime;

    if (!soundpost.isPlaying && soundpost.isPreloaded) {
        soundpost.isPlaying = true;
        soundpost.audio.play();
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

function injectSoundpost($message) {

    if (window.SOUNDPOST_STATE) {
        const $emotes = $message.find(".channel-emote[title]");
        $emotes.each((_, element) => {
            const $emote = $(element);
            const emoteTitle = $emote.attr("title");
            const soundpost = SOUNDPOSTS[emoteTitle];

            const longEmotes = [":homuhomu:", ":rratate:", "bakushin", "calliboy"];

            if (soundpost) {
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
                    myaudio.play();
                    PLAYED_SOUNDPOSTS.push(soundpost.soundurl);
                }
            }
        });
    }
    PLAYED_SOUNDPOSTS = [];
    cleanupSoundpostPlaybackState();
}

function cleanupSoundpostPlaybackState() {
    const limit = 40;
    const keys = Object.keys(SOUNDPOST_PLAYBACK_STATE);
    if (keys.length > limit) {
        const toDelete = keys.slice(0, keys.length - limit);
        toDelete.forEach((key) => {
            if (SOUNDPOST_PLAYBACK_STATE[key].audio) {
                SOUNDPOST_PLAYBACK_STATE[key].audio.pause();
                SOUNDPOST_PLAYBACK_STATE[key].audio.src = "";
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
    const response = await fetch(
        "https://raw.githubusercontent.com/om3tcw/r/emotes/soundposts/soundposts.json"
    );
    return await response.json();
};

function toggleSoundpostButtonImage(soundpostButton) {
    if (window.SOUNDPOST_STATE) {
        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/schizo.gif')";
    } else {
        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/medicated.png')";
    }
}

(async () => {
    await window.waitForFunc("chatMsgSocketTapFunctions")
    window.chatMsgSocketTapFunctions.push(injectSoundpost);

    const soundpostButton = document.createElement("button");
    soundpostButton.style.backgroundSize = "cover";

    //hacky
    await window.waitForFunc("DOMrebuiltPromise");
    await window.DOMrebuiltPromise;
    $(chatinputrow).append(soundpostButton);

    $(soundpostButton).on("click.schizo", () => {
        window.SOUNDPOST_STATE = !window.SOUNDPOST_STATE;
        localStorage.setItem("SOUNDPOST_STATE", window.SOUNDPOST_STATE);
        toggleSoundpostButtonImage(soundpostButton)
    });

    await loadSoundposts().then((data) => {
        SOUNDPOSTS = data;
        let bufferFetch = localStorage.getItem("SOUNDPOST_STATE");
        if (bufferFetch !== null) {
            window.SOUNDPOST_STATE = JSON.parse(bufferFetch);
        }        
    }) 
    
    toggleSoundpostButtonImage(soundpostButton);
})()
