export const MOTD_NAVBAR_TOGGLE_ID = "navbar-motd-toggle";
export const MOTD_TAB_SELECTOR = "[data-motd-tab]";

const MOTD_EVENT_NAMESPACE = ".hlggMotd";
const DEFAULT_MOTD_LOGO_URL = "https://mikobotecdn.win/emotes/garchomp.png";

export function createMotdStorageKey(channelName) {
  return `${channelName || "cytube"}_motd_active_tab`;
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeMotdTabs(tabs, fallbackHtml = "") {
  const normalizedTabs = [];
  const usedIds = new Set();

  if (Array.isArray(tabs)) {
    tabs.forEach((tab, index) => {
      if (!tab || typeof tab !== "object") {
        return;
      }

      const title = String(tab.title ?? tab.label ?? tab.name ?? "").trim();
      if (!title) {
        return;
      }

      const html = String(tab.html ?? tab.content ?? "");
      const baseId = slugify(tab.id || title, `tab-${index + 1}`);
      let id = baseId;
      let suffix = 2;

      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      usedIds.add(id);
      normalizedTabs.push({ id, title, html });
    });
  }

  if (normalizedTabs.length > 0) {
    return normalizedTabs;
  }

  const fallbackContent = String(fallbackHtml || "");
  if (fallbackContent.trim() === "") {
    return [];
  }

  return [{ id: "motd", title: "MOTD", html: fallbackContent }];
}

export function getMotdShellClass(tabs) {
  return tabs.length > 1
    ? "hlgg-motd-shell hlgg-motd-shell-tabs"
    : "hlgg-motd-shell hlgg-motd-shell-single";
}

function getGlobalMotdTabs() {
  if (Array.isArray(window.HLGG_MOTD_TABS)) {
    return normalizeMotdTabs(window.HLGG_MOTD_TABS);
  }

  if (Array.isArray(window.MOTDTabs_Array)) {
    return normalizeMotdTabs(
      window.MOTDTabs_Array.map((tab) => ({
        title: Array.isArray(tab) ? tab[0] : "",
        html: Array.isArray(tab) ? tab[1] : "",
      })),
    );
  }

  return [];
}

function extractMotdTabsFromHtml(rawHtml) {
  const tabs = [];
  const $scratch = $("<div>").html(rawHtml);

  $scratch.children(MOTD_TAB_SELECTOR).each(function collectMotdTab() {
    const $tab = $(this);
    tabs.push({
      id: $tab.attr("data-motd-tab-id") || $tab.attr("data-motd-tab"),
      title: $tab.attr("data-motd-tab"),
      html: $tab.html(),
    });
  });

  return normalizeMotdTabs(tabs);
}

function readStoredActiveTab(storageKey) {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    return "";
  }
}

function storeActiveTab(storageKey, tabId) {
  try {
    localStorage.setItem(storageKey, tabId);
  } catch (error) {
    // User-side storage blockers should not break the MOTD.
  }
}

function getInitialActiveTabId(tabs, storageKey) {
  const storedTabId = readStoredActiveTab(storageKey);

  if (tabs.some((tab) => tab.id === storedTabId)) {
    return storedTabId;
  }

  return tabs[0] ? tabs[0].id : "";
}

function selectMotdTab($shell, tabs, tabId, storageKey) {
  const selectedTab = tabs.find((tab) => tab.id === tabId) || tabs[0];
  if (!selectedTab) {
    return;
  }

  $shell.find(".hlgg-motd-tab").each(function updateTabButton() {
    const $button = $(this);
    const isActive = $button.attr("data-motd-tab-id") === selectedTab.id;
    $button.toggleClass("hlgg-motd-tab-active", isActive);
    $button.attr("aria-selected", isActive ? "true" : "false");
    $button.attr("tabindex", isActive ? "0" : "-1");
  });

  $shell.find("#hlgg-motd-panel").html(selectedTab.html);
  storeActiveTab(storageKey, selectedTab.id);
}

