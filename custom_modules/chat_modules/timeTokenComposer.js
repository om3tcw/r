const TIME_TOKEN_COMMAND = "@time";
const TIME_TOKEN_DEFAULT_STYLE = "f";
const TIME_TOKEN_POPUP_ID = "time-token-composer-popup";
const TIME_TOKEN_OPTION_SELECTOR = ".time-token-composer-option";
const TIME_TOKEN_RENDERED_SELECTOR = "time.time-token-rendered";
const TIME_TOKEN_REGEX = /<t:(\d{1,})(?::([tTdDfFR]))?>/g;
const TIME_TOKEN_TRIGGER_REGEX = /(?:^|\s)@time(?=\s|$)/g;
const TIME_TOKEN_STYLES = [
  { code: "t", label: "Time" },
  { code: "T", label: "Time + sec" },
  { code: "d", label: "Short date" },
  { code: "D", label: "Long date" },
  { code: "f", label: "Date + time" },
  { code: "F", label: "Full" },
];

const MONTH_INDEX_BY_NAME = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const timeTokenComposerState = {
  popupElement: null,
  popupHeaderElement: null,
  popupContentElement: null,
  isOpen: false,
  activeIndex: 0,
  activeFragment: null,
  flatOptions: [],
  refreshFrame: null,
  relativeRefreshInterval: null,
};

const DATE_TIME_FORMATTERS = {};
const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function getChatInputElement() {
  return document.getElementById("chatline");
}

function buildLocalDate(year, monthIndex, day, hour, minute) {
  const candidateDate = new Date(year, monthIndex, day, hour, minute, 0, 0);
  if (
    candidateDate.getFullYear() !== year ||
    candidateDate.getMonth() !== monthIndex ||
    candidateDate.getDate() !== day ||
    candidateDate.getHours() !== hour ||
    candidateDate.getMinutes() !== minute
  ) {
    return null;
  }

  return candidateDate;
}

function roundToNearestMinute(date) {
  return new Date(Math.round(date.getTime() / 60000) * 60000);
}

function getFormatter(formatterKey, options) {
  if (!DATE_TIME_FORMATTERS[formatterKey]) {
    DATE_TIME_FORMATTERS[formatterKey] = new Intl.DateTimeFormat(
      undefined,
      options,
    );
  }

  return DATE_TIME_FORMATTERS[formatterKey];
}

function formatRelativeTime(date) {
  const differenceMs = date.getTime() - Date.now();
  const absoluteDifferenceMs = Math.abs(differenceMs);
  const units = [
    { unit: "year", ms: 31557600000 },
    { unit: "month", ms: 2629800000 },
    { unit: "week", ms: 604800000 },
    { unit: "day", ms: 86400000 },
    { unit: "hour", ms: 3600000 },
    { unit: "minute", ms: 60000 },
    { unit: "second", ms: 1000 },
  ];

  for (const { unit, ms } of units) {
    if (absoluteDifferenceMs >= ms || unit === "second") {
      const roundedValue = Math.round(differenceMs / ms);
      return RELATIVE_TIME_FORMATTER.format(roundedValue, unit);
    }
  }

  return RELATIVE_TIME_FORMATTER.format(0, "second");
}

