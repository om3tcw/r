(function injectMigoboteGoldStyles() {
  const styleId = "migobotegold-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssMigoboteGold = `
    :root {
      --migobotegold-timestamp-icon-url: url("https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/gargolden.png");
      --migobotegold-icon-size: 16px;
      --migobotegold-icon-offset: 3px;
      --migobotegold-icon-gap: 3px;
    }

    @keyframes migobotegold-username-sheen {
      0% { background-position: 200% 50%; }
      100% { background-position: -200% 50%; }
    }

    @keyframes migobotegold-eyes-sheen {
      0% { filter: none; text-shadow: none; }
      42% { filter: none; text-shadow: none; }
      58% {
        filter: sepia(0.68) saturate(2.2) hue-rotate(-6deg) brightness(1.04) contrast(1.02);
        text-shadow: 0 0 1px rgba(255, 214, 122, 0.24);
      }
      100% { filter: none; text-shadow: none; }
    }

    #messagebuffer > div.migobotegold-active .timestamp {
      position: relative !important;
      animation: migobotegold-eyes-sheen 3.8s ease-in-out infinite !important;
      text-shadow: none !important;
    }

    #messagebuffer > div.migobotegold-active .timestamp::after {
      content: "" !important;
      position: absolute !important;
      top: 50% !important;
      left: 100% !important;
      width: var(--migobotegold-icon-size, 16px) !important;
      height: var(--migobotegold-icon-size, 16px) !important;
      transform: translate(var(--migobotegold-icon-offset, 3px), -50%) !important;
      background:
        var(--migobotegold-timestamp-icon-url)
        center / contain no-repeat !important;
      pointer-events: none !important;
    }

    #messagebuffer > div.migobotegold-active .timestamp + span {
      padding-left:
        calc(
          var(--migobotegold-icon-size, 16px) +
          var(--migobotegold-icon-offset, 3px) +
          var(--migobotegold-icon-gap, 3px)
        ) !important;
    }

    #messagebuffer > div.migobotegold-active .timestamp + span > strong.username,
    #messagebuffer > div.migobotegold-active > span > strong.username,
    #messagebuffer > div.migobotegold-active strong.username {
      color: #f6dd9a !important;
      background-image:
        linear-gradient(
          115deg,
          #cd8f1e 0%,
          #ffc700 42%,
          #ffa701 52%,
          #ffd000 60%,
          #bc8420 100%
        ) !important;
      background-size: 220% 100% !important;
      background-repeat: no-repeat !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      font-size: inherit !important;
      animation: migobotegold-username-sheen 2.5s linear infinite !important;
      filter: drop-shadow(0.5px 0.5px 0.5px #d6a441) !important;
      text-shadow: 0 0 1.5px rgba(255, 213, 118, 0.35) !important;
    }

    #messagebuffer > div.migobotegold-active strong.username::before,
    #messagebuffer > div.migobotegold-active strong.username::after {
      content: none !important;
    }

    #userlist .migobotegold-userlist-active {
      color: rgb(255, 179, 0) !important;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = cssMigoboteGold;
  document.head.appendChild(styleElement);
})();
