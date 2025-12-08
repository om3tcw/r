const apiUrl      = "https://unable-diet-least-attorneys.trycloudflare.com/api/v1/statuses";
const tweetRegex  = /https:\/\/(x|twitter|xcancel).com\/.*?\/status\/(\d+)/;

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

    .tweet-content {
        max-height: 500px;
        margin: 3% 3%;
        display: flex;
        flex-flow: column;
        row-gap: 15px;
    }

    .tweet-embed {
        position: relative;
        flex-grow: 1;
        max-width: 100%;
    }

    .tweet-loader {
        width: 60px;
        aspect-ratio: 4;
        background: radial-gradient(circle closest-side,#fff 90%,#0000) 0/calc(100%/3) 100% space;
        clip-path: inset(0 100% 0 0);
        animation: tweetanim 1s steps(4) infinite;
    }

    .tweet-image {
        display: grid;
        grid-template-columns: 1fr 1fr;
        place-content: center;
        row-gap: 5px;
        column-gap: 5px;
        flex: 1;
        min-width: 0px;
        min-height: 0px;
    }

    .tweet-image :nth-child(1):nth-last-child(3) {
        grid-column-start: span 2;
    }

    .tweet-image :nth-child(2):nth-last-child(1) {
        grid-column-start: span 1;
    }

    .tweet-image :nth-child(1):nth-last-child(2) {
        grid-column-start: span 1;
    }

    .tweet-image :nth-child(1):nth-last-child(1) {
        grid-column-start: span 2;
    }

    .tweet-img-preview {
        overflow: hidden;
        display: flex;
        justify-content: center;
    }

    .tweet-img-preview > a {
        display: flex;
        justify-content: center;
    }

    .tweet-img-preview img {
        max-width: 100%;
        max-height: 100%;
    }

    .tweet-img-preview video {
        max-width: 100%;
        max-height: 100%;
    }

    .tweet-user {
        display: flex;
        gap: 5px;
    }

    .tweet-text {
        min-height: 50px;
        overflow: scroll;
        align-content: center;
    }

    .tweet-text blockquote {
        font-size: 14px;
    }

    .tweet-user-id {
        display: flex;
        flex-direction: column;
    }

    .tweet-avatar > img {
        width: 48px;
        height: 48px;
    }


    @keyframes tweetanim {to{clip-path: inset(0 -34% 0 0)}}

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
        let response = await fetch(`${apiUrl}/${tweetId}`);
        let js = await response.json();
        tweetInfoCache[tweetId] = js;
        resolve(js);
    });
}

function buildEmbed(info) {
    let template = `<div class="tweet-content">
            <div class="tweet-user">
                <div class="tweet-avatar"><img src=""/></div>
                <div class="tweet-user-id">
                    <span class="tweet-user-name"></span>
                    <span class="tweet-user-handle" style="color: rgb(113, 118, 123);"></span>
                </div>
            </div>
            <div class="tweet-text">
            </div>
            <div class="tweet-image">
            </div>
        </div>`;

    let embed = document.createElement("div");
    embed.classList.add("tweet-embed");
    embed.innerHTML = template;

    embed.querySelector(".tweet-text").innerHTML = info.content;

    embed.querySelector(".tweet-user-name").innerText = info.account.display_name;
    embed.querySelector(".tweet-user-handle").innerText = "@" + info.account.acct;
    embed.querySelector(".tweet-avatar > img").src = info.account.avatar;

    if (info.media_attachments.length == 0) {
        embed.querySelector(".tweet-image").style.display = "none";
    }

    for (let attachment of info.media_attachments) {
        let imgPreview = document.createElement("div");
        imgPreview.classList.add("tweet-img-preview");
        if (attachment.type == "video" || attachment.type == "gifv") {
            imgPreview.innerHTML = `<video controls src="${attachment.url}"></video>`;
        } else {
            imgPreview.innerHTML = `<a href="${attachment.preview_url}" target="_blank"> <img src="${attachment.preview_url}"/> </a>`;
        }
        embed.querySelector(".tweet-image").appendChild(imgPreview);
    }

    return embed;
}

function scrolledToBottom(element) {
    return Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
}

function addPreview(linkElement) {
    let msgElement = linkElement.parentElement.parentElement;
    let previewDiv = document.createElement("div");
    previewDiv.classList.add("tweet-inline-preview");
    previewDiv.innerHTML = `<div class="tweet-loading" class="tweet-loader"></div><div class="tweet-embed"></div>`;

    previewDiv.querySelector("div.tweet-embed").style.display = "none";
    previewDiv.querySelector("div.tweet-loading").style.display = "";

    fetchTweetInfo(linkElement.href).then((result) => {
        previewDiv.querySelector("div.tweet-embed").style.display = "";
        previewDiv.querySelector("div.tweet-loading").style.display = "none";
        previewDiv.replaceChild(buildEmbed(result), previewDiv.querySelector("div.tweet-embed"));
    });

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
        .each((k, v) => addPreview(v));
}

function makeToggleButton() {
    var button = document.createElement("button");
    button.innerText = "🐦";
    button.classList.add("btn", "btn-sm", "btn-default", "collapsed", "active");
    button.addEventListener("click", ({target}) => {
        window.tweetPreview.toggle();
        target.classList.toggle("collapsed");
        target.classList.toggle("active");
    })
    document.querySelector("#plcontrol").appendChild(button);
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
    //await window.waitForFunc("MESSAGE_PROCESSOR");
    //MESSAGE_PROCESSOR.addTap(addTweetPreview);
    createStyle();
    //makeToggleButton();
})();
