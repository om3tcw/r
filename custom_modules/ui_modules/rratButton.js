function parseURLInput(newId) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/;
    const youtubeMatch = newId.match(youtubeRegex);
    if (youtubeMatch) {
        return {
            id: youtubeMatch[1].substring(0, 11),
            source: "yt"
        };
    }

    const twitchRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/)([^/]+)/;
    const twitchMatch = newId.match(twitchRegex);
    if (twitchMatch) {
        return {
            id: twitchMatch[1],
            source: "tw"
        };
    }

    switch (newId) {
        case "om3tcw":
            return {
                id: "cJtkxZrUicI",
                source: "yt"
            };
        case "ogey":
        case "rrat":
        case "ogey rrat":
            return {
                id: "JacN1MzyeKo",
                source: "yt"
            };
        default:
            if (newId.length === 11) {
                return {
                    id: newId,
                    source: "yt"
                };
            }
        }
    alert("Invalid input.\nExample input: https://www.youtube.com/watch?v=X9zw0QF12Kc, https://youtu.be/X9zw0QF12Kc, X9zw0QF12Kc, https://www.twitch.tv/holofightz, https://twitch.tv/holofightz");
    return null;
}

function bootstrapBtnFactory(id, icon) {
    return $("<input>", {
        type: "button",
        class: "btn btn-sm btn-default",
        value: icon,
        id: id
    })
}
const $rratButton = bootstrapBtnFactory("rratbutton", "🐀")
const $rratRefresh = bootstrapBtnFactory("rratrefresh", "🔃");

$(plcontrol).append($rratButton);
$(plcontrol).append($rratRefresh);

$rratButton.on("click", () => rratButtonClick()); 
$rratRefresh.on("click", () => toggleSocketListeners(true))

function rratButtonClick() {
    let urlPrompt = window.prompt("Replace the current playing stream\nRefresh to undo\n\nSwitching back to YouTube from Twitch is broken, so reloading the player is necessary in that case\n\nYoutube URL/ID:", "");
    
    let idObject = parseURLInput(urlPrompt);
    if (!idObject) {
        return;
    }
    
    let currentVideoData = fetchCurrentVideoData();
    
    if (currentVideoData.id === idObject.id) {
        alert("Don't rrat the same video you already have rratted, fool");
        return;
    }

    let videoData = {
        id: idObject.id,
        meta: {},
        paused: false,
        seconds: '00:00',
        type: idObject.source,
        title: "Rratted video"
    } 
    
    changeMediaCb(videoData);
    toggleSocketListeners(false);
    storeVideoData(currentVideoData);
}