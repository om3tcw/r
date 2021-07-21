/*!
 **|   Extended Layout Options
 **|   Copyright Xaekai 2014 - 2016
 **|   Version 2016.10.04.0100
 **|
 **@preserve
 */
"use strict";

function removeUntilNext() {
    socket.once("changeMedia", unremoveVideo);
    return removeVideo()
}

function removeVideo(event) {
    try {
        PLAYER.setVolume(0);
        if (PLAYER.type === "rv") {
            killVideoUntilItIsDead($(PLAYER.player))
        }
    } catch (e) {
        console.log(e)
    }
    CLIENT.removedOnGDrive = PLAYER.mediaType == "gd" ? true : false;
    $("#videowrap").hide().attr("id", "videowrap_disabled");
    $("#ytapiplayer").attr("id", "ytapiplayer_disabled");
    $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:unremoveVideo(event)").text("Restore video");
    if (event) event.preventDefault()
}

function unremoveVideo(event) {
    setTimeout(function() {
        PLAYER.setVolume(.33)
    }, 250);
    socket.emit("playerReady");
    $("#chatwrap").addClass("col-lg-5 col-md-5").removeClass("col-md-12");
    $("#videowrap_disabled").attr("id", "videowrap").show();
    $("#ytapiplayer_disabled").attr("id", "ytapiplayer");
    $('a[onclick*="removeVideo"]').attr("onclick", "javascript:removeVideo(event)").text("Remove video");
    if (event) event.preventDefault();
    if (CLIENT.removedOnGDrive) {
        CLIENT.removedOnGDrive = false;
        setTimeout(function() {
            $("#mediarefresh").click()
        }, 1e3)
    }
}

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
}(function(CyTube_Layout) {
    return CyTube_Layout(window, document, window.jQuery, String)
})(function(window, document, $, String, undefined) {
    $('nav.navbar a[href="#"][onclick]').attr("href", "javascript:void(0)");
    if (!$('a[onclick*="removeUntilNext"]').length) {
        $('a[onclick*="removeVideo"]').parent().parent().append($("<li>").append($("<a>").attr("href", "javascript:void(0)").attr("onclick", "javascript:removeUntilNext()").text("Remove Video Until Next")))
    }
    if (!$('a[onclick*="toggleChat"]').length) {
        $('a[onclick*="chatOnly"]').parent().after($("<li>").append($("<a>").attr("href", "javascript:void(0)").attr("onclick", "javascript:toggleChat()").text("Remove Chat")))
    }({
        host: "https://pink.horse/resources/css/",
        initialize: function() {
            if (CLIENT.cinemaMode) {
                return
            } else {
                CLIENT.cinemaMode = this
            }
            this.loadStyle()
        },
        createButtons: function() {
            $('a[onclick*="removeVideo"]').parent().parent().append($("<li>").append($("<a>").attr("href", "javascript:void(0)").attr("onclick", 'javascript:$("#cinematoggle").click()').text("Cinema Mode")));
            $('<div id="cinematoggle"><span class="glyphicon glyphicon-new-window "></span></div>').appendTo("body").click(function() {
                if (!$("body").hasClass("cinemachat")) {
                    if ($("#userlist").is(":visible")) {
                        $("#userlisttoggle").click()
                    }
                }
                $("body").toggleClass("cinemachat");
                if ($("iframe[src*=livestream]").length) {
                    PLAYER.mediaType = "";
                    PLAYER.mediaId = "";
                    socket.emit("playerReady")
                }
                handleWindowResize()
            })
        },
        createStyle: function(body) {
            this.style = $("<style>").attr("type", "text/css").attr("id", "cinemaStyle").html(body).appendTo("head")
        },
        handleCommand(message, target) {
            var params = message.substring(1).replace(/cinema ?/, "").trim();
            if (!params.length) {
                $("#cinematoggle").click()
            }
            if (params === "nopolls") {
                $("body").addClass("cinema-nopoll");
                $("#messagebuffer").trigger("whisper", `Cinema: Poll overlay disabled`);
                localStorage.setItem(`${CHANNEL.name}_cinemaHidePolls`, 1)
            }
            if (params === "polls") {
                $("body").removeClass("cinema-nopoll");
                $("#messagebuffer").trigger("whisper", `Cinema: Poll overlay enabled`);
                localStorage.setItem(`${CHANNEL.name}_cinemaHidePolls`, 0)
            }
        },
        registerCommand() {
            $("#chatline").trigger("registerCommand", ["cinema", this.handleCommand.bind(this)])
        },
        loadStyle: function() {
            $.ajax(this.host + "cinema.css?cache" + Math.random()).done((data => {
                this.createButtons();
                this.createStyle(data);
                this.registerCommand();
                if (localStorage.getItem(`${CHANNEL.name}_cinemaHidePolls`) !== null) {
                    if (parseInt(localStorage.getItem(`${CHANNEL.name}_cinemaHidePolls`))) {
                        $("body").addClass("cinema-nopoll")
                    }
                }
            }))
        }
    }).initialize()
});