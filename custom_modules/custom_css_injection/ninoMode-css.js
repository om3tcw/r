(function injectNinoModeStyles() {
  const styleId = "ninomode-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssNinoMode = `
    #ninomode-panel {
      margin: 6px 0 0;
      border: 0 !important;
      background: rgba(0, 0, 0, 0.48);
      box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.22);
    }

    #ninomode-panel .panel-heading {
      border: 0;
      color: white;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.62);
    }

    #ninomode-status.label {
      margin-top: 1px;
      font-size: 11px;
    }

    #ninomode-panel .panel-body {
      padding: 0;
      background: rgba(0, 0, 0, 0.16);
    }

    #ninomode-empty-state {
      padding: 7px 10px;
      color: rgba(255, 255, 255, 0.74);
      font-size: 13px;
    }

    #ninomode-buffer {
      max-height: 84px;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2px 0;
      background: rgba(0, 0, 0, 0.12);
    }

    #ninomode-buffer > div {
      font-size: 14px;
      color: white;
      display: block;
      padding-left: 3px;
      padding-bottom: 1px;
    }

    #ninomode-buffer > div:hover > .timestamp {
      opacity: 1;
    }

    #ninomode-buffer a {
      color: #80d8dd;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = cssNinoMode;
  document.head.appendChild(styleElement);
})();
