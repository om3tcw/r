const ModuleLoaderOptions = 
{
    playlist: {
        collapse: false,
        hidePlaylist: true,
        inlineBlame: true,
        moveReporting: false,
        quickQuality: false,
        recentMedia: true,
        simpleLeader: true,
        syncCheck: true,
        thumbnails: true,
        timeEstimates: true,
        userlist: { autoHider: true },
        smartScroll: true,
        maxMessages: 120
    },
}

class ModuleLoader {
    #modulePaths
    #moduleObjects;
    #options;
    #state;
    #clientRank;

    constructor(modulePaths) {
        this.#modulePaths = modulePaths
        this.#moduleObjects = null;
        this.#options = ModuleLoaderOptions;
        this.#state = { prev: "", pos: 0 };
        this.#clientRank = CLIENT.rank;
        this.allModulesLoaded = null;
    }

    #createModuleObject(moduleName, isActive = 1, rank = -1) {
        return { active: isActive, rank: rank, url: makeLiveCDNLink(`${MODULES_FOLDER}${moduleName}`), done: true};
    }

    #turnPathsIntoModuleObjects(modulePaths) {
        let moduleObjects = {}
        for (const module of modulePaths) {
            const modName = Object.keys(module)[0];
            const modUrl = module[modName]
            let isActive = module.isActive ?? 1;
            let rank = module.rank ?? -1;
            moduleObjects[modName] = this.#createModuleObject(modUrl, isActive, rank) 
        }
        this.#moduleObjects = moduleObjects
    }

    async initialize() {
        if (CLIENT.modules) {
            return;
        }
        
        //Idk about any-o-this, chief
        CLIENT.modules = this.#moduleObjects;
        window[CHANNEL.name].modulesOptions = this.#options;
        
        this.#turnPathsIntoModuleObjects(this.#modulePaths)
        this.allModulesLoaded = this.#sequencerLoader();
    }

    #isModuleEligibleForLoading(moduleConfig) {
        return moduleConfig.active && moduleConfig.rank <= this.#clientRank;
    }

    #sequencerLoader() {
        const moduleLoadPromises = [];
        this.#state.pos = 0;
        this.#state.prev = "";

        for (const moduleName of Object.keys(this.#moduleObjects)) {
            const moduleObject = this.#moduleObjects[moduleName];

            if (!moduleObject || typeof moduleObject !== 'object') {
                continue;
            }

            if (this.#isModuleEligibleForLoading(moduleObject)) {
                this.#state.prev = moduleName;
                this.#state.pos++;

                const moduleImport = import(moduleObject.url).then((importedModule) => {
                    for (const exportName in importedModule) {
                        if (Object.hasOwn(importedModule, exportName)) {
                            window[exportName] = importedModule[exportName];
                        }
                    }
                })
                moduleLoadPromises.push(moduleImport);
            }
        }
        return Promise.all(moduleLoadPromises);
    }
}

window.waitForFunc = async (functionalityWanted) => {
    if (functionalityWanted) {
        while (typeof window[functionalityWanted] === "undefined") {
            await new Promise((resolve) => setTimeout(resolve, 5));
        }
    }
};


export default ModuleLoader;