function formatDateForStyle(date, styleCode) {
  switch (styleCode) {
    case "t":
      return getFormatter("t", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    case "T":
      return getFormatter("T", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    case "d":
      return getFormatter("d", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    case "D":
      return getFormatter("D", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    case "F":
      return getFormatter("F", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    case "R":
      return formatRelativeTime(date);
    case "f":
    default:
      return getFormatter("f", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
  }
}

function createTimeToken(unixSeconds, styleCode) {
  return `<t:${unixSeconds}:${styleCode}>`;
}

function buildTimeTokenElement(unixSeconds, styleCode) {
  const validStyleCode = /^[tTdDfFR]$/.test(styleCode)
    ? styleCode
    : TIME_TOKEN_DEFAULT_STYLE;
  const timestampMs = Number(unixSeconds) * 1000;
  const timeElement = document.createElement("time");
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  timeElement.className = "time-token-rendered";
  timeElement.dataset.unix = String(unixSeconds);
  timeElement.dataset.style = validStyleCode;
  timeElement.dateTime = date.toISOString();
  timeElement.title = createTimeToken(unixSeconds, validStyleCode);
  timeElement.textContent = formatDateForStyle(date, validStyleCode);
  return timeElement;
}

function refreshRelativeTimeTokens() {
  document
    .querySelectorAll(`${TIME_TOKEN_RENDERED_SELECTOR}[data-style="R"]`)
    .forEach((element) => {
      const unixSeconds = Number(element.dataset.unix);
      if (!Number.isFinite(unixSeconds)) {
        return;
      }

      element.textContent = formatDateForStyle(new Date(unixSeconds * 1000), "R");
    });
}

function ensureRelativeRefreshInterval() {
  if (timeTokenComposerState.relativeRefreshInterval !== null) {
    return;
  }

  timeTokenComposerState.relativeRefreshInterval = window.setInterval(
    refreshRelativeTimeTokens,
    30000,
  );
}

function tokenizeTimeQuery(query) {
  return String(query || "")
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function parseTimeInput(input) {
  const timeMatch = String(input || "")
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);

  if (!timeMatch) {
    return null;
  }

  let hour = Number(timeMatch[1]);
  const minute = timeMatch[2] ? Number(timeMatch[2]) : 0;
  const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : "";

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute > 59) {
    return null;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }

    hour %= 12;
    if (meridiem === "pm") {
      hour += 12;
    }
  } else if (hour > 23) {
    return null;
  }

  return { hour, minute };
}

function parseMonthToken(monthToken) {
  if (!monthToken) {
    return null;
  }

  const normalizedToken = String(monthToken || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
  if (!Object.hasOwn(MONTH_INDEX_BY_NAME, normalizedToken)) {
    return null;
  }

  return MONTH_INDEX_BY_NAME[normalizedToken];
}

function getContextLabel(date) {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const tomorrowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const yesterdayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
    0,
    0,
    0,
    0,
  );
  const targetDayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

  if (targetDayStart.getTime() === todayStart.getTime()) {
    return "Today";
  }
  if (targetDayStart.getTime() === tomorrowStart.getTime()) {
    return "Tomorrow";
  }
  if (targetDayStart.getTime() === yesterdayStart.getTime()) {
    return "Yesterday";
  }

  const yearDifference = date.getFullYear() - now.getFullYear();
  if (yearDifference === 0) {
    return "This year";
  }
  if (yearDifference === -1) {
    return "Last year";
  }
  if (yearDifference === 1) {
    return "Next year";
  }

  return String(date.getFullYear());
}

function createCandidateGroup(date) {
  const unixSeconds = Math.floor(date.getTime() / 1000);

  return {
    date,
    unixSeconds,
    contextLabel: getContextLabel(date),
  };
}

function parseExplicitOrRelativeQuery(tokens, now) {
  if (!tokens.length) {
    return null;
  }

  if (tokens[0] === "today" || tokens[0] === "tomorrow") {
    const offsetDays = tokens[0] === "tomorrow" ? 1 : 0;
    const time = tokens.length > 1 ? parseTimeInput(tokens.slice(1).join("")) : null;
    if (tokens.length > 1 && !time) {
      return [];
    }

    const candidateDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offsetDays,
      time ? time.hour : 12,
      time ? time.minute : 0,
      0,
      0,
    );

    return [createCandidateGroup(candidateDate)];
  }

  const dayFirstMatch = String(tokens.join(" ")).match(
    /^(\d{1,2})\s+([a-z.]+)(?:\s+(\d{4}))?(?:\s+(.+))?$/i,
  );
  const monthFirstMatch = String(tokens.join(" ")).match(
    /^([a-z.]+)\s+(\d{1,2})(?:\s+(\d{4}))?(?:\s+(.+))?$/i,
  );
  const dateMatch = dayFirstMatch || monthFirstMatch;

  if (!dateMatch) {
    return null;
  }

  const isDayFirst = dateMatch === dayFirstMatch;
  const day = Number(isDayFirst ? dateMatch[1] : dateMatch[2]);
  const monthIndex = parseMonthToken(isDayFirst ? dateMatch[2] : dateMatch[1]);
  const explicitYear = dateMatch[3] ? Number(dateMatch[3]) : null;
  const timePart = dateMatch[4] ? String(dateMatch[4]).trim() : "";
  const time = timePart ? parseTimeInput(timePart.replace(/\s+/g, "")) : null;

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31 ||
    monthIndex === null ||
    (timePart && !time)
  ) {
    return [];
  }

  const hour = time ? time.hour : 12;
  const minute = time ? time.minute : 0;
  if (Number.isInteger(explicitYear)) {
    const explicitDate = buildLocalDate(
      explicitYear,
      monthIndex,
      day,
      hour,
      minute,
    );
    return explicitDate ? [createCandidateGroup(explicitDate)] : [];
  }

  const upcomingDate = findOccurrenceByDirection(
    monthIndex,
    day,
    hour,
    minute,
    now,
    1,
  );
  const previousDate = findOccurrenceByDirection(
    monthIndex,
    day,
    hour,
    minute,
    now,
    -1,
  );

  return [upcomingDate, previousDate]
    .filter(Boolean)
    .map((candidateDate) => createCandidateGroup(candidateDate));
}

function findOccurrenceByDirection(monthIndex, day, hour, minute, now, direction) {
  const yearBase = now.getFullYear();
  const comparisonTarget = now.getTime();

  for (let yearOffset = 0; yearOffset < 8; yearOffset += 1) {
    const candidateYear = yearBase + yearOffset * direction;
    const candidateDate = buildLocalDate(
      candidateYear,
      monthIndex,
      day,
      hour,
      minute,
    );

    if (!candidateDate) {
      continue;
    }

    if (
      (direction > 0 && candidateDate.getTime() >= comparisonTarget) ||
      (direction < 0 && candidateDate.getTime() < comparisonTarget)
    ) {
      return candidateDate;
    }
  }

  return null;
}

function parseTimeOnlyQuery(query, now) {
  const parsedTime = parseTimeInput(String(query || "").replace(/\s+/g, ""));
  if (!parsedTime) {
    return [];
  }

  const sameDayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parsedTime.hour,
    parsedTime.minute,
    0,
    0,
  );
  const nextDate =
    sameDayDate.getTime() >= now.getTime()
      ? sameDayDate
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          parsedTime.hour,
          parsedTime.minute,
          0,
          0,
        );
  const previousDate =
    sameDayDate.getTime() < now.getTime()
      ? sameDayDate
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          parsedTime.hour,
          parsedTime.minute,
          0,
          0,
        );

  return [createCandidateGroup(nextDate), createCandidateGroup(previousDate)];
}

