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

    $("#videowrap").remove();
    $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:unremoveVideo(event)").text("Restore video");
    if (event) event.preventDefault()
}

function unremoveVideo(event) {
    setTimeout(() => {
        let lastVolume = localStorage.getItem("LAST_VOLUME") ?? 0
        PLAYER.setVolume(lastVolume)
    }, 250);
    socket.emit("playerReady");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:removeVideo(event)").text("Remove video");
    if (event) {
        event.preventDefault()
    };
}

$(function() {
    $('nav.navbar a[href="#"][onclick]')
    
    .attr("href", "javascript:void(0)");
        if (!$('a[onclick*="removeUntilNext"]').length) {
        $('a[onclick*="removeVideo"]')
        .parent()
        .parent()
        .append($("<li>")
        .append($("<a>")
        .attr("href", "javascript:void(0)")
        .attr("onclick", "javascript:removeUntilNext()")
        .text("Remove Video Until Next")))
    }
    if (!$('a[onclick*="toggleChat"]').length) {
        $('a[onclick*="chatOnly"]')
        .parent().after($("<li>")
        .append($("<a>")
        .attr("href", "javascript:void(0)")
        .attr("onclick", "javascript:toggleChat()")
        .text("Remove Chat")))
    }

})