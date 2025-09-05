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

let currentVideoData = null;
let currentVideoSync = null;
const storeChangeMediaValue = (data) => {
    currentVideoData = data;
}
const storeMediaUpdateValue = (data) => {
    currentVideoSync = data;
}

//HIJACK THE SOCKET CALLBACKS
//For 500 dollars "What is DRY"
let mediaUpdateCallback = socket._callbacks.$mediaUpdate[0];
let setCurrentCallback = socket._callbacks.$setCurrent[0];
let changeMediaCallback = socket._callbacks.$changeMedia[0];

function restoreVideoListeners() {
    socket.on("mediaUpdate", mediaUpdateCallback);
    socket.on("setCurrent", setCurrentCallback);
    socket.on("changeMedia", changeMediaCallback);
}

function removeVideoListeners() {
    socket.off("mediaUpdate", mediaUpdateCallback);
    socket.off("setCurrent", setCurrentCallback);
    socket.off("changeMedia", changeMediaCallback);
}

function storeSocketResponses() {
    socket.on("changeMedia", storeChangeMediaValue);
    socket.on("mediaUpdate", storeMediaUpdateValue);
}

function updateVideoWithStoredVideoData() {
    socket.off("changeMedia", storeChangeMediaValue);
    socket.off("mediaUpdate", storeMediaUpdateValue);
    changeMediaCallback(currentVideoData);
    if (currentVideoSync) {
        mediaUpdateCallback(currentVideoSync);
    }
    
}

function removeVideoDOMUpdates() {
    $videowrap.hide();
    $chatwrap.removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $removeVideoListLink.text("Restore Video");
    $removeVideoListLink.off('click.removeVideo');
    $removeVideoListLink.on('click.restoreVideo', restoreVideo);
}

function restoreVideoDOMUpdates() {
    $videowrap.show();
    $chatwrap.addClass("col-lg-5 col-md-5").removeClass("col-md-12");
    $removeVideoListLink.text("Remove Video");
    $removeVideoListLink.off('click.restoreVideo');
    $removeVideoListLink.on('click.removeVideo', removeVideo);
}

function storeCurrentVideoData() {
    let data = {
        id: PLAYER.mediaId,
        meta: {},
        paused: false,
        seconds: PLAYER.mediaLength,
        type: PLAYER.mediaType
    }
    storeChangeMediaValue(data);
}

export function removeVideo() {
    PLAYER.pause();
    if (PLAYER.yt) {
        PLAYER.yt.stopVideo();
    }
    storeCurrentVideoData();
    removeVideoDOMUpdates();
    removeVideoListeners();
    storeSocketResponses();
}

export function restoreVideo() {
    PLAYER.play();
    restoreVideoDOMUpdates()
    restoreVideoListeners();
    updateVideoWithStoredVideoData();
}

function removeUntilNext() {
    removeVideo();

    socket.once("changeMedia", (data) => {
        storeChangeMediaValue(data);
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