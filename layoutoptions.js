"use strict";

function removeUntilNext() {
    socket.once("changeMedia", unremoveVideo);
    return removeVideo()
}

function removeVideo(event) {
    try {
        localStorage.setItem("LAST_VOLUME", PLAYER.getVolume((cb) => {return cb}))
        PLAYER.setVolume(0);
    } catch (e) {
        console.log(e)
    }
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:unremoveVideo(event)").text("Restore video");
    if (event) event.preventDefault()
}


function unremoveVideo(event) {
    setTimeout(() => {
        lastVolume = localStorage.getItem("LAST_VOLUME") ?? 0
        PLAYER.setVolume(lastVolume)
    }, 250);
    socket.emit("playerReady");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:removeVideo(event)").text("Remove video");
    if (event) {
        event.preventDefault()
    };
}