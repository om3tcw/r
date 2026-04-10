const tweetRegex = /https:\/\/(x|twitter|xcancel).com\/.*?\/status\/(\d+)/;
const apiUrl = "https://unable-diet-least-attorneys.trycloudflare.com";

let tweetInfoCache = {};

function createStyle() {
    let css = `
   .tweet-inline-preview {
        background-color: black;
        color: white;
        max-width: 350px;
        border-color: #535353;
        display: flex;
    }

    .tweet-inline-preview > iframe {
        width: 100%;
        border: none;
    }

    .tweet-button-toggle {
        cursor: pointer;
        color: red;
    };
    `;

    let style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}

function getTweetId(tweetUrl) {
    return tweetRegex.exec(tweetUrl)[2];
}

function stopIframeMedia(iframe) {
    // Tells the iframe we're hiding it so we can stop any video playbacks
    iframe.contentWindow.postMessage(JSON.stringify({ context: "iframe.hide" }), "*");
}

// Using an iframe to hide the referrer so twitter doesn't block us
function addPreviewIframe(linkElement) {
    let tweetId = getTweetId(linkElement.href);

    let msgElement = linkElement.parentElement.parentElement;

    let previewDiv = document.createElement("div");
    previewDiv.classList.add("tweet-inline-preview", "tweet-inline-shit");

    let iframe = document.createElement("iframe");
    iframe.allow = "fullscreen"
    iframe.src = `${apiUrl}/embed-iframe/${tweetId}`;

    previewDiv.appendChild(iframe);

    let toggleButton = document.createElement("span");
    toggleButton.innerText = `Remove`;
    toggleButton.role = "button";
    toggleButton.classList.add("tweet-button-toggle");
    toggleButton.addEventListener("click", ({target}) => {
        if (target.innerText == "Remove") {
            iframe.style.display = "none";
            target.innerText = "Embed";
            stopIframeMedia(iframe);
        } else {
            iframe.style.display = "";
            target.innerText = "Remove";
        }
    });
    toggleButton.classList.add("tweet-inline-shit");

    let lspan = document.createElement("span");
    let rspan = document.createElement("span");

    lspan.innerText = " [";
    rspan.innerText = "]";

    lspan.classList.add("tweet-inline-shit");
    rspan.classList.add("tweet-inline-shit");

    linkElement.after(lspan, toggleButton, rspan);

    // resize listener for when the element updates
    // must be the last element in the chat and be visible
    let observer = new ResizeObserver((entries) => {
        if (window.SCROLLCHAT) {
            window.scrollChat();
        }
    });

    // disconnect the observer after 10s, hopefully everything loaded...
    setTimeout(() => {
        observer.disconnect();
    }, 10000);

    observer.observe(previewDiv);
    msgElement.appendChild(previewDiv);
}

async function addTweetPreview($message) {
    $message = $message.parent().find("> span").last();
    if ($message.parent().find(".tweet-inline-shit").length > 0) {
        return;
    }

    $message
        .find("> a")
        .filter((k, v) => tweetRegex.test(v.href))
        .each((k, v) => addPreviewIframe(v));
}

window.tweetPreview = {
    toggle : function(on) {
        if (on) {
            MESSAGE_PROCESSOR.addTap(addTweetPreview);
            document.querySelectorAll(".tweet-inline-shit").forEach(el => { el.style.display = ""});
        } else {
            MESSAGE_PROCESSOR.unsubscribe(addTweetPreview);
            document.querySelectorAll(".tweet-inline-shit").forEach(el => {
                el.style.display = "none"
                let iframe = el.querySelector("iframe");
                if (iframe) {
                    stopIframeMedia(iframe);
                }
            });
        }
    }
};

(async () => {
    createStyle();

    // Auto resize embed based on content
    window.addEventListener("message", (event) => {
        if (event.origin !== apiUrl) return;

        try {
            var data = JSON.parse(event.data);
        } catch {
            console.log("Invalid message: ", event.data);
            return;
        }

        if (data.context == "iframe.error") {
            document.querySelectorAll(`iframe[src^="${data.src}"]`).forEach(iframe => {
                iframe.parentElement.style.display = "none";
            });
        } else if (data.context == "iframe.resize") {
            document.querySelectorAll(`iframe[src^="${data.src}"]`).forEach(iframe => {
                iframe.height = data.height + 30;
            });
        }
    });
})();