function buildCandidateGroups(query) {
  const now = new Date();
  const normalizedQuery = String(query || "").trim().replace(/\s+/g, " ");

  if (!normalizedQuery) {
    return [createCandidateGroup(roundToNearestMinute(now))];
  }

  const tokens = tokenizeTimeQuery(normalizedQuery);
  const explicitQueryCandidates = parseExplicitOrRelativeQuery(tokens, now);
  if (Array.isArray(explicitQueryCandidates)) {
    return explicitQueryCandidates;
  }

  return parseTimeOnlyQuery(normalizedQuery, now);
}

function findActiveTimeFragment(inputValue, caretIndex) {
  if (typeof inputValue !== "string" || !Number.isFinite(caretIndex)) {
    return null;
  }

  const valueBeforeCaret = inputValue.slice(0, caretIndex);
  let lastTriggerMatch = null;
  let triggerMatch;

  TIME_TOKEN_TRIGGER_REGEX.lastIndex = 0;
  while ((triggerMatch = TIME_TOKEN_TRIGGER_REGEX.exec(valueBeforeCaret))) {
    lastTriggerMatch = triggerMatch;
  }

  if (!lastTriggerMatch) {
    return null;
  }

  const triggerPrefix = lastTriggerMatch[0].startsWith(" ") ? 1 : 0;
  const fragmentStart = lastTriggerMatch.index + triggerPrefix;
  const afterCommandIndex = fragmentStart + TIME_TOKEN_COMMAND.length;
  const firstCharacterAfterCommand = inputValue.charAt(afterCommandIndex);

  if (!firstCharacterAfterCommand || !/\s/.test(firstCharacterAfterCommand)) {
    return null;
  }

  if (caretIndex < afterCommandIndex + 1) {
    return null;
  }

  const fragmentText = inputValue.slice(fragmentStart, caretIndex);
  return {
    start: fragmentStart,
    end: caretIndex,
    query: fragmentText.slice(TIME_TOKEN_COMMAND.length).replace(/^\s+/, ""),
  };
}

