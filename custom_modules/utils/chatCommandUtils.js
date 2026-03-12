const DEFAULT_MESSAGE_BUFFER_SELECTOR = "#messagebuffer";
const DEFAULT_USERLIST_SELECTOR = "#userlist .userlist_item";

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase();
}

function escapeRegExp(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeCssIdentifier(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

function getMessageRow($messageElement, options = {}) {
  if (!$messageElement || !$messageElement.length) {
    return null;
  }

  const messageBufferSelector =
    options.messageBufferSelector || DEFAULT_MESSAGE_BUFFER_SELECTOR;
  const $row = $messageElement.closest(`${messageBufferSelector} > div`);
  return $row.length ? $row : null;
}

function getMessageClassName($row) {
  if (!$row || !$row.length) {
    return "";
  }

  return (
    ($row.attr("class") || "")
      .split(/\s+/)
      .find((className) => {
        return (
          className.startsWith("chat-msg-") &&
          className !== "chat-msg-$server$"
        );
      }) || ""
  );
}

function getMessageAuthorFromClassName($row) {
  const messageClassName = getMessageClassName($row);
  if (!messageClassName) {
    return "";
  }

  return messageClassName.slice("chat-msg-".length).trim();
}

function getMessageAuthor($row) {
  if (!$row || !$row.length) {
    return "";
  }

  const classDerivedAuthor = getMessageAuthorFromClassName($row);
  if (classDerivedAuthor) {
    return classDerivedAuthor;
  }

  const usernameText = $row.find("strong.username").first().text();
  if (!usernameText) {
    return "";
  }

  return usernameText.replace(/:\s*$/, "").trim();
}

function isServerMessageRow($row) {
  if (!$row || !$row.length) {
    return false;
  }

  return ($row.attr("class") || "")
    .split(/\s+/)
    .some((className) => className === "chat-msg-$server$");
}

function getMessageContentRootElement($messageElement, options = {}) {
  if (!$messageElement || !$messageElement.length) {
    return null;
  }

  const $messageRow =
    options.$row || getMessageRow($messageElement, options) || null;
  if ($messageRow && $messageRow.length) {
    const $messageContentSpan = $messageRow.children("span").last();
    if ($messageContentSpan.length) {
      return $messageContentSpan[0];
    }
  }

  return $messageElement[0] || null;
}

function getEmoteNodesFromRoot(
  rootElement,
  options = { selector: ".channel-emote[title]" },
) {
  if (!rootElement) {
    return [];
  }

  const selector = options.selector || ".channel-emote[title]";
  const emoteNodes = [];
  if (rootElement.matches && rootElement.matches(selector)) {
    emoteNodes.push(rootElement);
  }

  if (typeof rootElement.querySelectorAll === "function") {
    emoteNodes.push(...rootElement.querySelectorAll(selector));
  }

  return emoteNodes;
}

function getTextWithEmoteTitles(
  rootElement,
  options = { selector: "img.channel-emote[title]" },
) {
  if (!rootElement) {
    return "";
  }

  const selector = options.selector || "img.channel-emote[title]";
  const textChunks = [];

  function walkNode(node) {
    if (!node) {
      return;
    }

    if (node.nodeType === 3) {
      textChunks.push(String(node.nodeValue || ""));
      return;
    }

    if (node.nodeType !== 1) {
      return;
    }

    const element = node;
    if (element.matches && element.matches(selector)) {
      const emoteTitle = String(element.getAttribute("title") || "").trim();
      if (emoteTitle) {
        textChunks.push(` ${emoteTitle} `);
      }
      return;
    }

    const childNodes = element.childNodes || [];
    for (let index = 0; index < childNodes.length; index += 1) {
      walkNode(childNodes[index]);
    }
  }

  walkNode(rootElement);
  return textChunks.join("");
}

function getUserlistNameElement($userlistRow) {
  if (!$userlistRow || !$userlistRow.length) {
    return $();
  }

  return $userlistRow.children().eq(1);
}

function getUserlistUsernameFromRow($userlistRow) {
  if (!$userlistRow || !$userlistRow.length) {
    return "";
  }

  const dataName = String($userlistRow.data("name") || "").trim();
  if (dataName) {
    return dataName;
  }

  return String(getUserlistNameElement($userlistRow).text() || "").trim();
}

function findUserlistRowByUsername(username, options = {}) {
  const normalizedTarget = normalizeUsername(username);
  if (!normalizedTarget) {
    return null;
  }

  const userlistSelector = options.userlistSelector || DEFAULT_USERLIST_SELECTOR;
  let foundRow = null;

  $(userlistSelector).each((_, element) => {
    const $row = $(element);
    const rowUsername = normalizeUsername(getUserlistUsernameFromRow($row));
    if (rowUsername !== normalizedTarget) {
      return;
    }

    foundRow = $row;
    return false;
  });

  return foundRow;
}

function getCommandAuthorRank(username, options = {}) {
  const $userlistRow = findUserlistRowByUsername(username, options);
  const client =
    options.client || (typeof window !== "undefined" ? window.CLIENT : null);
  const rankEnum =
    options.rankEnum || (typeof window !== "undefined" ? window.Rank : null);

  if (!$userlistRow || !$userlistRow.length) {
    const normalizedClientName = normalizeUsername(client && client.name);
    const normalizedUsername = normalizeUsername(username);
    if (normalizedClientName && normalizedClientName === normalizedUsername) {
      return Number(client && client.rank);
    }

    return undefined;
  }

  const dataRank = Number($userlistRow.data("rank"));
  if (Number.isFinite(dataRank)) {
    return dataRank;
  }

  const $nameElement = getUserlistNameElement($userlistRow);
  if ($nameElement.hasClass("userlist_owner")) {
    return rankEnum && rankEnum.Owner != null ? rankEnum.Owner : 10;
  }
  if ($nameElement.hasClass("userlist_admin")) {
    return rankEnum && rankEnum.Admin != null ? rankEnum.Admin : 3;
  }
  if ($nameElement.hasClass("userlist_op")) {
    return rankEnum && rankEnum.Moderator != null ? rankEnum.Moderator : 2;
  }
  if ($nameElement.hasClass("userlist_guest")) {
    return rankEnum && rankEnum.Guest != null ? rankEnum.Guest : 0;
  }

  return rankEnum && rankEnum.Member != null ? rankEnum.Member : 1;
}

function isAuthorAllowed(authorUsername, options = {}) {
  const normalizedAuthor = normalizeUsername(authorUsername);
  if (!normalizedAuthor) {
    return false;
  }

  const allowedUsers = options.allowedUsers;
  if (allowedUsers instanceof Set) {
    if (allowedUsers.has(normalizedAuthor)) {
      return true;
    }
  } else if (Array.isArray(allowedUsers)) {
    const allowedUserSet = new Set(
      allowedUsers.map(normalizeUsername).filter(Boolean),
    );
    if (allowedUserSet.has(normalizedAuthor)) {
      return true;
    }
  }

  const minRank = Number(options.minRank);
  if (Number.isFinite(minRank)) {
    const authorRank = getCommandAuthorRank(authorUsername, options);
    if (Number.isFinite(authorRank) && authorRank >= minRank) {
      return true;
    }
  }

  if (!options.allowSelf) {
    return false;
  }

  const client =
    options.client || (typeof window !== "undefined" ? window.CLIENT : null);
  const normalizedClientName = normalizeUsername(client && client.name);
  return normalizedClientName && normalizedClientName === normalizedAuthor;
}

function postStatusSystemMessage(message, options = {}) {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }

  const messageBufferSelector =
    options.messageBufferSelector || DEFAULT_MESSAGE_BUFFER_SELECTOR;
  const $messageBuffer = $(messageBufferSelector);
  if (!$messageBuffer.length) {
    return;
  }

  const messageBufferElement = $messageBuffer[0];
  const shouldAutoScroll =
    messageBufferElement.scrollHeight -
      messageBufferElement.scrollTop -
      messageBufferElement.clientHeight <
    20;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedTimestamp = `[${hours}:${minutes}:${seconds}] `;
  const rowClasses = ["chat-msg-$server$"];

  if (options.rowClass) {
    rowClasses.push(String(options.rowClass).trim());
  }

  const $fakeSystemRow = $("<div>", {
    class: rowClasses.filter(Boolean).join(" "),
  });

  $("<span>", {
    class: "timestamp server-whisper",
    text: formattedTimestamp,
  }).appendTo($fakeSystemRow);

  $("<span>", {
    class: "server-whisper",
    text: safeMessage,
  }).appendTo($fakeSystemRow);

  $messageBuffer.append($fakeSystemRow);
  if (shouldAutoScroll) {
    messageBufferElement.scrollTop = messageBufferElement.scrollHeight;
  }
}

function setMessageRowsClassByUsername(
  username,
  className,
  shouldAdd,
  options = {},
) {
  const normalizedTarget = normalizeUsername(username);
  const safeClassName = String(className || "").trim();
  if (!normalizedTarget || !safeClassName) {
    return 0;
  }

  const messageBufferSelector =
    options.messageBufferSelector || DEFAULT_MESSAGE_BUFFER_SELECTOR;
  let updatedCount = 0;

  $(`${messageBufferSelector} > div`).each((_, element) => {
    const $row = $(element);
    if (!$row.length || isServerMessageRow($row)) {
      return;
    }

    const rowAuthor = normalizeUsername(getMessageAuthor($row));
    if (rowAuthor !== normalizedTarget) {
      return;
    }

    element.classList.toggle(safeClassName, Boolean(shouldAdd));
    updatedCount += 1;
  });

  return updatedCount;
}

function setUserlistNameClassByUsername(
  username,
  className,
  shouldAdd,
  options = {},
) {
  const safeClassName = String(className || "").trim();
  if (!safeClassName) {
    return false;
  }

  const $userlistRow = findUserlistRowByUsername(username, options);
  if (!$userlistRow || !$userlistRow.length) {
    return false;
  }

  const $nameElement = getUserlistNameElement($userlistRow);
  if (!$nameElement.length) {
    return false;
  }

  $nameElement.toggleClass(safeClassName, Boolean(shouldAdd));
  return true;
}

window.CHAT_MODULE_UTILS = {
  escapeCssIdentifier,
  escapeRegExp,
  findUserlistRowByUsername,
  getCommandAuthorRank,
  getEmoteNodesFromRoot,
  getMessageAuthor,
  getMessageAuthorFromClassName,
  getMessageClassName,
  getMessageContentRootElement,
  getMessageRow,
  getTextWithEmoteTitles,
  getUserlistNameElement,
  getUserlistUsernameFromRow,
  isAuthorAllowed,
  isServerMessageRow,
  normalizeUsername,
  postStatusSystemMessage,
  setMessageRowsClassByUsername,
  setUserlistNameClassByUsername,
};
