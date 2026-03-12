(function injectUohModeStyles() {
  const styleId = "uohmode-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssUohMode = `
    :root {
      --uoh-username-prefix-image-url: url("https://cracklej.win/djtyT473HU.png");
      --uoh-oshi-eyes-image-url: url("https://cracklej.win/aje2Uww34L.png");
      --uoh-username-prefix-width: 20px;
      --uoh-username-prefix-height: 20px;
      --uoh-username-prefix-margin-right: 4px;
      --uoh-oshi-eyes-width: 50px;
      --uoh-timestamp-height: 15px;
    }

    #messagebuffer > div.uohmode-active .timestamp {
      color: transparent !important;
      background-size:
        var(--uoh-oshi-eyes-width, 50px)
        var(--uoh-timestamp-height, 15px) !important;
      background-image: var(--uoh-oshi-eyes-image-url) !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
    }

    #messagebuffer > div.uohmode-active .timestamp + span > strong.username::before,
    #messagebuffer > div.uohmode-active > span > strong.username::before,
    #messagebuffer > div.uohmode-active strong.username::before {
      content: "" !important;
      display: inline-block !important;
      width: var(--uoh-username-prefix-width, 20px) !important;
      height: var(--uoh-username-prefix-height, 20px) !important;
      margin-right: var(--uoh-username-prefix-margin-right, 4px) !important;
      vertical-align: middle !important;
      background-image: var(--uoh-username-prefix-image-url) !important;
      background-size: contain !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = cssUohMode;
  document.head.appendChild(styleElement);
})();