function ensurePopupElement() {
  if (timeTokenComposerState.popupElement) {
    return timeTokenComposerState.popupElement;
  }

  const $popupElement = $("<div>", {
    id: TIME_TOKEN_POPUP_ID,
    class: "time-token-composer-hidden",
  });
  const $popupHeaderElement = $("<div>", {
    class: "time-token-composer-header",
  }).appendTo($popupElement);
  const $popupContentElement = $("<div>", {
    class: "time-token-composer-content",
  }).appendTo($popupElement);

  $popupElement.on("mousedown", TIME_TOKEN_OPTION_SELECTOR, (event) => {
    event.preventDefault();
    const requestedIndex = Number(event.currentTarget.dataset.index);
    if (Number.isInteger(requestedIndex)) {
      commitComposerSelection(requestedIndex);
    }
  });

  $(document.body).append($popupElement);

  timeTokenComposerState.popupElement = $popupElement[0];
  timeTokenComposerState.popupHeaderElement = $popupHeaderElement[0];
  timeTokenComposerState.popupContentElement = $popupContentElement[0];

  return timeTokenComposerState.popupElement;
}

function setComposerActiveIndex(nextIndex) {
  if (!timeTokenComposerState.flatOptions.length) {
    timeTokenComposerState.activeIndex = 0;
    return;
  }

  const boundedIndex =
    ((nextIndex % timeTokenComposerState.flatOptions.length) +
      timeTokenComposerState.flatOptions.length) %
    timeTokenComposerState.flatOptions.length;
  timeTokenComposerState.activeIndex = boundedIndex;

  const optionElements = ensurePopupElement().querySelectorAll(
    TIME_TOKEN_OPTION_SELECTOR,
  );
  optionElements.forEach((element, index) => {
    element.classList.toggle(
      "time-token-composer-option-active",
      index === boundedIndex,
    );
  });

  const activeOptionElement = optionElements[boundedIndex];
  if (activeOptionElement) {
    activeOptionElement.scrollIntoView({ block: "nearest" });
  }
}

function positionComposerPopup() {
  if (!timeTokenComposerState.isOpen || !timeTokenComposerState.popupElement) {
    return;
  }

  const chatInputElement = getChatInputElement();
  if (!chatInputElement) {
    return;
  }

  const popupElement = timeTokenComposerState.popupElement;
  const chatInputRect = chatInputElement.getBoundingClientRect();
  const desiredWidth = Math.min(Math.max(chatInputRect.width, 280), 440);
  popupElement.style.width = `${desiredWidth}px`;

  const popupHeight = popupElement.offsetHeight;
  const viewportTop = window.scrollY;
  const topAboveInput = window.scrollY + chatInputRect.top - popupHeight - 8;
  const topBelowInput = window.scrollY + chatInputRect.bottom + 8;
  const popupTop = topAboveInput >= viewportTop + 8 ? topAboveInput : topBelowInput;
  const maxLeft = window.scrollX + window.innerWidth - desiredWidth - 8;
  const popupLeft = Math.max(
    window.scrollX + 8,
    Math.min(window.scrollX + chatInputRect.left, maxLeft),
  );

  popupElement.style.top = `${popupTop}px`;
  popupElement.style.left = `${popupLeft}px`;
}

function closeComposerPopup() {
  if (!timeTokenComposerState.popupElement) {
    return;
  }

  timeTokenComposerState.isOpen = false;
  timeTokenComposerState.flatOptions = [];
  timeTokenComposerState.activeFragment = null;
  timeTokenComposerState.activeIndex = 0;
  timeTokenComposerState.popupElement.classList.add("time-token-composer-hidden");
}

