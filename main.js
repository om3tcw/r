//XaeModules leftover
if (!window[CHANNEL.name]) {
    window[CHANNEL.name] = {};
}

//XaeModules leftover
if (![CHANNEL.name].favicon) {
    [CHANNEL.name].favicon = $("<link/>")
        .prop("id", "favicon")
        .attr("rel", "shortcut icon")
        .attr("type", "image/png")
        .attr("sizes", "64x64")
        .attr("href", "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/ogey.png")
        .appendTo("head");
}

const LOCAL_CDN_URL = "https://immergrok.mikobotecdn.win/immergrok-cytube-fork";

//For live jsdelivr usage
const JSDELIVR_CDN_URL = "https://cdn.jsdelivr.net/gh/om3tcw/r@"
const CURRENT_COMMIT = ""
const CURRENT_BRANCH = "immergrok" //Change to om3tcw when live

//CHANGE TO JSDELIVR_CDN_URL WHEN LIVE
const CURRENT_CDN = LOCAL_CDN_URL;

const MODULES_FOLDER = "custom_modules/";
const MODULE_LOADER = `${MODULES_FOLDER}module_orchestration/ModuleLoader.js`
const ModulePaths = [
    { CSSInjection: `custom_css_injection/customCssInjection.js`},
    { MahjongMode: `chat_modules/mahjongMode.js` },
    { ChatMessageProcessor: `module_orchestration/chatMessageProcessor.js`},
    { TabsBelowVideo: `ui_modules/tabsBelowVideo.js`}, //I wouldn't disable this one
    { CustomDOMChanges: `ui_modules/customDOMChanges.js`},
    { CustomSettings:`ui_modules/customSettingsModal.js` },
    { BetterPlaylist: `ui_modules/betterPlaylist.js` },
    { BetterPms: `ui_modules/betterPms.js` },
    { SoundNotifications: `soundNotifications.js` },
    { MoreLayoutOptions: `ui_modules/moreLayoutOptions.js` },
    { CustomUserList: `ui_modules/customUserlist.js` },
    { HoloPeek: `holopeek/holoPeek.js` },
    { MessageModifications: `chat_modules/messageModifications.js`},
    { EnhancedEmotes: `chat_modules/enhancedEmotes.js` },
    { ImagePreview: `chat_modules/imagePreview.js` },
    { Soundposts: `chat_modules/soundpostModule.js` },
    { NNDChatModule: `chat_modules/nndChatModule.js`, isActive: 0, rank: -1}
]

//candidate to move to util.js
function makeLiveCDNLink(fileName) {
    return  CURRENT_CDN +
            CURRENT_COMMIT +
            "/" +
            fileName + 
            "?ver=1"
}

//candidate to move to util.js
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