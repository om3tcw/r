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
    .attr("href", "https://mikobotecdn.win/emotes/ogey.png")
    .appendTo("head");
}

const LOCAL_CDN_URL = "https://127.0.0.1:5050"; //change before push
const ONLINE_CDN = "https://mikobotecdn.win";
//CHANGE WHEN DEVELOPING/LIVE
const CURRENT_CDN = ONLINE_CDN;

const MODULES_FOLDER = "custom_modules/";
const MODULE_LOADER = `${MODULES_FOLDER}module_orchestration/ModuleLoader.js`;
const CHAT_MODULE_UTILS = `${MODULES_FOLDER}utils/chatCommandUtils.js`;
const CLIENT_ENVIRONMENT_UTILS = `${MODULES_FOLDER}utils/clientEnvironmentUtils.js`;
const FES_FUN_CONTROLLER = `${MODULES_FOLDER}fes_fun/fesFunController.js`;

function applyFesFunMobileGate(moduleConfig, isMobileClient) {
  if (!moduleConfig || typeof moduleConfig !== "object") {
    return moduleConfig;
  }

  const moduleName = Object.keys(moduleConfig)[0];
  const modulePath = String(moduleConfig[moduleName] || "");
  if (!isMobileClient || !modulePath.startsWith("fes_fun/")) {
    return moduleConfig;
  }

  return {
    ...moduleConfig,
    isActive: 0,
  };
}

const ModulePaths = [
  { CSSInjection: `custom_css_injection/customCssInjection.js` },
  { MahjongMode: `chat_modules/mahjongMode.js`, isActive: 1, rank: -1 },
  { ChatMessageProcessor: `module_orchestration/chatMessageProcessor.js` },
  { TabsBelowVideo: `ui_modules/tabsBelowVideo.js` }, //I wouldn't disable this one
  { CustomDOMChanges: `ui_modules/customDOMChanges.js` },
  { BetterPlaylist: `ui_modules/betterPlaylist.js` },
  { BetterPms: `ui_modules/betterPms.js` },
  { SoundNotifications: `soundNotifications.js` },
  { MoreLayoutOptions: `ui_modules/moreLayoutOptions.js` },
  { CustomUserList: `ui_modules/customUserlist.js` },
  { HoloPeek: `holopeek/holoPeek.js` },
  { MessageModifications: `chat_modules/messageModifications.js` },
  { MikuMikuBeam: `fes_fun/mikuMikuBeam.js` },
  { UserWordReplacement: `fes_fun/userWordReplacement.js` },
  { MigoboteGold: `fes_fun/migobotegold.js` },
  { UohMode: `fes_fun/uohmode.js` },
  { EnhancedEmotes: `chat_modules/enhancedEmotes.js` },
  { ImagePreview: `chat_modules/imagePreview.js`, isActive: 0, rank: -1 },
  { HashUtil: `utils/hashUtil.js` },
  { Soundposts: `chat_modules/soundpostModule.js` },
  { NNDChatModule: `chat_modules/nndChatModule.js`, isActive: 1, rank: -1 },
  { TweetEmbed: `chat_modules/tweetEmbed.js` },
  { VideoTitlePreview: `chat_modules/videoTitlePreview.js` },
  { NinoMode: `fes_fun/ninoMode.js` },
  { RratButton: `ui_modules/rratButton.js` },
  { EmotelistEnhancement: `ui_modules/emotelistEnhancements.js` },
];

//candidate to move to util.js
//change ?ver=n to automatically push changes.
function makeLiveCDNLink(fileName) {
  return CURRENT_CDN + "/" + fileName + "?ver=1-13-26";
}

//candidate to move to util.js
function fetchLastChatElement() {
  return $(messagebuffer).children().last().children().last();
}

const ModuleLoaderPromise = (async () => {
  const importedModule = await import(makeLiveCDNLink(MODULE_LOADER));
  return importedModule.default;
})();

const ChatModuleUtilsPromise = (async () => {
  const importedModule = await import(makeLiveCDNLink(CHAT_MODULE_UTILS));
  return importedModule;
})();

const ClientEnvironmentUtilsPromise = (async () => {
  const importedModule = await import(
    makeLiveCDNLink(CLIENT_ENVIRONMENT_UTILS)
  );
  return importedModule;
})();

const FesFunControllerPromise = (async () => {
  const importedModule = await import(makeLiveCDNLink(FES_FUN_CONTROLLER));
  return importedModule;
})();

let resolveAllModulesReady;
window.allModulesReady = new Promise((resolve, reject) => {
  resolveAllModulesReady = resolve;
});

(async function loadLogic() {
  await ChatModuleUtilsPromise;
  const { shouldTreatAsMobileClient } = await ClientEnvironmentUtilsPromise;
  await FesFunControllerPromise;
  const ModuleLoaderClass = await ModuleLoaderPromise;
  const isMobileClient = shouldTreatAsMobileClient();
  const ModuleLoaderInstance = new ModuleLoaderClass(
    ModulePaths.map((moduleConfig) =>
      applyFesFunMobileGate(moduleConfig, isMobileClient),
    ),
  );

  await ModuleLoaderInstance.initialize();
  await ModuleLoaderInstance.allModulesLoaded;
  resolveAllModulesReady();
})();
