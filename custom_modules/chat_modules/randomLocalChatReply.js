const RANDOM_CHAT_REPLY_CHANCE = 1 / 5;
const RANDOM_CHAT_REPLY_MESSAGE = "test message";
const PATCH_KEY = "__randomLocalChatReplyPatch";

function installRandomLocalChatReply() {
    if (
        typeof socket === "undefined" ||
        !socket ||
        typeof socket.emit !== "function"
    ) {
        console.warn(
            "[RandomLocalChatReply] socket.emit is unavailable; module not installed."
        );
        return false;
    }
	
    if (socket[PATCH_KEY]) {
        return true;
    }

    const originalEmit = socket.emit;
    let sendingInjectedMessage = false;

    function patchedEmit(eventName, ...args) {
        const payload = args[0];

        const isOutgoingChatMessage =
            eventName === "chatMsg" &&
            payload &&
            typeof payload === "object" &&
            typeof payload.msg === "string" &&
            payload.msg.trim().length > 0;

        const result = originalEmit.apply(this, [eventName, ...args]);

        if (
            isOutgoingChatMessage &&
            !sendingInjectedMessage &&
            Math.random() < RANDOM_CHAT_REPLY_CHANCE
        ) {
            setTimeout(() => {
                sendingInjectedMessage = true;

                try {
                    socket.emit("chatMsg", {
                        msg: RANDOM_CHAT_REPLY_MESSAGE,
                        meta: {}
                    });
                } finally {
                    sendingInjectedMessage = false;
                }
            }, 0);
        }

        return result;
    }

    socket.emit = patchedEmit;

    socket[PATCH_KEY] = {
        originalEmit,
        patchedEmit
    };

    console.info(
        `[RandomLocalChatReply] Installed. Chance: 1/500; message: "${RANDOM_CHAT_REPLY_MESSAGE}"`
    );

    return true;
}

function uninstallRandomLocalChatReply() {
    if (
        typeof socket === "undefined" ||
        !socket ||
        !socket[PATCH_KEY]
    ) {
        return false;
    }

    const patch = socket[PATCH_KEY];

    if (socket.emit === patch.patchedEmit) {
        socket.emit = patch.originalEmit;
    }

    delete socket[PATCH_KEY];

    console.info("[RandomLocalChatReply] Uninstalled.");

    return true;
}

installRandomLocalChatReply();

export {
    installRandomLocalChatReply,
    uninstallRandomLocalChatReply
};