function renderComposerPopup(query, candidateGroups, fragment) {
  const popupElement = ensurePopupElement();
  const popupHeaderElement = timeTokenComposerState.popupHeaderElement;
  const popupContentElement = timeTokenComposerState.popupContentElement;
  const normalizedQuery = String(query || "").trim().toUpperCase();
  const popupHeaderText = normalizedQuery
    ? `TIME FORMATS FOR ${normalizedQuery}`
    : "TIME FORMATS";

  popupHeaderElement.textContent = popupHeaderText;
  popupContentElement.innerHTML = "";

  timeTokenComposerState.activeFragment = fragment;
  timeTokenComposerState.flatOptions = [];
  timeTokenComposerState.activeIndex = 0;

  if (!candidateGroups.length) {
    $("<div>", {
      class: "time-token-composer-empty",
      text: "No matching time formats yet. Try inputs like 2pm, tomorrow 2pm, or 23 nov.",
    }).appendTo(popupContentElement);
  } else {
    candidateGroups.forEach((candidateGroup) => {
      const groupElement = document.createElement("div");
      groupElement.className = "time-token-composer-group";

      const groupLabelElement = document.createElement("div");
      groupLabelElement.className = "time-token-composer-group-label";
      groupLabelElement.textContent = candidateGroup.contextLabel;
      groupElement.appendChild(groupLabelElement);

      TIME_TOKEN_STYLES.forEach((styleDescriptor) => {
        const optionIndex = timeTokenComposerState.flatOptions.length;
        const optionToken = createTimeToken(
          candidateGroup.unixSeconds,
          styleDescriptor.code,
        );
        const optionElement = document.createElement("button");

        optionElement.type = "button";
        optionElement.className = "time-token-composer-option";
        optionElement.dataset.index = String(optionIndex);
        optionElement.innerHTML = `
          <span class="time-token-composer-option-preview">${formatDateForStyle(candidateGroup.date, styleDescriptor.code)}</span>
          <span class="time-token-composer-option-label">${styleDescriptor.label}</span>
        `;

        groupElement.appendChild(optionElement);
        timeTokenComposerState.flatOptions.push({
          styleCode: styleDescriptor.code,
          token: optionToken,
          unixSeconds: candidateGroup.unixSeconds,
        });
      });

      popupContentElement.appendChild(groupElement);
    });
  }

  popupElement.classList.remove("time-token-composer-hidden");
  timeTokenComposerState.isOpen = true;
  positionComposerPopup();
  setComposerActiveIndex(0);
}

function commitComposerSelection(requestedIndex = timeTokenComposerState.activeIndex) {
  const chatInputElement = getChatInputElement();
  const selectedOption = timeTokenComposerState.flatOptions[requestedIndex];
  const activeFragment = timeTokenComposerState.activeFragment;

  if (!chatInputElement || !selectedOption || !activeFragment) {
    return;
  }

  const existingValue = chatInputElement.value;
  const leadingText = existingValue.slice(0, activeFragment.start);
  const trailingText = existingValue.slice(activeFragment.end);
  const spacer = trailingText && /^\s/.test(trailingText) ? "" : " ";
  const nextValue = `${leadingText}${selectedOption.token}${spacer}${trailingText}`;
  const nextCaretPosition = (leadingText + selectedOption.token + spacer).length;

  chatInputElement.value = nextValue;
  chatInputElement.focus();
  chatInputElement.setSelectionRange(nextCaretPosition, nextCaretPosition);
  $(chatInputElement).trigger("input");
  closeComposerPopup();
}

function refreshComposerFromInput() {
  const chatInputElement = getChatInputElement();
  if (!chatInputElement) {
    closeComposerPopup();
    return;
  }

  const activeFragment = findActiveTimeFragment(
    chatInputElement.value,
    chatInputElement.selectionStart,
  );
  if (!activeFragment) {
    closeComposerPopup();
    return;
  }

  const candidateGroups = buildCandidateGroups(activeFragment.query);
  renderComposerPopup(activeFragment.query, candidateGroups, activeFragment);
}

function scheduleComposerRefresh() {
  if (timeTokenComposerState.refreshFrame !== null) {
    cancelAnimationFrame(timeTokenComposerState.refreshFrame);
  }

  timeTokenComposerState.refreshFrame = requestAnimationFrame(() => {
    timeTokenComposerState.refreshFrame = null;
    refreshComposerFromInput();
  });
}

function shouldIgnoreRenderedTimeNode(textNode) {
  const parentElement = textNode.parentElement;
  if (!parentElement) {
    return true;
  }

  return Boolean(
    parentElement.closest(
      `${TIME_TOKEN_RENDERED_SELECTOR}, a, code, pre, script, style`,
    ),
  );
}

