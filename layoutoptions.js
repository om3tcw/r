"use strict";

function removeUntilNext() {
    socket.once("changeMedia", restoreVideo);
    return removeVideo()
}

function removeVideo(event) {
    try {
        PLAYER.pause()
        //This won't save to local user session, meaning a reload 
        //(which originally resets a hidden video) will maintain the same behavior.
        USEROPTS.synch = false;
    } catch (e) {
        console.log(e)
    }

    $("#videowrap").hide().attr("id", "video_hidden");
    $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:restoreVideo(event)").text("Restore video");
    if (event) { event.preventDefault() };
}

function restoreVideo(event) {
    USEROPTS.synch = true;
    PLAYER.play()
    socket.emit("playerReady");
    $("#video_hidden").attr("id", "videowrap").show();
    $("#chatwrap").addClass("col-lg-5 col-md-5").removeClass("col-md-12");
    $('a[onclick*="restoreVideo"]').attr("onclick", "javascript:removeVideo(event)").text("Remove video");
    if (event) { event.preventDefault() };
}

//I don't really wanna touch this.
function toggleChat() {
    if ($("#chatwrap").parent().attr("id") === "main") {
        $("#chatwrap").appendTo("#customSettingsStaging");
        $("#videowrap").css("margin", "0 auto");
        $("#videowrap").css("float", "initial");
        $("#videowrap").css("margin-bottom", "20px");
        $('a[onclick*="toggleChat"]').text("Restore Chat");
        return
    }
    if (!USEROPTS.layout.match(/synchtube/)) {
        $("#chatwrap").prependTo("#main")
    } else {
        $("#chatwrap").appendTo("#main")
    }
    $("#videowrap").css("margin", "");
    $("#videowrap").css("float", "");
    $("#videowrap").css("margin-bottom", "");
    $('a[onclick*="toggleChat"]').text("Remove Chat")
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

function chatOnly() {
    removeVideo();
    var chat = $("#chatwrap").detach();
    $("#wrap").hide();
    $("footer").hide();
    chat.prependTo($("body"));
    chat.css({
        "min-height": "100%",
        "min-width": "100%",
        margin: "0",
        padding: "0"
    });

    $("<span/>").addClass("label label-default pull-right pointer")
        .text("Restore Header and Video")
        .appendTo($("#chatheader"))
        .on('click', function undoChatOnly() {
            $("#chatheader").find("span:gt(0)").remove();
            $("#wrap").show();
            $("footer").show();
            chat.css({
                "min-height": "",
                "min-width": "",
                "margin": "",
                "padding": ""
            });
            if (!USEROPTS.layout.match(/synchtube/)) {
                chat.prependTo("#main")
            } else {
                chat.appendTo("#main")
            }    
            restoreVideo()
        });
    
    setVisible("#showchansettings", CLIENT.rank >= 2);
    $("body").addClass("chatOnly");
    handleWindowResize();
}