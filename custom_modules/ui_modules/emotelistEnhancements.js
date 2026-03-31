var SOUNDPOST_PREVIEW = {
  playing: {},
};

let originalLoadPage = null;
let emoteTagMode = false;
let activeTaggedEmoteName = "";

function getEmoteModal() {
  return document.querySelector("#emotelist");
}

function getEmoteModalBody() {
  const modal = getEmoteModal();
  return modal ? modal.querySelector(".modal-body") : null;
}

function getEmoteToolbarContainer() {
  return (
    document.querySelector("#emotelist .modal-body div.pull-right") ||
    getEmoteModalBody()
  );
}

function installToolbarLayout() {
  const modalBody = getEmoteModalBody();
  const searchContainer = document.querySelector(
    "#emotelist .modal-body .pull-left",
  );
  const controlsContainer = document.querySelector(
    "#emotelist .modal-body .pull-right",
  );

  if (!modalBody || !searchContainer || !controlsContainer) {
    return;
  }

  let toolbarRow = document.querySelector("#emotelist-toolbar-row");
  if (!toolbarRow) {
    toolbarRow = document.createElement("div");
    toolbarRow.id = "emotelist-toolbar-row";
    modalBody.insertBefore(toolbarRow, searchContainer);
  }

  if (searchContainer.parentNode !== toolbarRow) {
    toolbarRow.appendChild(searchContainer);
  }

  if (controlsContainer.parentNode !== toolbarRow) {
    toolbarRow.appendChild(controlsContainer);
  }
}

function addSoundpostButton(emote_img) {
  if (!emote_img || !window.SOUNDPOSTS[emote_img.title]) return;

  var soundPreview = document.createElement("button");
  soundPreview.className = "emotelist-soundpost-preview";
  soundPreview.innerText = "▶";
  soundPreview.title = emote_img.title;
  soundPreview.type = "button";

  soundPreview.setAttribute(
    "style",
    `
        position:absolute;
        background: rgba(50, 50, 50, 0.5);
        border: transparent;
        color: rgb(240, 240, 240);
        width: 20px;
        height: 20px;
        font-size: 1.3rem;
        z-index: 1;
    `,
  );

  soundPreview.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (SOUNDPOST_PREVIEW.playing[this.title] !== undefined) {
      SOUNDPOST_PREVIEW.playing[this.title].pause();
      SOUNDPOST_PREVIEW.playing[this.title].currentTime = 0;
      SOUNDPOST_PREVIEW.playing[this.title] = undefined;
      this.innerText = "▶";
      return;
    }

    this.innerText = "...";

    var myaudio = new Audio(window.SOUNDPOSTS[this.title].soundurl);
    myaudio.preload = "metadata";
    myaudio.title = this.title;

    var self = this;
    myaudio.addEventListener(
      "canplaythrough",
      function () {
        self.innerText = "⏹";
      },
      false,
    );

    myaudio.addEventListener("timeupdate", () => {
      var prog = (myaudio.currentTime / myaudio.duration) * 100;
      if (prog >= 100) {
        prog = 0;
        self.innerText = "▶";
        SOUNDPOST_PREVIEW.playing[myaudio.title] = undefined;
      }
      self.style.background = `conic-gradient(transparent ${prog}%, rgba(50, 50, 50, 0.5) 0)`;
    });

    myaudio.volume = 0.1;
    myaudio.play();
    SOUNDPOST_PREVIEW.playing[this.title] = myaudio;
  });

  return soundPreview;
}

function installButtons() {
  var previews = document.querySelectorAll(".emote-preview-container");

  previews.forEach((preview) => {
    if (preview.querySelector(".emotelist-soundpost-preview")) {
      return;
    }

    var emote_img = preview.querySelector("img[title]");
    let audioButton = addSoundpostButton(emote_img);

    if (audioButton) {
      preview.insertBefore(audioButton, preview.firstChild);
    }
  });
}

function updateTagSummary(tags) {
  const currentTags = document.querySelector("#emotelist-tag-current");
  if (!currentTags) {
    return;
  }

  currentTags.textContent = tags.length
    ? `Current tags: ${tags.join(", ")}`
    : "Current tags: none";
}

function openTagEditor(emoteName, imageSource) {
  const editor = document.querySelector("#emotelist-tag-editor");
  if (!editor) {
    return;
  }

  activeTaggedEmoteName = emoteName;
  const tags = window.EMOTE_TAG_STORE.getTagsForEmote(emoteName);

  editor.hidden = false;
  editor.querySelector("#emotelist-tag-name").textContent = emoteName;
  editor.querySelector("#emotelist-tag-image").src = imageSource;
  editor.querySelector("#emotelist-tag-input").value = tags.join(", ");
  updateTagSummary(tags);
  editor.querySelector("#emotelist-tag-input").focus();
  editor.querySelector("#emotelist-tag-input").select();
}

