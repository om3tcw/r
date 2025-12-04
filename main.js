//XaeModules leftover
if (!window[CHANNEL.name]) {
    window[CHANNEL.name] = {};
}

//XaeModules leftover
if (!window[CHANNEL.name].favicon) {  // ← FIXED: Added window. and removed !
    window[CHANNEL.name].favicon = $("<link/>")
        .prop("id", "favicon")
        .attr("rel", "shortcut icon")
        .attr("type", "image/png")
        .attr("sizes", "64x64")
        .attr("href", "https://mikobotecdn.win/emotes/ogey.png")  // ← Keep this if emotes are still on old CDN; change if needed
        .appendTo("head");
}

const LOCAL_CDN_URL = "https://immergrok.mikobotecdn.win/immergrok-cytube-fork";
const ONLINE_CDN = "https://pub-98802ca013e94e4abe97676f2168a850.r2.dev";  // ← YOUR R2 BUCKET (NEW)
const CURRENT_CDN = ONLINE_CDN;  // ← NOW POINTS TO R2.DEV

const MODULES_FOLDER = "custom_modules/";
const MODULE_LOADER = `${MODULES_FOLDER}module_orchestration/ModuleLoader.js`;
const ModulePaths = [
    { CSSInjection: `custom_css_injection/customCssInjection.js`},
    { MahjongMode: `chat_modules/mahjongMode.js` , isActive: 1, rank: -1 },
    { ChatMessageProcessor: `module_orchestration/chatMessageProcessor.js`},
    { TabsBelowVideo: `ui_modules/tabsBelowVideo.js`}, //I wouldn't disable this one
    { CustomDOMChanges: `ui_modules/customDOMChanges.js`},
    { BetterPlaylist: `ui_modules/betterPlaylist.js` },
    { BetterPms: `ui_modules/betterPms.js` },
    { SoundNotifications: `soundNotifications.js` },
    { MoreLayoutOptions: `ui_modules/moreLayoutOptions.js` },
    { CustomUserList: `ui_modules/customUserlist.js` },
    { HoloPeek: `holopeek/holoPeek.js` },
    { MessageModifications: `chat_modules/messageModifications.js`},
    { EnhancedEmotes: `chat_modules/enhancedEmotes.js` },
    { ImagePreview: `chat_modules/imagePreview.js` , isActive: 0, rank: -1},
    { Soundposts: `chat_modules/soundpostModule.js` },
    { NNDChatModule: `chat_modules/nndChatModule.js`, isActive: 1, rank: -1},
    { RratButton: `ui_modules/rratButton.js`},
]

//candidate to move to util.js
//change ?ver=n to automatically push changes.
function makeLiveCDNLink(fileName) {
    return  CURRENT_CDN +
            "/" +
            fileName +
            "?ver=20251202"  // ← BUMP THIS FOR INSTANT RELOADS (today's date)
}

function fetchLastChatElement() {
    return $(messagebuffer).children().last().children().last();
}

const ModuleLoaderPromise = (async () => {
    const importedModule = await import(makeLiveCDNLink(MODULE_LOADER));
    return importedModule.default;
})();

let resolveAllModulesReady;
window.allModulesReady = new Promise((resolve, reject) => {
    resolveAllModulesReady = resolve;
});

(async function loadLogic() {

    const ModuleLoaderClass = await ModuleLoaderPromise;
    const ModuleLoaderInstance = new ModuleLoaderClass(ModulePaths);

    await ModuleLoaderInstance.initialize();
    await ModuleLoaderInstance.allModulesLoaded;
    resolveAllModulesReady();

})();