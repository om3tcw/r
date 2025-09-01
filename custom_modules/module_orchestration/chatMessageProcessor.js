class MessageSocketTap {
  constructor() {
    this.chatMsgSocketTapFunctions = [];
  }

  addTap(fn) {
    this.chatMsgSocketTapFunctions.push(fn);
    this.runTapForExistingMessages(fn);
  }

  runTapForExistingMessages(fn) {
    $('#messagebuffer [class|="chat-msg"]').each(async (index, element) => {
      const $jqElement = $(element); 
      const $messageElement = $jqElement.children().last();  
      fn($messageElement);
    })
  }

  unsubscribe(fn) {
    this.chatMsgSocketTapFunctions = this.chatMsgSocketTapFunctions.filter(fnObserved => fnObserved !== fn);
  }

  isItServerMessage($messageElement) {
    if ($messageElement.attr('class') === 'server-whisper' ) {
      return true;
    }
  }

  changeDOMMessageElement($messageElement) {
    if (!this.isItServerMessage($messageElement)) {
      for (const func of this.chatMsgSocketTapFunctions) {
        func($messageElement);
      }
    }
  }
}

export const MESSAGE_PROCESSOR = new MessageSocketTap();

socket.on("chatMsg", () => {
  let $messageElement = fetchLastChatElement();
  MESSAGE_PROCESSOR.changeDOMMessageElement($messageElement)
});