function refreshEmoteList(resetPage = false) {
  if (resetPage) {
    EMOTELIST.page = 0;
  }

  window.EMOTE_TAG_SEARCH_UI.runImmediateRefresh(() => {
    EMOTELIST.handleChange();
  });
}

function downloadTagManifest(jsonText) {
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "emote-tags.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function installTagEditor() {
  const modalBody = getEmoteModalBody();
  if (!modalBody || document.querySelector("#emotelist-tag-editor")) {
    return;
  }

  const editor = document.createElement("div");
  editor.id = "emotelist-tag-editor";
  editor.hidden = true;
  editor.innerHTML = `
        <div class="emotelist-tag-editor-header">
            <img id="emotelist-tag-image" alt="Selected emote preview">
            <div>
                <strong id="emotelist-tag-name"></strong>
                <div id="emotelist-tag-current"></div>
            </div>
        </div>
        <input id="emotelist-tag-input" class="form-control" type="text" placeholder="tag1, tag2, tag3">
        <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="emotelist-tag-save" class="btn btn-sm btn-primary" type="button">Save</button>
            <button id="emotelist-tag-clear" class="btn btn-sm btn-warning" type="button">Clear tags</button>
            <button id="emotelist-tag-cancel" class="btn btn-sm btn-default" type="button">Cancel</button>
        </div>
    `;
  modalBody.appendChild(editor);

  editor.querySelector("#emotelist-tag-save").addEventListener("click", () => {
    const input = editor.querySelector("#emotelist-tag-input");
    const tags = window.EMOTE_TAG_STORE.setTagsForEmote(
      activeTaggedEmoteName,
      input.value,
    );
    updateTagSummary(tags);
    refreshEmoteList();
  });

  editor.querySelector("#emotelist-tag-clear").addEventListener("click", () => {
    window.EMOTE_TAG_STORE.clearTagsForEmote(activeTaggedEmoteName);
    editor.querySelector("#emotelist-tag-input").value = "";
    updateTagSummary([]);
    refreshEmoteList();
  });

  editor
    .querySelector("#emotelist-tag-cancel")
    .addEventListener("click", () => {
      editor.hidden = true;
    });
}

function installTagExportPanel() {
  const modalBody = getEmoteModalBody();
  if (!modalBody || document.querySelector("#emotelist-tag-export-panel")) {
    return;
  }

  const panel = document.createElement("div");
  panel.id = "emotelist-tag-export-panel";
  panel.hidden = true;
  panel.innerHTML = `
        <strong>Export Preview</strong>
        <textarea id="emotelist-tag-export-preview" class="form-control" spellcheck="false"></textarea>
    `;
  modalBody.appendChild(panel);
}

function installTagControls() {
  if (CLIENT.rank < Rank.Moderator) {
    return;
  }

  installTagEditor();
  installTagExportPanel();

  const container = getEmoteToolbarContainer();
  if (!container || document.querySelector("#emotelist-tag-controls")) {
    return;
  }

  const controls = document.createElement("div");
  controls.id = "emotelist-tag-controls";
  controls.innerHTML = `
        <label class="checkbox-inline" style="margin: 0;">
            <input id="emotelist-tag-mode" type="checkbox"> Tag mode
        </label>
        <button id="emotelist-export-tags" class="btn btn-xs btn-default" type="button">Export tags</button>
        <button id="emotelist-clear-tag-draft" class="btn btn-xs btn-default" type="button">Clear draft</button>
    `;
  container.appendChild(controls);

  controls
    .querySelector("#emotelist-tag-mode")
    .addEventListener("change", function () {
      emoteTagMode = this.checked;
    });

  controls
    .querySelector("#emotelist-export-tags")
    .addEventListener("click", () => {
      const exportPanel = document.querySelector("#emotelist-tag-export-panel");
      const exportPreview = document.querySelector(
        "#emotelist-tag-export-preview",
      );
      const exportedJson = JSON.stringify(
        window.EMOTE_TAG_STORE.exportManifest(),
        null,
        2,
      );

      if (!exportPanel || !exportPreview) {
        return;
      }

      exportPreview.value = exportedJson;
      exportPanel.hidden = false;
      downloadTagManifest(exportedJson);
    });

  controls
    .querySelector("#emotelist-clear-tag-draft")
    .addEventListener("click", () => {
      window.EMOTE_TAG_STORE.clearDraft();
      if (activeTaggedEmoteName) {
        const restoredTags = window.EMOTE_TAG_STORE.getTagsForEmote(
          activeTaggedEmoteName,
        );
        const input = document.querySelector("#emotelist-tag-input");
        if (input) {
          input.value = restoredTags.join(", ");
        }
        updateTagSummary(restoredTags);
      }
      refreshEmoteList();
    });
}

