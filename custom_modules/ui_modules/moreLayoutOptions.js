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

let $chatwrap, $chatheader, $videowrap, $navbar;
let $layoutDropdownList, $chatOnlyListLink, $removeVideoListLink
//On Document Load IIFE
$(function changeLayoutDOM() {
    $chatwrap = $("#chatwrap");
    $videowrap = $("#videowrap");
    $navbar = $(".nav.navbar-nav");
    $chatheader = $("#chatheader");
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

let videoData = null;
let videoSyncData = null;
export const storeVideoData = (data) => {
    videoData = data;
}
export const storeVideoSyncData = (data) => {
    videoSyncData = data;
}

export const mediaUpdateCb = socket._callbacks.$mediaUpdate[0];
export const setCurrentCb = socket._callbacks.$setCurrent[0];
export const changeMediaCb = socket._callbacks.$changeMedia[0];


let listenersActive = false;
export function toggleSocketListeners(restore) {
    const restoreVideo = (restore === undefined) ? !listenersActive : restore;

    if (restoreVideo) {
        socket.off("mediaUpdate", mediaUpdateCb);
        socket.off("setCurrent", setCurrentCb);
        socket.off("changeMedia", changeMediaCb);

        socket.on("mediaUpdate", mediaUpdateCb);
        socket.on("setCurrent", setCurrentCb);
        socket.on("changeMedia", changeMediaCb);

        if (videoData) {
            changeMediaCb(videoData);
        }
        if (videoSyncData) {
            mediaUpdateCb(videoSyncData);
        }
    } else {
        socket.off("mediaUpdate", mediaUpdateCb);
        socket.off("setCurrent", setCurrentCb);
        socket.off("changeMedia", changeMediaCb);

        socket.on("changeMedia", storeVideoData);
        socket.on("mediaUpdate", storeVideoSyncData);
        
        let currentVideoData = fetchCurrentVideoData();
        storeVideoData(currentVideoData);
    }
    
    listenersActive = restoreVideo;
}

export function fetchCurrentVideoData() {
    return {
        id: PLAYER.mediaId,
        meta: {},
        paused: false,
        seconds: PLAYER.mediaLength,
        type: PLAYER.mediaType,
        title: PLAYER.yt?.videoTitle ?? playlistFind(window.PL_CURRENT).children[0].innerText
    }
}


export function removeVideoDOMElements() {
    $videowrap.hide();
    $chatwrap.css({ width: "100%"});
    $removeVideoListLink.text("Restore Video");
    $removeVideoListLink.off('click.removeVideo');
    $removeVideoListLink.on('click.restoreVideo', restoreVideo);
}

export function restoreVideoDOMElements() {
    $videowrap.show();
    $chatwrap.css({ width: ""});
    $removeVideoListLink.text("Remove Video");
    $removeVideoListLink.off('click.restoreVideo');
    $removeVideoListLink.on('click.removeVideo', removeVideo);
}

export function removeVideo() {
    PLAYER.pause();
    if (PLAYER.yt) {
        PLAYER.yt.stopVideo();
    }
    toggleSocketListeners(false);
    removeVideoDOMElements();
}

export function restoreVideo() {
    toggleSocketListeners(true);
    restoreVideoDOMElements();
    PLAYER.play();
}

export function removeUntilNext() {
    removeVideo();

    socket.once("changeMedia", (data) => {
        storeVideoData(data);
        restoreVideo();
    });
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

function restoreHeaderAndVideo($chat) {
    $("body").removeClass("chatOnly");
    $chatheader.find("span:gt(0)").remove();
    $("#wrap").show();
    
    $chat.css({
        "min-height": "",
        "min-width": "",
        "margin": "",
        "padding": ""
    });
    if (!USEROPTS.layout.match(/synchtube/)) {
        $chat.prependTo("#main")
    } else {
        $chat.appendTo("#main")
    }    
    restoreVideo();
}

function chatOnly() {
    removeVideo();

    let $chat = $chatwrap.detach();
    $("#wrap").hide();
    $("#footer").hide();
    $chat.prependTo($("body"));
    $chat.css({
        "min-height": "100%",
        "min-width": "100%",
        margin: "0",
        padding: "0"
    });

    let $restoreHeaderAndVideoLabel = $("<span/>")
        .addClass("label label-default pull-right pointer")
        .text("Restore Header and Video")
        .on('click.undoChatOnly', (e) => restoreHeaderAndVideo($chat));

    $restoreHeaderAndVideoLabel.appendTo($chatheader);
    
    setVisible("#showchansettings", CLIENT.rank >= 2);
    $("body").addClass("chatOnly");
    handleWindowResize();
}