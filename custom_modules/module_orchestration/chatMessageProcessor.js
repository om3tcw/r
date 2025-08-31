window.chatMsgSocketTapFunctions = []
window.postMessageTapFunctions = []

socket.on("chatMsg", async () => {
  let $messageElement = fetchLastChatElement();

  for (const func of window.chatMsgSocketTapFunctions) {
    func($messageElement);
  }
  
});

(async () => {
  await window.allModulesReady;
  $('#messagebuffer [class|="chat-msg"]').each(async (index, element) => {
    const $jqElement = $(element); 
    const $messageElement = $jqElement.children().last();  

    for (const func of window.chatMsgSocketTapFunctions) {
        func($messageElement)
    }

  })
})();