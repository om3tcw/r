(function injectEmoteTagUIStyles() {
  const styleId = "emote-tag-ui-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssEmoteTagUI = `
    #emotelist-tag-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    #emotelist-toolbar-row {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      margin-bottom: 10px;
    }

    #emotelist-toolbar-row > .pull-left,
    #emotelist-toolbar-row > .pull-right {
      float: none !important;
      margin: 0;
    }

    #emotelist-toolbar-row > .pull-left {
      width: 100%;
      position: relative;
    }

    #emotelist-toolbar-row > .pull-left .emotelist-search {
      width: 100%;
    }

    #emotelist-toolbar-row > .pull-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
    }

    #emotelist-toolbar-row .checkbox {
      margin: 0;
    }

    #emotelist-toolbar-row .checkbox label,
    #emotelist-toolbar-row .checkbox-inline {
      white-space: nowrap;
    }

    #emotelist-tag-editor,
    #emotelist-tag-export-panel {
      margin-top: 12px;
      padding: 12px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.03);
    }

    #emotelist-tag-editor[hidden],
    #emotelist-tag-export-panel[hidden] {
      display: none !important;
    }

    .emotelist-tag-editor-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .emotelist-tag-editor-header img {
      max-width: 64px;
      max-height: 64px;
      object-fit: contain;
    }

    #emotelist-tag-current {
      margin-bottom: 8px;
    }

    #emotelist-tag-export-preview {
      width: 100%;
      min-height: 180px;
      margin-top: 8px;
      resize: vertical;
      font-family: monospace;
    }

    #emotelist-tag-suggestions {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 6px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    }

    #emotelist-tag-suggestions[hidden] {
      display: none !important;
    }

    .emotelist-tag-suggestion {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      width: 100%;
      text-align: left;
    }

    .emotelist-tag-suggestion.is-active {
      background: rgba(66, 139, 202, 0.15);
      border-color: rgba(66, 139, 202, 0.45);
    }

    .emotelist-tag-suggestion-name {
      font-family: monospace;
    }

    .emotelist-tag-suggestion-count {
      opacity: 0.7;
      font-size: 12px;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = cssEmoteTagUI;
  document.head.appendChild(styleElement);
})();
