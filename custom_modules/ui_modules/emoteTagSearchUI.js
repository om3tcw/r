const SEARCH_DEBOUNCE_MS = 120;
const SEARCH_EVENT_GRACE_MS = 50;
const MAX_TAG_SUGGESTIONS = 8;
const LOWERCASE_EMOTE_NAME_CACHE = new Map();

let searchDebounceTimer = null;
let lastSearchInputEventAt = 0;
let bypassSearchDebounce = false;
let cachedTagCatalog = null;
let activeTagSuggestionIndex = -1;

function getEmoteModal() {
  return document.querySelector("#emotelist");
}

function getEmoteSearchInput() {
  const modal = getEmoteModal();
  if (!modal) {
    return null;
  }

  const inputs = modal.querySelectorAll(
    'input:not([type]), input[type="search"], input[type="text"]',
  );
  return (
    Array.from(inputs).find((input) => {
      return (
        !input.closest("#emotelist-tag-editor") &&
        !input.closest("#emotelist-tag-export-panel") &&
        input.id !== "emotelist-tag-input"
      );
    }) || null
  );
}

function getSearchContainer() {
  return (
    document.querySelector("#emotelist-toolbar-row > .pull-left") ||
    document.querySelector("#emotelist .modal-body .pull-left")
  );
}

function parseSearchQuery() {
  const query = (getEmoteSearchInput()?.value || "").trim();
  const tagSplit = query.match(/^(.*?)(?:\s+|^)tags:\s*(.*)$/i);

  if (!tagSplit) {
    return {
      hasTagClause: false,
      nameQuery: query,
      tagTerms: [],
    };
  }

  return {
    hasTagClause: true,
    nameQuery: tagSplit[1].trim(),
    tagTerms: window.EMOTE_TAG_STORE.parseTagInput(tagSplit[2]),
  };
}

function getTagSearchContext() {
  const searchInput = getEmoteSearchInput();
  if (!searchInput) {
    return null;
  }

  const query = searchInput.value || "";
  const tagSplit = query.match(/^(.*?)(tags:\s*)(.*)$/i);
  if (!tagSplit) {
    return null;
  }

  const tagSection = tagSplit[3];
  const lastCommaIndex = tagSection.lastIndexOf(",");
  const completedTagSection =
    lastCommaIndex >= 0 ? tagSection.slice(0, lastCommaIndex + 1) : "";
  const rawCurrentTerm =
    lastCommaIndex >= 0 ? tagSection.slice(lastCommaIndex + 1) : tagSection;
  const leadingWhitespace = rawCurrentTerm.match(/^\s*/)?.[0] || "";
  const currentTerm = rawCurrentTerm.trim().toLowerCase();
  const selectedTerms = window.EMOTE_TAG_STORE.parseTagInput(completedTagSection);

  return {
    currentTerm,
    prefix: `${tagSplit[1]}${tagSplit[2]}${completedTagSection}${leadingWhitespace}`,
    searchInput,
    selectedTerms,
  };
}

function buildTagCatalog() {
  const countsByTag = new Map();

  Object.values(window.EMOTE_TAGS || {}).forEach((tagList) => {
    if (!Array.isArray(tagList)) {
      return;
    }

    tagList.forEach((tag) => {
      countsByTag.set(tag, (countsByTag.get(tag) || 0) + 1);
    });
  });

  return Array.from(countsByTag.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.tag.localeCompare(b.tag);
    });
}

function getTagCatalog() {
  if (!cachedTagCatalog) {
    cachedTagCatalog = buildTagCatalog();
  }

  return cachedTagCatalog;
}

function getTagSuggestionPanel() {
  return document.querySelector("#emotelist-tag-suggestions");
}

function hideTagSuggestions() {
  const panel = getTagSuggestionPanel();
  if (!panel) {
    return;
  }

  panel.hidden = true;
  panel.innerHTML = "";
  activeTagSuggestionIndex = -1;
}

function getMatchingTagSuggestions() {
  const context = getTagSearchContext();
  if (!context || !context.currentTerm) {
    return [];
  }

  const selectedTerms = new Set(context.selectedTerms);
  return getTagCatalog()
    .filter(({ tag }) => {
      return !selectedTerms.has(tag) && tag.includes(context.currentTerm);
    })
    .slice(0, MAX_TAG_SUGGESTIONS);
}

function applyTagSuggestion(tag) {
  const context = getTagSearchContext();
  if (!context) {
    return;
  }

  context.searchInput.value = `${context.prefix}${tag}, `;
  hideTagSuggestions();
  runImmediateRefresh(() => {
    if (typeof EMOTELIST !== "undefined") {
      EMOTELIST.page = 0;
      EMOTELIST.handleChange();
    }
  });
  context.searchInput.focus();
}

function updateTagSuggestionSelection() {
  const panel = getTagSuggestionPanel();
  if (!panel || panel.hidden) {
    return;
  }

  panel
    .querySelectorAll(".emotelist-tag-suggestion")
    .forEach((button, index) => {
      button.classList.toggle(
        "is-active",
        index === activeTagSuggestionIndex,
      );
    });
}

function renderSuggestions() {
  const panel = getTagSuggestionPanel();
  if (!panel) {
    return;
  }

  const suggestions = getMatchingTagSuggestions();
  if (!suggestions.length) {
    hideTagSuggestions();
    return;
  }

  panel.innerHTML = "";
  suggestions.forEach(({ tag, count }, index) => {
    const suggestionButton = document.createElement("button");
    suggestionButton.className = "emotelist-tag-suggestion btn btn-xs btn-default";
    suggestionButton.type = "button";
    suggestionButton.dataset.index = String(index);
    suggestionButton.innerHTML = `
        <span class="emotelist-tag-suggestion-name">${tag}</span>
        <span class="emotelist-tag-suggestion-count">${count}</span>
    `;

    suggestionButton.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });
    suggestionButton.addEventListener("click", () => {
      applyTagSuggestion(tag);
    });

    panel.appendChild(suggestionButton);
  });

  activeTagSuggestionIndex = 0;
  updateTagSuggestionSelection();
  panel.hidden = false;
}

