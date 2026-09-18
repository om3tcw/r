const RANDOM_CHAT_REPLY_CHANCE = 1 / 200;

const RANDOM_CHAT_REPLY_MESSAGE =
    "This ClaudeChatCompanion is at 95% token usage limit, please add more funds to prevent loss of service.";

const RANDOM_CHAT_REPLY_DELAY = 250;
const PATCH_KEY = "__randomLocalChatReplyPatch";

function installRandomLocalChatReply() {
    if (
        typeof socket === "undefined" ||
        !socket ||
        typeof socket.emit !== "function"
    ) {
        setTimeout(installRandomLocalChatReply, 250);
        return;
    }

    if (socket[PATCH_KEY]) {
        return;
    }

    const originalEmit = socket.emit;
    let sendingRandomMessage = false;

    function patchedEmit(eventName, ...args) {
        const payload = args[0];

        const isChatMessage =
            eventName === "chatMsg" &&
            payload &&
            typeof payload.msg === "string" &&
            payload.msg.trim().length > 0;

        const result = originalEmit.apply(this, [eventName, ...args]);

        if (
            isChatMessage &&
            !sendingRandomMessage &&
            Math.random() < RANDOM_CHAT_REPLY_CHANCE
        ) {
            setTimeout(() => {
                sendingRandomMessage = true;

                try {
                    socket.emit("chatMsg", {
                        msg: RANDOM_CHAT_REPLY_MESSAGE,
                        meta: {}
                    });
                } finally {
                    sendingRandomMessage = false;
                }
            }, RANDOM_CHAT_REPLY_DELAY);
        }

        return result;
    }

    socket.emit = patchedEmit;

    socket[PATCH_KEY] = {
        originalEmit,
        patchedEmit
    };
}

installRandomLocalChatReply();
