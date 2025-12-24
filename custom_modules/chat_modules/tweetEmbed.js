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
    `;

    let style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}

function getTweetId(tweetUrl) {
    return tweetRegex.exec(tweetUrl)[2];
}

async function fetchTweetInfo(tweetUrl) {
    let tweetId = getTweetId(tweetUrl);

    return new Promise(async (resolve, reject) => {
        if (tweetInfoCache[tweetId] !== undefined) {
            return resolve(tweetInfoCache[tweetId]);
        }
        let response = await fetch(`${apiUrl}/api/v1/statuses/${tweetId}`);

        let js = await response.json();
        tweetInfoCache[tweetId] = js;
        resolve(js);
    });
}

// Using an iframe to hide the referrer so twitter doesn't block us
function addPreviewIframe(linkElement) {
    let tweetId = getTweetId(linkElement.href);
    let msgElement = linkElement.parentElement.parentElement;
    let previewDiv = document.createElement("div");
    previewDiv.classList.add("tweet-inline-preview");

    let iframe = document.createElement("iframe");
    iframe.allow = "fullscreen"
    iframe.src = `${apiUrl}/embed-iframe/${tweetId}`;
    iframe.onerror = function() {
        previewDiv.style.display = "none";
    }

    previewDiv.appendChild(iframe);

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
        console.log("Disconnected");
    }, 10000);

    observer.observe(previewDiv);
    msgElement.appendChild(previewDiv);
}

async function addTweetPreview($messageElement) {
    $messageElement
        .find("a")
        .filter((k, v) => tweetRegex.test(v.href))
        .each((k, v) => addPreviewIframe(v));
}

window.tweetPreview = {
    toggle : function(on) {
        if (on) {
            MESSAGE_PROCESSOR.addTap(addTweetPreview);
            document.querySelectorAll(".tweet-inline-preview").forEach(el => { el.style.display = ""});
        } else {
            MESSAGE_PROCESSOR.unsubscribe(addTweetPreview);
            document.querySelectorAll(".tweet-inline-preview").forEach(el => { el.style.display = "none"});
        }
        window.tweetPreview.enabled = !window.tweetPreview.enabled;
    }
};

(async () => {
    createStyle();

    // Auto resize embed based on content
    window.addEventListener("message", (event) => {
        if (event.origin !== apiUrl) return;

        let data = JSON.parse(event.data);

        if (data.context == "iframe.error") {
            document.querySelectorAll(`iframe[src^="${data.src}"]`).forEach(iframe => {
                iframe.parentElement.style.display = "none";
            });
        } else if (data.context == "iframe.resize") {
            document.querySelectorAll(`iframe[src^="${data.src}"]`).forEach(iframe => {
                iframe.height = data.height + 50;
            });
        }
    });
})();
