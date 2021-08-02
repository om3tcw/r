/*!
 **|   CyTube Audio Notifications System
 **|   Copyright 2013-2018 Xaekai
 **|   Version 2018.01.18.1400
 **|
 **@requires playlist
 **@optional settings
 **@optional audiolib
 **@optional whispers
 **@preserve
 */
"use strict";
if (!window[CHANNEL.name]) {
    window[CHANNEL.name] = {}
}(function(CyTube_Notifications) {
    return CyTube_Notifications(window, document, window.jQuery)
})(function(window, document, $, undefined) {
    if (typeof Storage === "undefined") {
        console.error("[XaeTube: Audio Notifier]", "localStorage not supported. Aborting load.");
        return
    } else if (typeof window.playlist !== "function") {
        console.error("[XaeTube: Audio Notifier]", "Playlist parser unavailable. Aborting load.");
        return;
        return
    } else {
        console.info("[XaeTube: Audio Notifier]", "Loading Module.")
    }
    if (typeof window[CHANNEL.name].audioLibrary === "undefined") {
        console.warn("[XaeTube: Audio Notifier]", "WARNING: Audio library module not loaded.")
    }
    if (!$("#customSettingsStaging").length) {
        console.warn("[XaeTube: Audio Notifier]", "WARNING: Settings module not loaded.")
    }
    const AudioNotifier = function() {
        this.Squee = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .35,
            id: "squee"
        };
        this.Poll = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .1,
            id: "votingpoll"
        };
        this.Priv = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .15,
            id: "uhoh"
        };
        this.Video = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .35,
            id: "fairywand"
        };
        this.Marked = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .4,
            id: "bell"
        };
        this.typeNames = {
            Squee: "Username",
            Poll: "Poll",
            Priv: "Private Message",
            Video: "Queued Video",
            Marked: "Marked Video"
        };
        this.choices = Object.assign({}, {
            squee: "https://resources.pink.horse/sounds/squee.ogg",                         //https://resources.pink.horse/sounds/squee.ogg
            votingpoll: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/other/ogeyrrat.mp3",
            uhoh: "https://resources.pink.horse/sounds/uhoh.ogg",                           //https://resources.pink.horse/sounds/uhoh.ogg
            fairywand: "https://resources.pink.horse/sounds/fairy_wand.ogg",                //https://resources.pink.horse/sounds/fairy_wand.ogg
            bell: "https://resources.pink.horse/sounds/bell.ogg"                            //https://resources.pink.horse/sounds/bell.ogg
        }, window[CHANNEL.name].audioLibrary ? window[CHANNEL.name].audioLibrary.squees : undefined);
        this.handler = {
            Squee: function(data) {
                var squee;
                if (!this.Squee.toggleState) {
                    return
                }
                if (!CHANNEL.opts.chat_antiflood) {
                    console.info("[XaeTube: Audio Notifier]", "User ping ignored: Chat throttle off.");
                    return
                }
                if (Date.now() - this.Squee.timeSinceLast < 7e3) return;
                squee = $(".nick-highlight:not( .parsed )");
                if (!squee.length) return;
                squee.addClass("parsed");
                var start = Date.parse("2015-10-31T04:00:00Z"),
                    end = Date.parse("2015-11-01T04:00:00Z"),
                    current = Date.now();
                current > start && end > current ? function() {
                    toot = new Audio("/skulltrumpet.wav");
                    toot.volume = .33;
                    toot.play()
                }() : this.Squee.audio[0].play();
                this.Squee.timeSinceLast = Date.now()
            }.bind(this),
            Poll: function(data) {
                if (!this.Poll.toggleState) return;
                if (CLIENT.rank < CHANNEL.perms.pollvote) return;
                if (Date.now() - this.Poll.timeSinceLast <  6e4) return;
                this.Poll.audio[0].play();
                this.Poll.timeSinceLast = Date.now()
            }.bind(this),
            Priv: function(data) {
                if (!this.Priv.toggleState) return;
                if (data.username == CLIENT.name) return;
                if (window.IGNORED.includes(data.username)) return;
                if ($(document.activeElement).hasClass("pm-input")) return;
                if (Date.now() - this.Priv.timeSinceLast < 18e4) return;
                this.Priv.audio[0].play();
                this.Priv.timeSinceLast = Date.now();
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Direct Message Notification)").remove();
                $("#messagebuffer").trigger("whisper", `Direct Message Notification: ${data.username}`)
            }.bind(this),
            Video: function(data) {
                var addedby;
                if (!this.Video.toggleState) return;
                if (CLIENT.rank < CHANNEL.perms.seeplaylist) return;
                addedby = playlist(true).addedby == CLIENT.name;
                if (addedby && this.Video.last) {
                    this.Video.timeSinceLast = Date.now();
                    return
                }
                this.Video.last = false;
                if (!addedby) return;
                if (Date.now() - this.Video.timeSinceLast < 6e5) return;
                this.Video.audio[0].play();
                this.Video.timeSinceLast = Date.now();
                this.Video.last = true;
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Video Notification)").remove();
                $("#messagebuffer").trigger("whisper", "Video Notification: Your video is now playing!")
            }.bind(this),
            Marked: function(uid) {
                if (!this.Marked.toggleState) return;
                if (CLIENT.rank < CHANNEL.perms.seeplaylist) return;
                if (Date.now() - this.Marked.timeSinceLast < 1 * 1e3) return;
                var item = $(`.pluid-${uid}`);
                var marked = $("#queue").data("marked");
                var isMarked = marked.includes(uid);
                if (!isMarked) {
                    return
                }
                marked.splice(marked.indexOf(uid), 1);
                item.find(".qbtn-mark").removeClass("btn-warning").addClass("btn-default disabled");
                this.Marked.audio[0].play();
                this.Marked.timeSinceLast = Date.now();
                this.Marked.last = true;
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Video Notification)").remove();
                $("#messagebuffer").trigger("whisper", "Video Notification: A video you marked is now playing!")
            }.bind(this)
        };
        return this
    };
    Object.assign(AudioNotifier.prototype, {
        pushNoticeChange: function(change) {
            var type, id, silent;
            type = change.type;
            id = change.id;
            silent = change.silent;
            this[type].id = id;
            this[type].file = this.choices[id];
            localStorage.setItem(`${CHANNEL.name}_AudioNotice${type}ID`, id);
            $("#AudioNotice" + this.typeNames[type].split(" ")[0]).remove();
            this[type].audio = $("<audio>").prop("id", "AudioNotice" + this.typeNames[type].split(" ")[0]).appendTo("body").attr("preload", "auto").prop("volume", this[type].volume).append($("<source>").attr("src", this[type].file).attr("type", "audio/ogg"));
            if (!silent) {
                this[type].audio[0].play();
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(" + this.typeNames[type] + " Notification)").remove();
                $("#messagebuffer").trigger("whisper", this.typeNames[type] + " Notification Changed to: " + id)
            }
        },
        pushVolume: function(change) {
            var type, volume;
            type = change.type;
            volume = change.volume;
            if (volume == "up") {
                volume = (this[type].volume * 100 + 5) / 100
            } else if (volume == "down") {
                volume = (this[type].volume * 100 - 5) / 100
            } else {
                return console.error("[XaeTube: Audio Notifier]", "Unrecognized volume direction.")
            }
            volume = Math.min(Math.max(volume, .05), 1) || .6;
            this[type].volume = volume;
            localStorage.setItem(`${CHANNEL.name}_AudioNotice${type}Volume`, Math.floor(volume * 100));
            this[type].audio.prop("volume", volume)[0].play();
            if (this[type].indicator) {
                this[type].indicator.html(Math.floor(volume * 100))
            }
        },
        toggle: function(type) {
            this[type].toggleState = !this[type].toggleState;
            localStorage.setItem(`${CHANNEL.name}_AudioNotice${type}Toggle`, +this[type].toggleState);
            if (this[type].toggleButton) {
                this[type].toggleButton.toggleClass("label-default label-info")
            }
            this[type].panel.toggleClass("btn-danger btn-success")
        },
        createToggles: function() {
            this.Squee.toggleButton = $("<span/>").html('Sq<span class="toggle-label">uee</span>').prop("id", "AudioNoticeSqueeToggle").attr("title", "Toggle Username Audio Notices").addClass("pointer label label-info pull-right").on("click", (() => {
                this.toggle("Squee")
            }));
            if (!this.Squee.toggleState) {
                this.Squee.toggleButton.removeClass("label-info").addClass("label-default")
            }
        },
        createControls: function(types) {
            var self = this;
            this.controls = $("<div>").addClass("customSettings").attr("id", "AudioNoticeControls").attr("data-title", "Audio Notifications Settings").prependTo("#customSettingsStaging").data("column-class", "col-sm-6");
            while (types.length) {
                var type = types.shift();
                var form = $("<form>").prop("action", "javascript:void(0)").addClass("form-horizontal");
                var wrapper = $("<div>").addClass("form-group").prop("id", "AudioNoticeControls" + type).appendTo(form);
                var label = $("<span>").addClass("label label-info col-sm-3").text(this.typeNames[type] + " Notice").appendTo(wrapper);
                var buttongroup = $("<div>").addClass("btn-group col-sm-8").attr("data-control", type).appendTo(wrapper);
                var toggle = this[type].panel = $("<button/>").prop("id", "AudioNoticeControls" + type + "Toggle").addClass("btn btn-sm btn-success").attr("title", "Toggle " + this.typeNames[type] + " Notices").html('<span class="glyphicon glyphicon-bell"></span>').on("click", function() {
                    self.toggle($(this).parent().data().control)
                }).prependTo(buttongroup);
                var sounds = $("<div/>").addClass("btn-group").prop("id", "AudioNoticeControls" + type + "Sounds").appendTo(buttongroup);
                var volumeDown = $("<button/>").prop("id", "AudioNoticeControls" + type + "VolumeDown").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume Down").on("click", function() {
                    self.pushVolume({
                        type: $(this).parent().data().control,
                        volume: "down"
                    })
                }).html('<span class="glyphicon glyphicon-volume-down"></span>').appendTo(buttongroup);
                var indicator = this[type].indicator = $("<button/>").prop("id", "AudioNoticeControls" + type + "Indicator").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume").html(this[type].volume * 100).appendTo(buttongroup);
                var volumeUp = $("<button/>").prop("id", "AudioNoticeControls" + type + "VolumeUp").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume Up").on("click", function() {
                    self.pushVolume({
                        type: $(this).parent().data().control,
                        volume: "up"
                    })
                }).html('<span class="glyphicon glyphicon-volume-up"></span>').appendTo(buttongroup);
                var play = $("<button/>").prop("id", "AudioNoticeControls" + type + "Play").addClass("btn btn-sm btn-default").attr("title", "Play Notification").on("click", function() {
                    self[$(this).parent().data().control].audio[0].play()
                }).html('<span class="glyphicon glyphicon-play"></span>').appendTo(buttongroup);
                var dropdown = $("<button/>").addClass("btn btn-default btn-sm dropdown-toggle").attr("type", "button").attr("href", "javascript:void(0)").attr("data-toggle", "dropdown").html("<span class='glyphicon glyphicon-music'></span> Sound <span class='caret'></span>").appendTo(sounds);
                var sound_content = $("<ul/>").addClass("dropdown-menu").addClass("columns").attr("role", "menu").appendTo(sounds);
                var keys = Object.keys(this.choices);
                while (keys.length) {
                    var populate_list = $("<li/>").appendTo(sound_content);
                    void
                    function(key) {
                        $("<a/>").text(key).attr("href", "javascript:void(0)").attr("data-notice", key).attr("data-type", type).on("click", function() {
                            console.log($(this).data().type, $(this).data().notice);
                            self.pushNoticeChange({
                                type: $(this).data().type,
                                id: $(this).data().notice,
                                silent: false
                            })
                        }).appendTo(populate_list)
                    }(keys.shift())
                }
                if (!this[type].toggleState) {
                    toggle.toggleClass("btn-success btn-danger")
                }
                this.controls.append(form)
            }
        },
        initialize: function() {
            this.initialized = true;
            socket.on("chatMsg", (data => {
                this.handler["Squee"](data)
            }));
            socket.on("newPoll", (data => {
                this.handler["Poll"](data)
            }));
            socket.on("pm", (data => {
                this.handler["Priv"](data)
            }));
            socket.on("changeMedia", (data => {
                this.handler["Video"](data)
            }));
            socket.on("setCurrent", (data => {
                this.handler["Marked"](data)
            }));
            if (window[CHANNEL.name].modulesOptions && window[CHANNEL.name].modulesOptions.audioNotice) {
                this.choices = Object.assign(this.choices, window[CHANNEL.name].modulesOptions.audioNotice.choices);
                var notices = Object.keys(window[CHANNEL.name].modulesOptions.audioNotice.notices);
                for (var i = notices.length - 1; i >= 0; i--) {
                    this[notices[i]]["id"] = window[CHANNEL.name].modulesOptions.audioNotice.notices[notices[i]]
                }
            }
            var types = Object.keys(this.typeNames);
            while (types.length) {
                var type = types.shift();
                var toggle = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}Toggle`);
                var id = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}ID`);
                var volume = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}Volume`);
                if (toggle) {
                    this[type].toggleState = parseInt(toggle)
                }
                if (id) {
                    this[type].id = id
                }
                if (volume) {
                    this[type].volume = parseInt(volume) / 100 || .6
                }
                this.pushNoticeChange({
                    type: type,
                    id: this[type].id,
                    silent: true
                })
            }
            
            this.createControls(Object.keys(this.typeNames));
            console.info("[XaeTube: Audio Notifier]", "System Initialized.");
            return this
        }
    });
    window[CHANNEL.name].audioNotice = (new AudioNotifier).initialize()
});
