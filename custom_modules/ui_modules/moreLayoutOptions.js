const $removeVideoUntilNext = $("<li>")
    .append($("<a>")
        .attr("id", "remove-video-until-next")
        .text("Remove Video Until Next"))
        .on('click', removeUntilNext);

const $toggleChatListLink = $("<li>")
    .append($("<a>")
        .attr("id", "toggle-chat")
        .text("Remove Chat"))
        .on('click', toggleChat);

let chatToggledOff = false;

let $chatwrap, $videowrap, $navbar;
let $layoutDropdownList, $chatOnlyListLink, $removeVideoListLink
//On Document Load IIFE
$(function changeLayoutDOM() {
    $chatwrap = $("#chatwrap");
    $videowrap = $("#videowrap");
    $navbar = $(".nav.navbar-nav");
    $layoutDropdownList = $navbar.children().eq(4).children().last().attr("id", "layout-nav-toggle");
    $chatOnlyListLink = $layoutDropdownList.children().eq(0).children();
    $removeVideoListLink = $layoutDropdownList.children().eq(1).children();
    
    $layoutDropdownList.append($removeVideoUntilNext);
    //Maintaining the same order
    $toggleChatListLink.insertBefore($removeVideoListLink.parent());
    
    $chatOnlyListLink.removeAttr('onclick href');
    $chatOnlyListLink.on('click.chatOnly', chatOnly);

    $removeVideoListLink.removeAttr('onclick href');
    $removeVideoListLink.on('click.removeVideo', removeVideo);
})

function removeVideo(event) {
    try {
        PLAYER.pause()
        //This won't save to local user session, meaning a reload 
        //(which originally resets a hidden video) will maintain the same behavior.
        USEROPTS.synch = false;
    } catch (e) {
        console.log(e)
    }

    $videowrap.hide()
    $chatwrap.removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $removeVideoListLink.text("Restore Video");
    $removeVideoListLink.off('click.removeVideo');
    $removeVideoListLink.on('click.restoreVideo', restoreVideo);
    if (event) { event.preventDefault() };
}

function restoreVideo(event) {
    socket.off("changeMedia", restoreVideo);
    //Reloads the player
    socket.emit("playerReady");
    try {
        PLAYER.mediaType = "";
        PLAYER.mediaId = "";
        PLAYER.play();
        USEROPTS.synch = true;
    } catch(e) {
        console.debug("Player not found when restoring video", e)
    }

    $videowrap.show();
    $chatwrap.addClass("col-lg-5 col-md-5").removeClass("col-md-12");
    $removeVideoListLink.text("Remove Video");

    $removeVideoListLink.off('click.restoreVideo');
    $removeVideoListLink.on('click.removeVideo', removeVideo);

    if (event) { event.preventDefault() };
}

function removeUntilNext() {
    removeVideo();
    socket.once("changeMedia", restoreVideo);
}

//I don't really wanna touch this.
function toggleChat() {
    if (chatToggledOff) {
        chatToggledOff = !chatToggledOff;
        $toggleChatListLink.children().last().text("Remove Chat");
        if (!USEROPTS.layout.match(/synchtube/)) {
            $chatwrap.prependTo("#main")
        } else {
            $chatwrap.appendTo("#main")
        }
        $videowrap.css({
            "margin": "",
            "float": "",
            "margin-bottom": ""
        });
    } else {
        chatToggledOff = !chatToggledOff;
        $toggleChatListLink.children().last().text("Restore Chat");
        $chatwrap.appendTo("#customSettingsStaging");
        $videowrap.css({
            "margin": "0 auto 20px auto",
            "float": "initial"
        });
    }
}

function chatOnly() {
    removeVideo();
    let chat = $chatwrap.detach();
    $("#wrap").hide();
    $("#footer").hide();
    chat.prependTo($("body"));
    chat.css({
        "min-height": "100%",
        "min-width": "100%",
        margin: "0",
        padding: "0"
    });

    let $restoreHeaderAndVideoLabel = $("<span/>")
        .addClass("label label-default pull-right pointer")
        .text("Restore Header and Video")
        .on('click.undoChatOnly', function undoChatOnly() {
            $("#chatheader").find("span:gt(0)").remove();
            $("#wrap").show();
            $("#footer").show();
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

    $restoreHeaderAndVideoLabel.appendTo($chatwrap);
    
    setVisible("#showchansettings", CLIENT.rank >= 2);
    $("body").addClass("chatOnly");
    handleWindowResize();
}