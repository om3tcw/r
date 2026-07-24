const NOTIFICATION_DEFAULT_VOLUME = 0.1;
const NOTIFICATION_IDS = Object.freeze({
  Poll: "pollNotification",
  Priv: "privateMessageNotification",
  Video: "queuedVideoNotification",
});
const NOTIFICATION_LABELS = Object.freeze({
  Poll: "Poll",
  Priv: "Private Message",
  Video: "Queued Video",
});
const NOTIFICATION_ORDERS = Object.freeze({
  Poll: 10,
  Priv: 20,
  Video: 30,
});
const NOTIFICATION_DEFAULT_CHOICE_IDS = Object.freeze({
  Poll: "newPoll",
  Priv: "privateMessage",
  Video: "yourVideoPlays",
});
const NOTIFICATION_BASE_CHOICES = Object.freeze({
  newPoll:
    "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/poll.mp3",
  privateMessage:
    "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/sharkmail.ogg",
  yourVideoPlays:
    "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/morinayeah.ogg",
  bell: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/fairywand.ogg",
});

function getNotificationConfigRoot() {
  return window[CHANNEL.name] && typeof window[CHANNEL.name] === "object"
    ? window[CHANNEL.name]
    : {};
}

function getAudioNoticeConfig() {
  const configRoot = getNotificationConfigRoot();
  const modulesOptions =
    configRoot.modulesOptions && typeof configRoot.modulesOptions === "object"
      ? configRoot.modulesOptions
      : {};

  return modulesOptions.audioNotice && typeof modulesOptions.audioNotice === "object"
    ? modulesOptions.audioNotice
    : {};
}

function getNotificationChoices(type) {
  const audioNoticeConfig = getAudioNoticeConfig();
  const configuredChoices =
    audioNoticeConfig.choices && typeof audioNoticeConfig.choices === "object"
      ? audioNoticeConfig.choices
      : {};

  return {
    ...NOTIFICATION_BASE_CHOICES,
    ...configuredChoices,
  };
}

function getDefaultChoiceId(type, choices) {
  const audioNoticeConfig = getAudioNoticeConfig();
  const configuredNotices =
    audioNoticeConfig.notices && typeof audioNoticeConfig.notices === "object"
      ? audioNoticeConfig.notices
      : {};
  const configuredChoiceId = String(configuredNotices[type] || "").trim();
  if (configuredChoiceId && choices[configuredChoiceId] != null) {
    return configuredChoiceId;
  }

  const defaultChoiceId = NOTIFICATION_DEFAULT_CHOICE_IDS[type] || "";
  if (defaultChoiceId && choices[defaultChoiceId] != null) {
    return defaultChoiceId;
  }

  const choiceKeys = Object.keys(choices);
  return choiceKeys.length ? choiceKeys[0] : "";
}

function getNotificationVolumeControlId(type) {
  return NOTIFICATION_IDS[type] || "";
}

function playManagedNotification(controlId, urlOverride = "") {
  const resolvedUrl =
    String(urlOverride || "").trim() ||
    (typeof window.getVolumeControlUrl === "function"
      ? window.getVolumeControlUrl(controlId)
      : "");

  if (!resolvedUrl) {
    return null;
  }

  try {
    const audioElement = new Audio(resolvedUrl);
    if (typeof window.applyVolumeControl === "function") {
      window.applyVolumeControl(controlId, audioElement);
    } else {
      audioElement.volume = NOTIFICATION_DEFAULT_VOLUME;
    }

    const playPromise = audioElement.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        if (error?.name === "NotAllowedError") {
          return;
        }

        console.error("[SoundNotifications] Audio play failed:", error);
      });
    }

    return audioElement;
  } catch (error) {
    console.error("[SoundNotifications] Audio setup failed:", error);
    return null;
  }
}

class AudioNotifier {
  constructor() {
    this.Poll = { timeSinceLast: 0 };
    this.Priv = { timeSinceLast: 0 };
    this.Video = { timeSinceLast: 0 };
  }

  registerVolumeControls() {
    Object.keys(NOTIFICATION_IDS).forEach((type) => {
      const choices = getNotificationChoices(type);
      window.registerVolumeControl({
        id: NOTIFICATION_IDS[type],
        label: NOTIFICATION_LABELS[type],
        order: NOTIFICATION_ORDERS[type],
        defaultVolume: NOTIFICATION_DEFAULT_VOLUME,
        choices,
        defaultChoiceId: getDefaultChoiceId(type, choices),
      });
    });
  }

  play(type, urlOverride = "") {
    const controlId = getNotificationVolumeControlId(type);
    if (!controlId) {
      return null;
    }

    return playManagedNotification(controlId, urlOverride);
  }

  handlePoll() {
    if (CLIENT.rank < CHANNEL.perms.pollvote) {
      return;
    }

    if (Date.now() - this.Poll.timeSinceLast < 60000) {
      return;
    }

    this.play("Poll");
    this.Poll.timeSinceLast = Date.now();
  }

  handlePriv(data) {
    if (!data || data.username === CLIENT.name) {
      return;
    }

    if (Array.isArray(window.IGNORED) && window.IGNORED.includes(data.username)) {
      return;
    }

    if ($(document.activeElement).hasClass("pm-input")) {
      return;
    }

    if (Date.now() - this.Priv.timeSinceLast < 180000) {
      return;
    }

    this.play("Priv");
    this.Priv.timeSinceLast = Date.now();
    $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Direct Message Notification)").remove();
    $("#messagebuffer").trigger("whisper", `Direct Message Notification: ${data.username}`);
  }

  handleVideo() {
    if (CLIENT.rank < CHANNEL.perms.seeplaylist) {
      return;
    }

    if ((Date.now() - this.Video.timeSinceLast) / 1000 < 10) {
      return;
    }

    const currentPlaylistItemId = window.PL_CURRENT;
    if (currentPlaylistItemId == null) {
      return;
    }

    const queuedBy = $(`.pluid-${currentPlaylistItemId}`)
      .children()
      .filter(".qe_blame")
      .text()
      .slice(0, -3);

    if (!queuedBy || queuedBy !== CLIENT.name) {
      return;
    }

    this.play("Video");
    this.Video.timeSinceLast = Date.now();
  }

  initialize() {
    this.registerVolumeControls();
    socket.on("newPoll", () => {
      this.handlePoll();
    });
    socket.on("pm", (data) => {
      this.handlePriv(data);
    });
    socket.on("changeMedia", () => {
      this.handleVideo();
    });

    console.info("[SoundNotifications] System initialized.");
    return this;
  }
}

(async () => {
  if (typeof Storage === "undefined") {
    console.error("[SoundNotifications] localStorage not supported. Aborting load.");
    return;
  }

  await window.waitForFunc("registerVolumeControl");
  window[CHANNEL.name].audioNotice = new AudioNotifier().initialize();
})();