function buildMotdShell(tabs, storageKey) {
  const activeTabId = getInitialActiveTabId(tabs, storageKey);
  const logoUrl =
    window.HLGG_MOTD_LOGO_URL === false
      ? ""
      : window.HLGG_MOTD_LOGO_URL || DEFAULT_MOTD_LOGO_URL;

  const $shell = $("<div>", {
    id: "hlgg-motd-shell",
    class: getMotdShellClass(tabs),
    role: "region",
    "aria-label": "Message of the day",
  });

  if (logoUrl) {
    $("<div>", { id: "hlgg-motd-logo", "aria-hidden": "true" })
      .append($("<img>", { src: logoUrl, alt: "" }))
      .appendTo($shell);
  }

  const $main = $("<div>", { id: "hlgg-motd-main" }).appendTo($shell);

  if (tabs.length > 1) {
    const $tabList = $("<div>", {
      id: "hlgg-motd-tabs",
      role: "tablist",
      "aria-label": "MOTD sections",
    }).appendTo($main);

    tabs.forEach((tab) => {
      $("<button>", {
        type: "button",
        class: "hlgg-motd-tab",
        role: "tab",
        id: `hlgg-motd-tab-${tab.id}`,
        "data-motd-tab-id": tab.id,
        "aria-controls": "hlgg-motd-panel",
        text: tab.title,
      }).appendTo($tabList);
    });
  }

  $("<div>", {
    id: "hlgg-motd-panel",
    class: "hlgg-motd-panel",
    role: "tabpanel",
  }).appendTo($main);

  $shell.on(`click${MOTD_EVENT_NAMESPACE}`, ".hlgg-motd-tab", function onTabClick(event) {
    event.preventDefault();
    selectMotdTab($shell, tabs, $(this).attr("data-motd-tab-id"), storageKey);
  });

  selectMotdTab($shell, tabs, activeTabId, storageKey);

  return $shell;
}

function setMotdVisible(isVisible) {
  const $motdWrap = $("#motdwrap");
  const $motd = $("#motd");

  $motdWrap.toggle(isVisible);
  $motd.toggle(isVisible);
  $(`#${MOTD_NAVBAR_TOGGLE_ID}`).toggleClass("active", isVisible);

  $motdWrap
    .find("#togglemotd .glyphicon")
    .toggleClass("glyphicon-minus", isVisible)
    .toggleClass("glyphicon-plus", !isVisible);
}

function ensureMotdNavbarToggle() {
  const $navbarList = $("#nav-collapsible .nav.navbar-nav").first();
  if ($navbarList.length === 0) {
    return;
  }

  let $toggle = $(`#${MOTD_NAVBAR_TOGGLE_ID}`);
  if ($toggle.length === 0) {
    $toggle = $("<a>", {
      id: MOTD_NAVBAR_TOGGLE_ID,
      href: "javascript:void(0)",
      text: "MOTD",
    });
    $("<li>").append($toggle).appendTo($navbarList);
  }

  $toggle.off(MOTD_EVENT_NAMESPACE).on(`click${MOTD_EVENT_NAMESPACE}`, function onToggleClick(event) {
    event.preventDefault();
    const shouldShow = !($("#motdwrap").is(":visible") && $("#motd").is(":visible"));
    setMotdVisible(shouldShow);
  });
}

function bindMotdCloseButton() {
  const $motdWrap = $("#motdwrap");
  const $closeButton = $motdWrap.find("#togglemotd");

  $motdWrap.off("click");
  $closeButton.off("click").on(`click${MOTD_EVENT_NAMESPACE}`, function onCloseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    setMotdVisible(false);
  });
}

function getRawMotdHtml($motd) {
  if (window.CHANNEL && typeof window.CHANNEL.motd === "string") {
    return window.CHANNEL.motd;
  }

  const storedRawHtml = $motd.data("hlggMotdRawHtml");
  if (typeof storedRawHtml === "string") {
    return storedRawHtml;
  }

  return $motd.html() || "";
}

function renderCurrentMotd() {
  const $motd = $("#motd");
  if ($motd.length === 0) {
    return;
  }

  const rawHtml = getRawMotdHtml($motd);
  $motd.data("hlggMotdRawHtml", rawHtml);

  const globalTabs = getGlobalMotdTabs();
  const tabs =
    globalTabs.length > 0
      ? globalTabs
      : normalizeMotdTabs(extractMotdTabsFromHtml(rawHtml), rawHtml);

  $motd.empty();

  if (tabs.length === 0) {
    setMotdVisible(false);
    return;
  }

  $motd.append(buildMotdShell(tabs, createMotdStorageKey(window.CHANNEL && window.CHANNEL.name)));
  setMotdVisible(true);
}

function wrapSetMotdCallback() {
  if (!window.Callbacks || typeof window.Callbacks.setMotd !== "function") {
    return;
  }

  if (window.Callbacks.setMotd.hlggMotdWrapped) {
    return;
  }

  const baseSetMotd = window.Callbacks.setMotd;
  window.Callbacks.setMotd = function setMotdWithTabbedRender() {
    const result = baseSetMotd.apply(this, arguments);
    renderCurrentMotd();
    return result;
  };
  window.Callbacks.setMotd.hlggMotdWrapped = true;
}

function initializeMotdModule() {
  if (typeof window === "undefined" || typeof window.$ !== "function") {
    return;
  }

  $(() => {
    ensureMotdNavbarToggle();
    bindMotdCloseButton();
    wrapSetMotdCallback();
    renderCurrentMotd();
  });
}

initializeMotdModule();
