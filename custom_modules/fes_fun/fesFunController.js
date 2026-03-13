const FES_FUN_STORAGE_KEY = "noFun";
const registeredFesFunModules = new Map();

function getInitialFesFunEnabledState() {
  try {
    const storedValue =
      window.localStorage && localStorage.getItem(FES_FUN_STORAGE_KEY);
    return storedValue !== "1" && storedValue !== "true";
  } catch (error) {
    console.error("[fesFun] Failed to read initial state:", error);
    return true;
  }
}

let isFesFunEnabled = getInitialFesFunEnabledState();

function applyFesFunStateToModule(moduleRegistration) {
  if (
    !moduleRegistration ||
    typeof moduleRegistration.setEnabled !== "function"
  ) {
    return;
  }

  moduleRegistration.setEnabled(isFesFunEnabled);
}

function registerFesFunModule(moduleRegistration) {
  if (
    !moduleRegistration ||
    typeof moduleRegistration !== "object" ||
    !String(moduleRegistration.id || "").trim() ||
    typeof moduleRegistration.setEnabled !== "function"
  ) {
    throw new Error("[fesFun] registerModule requires an id and setEnabled()");
  }

  const moduleId = String(moduleRegistration.id).trim();
  const normalizedRegistration = {
    id: moduleId,
    getState:
      typeof moduleRegistration.getState === "function"
        ? moduleRegistration.getState
        : null,
    setEnabled: moduleRegistration.setEnabled,
  };

  registeredFesFunModules.set(moduleId, normalizedRegistration);
  applyFesFunStateToModule(normalizedRegistration);
  return normalizedRegistration;
}

function setFesFunEnabled(nextEnabled) {
  isFesFunEnabled = Boolean(nextEnabled);

  for (const moduleRegistration of registeredFesFunModules.values()) {
    applyFesFunStateToModule(moduleRegistration);
  }

  return isFesFunEnabled;
}

function getFesFunState() {
  return {
    enabled: isFesFunEnabled,
    modules: Array.from(registeredFesFunModules.values()).map(
      (moduleRegistration) => ({
        id: moduleRegistration.id,
        state: moduleRegistration.getState
          ? moduleRegistration.getState()
          : null,
      }),
    ),
    storageKey: FES_FUN_STORAGE_KEY,
  };
}

window.fesFun = {
  getState: getFesFunState,
  isEnabled() {
    return isFesFunEnabled;
  },
  registerModule: registerFesFunModule,
  setEnabled: setFesFunEnabled,
};
