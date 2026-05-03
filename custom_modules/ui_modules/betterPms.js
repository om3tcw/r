"use strict";

//:fuwawaburn:
(function(CyTube_BetterPM) {
    return CyTube_BetterPM(window, document, window.jQuery)
})(function(window, document, $, undefined) {
    var PM_PANEL_MOBILE_VIEWPORT_MARGIN = 8;
    var PM_PANEL_DESKTOP_VIEWPORT_MARGIN = 0;
    var PM_PANEL_FALLBACK_WIDTH = 320;
    function isMobileViewport() {
        if (typeof window.matchMedia === "function") {
            return window.matchMedia("(max-width: 992px)").matches
        }
        var viewportWidth = window.innerWidth || (document.documentElement && document.documentElement.clientWidth);
        return viewportWidth > 0 && viewportWidth <= 992
    }
    function getPanelViewportMargin(isMobile) {
        return isMobile ? PM_PANEL_MOBILE_VIEWPORT_MARGIN : PM_PANEL_DESKTOP_VIEWPORT_MARGIN
    }
    function clampPanelLeft(left, panelWidth, viewportWidth, margin) {
        left = parseFloat(left);
        panelWidth = parseFloat(panelWidth);
        viewportWidth = parseFloat(viewportWidth);
        margin = parseFloat(margin);
        if (!isFinite(left)) {
            left = 0
        }
        if (!isFinite(panelWidth) || panelWidth <= 0) {
            panelWidth = PM_PANEL_FALLBACK_WIDTH
        }
        if (!isFinite(viewportWidth) || viewportWidth <= 0) {
            return left
        }
        if (!isFinite(margin) || margin < 0) {
            margin = PM_PANEL_MOBILE_VIEWPORT_MARGIN
        }
        if (margin > 0) {
            panelWidth = Math.max(panelWidth, PM_PANEL_FALLBACK_WIDTH)
        }
        return Math.max(margin, Math.min(left, viewportWidth - panelWidth - margin))
    }
    window.HLGGBetterPmLayout = {
        clampPanelLeft: clampPanelLeft,
        getPanelViewportMargin: getPanelViewportMargin
    };
    if (typeof Storage === "undefined") {
        console.error("[XaeTube: Better PMs]", "localStorage not supported. Aborting load.");
        return
    } else if (typeof CLIENT.name === "undefined") {
        console.error("[XaeTube: Better PMs]", "Client is an anonymous user. Aborting load.");
        return
    }
    class BetterPrivateMessages {
        constructor() {
            if (localStorage.getItem(`${CHANNEL.name}_BetterPM_PrevOpen_${CLIENT.name}`) === null) {
                localStorage.setItem(`${CHANNEL.name}_BetterPM_PrevOpen_${CLIENT.name}`, JSON.stringify([]))
            }
            this.previouslyOpen = JSON.parse(localStorage.getItem(`${CHANNEL.name}_BetterPM_PrevOpen_${CLIENT.name}`));
            this.openCache = {};
            $("#pmbar").on("deployCache", ((ev, user) => {
                this.deployCache(user);
                this.saveOpen()
            }));
            $("#pmbar").on("newMessage", ((ev, coresp, data) => {
                this.newMessage(coresp, data);
                this.saveOpen()
            }));
            $(window).on("unload.openprivs", (() => {
                this.saveOpen();
                this.flushCache()
            }));
            return this
        }
        flushCache() {
            Object.keys(this.openCache).forEach((coresp => {
                localStorage.setItem(`${CHANNEL.name}_BetterPM_History_${CLIENT.name}_${coresp}`, JSON.stringify(this["openCache"][coresp]))
            }))
        }
        deployCache(coresp) {
            if (localStorage.getItem(`${CHANNEL.name}_BetterPM_History_${CLIENT.name}_${coresp}`) === null) {
                return
            }
            this.initCache(coresp);
            this.openCache[coresp].slice(this.openCache[coresp].length > 50 ? this["openCache"][coresp].length - 50 : 0).forEach((i => {
                Callbacks.pm(i, true)
            }))
        }
        scheduleFlush() {
            this.flushCache()
        }
        initCache(coresp) {
            if (typeof this.openCache[coresp] === "undefined") {
                this.openCache[coresp] = JSON.parse(localStorage.getItem(`${CHANNEL.name}_BetterPM_History_${CLIENT.name}_${coresp}`))
            }
        }
        saveOpen() {
            var currOpen = [];
            $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function() {
                currOpen.push($(this).attr("id").replace(/^pm-/, ""))
            });
            localStorage.setItem(`${CHANNEL.name}_BetterPM_PrevOpen_${CLIENT.name}`, JSON.stringify(currOpen))
        }
        newMessage(coresp, msg) {
            if (localStorage.getItem(`${CHANNEL.name}_BetterPM_History_${CLIENT.name}_${coresp}`) === null) {
                localStorage.setItem(`${CHANNEL.name}_BetterPM_History_${CLIENT.name}_${coresp}`, JSON.stringify([]))
            }
            this.initCache(coresp);
            this.openCache[coresp].push(msg);
            this.scheduleFlush()
        }
        startUp() {
            var self = this;
            $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function() {
                return;
                var currentUser = $(this).attr("id").replace(/^pm-/, "");
                self.previouslyOpen.push(currentUser);
                $(this).find("div.pm-buffer").each(function() {
                    return
                })
            });
            this.previouslyOpen.forEach((user => {
                initPm(user)
            }));
            localStorage.setItem(`${CHANNEL.name}_BetterPM_PrevOpen_${CLIENT.name}`, JSON.stringify([]));
            return this
        }
    }
    window.initPm = function(user) {
        if ($("#pm-" + user).length > 0) {
            return $("#pm-" + user)
        }
        var pm = $("<div/>").addClass("panel panel-default pm-panel").appendTo($("#pmbar")).data("last", {
            name: ""
        }).attr("id", "pm-" + user);
        var title = $("<div/>").addClass("panel-heading").text(user).appendTo(pm);
        var close = $("<button/>").addClass("close pull-right").html("&times;").appendTo(title).click(function() {
            pm.remove();
            $("#pm-placeholder-" + user).remove()
        });
        var body = $("<div/>").addClass("panel-body").appendTo(pm).hide();
        var placeholder;
        title.click(function() {
            body.toggle();
            pm.removeClass("panel-primary").addClass("panel-default");
            if (!body.is(":hidden")) {
                placeholder = $("<div/>").addClass("pm-panel-placeholder").attr("id", "pm-placeholder-" + user).insertAfter(pm);
                var left = pm.position().left;
                var panelWidth = pm.outerWidth() || PM_PANEL_FALLBACK_WIDTH;
                var viewportWidth = window.innerWidth || (document.documentElement && document.documentElement.clientWidth);
                left = clampPanelLeft(left, panelWidth, viewportWidth, getPanelViewportMargin(isMobileViewport()));
                pm.css("position", "absolute").css("bottom", "0px").css("left", left)
            } else {
                pm.css("position", "");
                $("#pm-placeholder-" + user).remove()
            }
        });
        var buffer = $("<div/>").addClass("pm-buffer linewrap").appendTo(body);
        $("<hr/>").appendTo(body);
        var input = $("<input/>").addClass("form-control pm-input").attr("type", "text").attr("maxlength", 240).appendTo(body);
        input.keydown(function(ev) {
            if (ev.keyCode === 13) {
                if (CHATTHROTTLE) {
                    return
                }
                var meta = {};
                var msg = input.val();
                if (msg.trim() === "") {
                    return
                }
                if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
                    meta.modflair = CLIENT.rank
                }
                if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                    meta.modflair = CLIENT.rank;
                    msg = msg.substring(3)
                }
                socket.emit("pm", {
                    to: user,
                    msg: msg,
                    meta: meta
                });
                input.val("")
            }
        });
        $("#pmbar").trigger("deployCache", user);
        ({
            startCheck: function(user) {
                if (!$("#pm-" + user).length) {
                    return
                }
                var buffer = initPm(user).find(".pm-buffer");
                if (buffer.children().last().length) {
                    buffer.children().last()[0].scrollIntoView()
                }
                buffer[0].scrollTop = buffer[0].scrollHeight;
                if (buffer[0].scrollHeight == this.scrollHeight && this.scrollHeight !== 0) {
                    return
                } else {
                    this.scrollHeight = buffer[0].scrollHeight;
                    setTimeout(this.startCheck.bind(this), this.timeout, user)
                }
            },
            scrollHeight: -1,
            timeout: 250
        }).startCheck(user);
        return pm
    };
    window.Callbacks.pm = function(data, backlog) {
        var name = data.username;
        if (IGNORED.indexOf(name) !== -1) {
            return
        }
        if (data.username === CLIENT.name) {
            name = data.to
        } else {
            pingMessage(true)
        }
        var pm = initPm(name);
        var msg = formatChatMessage(data, pm.data("last"));
        var buffer = pm.find(".pm-buffer");
        msg.appendTo(buffer);
        buffer.scrollTop(buffer.prop("scrollHeight"));
        if (pm.find(".panel-body").is(":hidden")) {
            pm.removeClass("panel-default").addClass("panel-primary")
        }
        if (!backlog) {
            var coresp = CLIENT.name !== data.username ? data.username : data.to;
            $("#pmbar").trigger("newMessage", [coresp, data])
        }
    };
    if (!CLIENT.BetterPMs) {
        CLIENT.BetterPMs = (new BetterPrivateMessages).startUp()
    }
});
