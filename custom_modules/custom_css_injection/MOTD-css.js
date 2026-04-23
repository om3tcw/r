(function injectMotdStyles() {
  const styleId = "hlgg-motd-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssMotd = `
    #motdwrap {
      --hlgg-motd-max-height: min(280px, 34vh);
      --hlgg-motd-mobile-max-height: min(360px, 44vh);
      --hlgg-motd-panel-padding: 8px 12px;
      --hlgg-motd-single-panel-padding: 6px 40px 6px 10px;
      --hlgg-motd-logo-size: 56px;

      max-height: var(--hlgg-motd-max-height) !important;
      min-height: 0 !important;
      margin-bottom: 6px;
      padding: 0 !important;
      overflow-y: auto;
      color: #f4f1e8;
      background: rgba(18, 20, 24, 0.96) !important;
      background-image: none !important;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34);
    }

    #motd {
      padding-left: 0 !important;
      background: transparent !important;
      font-weight: 400 !important;
    }

    #motdwrap #togglemotd {
      position: sticky;
      top: 0;
      z-index: 2;
      margin: 8px 8px 0 0;
      color: #f4f1e8;
      opacity: 0.78;
      text-shadow: none;
    }

    #motdwrap #togglemotd:hover,
    #motdwrap #togglemotd:focus {
      opacity: 1;
      outline: none;
    }

    #hlgg-motd-shell {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
    }

    #hlgg-motd-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(var(--hlgg-motd-logo-size) + 20px);
      padding: 10px;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
    }

    #hlgg-motd-logo img {
      display: block;
      max-width: var(--hlgg-motd-logo-size);
      max-height: var(--hlgg-motd-logo-size);
      object-fit: contain;
    }

    #hlgg-motd-shell.hlgg-motd-shell-single {
      grid-template-columns: minmax(0, 1fr);
    }

    #hlgg-motd-shell.hlgg-motd-shell-single #hlgg-motd-logo {
      display: none;
    }

    #hlgg-motd-main {
      min-width: 0;
    }

    #hlgg-motd-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 8px 42px 0 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .hlgg-motd-tab {
      flex: 0 1 auto;
      min-width: 0;
      padding: 5px 9px;
      color: #dfe8e4;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .hlgg-motd-tab:hover,
    .hlgg-motd-tab:focus {
      color: #ffffff;
      background: rgba(78, 160, 163, 0.28);
      outline: none;
    }

    .hlgg-motd-tab.hlgg-motd-tab-active {
      color: #161616;
      background: #d99a34;
      border-color: #d99a34;
    }

    #hlgg-motd-panel {
      min-width: 0;
      padding: var(--hlgg-motd-panel-padding);
      font-size: 13px;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }

    #hlgg-motd-shell.hlgg-motd-shell-single #hlgg-motd-panel {
      padding: var(--hlgg-motd-single-panel-padding);
    }

    #hlgg-motd-panel p {
      margin: 0 0 8px;
    }

    #hlgg-motd-panel p:last-child {
      margin-bottom: 0;
    }

    #hlgg-motd-panel ul,
    #hlgg-motd-panel ol {
      margin: 6px 0 8px 22px;
      padding: 0;
    }

    #hlgg-motd-panel a {
      color: #8ed3d1;
    }

    #hlgg-motd-panel img,
    #hlgg-motd-panel video,
    #hlgg-motd-panel iframe {
      max-width: 100%;
    }

    @media (max-width: 700px) {
      #motdwrap {
        max-height: var(--hlgg-motd-mobile-max-height) !important;
      }

      #hlgg-motd-shell {
        grid-template-columns: minmax(0, 1fr);
      }

      #hlgg-motd-logo {
        display: none;
      }

      #hlgg-motd-tabs {
        padding-right: 38px;
      }
    }
  `;

  $("<style>", { id: styleId }).text(cssMotd).appendTo("head");
})();
