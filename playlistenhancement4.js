"use strict";

function playlist(active) {
    var queue = [];
    var selector = `#queue > .queue_entry${active?".queue_active":""}`;
    $(selector).each(function() {
        var data = $(this).data();
        var addedby;
        if ($(this).attr("data-original-title")) {
            addedby = $(this).attr("data-original-title").match(/: ([-\w\u00c0-\u00ff]{1,20})$/)[1]
        } else {
            addedby = $(this).attr("title").match(/: ([-\w\u00c0-\u00ff]{1,20})$/)[1]
        }
        queue.push({
            uid: data.uid,
            media: data.media,
            temp: data.temp,
            active: $(this).hasClass("queue_active"),
            addedby: addedby
        })
    });
    return active ? queue[0] : queue
}(function(CyTube_Playlist) {
    return CyTube_Playlist(window, document, window.jQuery)
})(function(window, document, $, undefined) {
    if (typeof Storage === "undefined") {
        console.error("[XaeTube: Enhanced Playlist]", "localStorage not supported. Aborting load.");
        return
    } else {
        console.info("[XaeTube: Enhanced Playlist]", "Loading Module.")
    }
    if (!window[CHANNEL.name]) {
        window[CHANNEL.name] = {}
    }
    const options = Object.assign({}, {
        collapse: true,
        hidePlaylist: false,
        inlineBlame: false,
        moveReporting: false,
        quickQuality: false,
        quickShuffle: true,
        recentMedia: false,
        simpleLeader: false,
        syncCheck: false,
        thumbnails: false,
        markAlert: true,
        timeEstimates: false,
        volumeControl: false
    }, window[CHANNEL.name].modulesOptions ? window[CHANNEL.name].modulesOptions.playlist : undefined;
({
    start: function() {
        if (!options.syncCheck) {
            return;
        }
        if (CLIENT.psync) {
            return;
        } else {
            CLIENT.psync = this;
        }
        socket.on("setPlaylistMeta", (data => {
            this.syncCheck(data);
        }));
        socket.on("queue", (data => {
            this.resetTimer(data);
        }));
    },
    syncCheck: function(data) {
        if (CHANNEL.perms.seeplaylist > CLIENT.rank) {
            return;
        }
        if (Math.abs(this.sinceLast - Date.now()) < this.cooldown) {
            return;
        }
        var playlistCount = $("ul#queue li.queue_entry").length;
        if (Math.abs(playlistCount - data.count) > 1) {
            this.setTimer();
        }
    },
    setTimer: function() {
        if (this.state.activeTimer) {
            this.sinceLast = Date.now();
            clearTimeout(this.state.tock);
        } else {
            this.state.activeTimer = true;
        }
        this.state.tock = setTimeout(this.syncFix.bind(this), this.delay);
    },
    resetTimer: function(data) {
        if (this.state.activeTimer) {
            this.setTimer();
        }
    },
    syncFix: function() {
        this.state.activeTimer = false;
        socket.emit("requestPlaylist");
        this.sinceLast = Date.now();
    },
    state: {
        active: false,
        tock: 0
    },
    sinceLast: Date.now(),
    cooldown: 120 * 1e3,
    delay: 5 * 1e3
}).start();

({
    start: function() {
        if (!options.thumbnails) {
            return;
        }
        if (CLIENT.thumbnailer) {
            return;
        } else {
            CLIENT.thumbnailer = this;
        }
        $("<style>").prop("id", "thumbnailer")
            .text(".playlist-thumbnail { max-height: 120px; max-width: 240px; border-radius: 4px; z-index: 3; }")
            .appendTo("head");
        $("#queue").on("mouseleave", () => {
            this.trimOrphans();
        });
        socket.on("delete", () => {
            this.trimOrphans();
        });
        socket.on("queue", () => {
            this.playlistScan();
        });
        socket.on("playlist", () => {
            this.playlistScan();
        });
        this.playlistScan();
    },
    playlistScan: function() {
        if (CHANNEL.perms.seeplaylist > CLIENT.rank) {
            return;
        }
        var self = this;
        $("#queue > .queue_entry:not(.thumbed)").each(function() {
            self.getThumbnail($(this));
        });
    },
    trimOrphans: function() {
        $("#queue .popover").remove();
    },
    getThumbnail: function(target) {
        var type = target.data().media.type;
        var id = target.data().media.id;
        var url;

        switch (type) {
            case "vi":
                url = "https://vimeo.com/api/v2/video/__id.json".replace(/__id/, id);
                $.getJSON(url, (data => {
                    var url = data[0].thumbnail_medium;
                    this.applyThumbnail(target, url);
                }));
                target.addClass("thumbed");
                return;
            case "yt":
                url = "https://img.youtube.com/vi/__id/0.jpg".replace(/__id/, id);
                break;
            case "dm":
                url = "https://www.dailymotion.com/thumbnail/video/__id".replace(/__id/, id);
                break;
            default:
                target.addClass("thumbed");
                return;
        }
        this.applyThumbnail(target, url);
        target.addClass("thumbed");
    },
    applyThumbnail: function(target, url) {
        target.popover({
            html: true,
            placement: function() {
                return !USEROPTS.layout.match(/synchtube/) ? "left" : "right";
            },
            trigger: "hover", 
            content: '<img src="__url" class="__class">'.replace(/__class/, this.klass).replace(/__url/, url)
        });
        $('#queue').on('mouseenter', '.queue_entry', function() {
            $(this).popover('show');  
        });

        $('#queue').on('mouseleave', '.queue_entry', function() {
            $(this).popover('hide');  
        });
    },
    klass: "playlist-thumbnail"
}).start();
    void(() => {
        if (!options.inlineBlame) {
            return
        }
        window.makeQueueEntry = function(item, addbtns) {
            var video = item.media;
            var li = $("<li/>");
            li.addClass("queue_entry");
            li.addClass("pluid-" + item.uid);
            li.data("uid", item.uid);
            li.data("media", video);
            li.data("temp", item.temp);
            li.data("blame", item.queueby);
            if (video.thumb) {
                $("<img/>").attr("src", video.thumb.url).css("float", "left").css("clear", "both").appendTo(li)
            }
            var title = $("<a/>").addClass("qe_title").appendTo(li).text(video.title).attr("href", formatURL(video)).attr("target", "_blank");
            var time = $("<span/>").addClass("qe_time").appendTo(li);
            time.text(video.duration);
            var blame = $("<span/>").addClass("qe_blame").appendTo(li);
            blame.text(item.queueby + " | ");
            var clear = $("<div/>").addClass("qe_clear").appendTo(li);
            if (item.temp) {
                li.addClass("queue_temp")
            }
            if (addbtns) {
                addQueueButtons(li)
            }
            return li
        };
        setTimeout(function() {
            socket.emit("requestPlaylist")
        }, 61e3)
    })();
    void(() => {
        if (!options.markAlert) {
            return
        }
        var _aQB = window.addQueueButtons;
        window.addQueueButtonsOld = _aQB;
        $("#queue").data("marked", []);
        window.addQueueButtons = function(li) {
            li.find(".qbtn-mark").remove();
            window.addQueueButtonsOld(li);
            const usingGroup = hasPermission("playlistjump") || hasPermission("playlistmove") || hasPermission("settemp") || hasPermission("playlistdelete");
            var uid = li.data("uid");
            var blame = li.data("blame");
            var menu = li.find(".btn-group");
            var title = li.find(".qe_title");
            var mark = $("#queue").data("marked").includes(uid);
            var marker = $("<button/>").addClass("btn btn-xs qbtn-mark").addClass(`${mark?"btn-warning":"btn-default"}`).html("<span class='glyphicon glyphicon-bell'></span>Notify").click(function() {
                var marked = $("#queue").data("marked");
                var isMarked = marked.includes(uid);
                $(this).removeClass("btn-default btn-warning").addClass(`${isMarked?"btn-default":"btn-warning"}`);
                if (isMarked) {
                    marked.splice(marked.indexOf(uid), 1)
                } else {
                    marked.push(uid);
                    $("#messagebuffer").trigger("whisper", `You have marked a video for playing notification.`)
                }
            });
            if (usingGroup) {
                marker.prependTo(menu)
            } else {
                marker.html("<span class='glyphicon glyphicon-bell'></span>").css("margin-right", "2px").addClass("pull-left").insertBefore(title)
            }
        };
        rebuildPlaylist()
    })();
    void(() => {
        if (!options.timeEstimates) {
            return
        }
        HTMLCollection.prototype.each = Array.prototype.each = NodeList.prototype.each = function(func, _this) {
            var i = -1,
                bindeach = _this === undefined;
            while (++i < this.length) {
                if (bindeach) {
                    _this = this[i]
                }
                func.bind(_this)(this[i], i, this)
            }
        };
        document.head.insertAdjacentHTML("beforeEnd", "<style>#queue li:hover .qe_time:before { content: attr(data-timeleft); }</style>");
        var _mQE = window.makeQueueEntry;
        window.makeQueueEntry = function(item, addbtns) {
            var li = _mQE(item, addbtns);
            li[0].dataset.seconds = item.media.seconds;
            return li
        };

        function calculateRemainingTime() {
            function secondsToTimeStr(d) {
                d = Number(d);
                var h = Math.floor(d / 3600);
                var m = Math.floor(d % 3600 / 60);
                var s = Math.floor(d % 3600 % 60);
                return (h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s
            }
            var q = document.querySelectorAll("#queue li");
            var m = document.querySelector("#plmeta");
            var active, cycle = [],
                total = 0;
            var currentTime = m && "playtime" in m.dataset && m.dataset["playtime"] >= 0 ? m.dataset["playtime"] : 0;
            if (q.length == 0) return;
            q.each(function injectDOM() {
                if (!this.querySelector(".qe_time")) return;
                if (!active) {
                    if (this.classList.contains("queue_active")) {
                        active = this;
                        total += parseInt(this.dataset.seconds) - currentTime;
                        this.querySelector(".qe_time").dataset.timeleft = "Time left: " + secondsToTimeStr(total) + " | "
                    } else cycle.push(this);
                    return
                } else {
                    this.querySelector(".qe_time").dataset.timeleft = "Time till: " + secondsToTimeStr(total) + " | ";
                    total += parseInt(this.dataset.seconds)
                }
            });
            cycle.each(function() {
                this.querySelector(".qe_time").dataset.timeleft = "Time till: " + secondsToTimeStr(total) + " | ";
                total += parseInt(this.dataset.seconds)
            })
        }
        socket.on("mediaUpdate", function(data) {
            var meta = document.querySelector("#plmeta");
            if (meta && (!meta.dataset["playtime"] || !data.paused)) {
                meta.dataset["playtime"] = Math.abs(Math.ceil(data.currentTime))
            }
            if (!data.paused) {
                calculateRemainingTime()
            }
        });
        socket.emit("requestPlaylist")
    })();
    ({
        maxhist: 10,
        history: [],
        synch: function() {
            localStorage.setItem(`${CHANNEL.name}_RecentMedia`, JSON.stringify(this.history))
        },
        view: function() {
            function createEntry(media) {
                var li = $("<li>").addClass("recent_entry queue_entry");
                var a = $("<a>").addClass("recent_link qe_title").attr("target", "_blank").attr("href", media.link).text(media.title).appendTo(li);
                var time = $("<span>").addClass("qe_time").text(media.duration).appendTo(li);
                var blame = $("<span>").addClass("qe_blame").text(media.blame + " | ").appendTo(li);
                return li
            }
            $("#recentmedia-list").empty();
            if (this.history.length) {
                for (var i = this.history.length - 1; i >= 0; i--) {
                    createEntry(this.history[i]).appendTo("#recentmedia-list")
                }
            }
        },
        update: function(data) {
            var newEntry = {
                title: data["title"],
                link: formatURL(data),
                duration: data["duration"],
                blame: $(".pluid-" + PL_CURRENT).data("blame")
            };
            if (newEntry.link === "#") {
                return
            }
            if (this.history.length && newEntry.link === this.history[this.history.length - 1]["link"]) {
                return
            }
            this.history.push(newEntry);
            this.history = this.history.slice(this.history.length > this.maxhist ? this.history.length - this.maxhist : 0, this.history.length);
            this.synch()
        },
        start: function() {
            if (CHANNEL.perms.seeplaylist > CLIENT.rank) {
                return
            }
            if (!options.recentMedia) {
                return
            } else {
                window[CHANNEL.name]["RecentMedia"] = this
            }
            if (localStorage.getItem(`${CHANNEL.name}_RecentMedia`) === null) {
                localStorage.setItem(`${CHANNEL.name}_RecentMedia`, JSON.stringify([]))
            }
            this.history = JSON.parse(localStorage.getItem(`${CHANNEL.name}_RecentMedia`));
            var self = this;
            var pane = $("<div>").attr("id", "recentmedia").addClass("plcontrol-collapse col-lg-12 col-md-12 collapse in").prependTo("#rightpane-inner").append($("<div>").addClass("vertical-spacer")).append($("<ol>").attr("id", "recentmedia-list").text("Initializing.")).attr("aria-expanded", "true").css("height", "0");
            var button = $("<button>").attr("id", "showrecent").attr("title", "Recently shown videos").attr("data-toggle", "collapse").attr("data-target", "#recentmedia").addClass("btn btn-sm btn-default collapsed").append($("<span>").addClass("glyphicon glyphicon-time")).on("click", function() {
                var wasActive = $(this).hasClass("active");
                $(".plcontrol-collapse").collapse("hide");
                $("#plcontrol button.active").button("toggle");
                if (!wasActive) {
                    $(this).button("toggle")
                }
                self.view()
            }).appendTo("#plcontrol").click();
            var style = $("<style>").text("#recentmedia-list>li:first-child { border-top-width: 1px }").prependTo($("head"));
            socket.on("changeMedia", (data => {
                this.update(data);
                this.view()
            }));
            socket.emit("playerReady")
        }
    }).start();
    void(() => {
        if (!options.moveReporting) {
            return
        }
        Callbacks.moveVideo = function(data) {
            console.log($(".pluid-" + data["from"]).data());
            console.log($(".pluid-" + data["after"]).data());
            PL_ACTION_QUEUE.queue((plq => {
                $("#messagebuffer").trigger("whisper", String().concat("[MoveMedia] ", '<span class="text-info">', $(".pluid-" + data["from"]).data()["media"]["title"], "</span>", " ", '<span class="text-info">', "(Pos: ", $(".pluid-" + data["from"]).index() + 1, ")", "</span>", " after ", '<span class="text-info">', $(".pluid-" + data["after"]).data()["media"]["title"], "</span>", " ", $(".pluid-" + data["after"]).index() + 1, "."));
                playlistMove(data.from, data.after, (() => {
                    plq.release()
                }))
            }))
        }
    })();
    void(() => {
        if (!options.simpleLeader) {
            return
        }
        if (CHANNEL.perms.leaderctl > CLIENT.rank) {
            return
        }
        $("<button>").prop("id", "leader").attr("title", "Control current time of media").addClass("btn btn-sm btn-default").append($("<span>").addClass("glyphicon glyphicon-transfer")).insertAfter($("#qlockbtn")).on("click", function() {
            if (CLIENT.leader) {
                socket.emit("assignLeader", {
                    name: ""
                })
            } else {
                socket.emit("assignLeader", {
                    name: CLIENT.name
                })
            }
        });
        socket.on("setLeader", function(name) {
            if (name === CLIENT.name) {
                $("#leader").removeClass("btn-default").addClass("btn-warning")
            } else {
                $("#leader").addClass("btn-default").removeClass("btn-warning")
            }
        })
    })();
    void(() => {
        if (!options.hidePlaylist) {
            return
        }
        if (!hasPermission("seeplaylist")) {
            return
        }
        if (localStorage.getItem(`${CHANNEL.name}_HidePlaylist`) === "on") {
            $("#queue").data().hide = true;
            $("#queue").toggle()
        } else {
            $("#queue").data().hide = false
        }
        $("<button>").prop("id", "hidePlaylist").attr("title", "Hide/Show playlist").addClass("btn btn-sm").addClass(localStorage.getItem(`${CHANNEL.name}_HidePlaylist`) === "on" ? "btn-warning" : "btn-default").append($("<span>").addClass("glyphicon glyphicon-list-alt")).insertAfter($("#shuffleplaylist")).on("click", function() {
            if (!$("#queue").data().hide) {
                $("#queue").data().hide = true;
                localStorage.setItem(`${CHANNEL.name}_HidePlaylist`, "on")
            } else {
                $("#queue").data().hide = false;
                localStorage.setItem(`${CHANNEL.name}_HidePlaylist`, "off")
            }
            $("#queue").toggle();
            $(this).toggleClass("btn-default btn-warning")
        });
        return
    })();
    void(() => {
        if (!options.collapse) {
            return
        }
        const minrank = Math.min(CHANNEL.perms.oplaylistdelete, CHANNEL.perms.playlistdelete, CHANNEL.perms.oplaylistjump, CHANNEL.perms.playlistjump, CHANNEL.perms.oplaylistnext, CHANNEL.perms.playlistnext);
        if (minrank > CLIENT.rank) {
            return
        }
        if (localStorage.getItem(`${CHANNEL.name}_CollapsePlaylist`) === "on") {
            $("#queue").data().shrink = true;
            $("<style>").prop("id", "playlistStyle").text("#queue div.btn-group { display: none!important; }").appendTo($("head"))
        } else {
            $("#queue").data().shrink = false
        }
        $("<button>").prop("id", "shrinkplaylist").attr("title", "Toggle playlist collapse").addClass("btn btn-sm").addClass(localStorage.getItem(`${CHANNEL.name}_CollapsePlaylist`) === "on" ? "btn-warning" : "btn-default").append($("<span>").addClass("glyphicon glyphicon-compressed")).insertAfter($("#shuffleplaylist")).on("click", function() {
            if (!$("#queue").data().shrink) {
                $("#queue").data().shrink = true;
                $("<style>").prop("id", "playlistStyle").text("#queue div.btn-group { display: none!important; }").appendTo($("head"));
                localStorage.setItem(`${CHANNEL.name}_CollapsePlaylist`, "on")
            } else {
                $("#queue").data().shrink = false;
                $("#playlistStyle").remove();
                localStorage.setItem(`${CHANNEL.name}_CollapsePlaylist`, "off")
            }
            $(this).toggleClass("btn-default btn-warning")
        })
    })();
    void(() => {
        if (!options.quickQuality) {
            return
        }
        var qualityChoices = [{
            code: "auto",
            text: "Auto"
        }, {
            code: "240",
            text: "240p"
        }, {
            code: "360",
            text: "360p"
        }, {
            code: "480",
            text: "480p"
        }, {
            code: "720",
            text: "720p"
        }, {
            code: "1080",
            text: "1080p"
        }, {
            code: "best",
            text: "Highest"
        }];
        var current = qualityChoices.filter((cv => {
            return cv.code == USEROPTS.default_quality
        }))[0]["text"];
        var quickQuality = $("<div/>").addClass("btn-group dropdown").prop("id", "quickQuality").prependTo("#videocontrols");
        $("<button/>").addClass("btn btn-default btn-sm dropdown-toggle").attr("type", "button").attr("title", "Preferred Quality").attr("href", "javascript:void(0)").attr("data-toggle", "dropdown").html("<span class='glyphicon glyphicon-hd-video'></span><strong> " + current + " </strong><span class='caret'></span>").appendTo(quickQuality);
        var quickChoices = $("<ul/>").addClass("dropdown-menu ul-double").appendTo(quickQuality);
        qualityChoices.forEach((cv => {
            var link = $("<li/>").addClass("li-double").appendTo(quickChoices);
            $("<a/>").text(cv.text).attr("quality", cv.code).appendTo(link).click(function() {
                $("#quickQuality strong").text(" " + $(this).text());
                USEROPTS.default_quality = $(this).attr("quality");
                $("#us-default-quality").val(USEROPTS.default_quality);
                storeOpts();
                $("#mediarefresh").click()
            })
        }))
    })();
    ({
        start: function() {
            if (!options.volumeControl) {
                return
            }
            if (CLIENT.volumeControl) {
                return
            } else {
                CLIENT.volumeControl = this
            }
            this.deployButtons();
            socket.on("mediaUpdate", function() {
                PLAYER.getVolume(function(currentVolume) {
                    if (currentVolume == null) {
                        return
                    }
                    $("#volumeButtonIndicator").html(currentVolume.toFixed(2))
                })
            });
            socket.on("changeMedia", function() {
                setTimeout(function() {
                    PLAYER.getVolume(function(currentVolume) {
                        $("#volumeButtonIndicator").html(currentVolume.toFixed(2))
                    })
                }, 250)
            })
        },
        deployButtons: function() {
            this.up.prependTo("#videocontrols");
            this.indicator.prependTo("#videocontrols");
            this.down.prependTo("#videocontrols")
        },
        up: $("<button/>").prop("id", "volumeButtonUp").addClass("btn btn-default btn-sm").attr("type", "button").attr("title", "Volume Up").html("<span class='glyphicon glyphicon-volume-up'></span>").on("click", function() {
            PLAYER.getVolume((currentVolume => {
                var newVolume = Math.min(1, Math.max(0, Math.round((currentVolume + (currentVolume >= .1 ? currentVolume >= .2 ? .05 : .02 : .01)) / .01) * .01)).toFixed(2);
                PLAYER.setVolume(newVolume);
                $("#volumeButtonIndicator").html(newVolume)
            }))
        }),
        indicator: $("<button/>").prop("id", "volumeButtonIndicator").addClass("btn btn-success btn-sm").attr("type", "button").attr("title", "Volume Indicator / Mute").html("???").data("mutedState", false).on("click", function() {
            if ($(this).data()["mutedState"]) {
                PLAYER.setVolume($(this).data()["preMutedVolume"]);
                $(this).data()["mutedState"] = false;
                $(this).toggleClass("btn-success btn-warning")
            } else {
                PLAYER.getVolume((currentVolume => {
                    console.info("Muting player. Restore Volume:", currentVolume);
                    $("#volumeButtonIndicator").data()["preMutedVolume"] = currentVolume;
                    $("#volumeButtonIndicator").data()["mutedState"] = true;
                    $("#volumeButtonIndicator").toggleClass("btn-success btn-warning");
                    PLAYER.setVolume(0)
                }))
            }
        }),
        down: $("<button/>").prop("id", "volumeButtonDown").addClass("btn btn-default btn-sm").attr("type", "button").attr("title", "Volume Down").html("<span class='glyphicon glyphicon-volume-down'></span>").on("click", function() {
            PLAYER.getVolume((currentVolume => {
                var newVolume = Math.min(1, Math.max(0, Math.round((currentVolume - (currentVolume <= .2 ? currentVolume <= .1 ? .01 : .02 : .05)) / .01) * .01)).toFixed(2);
                PLAYER.setVolume(newVolume);
                $("#volumeButtonIndicator").html(newVolume)
            }))
        })
    }).start();
    void(() => {
        if (!options.quickShuffle) {
            return
        }
        $("#shuffleplaylist").unbind("click");
        $("#shuffleplaylist").click(function(event) {
            if (event.shiftKey) {
                return socket.emit("shufflePlaylist")
            }
            var shuffle = confirm("Are you sure you want to shuffle the playlist?");
            if (shuffle) {
                socket.emit("shufflePlaylist")
            }
        })
    })()
});
