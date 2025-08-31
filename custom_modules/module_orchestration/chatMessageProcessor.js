window.chatMsgSocketTapFunctions = []
window.postMessageTapFunctions = []

function isItServerMessage() {
  if ( $messageElement.attr('class') === 'server-whisper' ) {
    return true;
  }
}

function changeDOMMessageElement($messageElement) {
  if (!isItServerMessage) {
    for (const func of window.chatMsgSocketTapFunctions) {
      func($messageElement);
    }
  }
}

socket.on("chatMsg", async () => {
  let $messageElement = fetchLastChatElement();
  changeDOMMessageElement($messageElement)
});

(async () => {
  await window.allModulesReady;
  $('#messagebuffer [class|="chat-msg"]').each(async (index, element) => {
    const $jqElement = $(element); 
    const $messageElement = $jqElement.children().last();  
    changeDOMMessageElement($messageElement);
  })
})();