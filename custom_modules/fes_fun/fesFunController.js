const FES_FUN_STORAGE_KEY = "fesFunEnabled";
const LEGACY_FES_FUN_STORAGE_KEY = "disableMikuBeam";
const registeredFesFunModules = new Map();

function getInitialFesFunEnabledState() {
  try {
    if (!window.localStorage) {
      return true;
    }

    const storedValue = localStorage.getItem(FES_FUN_STORAGE_KEY);
    if (storedValue === "1" || storedValue === "true") {
      return true;
    }
    if (storedValue === "0" || storedValue === "false") {
      return false;
    }

    // clean up old key
    if (localStorage.getItem(LEGACY_FES_FUN_STORAGE_KEY) != null) {
      localStorage.removeItem(LEGACY_FES_FUN_STORAGE_KEY);
    }

    return true;
  } catch (error) {
    console.error("[fesFun] Failed to read initial state:", error);
    return true;
  }
}

let isFesFunEnabled = getInitialFesFunEnabledState();

function persistFesFunEnabledState() {
  try {
    if (!window.localStorage) {
      return;
    }

    localStorage.setItem(FES_FUN_STORAGE_KEY, isFesFunEnabled ? "1" : "0");
    localStorage.removeItem(LEGACY_FES_FUN_STORAGE_KEY);
  } catch (error) {
    console.error("[fesFun] Failed to persist state:", error);
  }
}

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
  persistFesFunEnabledState();

  for (const moduleRegistration of registeredFesFunModules.values()) {
    applyFesFunStateToModule(moduleRegistration);
  }

  return isFesFunEnabled;
}

function setFesFunModuleEnabled(moduleId, nextEnabled) {
  const normalizedModuleId = String(moduleId || "").trim();
  if (!normalizedModuleId) {
    return null;
  }

  const moduleRegistration = registeredFesFunModules.get(normalizedModuleId);
  if (!moduleRegistration) {
    return null;
  }

  return moduleRegistration.setEnabled(Boolean(nextEnabled));
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
  setModuleEnabled: setFesFunModuleEnabled,
};
