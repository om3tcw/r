const $textInputBox = $('#chatline');

function formatMJMessage($messageElement) {
  if (!$messageElement.text().startsWith('MJ:')) {
    return
  }
  let $timestampElement = $messageElement.parent().find('.timestamp')
  $($messageElement).addClass("MahjongMessage")
  $timestampElement.css("background-image", "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/eyes/nyagger.png')")
  $messageElement.text($messageElement.text().replace(/^MJ: /, ''));
  toggleSingleMJMessage($messageElement, canReadMJMessages())
} 

function injectSecretMahjongEmotes($messageElement) {
  let messageHtml = $messageElement.html();
  Object.keys(secretMJEmotes)
        .map(secretEmote => {
    return {
      original: secretEmote,
      escaped: secretEmote.replace(/[-/\\^$.*+?()[\]{}|]/g, '\\$&')
    }}
  ).forEach(({ original, escaped }) => {
      const regex = new RegExp(escaped, 'g');
      messageHtml = messageHtml.replace(regex,
        `<img class="channel-emote" title="${original}" src="${secretMJEmotes[original]}">`);
    });
  $messageElement.html(messageHtml);
  }

function prependMessagesWithMJ(textInputBox) {
  if (textInputBox.val() && !textInputBox.val().startsWith('MJ: ')) {
      textInputBox.val('MJ: ' + textInputBox.val());
  }
}

function toggleSingleMJMessage($messageElement, canRead) {
  if (canRead) {
    $messageElement.parent().css('display', 'block');
  } else {
    $messageElement.parent().css('display', 'none');
  }
}

function toggleMJMessages(self) {
  let canRead = self.checkbox.prop('checked');
  $('#messagebuffer [class|="MahjongMessage"]').each((_, element) => {
    let $jqElement = $(element)
    toggleSingleMJMessage($jqElement, canRead);
  })
}

const secretMJEmotes = [
  { name: ":nyaggernap:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggernap.jpg"},
  { name: ":yakuless:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/yakuless.gif" },
  { name: ":nightynightnyagger:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nightynightnyagger.png" },
  { name: ":chinpo:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/chinpo.png" },
  { name: ":sharingiscaring:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/sharingiscaring.png" },
  { name: ":pardner:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/pardner.png" },
  { name: ":nyaggerfed:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggerfed.png" },
  { name: ":nyaggerfish:", image: "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggerfish.png" }  
]

function sanitizeText(str) {
    str = str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
    return str;
}

function turnMahjongEmotesReal(emotes) {
  emotes.forEach(function (emote) {
    emote.regex = new RegExp(emote.source, "gi");
    CHANNEL.emotes.push(emote);
    CHANNEL.emoteMap[sanitizeText(emote.name)] = emote;
  })
}

function prependMahjongMode(self) {
  $textInputBox.on('input.prependMJ focus.prependMJ', 
    () => prependMessagesWithMJ($textInputBox));
  toggleMJMessages(self);
}

function removeMahjongMode(self) {
  $textInputBox.off('input.prependMJ focus.prependMJ')
  $textInputBox.val($textInputBox.val().replace(/^MJ: /, ''));
  toggleMJMessages(self);
}


let MahjongModeHoloPeekItem = 
  {
    optionName: "MahjongMode", 
    optionDescription: "Mahjong Mode", 
    optionFunc: prependMahjongMode,
    cleanupFunc: removeMahjongMode
  }

let MahjongLurkHoloPeekItem = {
  optionName: 'MahjongLurk',
  optionDescription: 'Mahjong Lurk',
  optionFunc: toggleMJMessages,
  cleanupFunc: toggleMJMessages
};

function canReadMJMessages() {
  return MahjongLurkHoloPeekItem.checkbox.prop('checked') ||
         MahjongModeHoloPeekItem.checkbox.prop('checked')
}


(async function insertMahjongModeIntoHoloPeek() {

  await window.waitForFunc("createHoloPeekItem");
  await window.waitForFunc("addToHoloPeekContainer");

  MahjongLurkHoloPeekItem = window.createHoloPeekItem(MahjongLurkHoloPeekItem);
  MahjongModeHoloPeekItem = window.createHoloPeekItem(MahjongModeHoloPeekItem);

  window.addToHoloPeekContainer(MahjongLurkHoloPeekItem, true);
  window.addToHoloPeekContainer(MahjongModeHoloPeekItem, true);

  await window.waitForFunc("chatMsgSocketTapFunctions")

  window.chatMsgSocketTapFunctions.push(formatMJMessage);
  turnMahjongEmotesReal(secretMJEmotes);  
})();