function replaceTimeTokensInTextNode(textNode) {
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

  if (shouldIgnoreRenderedTimeNode(textNode)) {
    return;
  }

  const originalText = textNode.nodeValue;
  TIME_TOKEN_REGEX.lastIndex = 0;
  if (!originalText || !TIME_TOKEN_REGEX.test(originalText)) {
    TIME_TOKEN_REGEX.lastIndex = 0;
    return;
  }

  TIME_TOKEN_REGEX.lastIndex = 0;
  const replacementFragment = document.createDocumentFragment();
  let lastIndex = 0;
  let tokenMatch;

  while ((tokenMatch = TIME_TOKEN_REGEX.exec(originalText))) {
    const fullMatch = tokenMatch[0];
    const unixSeconds = Number(tokenMatch[1]);
    const styleCode = tokenMatch[2] || TIME_TOKEN_DEFAULT_STYLE;
    if (tokenMatch.index > lastIndex) {
      replacementFragment.appendChild(
        document.createTextNode(originalText.slice(lastIndex, tokenMatch.index)),
      );
    }

    if (!Number.isFinite(unixSeconds)) {
      replacementFragment.appendChild(document.createTextNode(fullMatch));
      lastIndex = tokenMatch.index + fullMatch.length;
      continue;
    }

    const renderedTimeElement = buildTimeTokenElement(unixSeconds, styleCode);
    if (renderedTimeElement) {
      replacementFragment.appendChild(renderedTimeElement);
    } else {
      replacementFragment.appendChild(document.createTextNode(fullMatch));
    }

    lastIndex = tokenMatch.index + fullMatch.length;
  }

  if (lastIndex < originalText.length) {
    replacementFragment.appendChild(
      document.createTextNode(originalText.slice(lastIndex)),
    );
  }

  textNode.parentNode.replaceChild(replacementFragment, textNode);
  TIME_TOKEN_REGEX.lastIndex = 0;
}

function renderTimeTokensInMessage($messageElement) {
  if (!$messageElement || !$messageElement.length) {
    return;
  }

  const $messageRow = $messageElement.closest("#messagebuffer > div");
  if (
    !$messageRow.length ||
    $messageRow.hasClass("chat-msg-$server$") ||
    $messageRow.hasClass("server-msg-reconnect")
  ) {
    return;
  }

  const rootElement =
    $messageRow.children("span").last()[0] || $messageElement[0] || null;
  if (!rootElement || typeof document.createTreeWalker !== "function") {
    return;
  }

  const textNodes = [];
  const textNodeWalker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
  );

  while (textNodeWalker.nextNode()) {
    textNodes.push(textNodeWalker.currentNode);
  }

  textNodes.forEach((textNode) => replaceTimeTokensInTextNode(textNode));
}

function bindComposerEvents() {
  const $chatInput = $("#chatline");
  if (!$chatInput.length) {
    return;
  }

  $chatInput.on(
    "input.timeTokenComposer click.timeTokenComposer keyup.timeTokenComposer focus.timeTokenComposer",
    () => {
      scheduleComposerRefresh();
    },
  );

  $chatInput.on("blur.timeTokenComposer", () => {
    window.setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        timeTokenComposerState.popupElement &&
        timeTokenComposerState.popupElement.contains(activeElement)
      ) {
        return;
      }

      closeComposerPopup();
    }, 0);
  });

  $chatInput.on("keydown.timeTokenComposer", (event) => {
    if (!timeTokenComposerState.isOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeComposerPopup();
      return;
    }

    if (!timeTokenComposerState.flatOptions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setComposerActiveIndex(timeTokenComposerState.activeIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setComposerActiveIndex(timeTokenComposerState.activeIndex - 1);
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      commitComposerSelection(timeTokenComposerState.activeIndex);
    }
  });

  $(document).on("mousedown.timeTokenComposer", (event) => {
    if (!timeTokenComposerState.isOpen) {
      return;
    }

    const popupElement = timeTokenComposerState.popupElement;
    const chatInputElement = getChatInputElement();
    if (
      (popupElement && popupElement.contains(event.target)) ||
      event.target === chatInputElement
    ) {
      return;
    }

    closeComposerPopup();
  });

  $(window).on("resize.timeTokenComposer scroll.timeTokenComposer", () => {
    positionComposerPopup();
  });
}

(async function initializeTimeTokenComposer() {
  await window.waitForFunc("DOMrebuiltPromise");
  await window.DOMrebuiltPromise;

  bindComposerEvents();

  await window.waitForFunc("MESSAGE_PROCESSOR");
  if (
    typeof MESSAGE_PROCESSOR !== "undefined" &&
    MESSAGE_PROCESSOR &&
    typeof MESSAGE_PROCESSOR.addTap === "function"
  ) {
    MESSAGE_PROCESSOR.addTap(renderTimeTokensInMessage);
  }

  ensureRelativeRefreshInterval();
})();
