const defaultVolume = 0.1;

function isItHalloween() {
    const currentYear = new Date().getFullYear();
    const HALLOWEEN_START = new Date(`${currentYear}-10-31T04:00:00Z`);
    const HALLOWEEN_END = new Date(`${currentYear}-11-01T04:00:00Z`);
    const currentTimestamp = Date.now();
    return (currentTimestamp > HALLOWEEN_START && currentTimestamp < HALLOWEEN_END)
}

//Rename this god damned fuck function "playlist" to something else

async function waitForPlaylist() {
    await window.waitForFunc("fetchActiveVideoQueue");
}

waitForPlaylist().then((() => {
    if (typeof Storage === "undefined") {
        console.error("[XaeTube: Audio Notifier]", "localStorage not supported. Aborting load.");
        return
    }
    if (typeof window[CHANNEL.name].audioLibrary === "undefined") {
        console.warn("[XaeTube: Audio Notifier]", "WARNING: Audio library module not loaded.")
    }
    if (!$("#customSettingsStaging").length) {
        console.warn("[XaeTube: Audio Notifier]", "WARNING: Settings module not loaded.")
    }

    class AudioNotifier {
        Squee = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .35,
            id: "squee"
        };
        Poll = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .2,
            id: "newPoll"
        };
        Priv = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .15,
            id: "privateMessage"
        };
        Video = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .35,
            id: "fairywand"
        };
        Marked = {
            timeSinceLast: 0,
            toggleState: true,
            volume: .4,
            id: "bell"
        };
        typeNames = {
            Squee: "Username",
            Poll: "Poll",
            Priv: "Private Message",
            Video: "Queued Video",
            Marked: "Marked Video"
        };
        choices = {
            squee: "",
            newPoll: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/ogeyrrat.ogg",
            privateMessage: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/sharkmail.ogg",
            yourVideoPlays: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/morinayeah.ogg",
            bell: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/fairywand.ogg",
            ...window[CHANNEL.name].audioLibrary ? window[CHANNEL.name].audioLibrary.squees : undefined
        };
        handler = {
            Squee: () => {
                let squee;
                if (!this.Squee.toggleState) {
                    return;
                }
                if (!CHANNEL.opts.chat_antiflood) {
                    console.info("[XaeTube: Audio Notifier]", "User ping ignored: Chat throttle off.");
                    return;
                }
                if (Date.now() - this.Squee.timeSinceLast < 7e3) return;
                squee = $(".nick-highlight:not( .parsed )");
                if (!squee.length) return;
                squee.addClass("parsed");

                if (isItHalloween()) {
                    let toot = new Audio("/skulltrumpet.wav");
                    toot.volume = .33;
                    toot.play();
                } else {
                    this.Squee.audio[0].play();
                    this.Squee.timeSinceLast = Date.now();
                }
            },
            Poll: () => {
                if (!this.Poll.toggleState) return;
                if (CLIENT.rank < CHANNEL.perms.pollvote) return;
                if (Date.now() - this.Poll.timeSinceLast < 6e4) return;
                console.log(this.choices.newPoll)
                let audio = new Audio(this.choices.newPoll);
                audio.volume = 0.2;
                audio.play();
                this.Poll.timeSinceLast = Date.now();
            },
            Priv: (data) => {
                if (!this.Priv.toggleState) return;
                if (data.username == CLIENT.name) return;
                if (window.IGNORED.includes(data.username)) return;
                if ($(document.activeElement).hasClass("pm-input")) return;
                if (Date.now() - this.Priv.timeSinceLast < 18e4) return;
                let audio = new Audio(this.choices.privateMessage);
                audio.volume = 0.15;
                audio.play();
                this.Priv.timeSinceLast = Date.now();
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Direct Message Notification)").remove();
                $("#messagebuffer").trigger("whisper", `Direct Message Notification: ${data.username}`);
            },
            Video: () => {
                
                debugger;
                if (!this.Video.toggleState) return;
                if (CLIENT.rank < CHANNEL.perms.seeplaylist) return;
                let timeSinceLastQueue = (Date.now() - this.Video.timeSinceLast) / 1000;

                if (timeSinceLastQueue < 60) {
                    return;
                }

                let currentQueue = fetchActiveVideoQueue();
                if (currentQueue.addedby != CLIENT.name) {
                    return;
                }
                
                this.Video.timeSinceLast = Date.now();
                let audio = new Audio(this.choices.yourVideoPlays);
                audio.volume = 0.35;
                audio.play();
                $("div.chat-msg-\\\\\\$server\\\\\\$:contains(Video Notification)").remove();
                $("#messagebuffer").trigger("whisper", "Video Notification: Your video is now playing!");
            },
            //Removed Marked
            //I'd rather rewrite it than fucking deal with this code.
        }
    }
    Object.assign(AudioNotifier.prototype, {
        pushNoticeChange: function(change) {
            let type, id, silent;
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
        pushVolume: (change) => {
            let type, volume;
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
        toggle: (type) => {
            this[type].toggleState = !this[type].toggleState;
            localStorage.setItem(`${CHANNEL.name}_AudioNotice${type}Toggle`, +this[type].toggleState);
            if (this[type].toggleButton) {
                this[type].toggleButton.toggleClass("label-default label-info")
            }
            this[type].panel.toggleClass("btn-danger btn-success")
        },
        createToggles: () => {
            this.Squee.toggleButton = $("<span/>").html('Sq<span class="toggle-label">uee</span>').prop("id", "AudioNoticeSqueeToggle").attr("title", "Toggle Username Audio Notices").addClass("pointer label label-info pull-right").on("click", (() => {
                this.toggle("Squee")
            }));
            if (!this.Squee.toggleState) {
                this.Squee.toggleButton.removeClass("label-info").addClass("label-default")
            }
        },
        createControls: function(types) {
            this.controls = $("<div>").addClass("customSettings").attr("id", "AudioNoticeControls").attr("data-title", "Audio Notifications Settings").prependTo("#customSettingsStaging").data("column-class", "col-sm-6");
            while (types.length) {
                let type = types.shift();
                let form = $("<form>").prop("action", "javascript:void(0)").addClass("form-horizontal");
                let wrapper = $("<div>").addClass("form-group").prop("id", "AudioNoticeControls" + type).appendTo(form);
                $("<span>").addClass("label label-info col-sm-3").text(this.typeNames[type] + " Notice").appendTo(wrapper);
                let buttongroup = $("<div>").addClass("btn-group col-sm-8").attr("data-control", type).appendTo(wrapper);
                let toggle = this[type].panel = $("<button/>").prop("id", "AudioNoticeControls" + type + "Toggle").addClass("btn btn-sm btn-success").attr("title", "Toggle " + this.typeNames[type] + " Notices").html('<span class="glyphicon glyphicon-bell"></span>').on("click", function() {
                    this.toggle($(this).parent().data().control)
                }).prependTo(buttongroup);
                let sounds = $("<div/>").addClass("btn-group").prop("id", "AudioNoticeControls" + type + "Sounds").appendTo(buttongroup);
                $("<button/>").prop("id", "AudioNoticeControls" + type + "VolumeDown").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume Down").on("click", function() {
                    this.pushVolume({
                        type: $(this).parent().data().control,
                        volume: "down"
                    })
                }).html('<span class="glyphicon glyphicon-volume-down"></span>').appendTo(buttongroup);
                this[type].indicator = $("<button/>").prop("id", "AudioNoticeControls" + type + "Indicator").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume").html(this[type].volume * 100).appendTo(buttongroup);
                $("<button/>").prop("id", "AudioNoticeControls" + type + "VolumeUp").addClass("btn btn-sm btn-default").attr("title", this.typeNames[type] + " Volume Up").on("click", function() {
                    this.pushVolume({
                        type: $(this).parent().data().control,
                        volume: "up"
                    })
                }).html('<span class="glyphicon glyphicon-volume-up"></span>').appendTo(buttongroup);
                $("<button/>").prop("id", "AudioNoticeControls" + type + "Play").addClass("btn btn-sm btn-default").attr("title", "Play Notification").on("click", function() {
                    this[$(this).parent().data().control].audio[0].play()
                }).html('<span class="glyphicon glyphicon-play"></span>').appendTo(buttongroup);
                $("<button/>").addClass("btn btn-default btn-sm dropdown-toggle").attr("type", "button").attr("href", "javascript:void(0)").attr("data-toggle", "dropdown").html("<span class='glyphicon glyphicon-music'></span> Sound <span class='caret'></span>").appendTo(sounds);
                let sound_content = $("<ul/>").addClass("dropdown-menu").addClass("columns").attr("role", "menu").appendTo(sounds);
                let keys = Object.keys(this.choices);
                while (keys.length) {
                    let populate_list = $("<li/>").appendTo(sound_content);
                    void
                    function(key) {
                        $("<a/>").text(key).attr("href", "javascript:void(0)").attr("data-notice", key).attr("data-type", type).on("click", function() {
                            console.log($(this).data().type, $(this).data().notice);
                            this.pushNoticeChange({
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
            if (window[CHANNEL.name].modulesOptions && window[CHANNEL.name].modulesOptions.audioNotice) {
                this.choices = Object.assign(this.choices, window[CHANNEL.name].modulesOptions.audioNotice.choices);
                let notices = Object.keys(window[CHANNEL.name].modulesOptions.audioNotice.notices);
                for (let i = notices.length - 1; i >= 0; i--) {
                    this[notices[i]]["id"] = window[CHANNEL.name].modulesOptions.audioNotice.notices[notices[i]]
                }
            }
            let types = Object.keys(this.typeNames);
            while (types.length) {
                let type = types.shift();
                let toggle = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}Toggle`);
                let id = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}ID`);
                let volume = localStorage.getItem(`${CHANNEL.name}_AudioNotice${type}Volume`);
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
}));