function installTagModeListener() {
  const modal = getEmoteModal();
  if (!modal || modal.dataset.emoteTagModeListenerInstalled === "1") {
    return;
  }

  modal.addEventListener(
    "click",
    function (event) {
      if (!emoteTagMode || event.button !== 0) {
        return;
      }

      if (
        event.target.closest(".emotelist-soundpost-preview") ||
        event.target.closest("#emotelist-tag-controls") ||
        event.target.closest("#emotelist-tag-editor") ||
        event.target.closest("#emotelist-tag-export-panel")
      ) {
        return;
      }

      const preview = event.target.closest(".emote-preview-container");
      if (!preview) {
        return;
      }

      const emoteImage = preview.querySelector("img[title]");
      if (!emoteImage) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openTagEditor(emoteImage.title, emoteImage.src);
    },
    true,
  );

  modal.dataset.emoteTagModeListenerInstalled = "1";
}

function installSoundpostPreview() {
  originalLoadPage = EMOTELIST.loadPage;

  EMOTELIST.loadPage = function (page) {
    originalLoadPage.call(EMOTELIST, page);

    installToolbarLayout();
    window.EMOTE_TAG_SEARCH_UI.install();
    installButtons();
    installFilters();
    installTagControls();
    installTagModeListener();
  };
  installToolbarLayout();
  window.EMOTE_TAG_SEARCH_UI.install();
  installButtons();
}

function installFilters() {
  var container = getEmoteToolbarContainer();
  if (!container) {
    return;
  }

  if (!document.querySelector("#emotelist-soundposts")) {
    var newbox = document.createElement("div");
    newbox.classList.add("checkbox");
    newbox.innerHTML =
      '<label><input id="emotelist-soundposts" type="checkbox">Soundposts only</label>';
    newbox.querySelector("input").addEventListener("change", function () {
      EMOTELIST.filterSoundPosts = this.checked;
      window.EMOTE_TAG_SEARCH_UI.runImmediateRefresh(() => {
        EMOTELIST.handleChange();
        EMOTELIST.loadPage(0);
      });
    });
    container.appendChild(newbox);
  }

  if (EmoteList.prototype.handleChange.__tagEnhanced) {
    return;
  }

  const runHandleChange = function () {
    this.emotes = CHANNEL.emotes.slice();
    if (this.sortAlphabetical) {
      this.emotes.sort(function (a, b) {
        var x = window.EMOTE_TAG_SEARCH_UI.getLowercaseEmoteName(a);
        var y = window.EMOTE_TAG_SEARCH_UI.getLowercaseEmoteName(b);

        if (x < y) {
          return -1;
        } else if (x > y) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    if (this.filterSoundPosts) {
      this.emotes = this.emotes.filter(
        (emote) => window.SOUNDPOSTS[emote.name],
      );
    }

    const searchQuery = window.EMOTE_TAG_SEARCH_UI.parseSearchQuery();
    if (searchQuery.hasTagClause) {
      const lowercasedNameQuery = searchQuery.nameQuery.toLowerCase();
      this.emotes = this.emotes.filter((emote) => {
        const nameMatches =
          !lowercasedNameQuery ||
          window.EMOTE_TAG_SEARCH_UI
            .getLowercaseEmoteName(emote)
            .includes(lowercasedNameQuery);
        const emoteTags = window.EMOTE_TAGS[emote.name] || [];
        const tagsMatch =
          !searchQuery.tagTerms.length ||
          searchQuery.tagTerms.every((tag) => emoteTags.includes(tag));

        return nameMatches && tagsMatch;
      });
    } else if (this.filter) {
      this.emotes = this.emotes.filter(this.filter);
    }

    this.paginator = new NewPaginator(
      this.emotes.length,
      this.itemsPerPage,
      this.loadPage.bind(this),
    );
    this.paginatorContainer.html("");
    this.paginatorContainer.append(this.paginator.elem);
    this.paginator.loadPage(this.page);
  };

  EmoteList.prototype.handleChange = function () {
    window.EMOTE_TAG_SEARCH_UI.queueOrRunHandleChange(this, runHandleChange);
  };

  EmoteList.prototype.handleChange.__tagEnhanced = true;
}

function installTagRefreshListener() {
  if (window.__emoteTagRefreshInstalled) {
    return;
  }

  window.addEventListener("emote-tags-updated", () => {
    if (typeof EMOTELIST !== "undefined") {
      window.EMOTE_TAG_SEARCH_UI.invalidateTagCatalog();
      window.EMOTE_TAG_SEARCH_UI.renderSuggestions();
      refreshEmoteList();
    }
  });

  window.__emoteTagRefreshInstalled = true;
}

(async () => {
  await window.waitForFunc("EMOTELIST");
  await window.waitForFunc("SOUNDPOSTS");
  await window.waitForFunc("EMOTE_TAG_STORE");
  await window.waitForFunc("EMOTE_TAG_SEARCH_UI");
  await window.EMOTE_TAG_STORE.ready;

  installSoundpostPreview();
  installToolbarLayout();
  window.EMOTE_TAG_SEARCH_UI.install();
  installFilters();
  installTagControls();
  installTagModeListener();
  installTagRefreshListener();
})();