function moveTagSuggestionSelection(direction) {
  const panel = getTagSuggestionPanel();
  if (!panel || panel.hidden) {
    return false;
  }

  const suggestionButtons = panel.querySelectorAll(".emotelist-tag-suggestion");
  if (!suggestionButtons.length) {
    return false;
  }

  activeTagSuggestionIndex =
    (activeTagSuggestionIndex + direction + suggestionButtons.length) %
    suggestionButtons.length;
  updateTagSuggestionSelection();
  return true;
}

function applyActiveTagSuggestion() {
  const panel = getTagSuggestionPanel();
  if (!panel || panel.hidden || activeTagSuggestionIndex < 0) {
    return false;
  }

  const activeButton = panel.querySelector(
    `.emotelist-tag-suggestion[data-index="${activeTagSuggestionIndex}"]`,
  );
  if (!activeButton) {
    return false;
  }

  const tagName = activeButton.querySelector(".emotelist-tag-suggestion-name");
  if (!tagName) {
    return false;
  }

  applyTagSuggestion(tagName.textContent || "");
  return true;
}

function clearPendingSearchRefresh() {
  if (searchDebounceTimer !== null) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
}

function runImmediateRefresh(callback) {
  const previousBypassState = bypassSearchDebounce;
  bypassSearchDebounce = true;
  clearPendingSearchRefresh();

  try {
    return callback();
  } finally {
    bypassSearchDebounce = previousBypassState;
  }
}

function queueOrRunHandleChange(emoteList, runHandleChange) {
  const searchTriggeredRefresh =
    !bypassSearchDebounce &&
    Date.now() - lastSearchInputEventAt <= SEARCH_EVENT_GRACE_MS;

  if (searchTriggeredRefresh) {
    clearPendingSearchRefresh();
    searchDebounceTimer = window.setTimeout(() => {
      searchDebounceTimer = null;
      runHandleChange.call(emoteList);
    }, SEARCH_DEBOUNCE_MS);
    return;
  }

  clearPendingSearchRefresh();
  runHandleChange.call(emoteList);
}

function getLowercaseEmoteName(emote) {
  if (!emote || typeof emote.name !== "string") {
    return "";
  }

  if (!LOWERCASE_EMOTE_NAME_CACHE.has(emote.name)) {
    LOWERCASE_EMOTE_NAME_CACHE.set(emote.name, emote.name.toLowerCase());
  }

  return LOWERCASE_EMOTE_NAME_CACHE.get(emote.name);
}

function installSearchDebounce() {
  const searchInput = getEmoteSearchInput();
  if (!searchInput || searchInput.dataset.emoteSearchDebounceInstalled === "1") {
    return;
  }

  const markSearchInputEvent = () => {
    lastSearchInputEventAt = Date.now();
  };

  searchInput.addEventListener("input", markSearchInputEvent, true);
  searchInput.addEventListener("keyup", markSearchInputEvent, true);
  searchInput.dataset.emoteSearchDebounceInstalled = "1";
}

function installTagSuggestions() {
  const searchInput = getEmoteSearchInput();
  const searchContainer = getSearchContainer();
  if (
    !searchInput ||
    !searchContainer ||
    searchInput.dataset.emoteTagSuggestionsInstalled === "1"
  ) {
    return;
  }

  if (!document.querySelector("#emotelist-tag-suggestions")) {
    const suggestionPanel = document.createElement("div");
    suggestionPanel.id = "emotelist-tag-suggestions";
    suggestionPanel.hidden = true;
    searchContainer.appendChild(suggestionPanel);
  }

  searchInput.addEventListener("input", () => {
    renderSuggestions();
  });

  searchInput.addEventListener("focus", () => {
    renderSuggestions();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.key.toLowerCase() === "a"
    ) {
      searchInput.focus();
      searchInput.select();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
}); 
  
  searchInput.addEventListener("keydown", (event) => {
    const panel = getTagSuggestionPanel();
    const suggestionsVisible = panel && !panel.hidden;
    if (!suggestionsVisible) {
      return;
    }

    if (event.key === "ArrowDown") {
      if (moveTagSuggestionSelection(1)) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowUp") {
      if (moveTagSuggestionSelection(-1)) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      if (applyActiveTagSuggestion()) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Escape") {
      hideTagSuggestions();
    }
  });

  searchInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      const activeElement = document.activeElement;
      if (!activeElement || !activeElement.closest("#emotelist-tag-suggestions")) {
        hideTagSuggestions();
      }
    }, 0);
  });

  searchInput.dataset.emoteTagSuggestionsInstalled = "1";
}

function installPlaceholder() {
  const searchInput = getEmoteSearchInput();
  if (!searchInput) {
    return;
  }

  searchInput.placeholder =
    'Search by name "emote name" by tag "tags: 1, 2" or both "anya tags: laugh, gif"';
}

function install() {
  installSearchDebounce();
  installTagSuggestions();
  installPlaceholder();
}

function invalidateTagCatalog() {
  cachedTagCatalog = null;
}

export const EMOTE_TAG_SEARCH_UI = {
  getLowercaseEmoteName,
  install,
  invalidateTagCatalog,
  parseSearchQuery,
  queueOrRunHandleChange,
  renderSuggestions,
  runImmediateRefresh,
};

window.EMOTE_TAG_SEARCH_UI = EMOTE_TAG_SEARCH_UI;
