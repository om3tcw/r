if (!this[CHANNEL.name]) {
    this[CHANNEL.name] = {};
}
if (!this[CHANNEL.name].favicon) {
    this[CHANNEL.name].favicon = $("<link/>")
        .prop("id", "favicon")
        .attr("rel", "shortcut icon")
        .attr("type", "image/png")
        .attr("sizes", "64x64")
        .attr("href", "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/ogey.png")
        .appendTo("head");
}

const xaeModule = {
    options: {
        playlist: {
            collapse: false,
            hidePlaylist: true,
            inlineBlame: true,
            moveReporting: false,
            quickQuality: false,
            recentMedia: true,
            simpleLeader: true,
            syncCheck: true,
            thumbnails: true,
            timeEstimates: true,
            userlist: { autoHider: true },
            smartScroll: false,
            maxMessages: 120
        },
        various: { notepad: true, emoteToggle: false }
    },
    modules: {
        settings: { active: 1, rank: -1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r/customsettingsmodal.js", done: true },
        playlist: { active: 1, rank: -1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r/playlistenhancement2.js", done: true },
        privmsg: { active: 1, rank: 1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r/pmenhancement.js", done: true },
        notifier: { active: 1, rank: -1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/notifier.js", done: true },
        layout: { active: 1, rank: -1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r/layoutoptions.js", done: true },
        userlist: { active: 1, rank: -1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/userlist.js", done: true },
        html2canvas: { active: 1, rank: -1, url: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", done: true }
    },
    getScript(url, success, cache = true) {
        return $.ajax({ url, cache, success, type: "GET", dataType: "script" });
    },
    initialize() {
        if (CLIENT.modules) return;
        CLIENT.modules = this;
        window[CHANNEL.name].modulesOptions = this.options;
        console.info("[XaeModule]", "Begin Loading.");
        this.index = Object.keys(this.modules);
        this.sequencerLoader();
        this.cache = false;
    },
    sequencerLoader() {
        if (this.state.prev) {
            setTimeout(this.modules[this.state.prev].done, 0);
            this.state.prev = "";
        }
        if (this.state.pos >= this.index.length) {
            console.info("[XaeModule]", "Loading Complete.");
            return;
        }
        const currKey = this.index[this.state.pos];
        if (this.state.pos < this.index.length) {
            if (this.modules[currKey].active) {
                if (this.modules[currKey].rank <= CLIENT.rank) {
                    console.info("[XaeModule]", "Loading:", currKey);
                    this.state.prev = currKey;
                    this.state.pos++;
                    const cache = typeof this.modules[currKey].cache === "undefined" ? this.cache : this.modules[currKey].cache;
                    this.getScript(this.modules[currKey].url, this.sequencerLoader.bind(this), cache);
                } else {
                    if (this.modules[currKey].rank === 0 && CLIENT.rank === -1) {
                        socket.once("login", data => {
                            if (data.success) {
                                this.getScript(this.modules[currKey].url, false, this.cache);
                            }
                        });
                    }
                    this.state.pos++;
                    this.sequencerLoader();
                }
            } else {
                this.state.pos++;
                this.sequencerLoader();
            }
        }
    },
    state: { prev: "", pos: 0 }
};

xaeModule.initialize();

$(document).ready(function () {
    const watermark = 'om3tcw is cuter than usual';
    $('#chatwrap').attr('placeholder', watermark);

    $('#nav-collapsible ul:first-child').append("<li class='dropdown'><a target='_blank' href='https://holodex.net/home'>HoloDex</a></li>");
    $('#nav-collapsible ul:first-child').append("<li class='dropdown'><a target='_blank' href='https://aggie.io/k9z9w_8z47'>om3tcw Aggie</a></li>");
});

// Tabs
{
    const tabContainer = $('<div id="MainTabContainer"></div>').appendTo('#videowrap');
    const tabList = $('<ul class="nav nav-tabs" role="tablist"></ul>').appendTo(tabContainer);
    const tabContent = $('<div class="tab-content"></div>').appendTo(tabContainer);

    // Playlist Tab
    $('<div role="tabpanel" class="tab-pane active" id="playlistTab"></div>')
        .appendTo(tabContent)
        .append($('#rightcontrols').detach())
        .append($('#playlistrow').detach().removeClass('row'));
    const playlistButton = $('<li class="active" role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#playlistTab">Playlist</a></li>').appendTo(tabList);

    if (getOrDefault(CHANNEL.name + "chinkspy", false)) {
        $('body').append('<span id="pnl_options" style="position:absolute;display:none;left:0;top:30px;padding-top:10px;width:100%;background:rgba(0,0,0,0.5);z-index:2;"></span>');
        $('<li><a id="btn_playList" class="pointer">Playlist</a></li>').insertAfter('#settingsMenu')
            .click(function () {
                if ($('#pnl_options').css('display') === 'none') {
                    $('#rightcontrols').detach().appendTo('#pnl_options');
                    $('#playlistrow').detach().appendTo('#pnl_options');
                    $('#pnl_options').slideDown();
                } else {
                    $('#pnl_options').slideUp();
                }
            });
        playlistButton.on('mousedown', function () {
            $('#rightcontrols').detach().appendTo('#playlistTab');
            $('#playlistrow').detach().appendTo('#playlistTab');
        });
    }

    // Polls Tab
    $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#pollsTab">Polls <span id="pollsbadge" class="badge" style="background-color:#FFF;color:#000;"></span></a></li>')
        .appendTo(tabList).click(function () {
            $('#pollsbadge').text('');
        });
    $('<div role="tabpanel" class="tab-pane" id="pollsTab"><div class="col-lg-12 col-md-12" id="pollhistory"></div></div>')
        .appendTo(tabContent).prepend($('#newpollbtn').detach());

    const redoPollwrap = function () {
        $('#pollwrap').detach().insertBefore('#MainTabContainer');
        $('#pollwrap .well span.label.pull-right').detach().insertBefore('#pollwrap .well h3');
        $('#pollwrap button.close').off("click").click(function () {
            $('#pollwrap').detach().insertBefore('#pollhistory');
            if (!$('#pollsTab').hasClass('active')) {
                const badgeTxt = $('#pollsbadge').text();
                $('#pollsbadge').text((badgeTxt ? parseInt(badgeTxt) : 0) + 1);
            }
        });
    };

    const base_newPoll = Callbacks.newPoll;
    Callbacks.newPoll = function (data) {
        base_newPoll(data);
        if (!$('#pollsTab').hasClass('active') && $('#MainTabContainer #pollwrap').length === 0) {
            const badgeTxt = $('#pollsbadge').text();
            const pollCnt = $('#pollwrap .well.muted').length + (badgeTxt ? parseInt(badgeTxt) : 0);
            $('#pollsbadge').text(pollCnt);
        }

        $('#pollwrap .well.muted').detach().prependTo('#pollhistory');
        redoPollwrap();
    };
    redoPollwrap();

    // Teamup
    $('<div role="tabpanel" class="tab-pane" id="calendarTab"><iframe width="100%" height="600" frameborder="0" scrolling="no"></iframe></div>').appendTo(tabContent);
    $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab">Teamup EN</a></li>').appendTo(tabList);
    const baseCalendarUrl = 'https://teamup.com/ksua2ar4zft49pdn7c?view=m&showLogo=0&showSearch=0&showProfileAndInfo=0&showSidepanel=1&disableSidepanel=0&showTitle=0&showViewSelector=1&showMenu=0&weekStartDay=mo&showAgendaHeader=1&showAgendaDetails=0&showYearViewHeader=1';

    $('<div role="tabpanel" class="tab-pane" id="calendarTab2"><iframe width="100%" height="600" frameborder="0" scrolling="auto"></iframe></div>').appendTo(tabContent);
    $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab2">Oshi Eyes</a></li>').appendTo(tabList);
    const baseCalendarUrl2 = 'https://docs.google.com/forms/d/1oqO8DIIyxuKVPvhXSAmxNCy5zCkS8XQAhEKi8a9BK1g/viewform?';

    let calendars = getOrDefault(CHANNEL.name + '_CALENDARS', null);
    if (!Array.isArray(calendars)) {
        setOpt(CHANNEL.name + '_CALENDARS', calendars = [{ src: 'd426h89oqa3krrq8cj00kbasgo%40group.calendar.google.com', color: '2952A3' }]);
    }
    window.AddCalendar = function (src, color) {
        setOpt(CHANNEL.name + '_CALENDARS', getOrDefault(CHANNEL.name + '_CALENDARS', []).concat([{ src, color }]));
    };

    $('#calendarTab iframe').attr('src', baseCalendarUrl + '&');
    $('#calendarTab2 iframe').attr('src', baseCalendarUrl2 + '&');
    $('#leftpane').remove();
}

// Keybinds
let keyHeld = false;
$(window).bind('keyup', function () { keyHeld = false; });
$(window).bind('keydown', function (event) {
    const inputBox = document.getElementById("chatline");
    const inputVal = inputBox.value;
    if (event.ctrlKey && !event.shiftKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
            case 'a':
                event.preventDefault();
                if (!keyHeld) {
                    keyHeld = true;
                    inputBox.focus();
                    inputBox.setSelectionRange(0, inputVal.length);
                }
                break;
            case 's':
                if (!keyHeld) {
                    keyHeld = true;
                    event.preventDefault();
                    const selSt = inputBox.selectionStart;
                    const selEnd = inputBox.selectionEnd;
                    if (inputBox === document.activeElement) {
                        if (inputBox.selectionStart === inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0, selSt) + "[sp]" + inputVal.substring(selSt, selEnd) + "[/sp]" + inputVal.substring(selEnd, inputVal.length);
                            inputBox.setSelectionRange(selSt + 4, selSt + 4);
                        } else if (inputBox.selectionStart < inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0, selSt) + "[sp]" + inputVal.substring(selSt, selEnd) + "[/sp]" + inputVal.substring(selEnd, inputVal.length);
                            inputBox.setSelectionRange(selEnd + 9, selEnd + 9);
                        }
                    }
                }
                break;
            case 'r':
                if (!keyHeld) {
                    keyHeld = true;
                    event.preventDefault();
                    event.stopPropagation();
                    const selSt = inputBox.selectionStart;
                    const selEnd = inputBox.selectionEnd;
                    if (inputBox === document.activeElement) {
                        if (inputBox.selectionStart === inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0, selSt) + "[r] " + inputVal.substring(selSt, selEnd) + " [/r]" + inputVal.substring(selEnd, inputVal.length);
                            inputBox.setSelectionRange(selSt + 4, selSt + 4);
                        } else if (inputBox.selectionStart < inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0, selSt) + "[r] " + inputVal.substring(selSt, selEnd) + " [/r]" + inputVal.substring(selEnd, inputVal.length);
                            inputBox.setSelectionRange(selEnd + 9, selEnd + 9);
                        }
                    }
                }
                break;
        }
    }
});

// Replace Video
(function () {
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🐀" id="replacebutton">');
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🔃" id="refreshbutton">');

    $('#replacebutton').click(function () {
        let newId = window.prompt("Replace the current playing stream\nRefresh to undo\n\nSwitching back to YouTube from Twitch is broken, so reloading the player is necessary in that case\n\nYoutube URL/ID:", "");
        let newSource = "YT";

        if (newId == null) {
            newId = "";
        } else if (newId.includes("https://youtube.com/watch?v=")) {
            newId = newId.replace('https://youtube.com/watch?v=', '').substring(0, 11);
        } else if (newId.includes("https://www.youtube.com/watch?v=")) {
            newId = newId.replace('https://www.youtube.com/watch?v=', '').substring(0, 11);
        } else if (newId.includes("https://youtu.be/")) {
            newId = newId.replace('https://youtu.be/', '').substring(0, 11);
        } else if (newId.includes("https://www.twitch.tv/")) {
            newId = newId.replace('https://www.twitch.tv/', '');
            newSource = "TTV";
        } else if (newId.includes("https://twitch.tv/")) {
            newId = newId.replace('https://twitch.tv/', '');
            newSource = "TTV";
        } else if (newId === "om3tcw") {
            newId = "cJtkxZrUicI";
        } else if (newId === "ogey" || newId === "rrat" || newId === "ogey rrat") {
            newId = "JacN1MzyeKo";
        } else if (newId.length !== 11) {
            alert("Invalid input.\nExample input: https://www.youtube.com/watch?v=X9zw0QF12Kc, https://youtu.be/X9zw0QF12Kc, X9zw0QF12Kc, https://www.twitch.tv/holofightz, https://twitch.tv/holofightz");
            newId = "";
        }

        document.body.classList.add('chatOnly');
        socket.emit("removeVideo");
        CLIENT.videoRemoved = true;

        if (newId !== "") {
            const playerSrc = newSource === "YT"
                ? `https://www.youtube.com/embed/${newId}?autohide=1&autoplay=1&controls=1&iv_load_policy=3&rel=0&wmode=opaque&enablejsapi=1&origin=https%3A%2F%2Fom3tcw.com&widgetid=2`
                : `https://player.twitch.tv?channel=${newId}&parent=om3tcw.com&referrer=location.host`;
            document.getElementById("ytapiplayer").src = playerSrc;
        }
    });

    $('#refreshbutton').click(function () {
        document.body.classList.remove('chatOnly');
        document.getElementById("mediarefresh").click();
        socket.emit("restoreVideo");
        CLIENT.videoRemoved = false;
    });
})();

// Image Hover
const ImageHoverEnable = false;

function createHoverImage(jqChatMessage) {
    jqChatMessage.find("a").bind("mouseenter", function () {
        if (ImageHoverEnable) {
            const messageAfter = $(this).parent().next();
            if (!messageAfter.is("img")) {
                const newImg = new Image();
                newImg.style.display = "none";
                newImg.onload = function () {
                    this.classList.add("imageHoverPreview", "imageLoaded");
                };
                newImg.src = $(this).html();
                $(this).parent().after(newImg);
            }
            $("#messagebuffer div:hover .imageHoverPreview").stop(true, false).slideDown(100);
            $("#messagebuffer div:hover").one("mouseout", function () {
                $(this).children(".imageHoverPreview").stop(true, true).slideUp(100).delay(100).removeAttr("style");
            });
        }
    });
}

$("#messagebuffer").bind('DOMNodeInserted', function (event) {
    $(event.target).find("a").parent().parent().each(function () {
        createHoverImage($(this));
    });
});

$("#messagebuffer a").parent().parent().each(function () {
    createHoverImage($(this));
});

// UI Enhancements
(() => {
    'use strict';

    // Move controls around
    $('#videowrap').append("<span id='vidchatcontrols' style='float:right'>");
    $('#emotelistbtn').detach().insertBefore('#chatwrap>form').wrap('<div id="emotebtndiv"></div>').text('Emotes').attr('title', 'Emote List');
    $('#leftcontrols').remove();

    $('.navbar-brand').attr('href', 'https://files.catbox.moe/om3tcw.webm');

    $("#togglemotd").html("X").click(() => $("#motdwrap").hide());

    $(".nav.navbar-nav").append(`
      <li>
        <a id="resize-video-smaller-btn" href="javascript:void(0)" title="Make the video smaller">
          <span class="glyphicon glyphicon-minus"></span>
        </a>
      </li>
      <li>
        <a id="resize-video-larger-btn" href="javascript:void(0)" title="Make the video larger">
          <span class="glyphicon glyphicon-plus"></span>
        </a>
      </li>
    `);

    // Click Event for Larger Button
    $("#resize-video-larger-btn").on('click', () => {
        try {
            CyTube.ui.changeVideoWidth(1);  // Increase video size
        } catch (error) {
            console.error(error);
        }
    });

    // Click Event for Smaller Button
    $("#resize-video-smaller-btn").on('click', () => {
        try {
            CyTube.ui.changeVideoWidth(-1);  // Decrease video size
        } catch (error) {
            console.error(error);
        }
    });

    // Existing Code for Toggles
    $(".nav.navbar-nav").append('<li><a id="videotoggylogg" href="javascript:void(0)">A/O</a></li>');
    $("#videotoggylogg").click(() => {
        if ($("#videowrap:visible").length) {
            $("#videowrap").hide();
            $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-lg-12 col-md-12");
        } else {
            $("#videowrap").show();
            $("#chatwrap").removeClass("col-lg-12 col-md-12").addClass("col-lg-5 col-md-5");
        }
    });

    $(".nav.navbar-nav").append('<li><a id="togglemotd" href="javascript:void(0)">MOTD</a></li>');
    $("#togglemotd").click(() => {
        if ($("#motdwrap:visible").length) {
            $("#motdwrap").hide();
        } else {
            $("#motdwrap").show();
            $("#motd").show();
        }
    });

    $("#main").addClass("flex").children().first().children().first().after('<div id="chatdisplayrow" class="row"></div>').next().append($("#userlist,#messagebuffer").removeAttr("style")).after('<div id="chatinputrow" class="row"></div>').next().append($("#emotebtndiv,#chatwrap>form"));

    // Mikoboat
    const mikoDing = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/om3tcw.ogg');
    mikoDing.loop = true;
    mikoDing.volume = 0.1;
    $('.navbar-brand').on('mouseenter', () => mikoDing.play());
    $('.navbar-brand').on('mouseleave', () => mikoDing.pause());

    // Emote button
    const randomEmotePool = [
        "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyascone.png",
        "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyascone.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasip.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachicken.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatoast.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachocoshroom.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasourdough.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaminecraft.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaclif.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasalman.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaeggsandwich.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyashitpost.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacereal.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatect.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasteak.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyanoodle.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagogurt.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawrappedburger.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapolitan.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagraph.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaoreoshake.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyataco.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacorndog.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaparfait.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasandwich.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasandwich2.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamage.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapirouette.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyafry.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyadonut.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamelonsoda.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaknife.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaahituna.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapumpkinpie.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaseesyourhotpocket.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyart.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamouth.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawithagun.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyan.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachurro.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasugarcookie.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyainahair.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagoslings.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacube.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamami.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyablink.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawarp.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/aranya.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapizza.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamail.png"
        , "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatoast2.png"
    ];

    const drawRandomEmote = () => randomEmotePool[Math.floor(Math.random() * randomEmotePool.length)];

    $("#emotelistbtn").click(function () {
        $(this).css("background-image", "url(" + drawRandomEmote() + ")");
    }).html("");

    // Holo Button
    const holoButton = document.createElement('button');
    holoButton.id = 'holopeek';
    holoButton.classList = 'holoAnim';
    holoButton.onclick = () => {
        document.getElementById('holopeek').classList.toggle('holoAnim');
        const bubble = document.getElementById('holoBubble');
        bubble.style.display = bubble.style.display === 'none' ? 'flex' : 'none';
        const tail = document.getElementById('holoTail');
        tail.style.display = tail.style.display === 'none' ? 'block' : 'none';
    };
    document.body.append(holoButton);


    const holoTail = document.createElement('div');
    holoTail.id = 'holoTail';
    holoTail.style.display = 'none';
    document.body.append(holoTail);


    const holoBubble = document.createElement('div');
    holoBubble.id = 'holoBubble';
    holoBubble.style.display = 'none';
    document.body.append(holoBubble);


    // User's Guide
    const userGuide = document.createElement('a');
    userGuide.href = "https://github.com/om3tcw/r/blob/emotes/holopeek/User%20Guide.txt";
    userGuide.target = "_blank";
    userGuide.innerHTML = "User's guide";
    userGuide.style.cssText = "color: #888; font-size: small; text-align: end;";
    holoBubble.append(userGuide);


    // Checkbox Options
    let hiddenMJMessages = [];


    const options = [
        {
            id: 'background',
            desc: 'Change Background',
            func: self => {
                const checkboxElem = document.getElementById(`holopeek_${self.id}`);
                const textElem = document.getElementById(`holopeek_${self.id}_text`);
                if (checkboxElem && textElem) {
                    self.css = checkboxElem.checked && textElem.value ? `body { background-image: url(${textElem.value}); }` : null;
                }
            },
            text: {
                value: 'https://raw.githubusercontent.com/om3tcw/r/emotes/holopeek/black.png',
                inputEvent: self => {
                    document.getElementById(`holopeek_${self.id}`).checked = false;
                    self.text.value = document.getElementById(`holopeek_${self.id}_text`).value;
                }
            }
        },
        {
            id: 'WatchalongOfftopic',
            desc: 'Offtopic Mode',
            func: self => {
                const checkboxElem = document.getElementById('holopeek_WatchalongOfftopic');
                const username = document.getElementById('welcome').innerText.replace('Welcome, ', '');
                prependMessagesWithMJ(username, checkboxElem.checked);
                toggleHiddenMJMessages();
            }
        },
        {
            id: 'WatchalongOfftopic2',
            desc: 'Offtopic Lurk',
            func: self => {
                toggleHiddenMJMessages();
            }
        },
        {
            id: 'image_hower',
            desc: 'Enable image on link hover',
            func: () => ImageHoverEnable = !ImageHoverEnable
        },
        {
            id: 'reveal_spoilers',
            desc: 'Reveal spoilers',
            css: `.spoiler { color: #ff8; }`
        },
        {
            id: 'chat_video_ratio',
            desc: '>chat:video ratio',
            func: self => {
                const checkboxElem = document.getElementById(`holopeek_${self.id}`);
                const rangeElem = document.getElementById(`holopeek_${self.id}_range`);
                if (checkboxElem && rangeElem) {
                    self.css = checkboxElem.checked ? `
              #videowrap { width: ${100 - rangeElem.value}% !important; }
              #videowrap-header { display: none; }
              #chatwrap { width: ${rangeElem.value}% !important; }
            ` : null;
                }
            },
            range: {
                value: 50,
                min: 0,
                max: 100,
                step: 1,
                inputEvent: self => {
                    document.getElementById(`holopeek_${self.id}`).checked = false;
                    self.range.value = document.getElementById(`holopeek_${self.id}_range`).value;
                }
            }
        },
        {
            id: 'chat_transparency',
            desc: 'Chat Transparency',
            func: self => {
                const checkboxElem = document.getElementById(`holopeek_${self.id}`);
                const rangeElem = document.getElementById(`holopeek_${self.id}_range`);
                if (checkboxElem && rangeElem) {
                    const alpha = 1 - rangeElem.value;
                    const bgColor = `rgba(0, 0, 0, ${alpha})`;
                    self.css = checkboxElem.checked ? `
              #userlist, #messagebuffer { background-color: ${bgColor} !important; }
              .linewrap { background-color: ${bgColor}; }
            ` : null;
                }
            },
            range: {
                value: 0.5,
                min: 0,
                max: 1,
                step: 0.05,
                inputEvent: self => {
                    document.getElementById(`holopeek_${self.id}`).checked = false;
                    self.range.value = document.getElementById(`holopeek_${self.id}_range`).value;
                }
            }
        },
        {
            id: 'chat_video_only',
            desc: 'Chat & video only, no bullshit',
            setupFunc: () => {
                const lunaButton = document.createElement('button');
                lunaButton.id = 'lunaButton';
                lunaButton.onclick = () => {
                    const chatwrap = document.getElementById('chatwrap');
                    chatwrap.style.pointerEvents = chatwrap.style.pointerEvents === 'none' ? 'all' : 'none';
                    chatwrap.style.opacity = chatwrap.style.pointerEvents === 'none' ? 0.25 : 1;
                };
                document.body.append(lunaButton);


                const css = `
            #lunaButton {
              width: 46px;
              height: 100px;
              background: url('https://raw.githubusercontent.com/om3tcw/r/emotes/holopeek/lunapeek.png');
              position: absolute;
              right: 0;
              top: 0;
              padding: 0;
              z-index: 2147483647;
              border: none;
              outline: none;
              display: none;
              opacity: 0;
              transition: .25s;
            }
            #lunaButton:hover {
              opacity: 1;
              transition: .25s;
            }
          `;
                const style = document.createElement('style');
                style.appendChild(document.createTextNode(css));
                document.head.appendChild(style);
            },
            css: `
          #mainpage { padding-top: 0 !important; background: #000 !important; }
          ::-webkit-scrollbar { width: 0 !important; } *{ scrollbar-width: none !important; }
          #chatheader, #userlist, #videowrap-header, #vidchatcontrols, #pollwrap, #MainTabContainer, .timestamp, nav.navbar { display: none !important; }
          #chatwrap { position: fixed; width: 100%; }
          #videowrap {
            width: 100vw;
            height: 56.25vw;
            max-height: 100vh;
            max-width: 177.78vh;
            position: absolute;
            margin: 0 0 0 auto !important;
            padding: 0 !important;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
          }
          #emotelistbtn {
            background-size: cover;
            background-position: initial;
            outline: none;
          }
          #chatinputrow button {
            background-position-y: -12px;
            height: 20px;
            background-color: transparent;
            border: none;
            border-radius: 0 8px 0 0;
          }
          form input#chatline { padding: 8px; background: none; }
          #emotebtndiv + form { background: none; image-rendering: pixelated; }
          #chatinputrow { flex-direction: row; }
          #messagebuffer div.nick-hover .username { color: #84f !important; }
          #messagebuffer div.nick-highlight .username { color: #f8f !important; }
          #messagebuffer div.nick-highlight.nick-hover .username { color: #fff !important; }
          #messagebuffer div {
            background-color: #0000 !important;
            box-shadow: none !important;
          }
          .linewrap {
            background-color: #0000 !important;
            box-shadow: none !important;
            text-shadow:
              1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000,
              2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000,
              1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;
          }
          .username {
            text-shadow:
              1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000,
              2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000,
              1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;
          }
          form { background: none !important; }
          #chatline {
            box-shadow: none !important;
            height: 20px;
            background-size: 44px !important;
            background-position: 0 -8px !important;
          }
          input.form-control[type=text] {
            color: #fff;
            height: 20px;
            text-shadow:
              1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000,
              2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000,
              1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;
          }
          #main { height: 100% !important; }
          input.form-control[type=text]::placeholder { color: #ccc !important; }
          :focus::-webkit-input-placeholder { color: #ccc !important; }
          .embed-responsive { max-height: 100% !important; }
          #lunaButton { display: block; }
        `
        },
        {
            id: 'invert_chat_position',
            desc: 'Invert chat position',
            css: `#main { flex-direction: row-reverse !important; }`
        },
        {
            id: 'hide_playlist',
            desc: 'Hide playlist',
            css: `#MainTabContainer { display: none; }`
        },
        {
            id: 'hide_navbar',
            desc: 'Hide navbar',
            css: `
          #mainpage { padding-top: 0 !important; }
          nav.navbar { display: none !important; }
        `
        },
        {
            id: 'hide_scrollbar',
            desc: 'Hide scrollbar',
            css: `
          ::-webkit-scrollbar { width: 0 !important; }
          * { scrollbar-width: none !important; }
        `
        },
        {
            id: 'custom_CSS',
            desc: 'Custom CSS',
            func: self => {
                const checkboxElem = document.getElementById(`holopeek_${self.id}`);
                const textAreaElem = document.getElementById(`holopeek_${self.id}_textarea`);
                if (checkboxElem && textAreaElem) {
                    self.css = checkboxElem.checked ? textAreaElem.value : null;
                }
            },
            textarea: {
                value: `
            .userlist_item { height: 14px; }
            #videowrap-header, .profile-box hr { display: none; }
            #messagebuffer > div > span > div { background-color: #0000; }
            #queue, #queue + div, .queue_entry, #pollwrap > div {
              box-shadow: none !important;
              border-radius: 0;
            }
            .queue_entry:hover:not(.queue_active), .userlist_item:hover {
              background-color: #84f8 !important;
            }
            .navbar { min-height: 32px; }
            a.navbar-brand {
              background-size: auto 45px;
              height: 32px;
              padding: 0;
              display: flex;
              align-items: center;
              cursor: pointer;
            }
            .nav-tabs { background: #0008; }
            .nav > li, .nav > li:focus {
              margin-bottom: 0;
              background: none !important;
            }
            .nav > li > a, #nav-collapsible > form {
              color: #ccc;
              margin: 0;
              border: none !important;
              padding: 6px 16px !important;
              border-radius: 0;
            }
            .nav > li > a:hover, .nav > li.activ, .nav > li.open > a.dropdown-toggle {
              background: none !important;
              text-shadow: #0ff 0 0 4px;
            }
            .navbar-collapse .btn-sm { margin: 2px; }
            #MainTabContainer > ul > li.active > a, #MainTabContainer > ul > li:hover > a {
              color: #fff;
              background: none;
              text-shadow: #0ff 0 0 4px;
              cursor: pointer !important;
            }
            .container-fluid { padding: 0; }
            #videowrap { padding: 0 0 0 350px; }
            .row { margin: 0; }
            #chatheader {
              box-shadow: none;
              background-color: #000a;
            }
            #mainpage { padding-top: 32px; }
            .navbar {
              border: none;
              box-shadow: none !important;
              background-color: #000a !important;
            }
            .profile-box {
              min-height: 0;
              background-color: #000c;
              border: none;
              padding: 8px 8px 0px 8px;
            }
            .profile-box p { margin: 4px 0 8px 0; }
            .profile-image {
              border: none;
              margin: 0 8px 4px 0;
            }
            .linewrap { z-index: 10; }
            #emotelistbtn {
              outline: none;
              padding: 0 16px;
              background-size: contain;
              background-position: center;
            }
            #chatinputrow button {
              border: none;
              border-radius: 0;
              width: 32px;
              height: 32px;
              background-color: #0000;
            }
            #chatinputrow, #chatinputrow form { height: 32px; }
            form input#chatline {
              padding: 0 0 0 5px;
              height: 32px;
            }
            #emotebtndiv + form {
              background-color: #000a;
              image-rendering: pixelated;
            }
            form input#chatline { background-size: auto; }
            #messagebuffer { background: none; }
            #messagebuffer .username { margin-top: 0; }
            #main { height: 100% !important; }
            #messagebuffer div { background-color: #0008; }
            #messagebuffer div.nick-hover {
              background-color: #4288 !important;
              box-shadow: none !important;
            }
            #messagebuffer div.nick-highlight {
              background-color: #84f8 !important;
              box-shadow: none !important;
            }
            #messagebuffer div.nick-highlight.nick-hover { background-color: #f8f8 !important; }
            #messagebuffer div.nick-highlight .username { color: #f8f; }
            #messagebuffer { box-shadow: none; }
            #userlist {
                box-shadow: none;
                background: #0008;
              }
              #main.flex > #chatwrap { box-shadow: none; }
              .embed-responsive {
                box-shadow: none;
                margin: 0;
                background-color: #000;
              }
              #pollwrap > div { margin: 0; }
              .queue_active.queue_temp { border-radius: 0; }
              #rightcontrols, #rightpane {
                box-shadow: none;
                background: #0008;
                border-radius: 0;
              }
              #pollwrap { min-height: 0px; }
              #pin-dropdown > .dropdown-menu { max-height: calc(100vh - 32px) !important; }
              #messagebuffer { padding: 0px; }
            `,
                inputEvent: self => {
                    document.getElementById(`holopeek_${self.id}`).checked = false;
                    self.textarea.value = document.getElementById(`holopeek_${self.id}_textarea`).value;
                }
            }
        },
        {
            id: 'Potato',
            desc: 'SmartFridgeOwner',
            func: self => {
                const checkboxElem = document.getElementById(`holopeek_${self.id}`);
                if (checkboxElem && checkboxElem.checked) {
                    self.css = `
                .videolist { background: none !important; }
                a.navbar-brand { background: none !important; }
                form input#chatline { background: none; }
                #emotelistbtn { background: none; }
                #emotebtndiv + form {
                  animation: none;
                  background-image: none;
                }
                #chatinputrow button {
                  animation: none !important;
                  background: none !important;
                }
                body { background: black !important; }
                .timestamp {
                  background-image: none !important;
                  color: white !important;
                }
              `;
                } else {
                    self.css = null;
                }
            }
        },
        {
            id: 'vertical_layout',
            desc: 'Vertical layout',
            css: `
            .navbar, #videowrap-header { display: none; }
            #mainpage {
              padding: 0;
              height: auto !important;
            }
            #main { flex-direction: column-reverse !important; }
            #videowrap, #chatwrap {
              width: 100%;
              margin: 0;
              padding: 0;
            }
          `
        },
        {
            id: 'vertical_layout2',
            desc: 'Vertical layout 2',
            css: `
            #chatwrap {
              position: fixed;
              width: 100%;
              height: auto;
              top: 60vw;
              bottom: 0;
            }
            #videowrap {
              width: 100vw;
              height: 56.25vw;
              max-height: 100vh;
              max-width: 177.78vh;
              position: absolute;
              margin: 0 0 0 auto !important;
              padding: 0 !important;
              top: 32px;
              bottom: 0;
              left: 0;
              right: 0;
            }
            #main { height: 100% !important; }
            .linewrap {
              background-color: #0000 !important;
              box-shadow: none !important;
            }
            #videowrap-header { display: none !important; }
          `
        }
    ];

    // Game Mode Prepend
    function prependMessagesWithMJ() {
        const chatInput = document.getElementById('chatline');


        const updateChatInput = () => {
            const offTopicEnabled = document.getElementById('holopeek_WatchalongOfftopic').checked ||
                document.getElementById('holopeek_WatchalongOfftopic2').checked;


            if (offTopicEnabled) {
                if (chatInput.value && !chatInput.value.startsWith('MJ: ')) {
                    chatInput.value = 'MJ: ' + chatInput.value;
                }
            } else {
                chatInput.value = chatInput.value.replace(/^MJ: /, '');
            }
        };


        chatInput.addEventListener('input', updateChatInput);
        chatInput.addEventListener('focus', updateChatInput);
    }


    function toggleHiddenMJMessages() {
        const offTopicEnabled = document.getElementById('holopeek_WatchalongOfftopic').checked ||
            document.getElementById('holopeek_WatchalongOfftopic2').checked;


        if (offTopicEnabled) {
            hiddenMJMessages.forEach(message => {
                message.style.display = 'block';
            });
            hiddenMJMessages = [];
        } else {
            document.querySelectorAll('[class^="chat-msg-"]').forEach(message => {
                if (message.innerText.startsWith('MJ:')) {
                    message.style.display = 'none';
                    if (!hiddenMJMessages.includes(message)) {
                        hiddenMJMessages.push(message);
                    }
                }
            });
        }
    }


    function hideMJMessagesOnLoad() {
        document.querySelectorAll('[class^="chat-msg-"]').forEach(parentElement => {
            parentElement.querySelectorAll('span').forEach(span => {
                if (span.innerHTML.includes('MJ:')) {
                    parentElement.style.display = 'none';
                    hiddenMJMessages.push(parentElement);
                }
            });
        });
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideMJMessagesOnLoad);
    } else {
        hideMJMessagesOnLoad();
    }

    const fplegend = document.createElement('p');
    fplegend.innerHTML = 'Options';
    fplegend.style.textAlign = 'center';
    holoBubble.appendChild(fplegend);


    const fpOptContainer = document.createElement('div');
    fpOptContainer.id = 'fpOptContainer';
    holoBubble.append(fpOptContainer);


    options.forEach(opt => {
        const div = $('<div>').appendTo(fpOptContainer);

        const optId = `holopeek_${opt.id}`;
        const checkboxElem = $('<input>', {
            id: optId,
            type: 'checkbox',
            click: () => {
                if (opt.func) opt.func(opt);
                $(`#${optId}_style`).remove();
                if (opt.css && checkboxElem.prop('checked')) {
                    $('<style>', {
                        id: `${optId}_style`,
                        text: opt.css
                    }).appendTo('head');
                }
            }
        }).appendTo(div);

        // Load cookie option
        const cookie = `; ${document.cookie}`.split(`; ${opt.id}=`).length === 2 ? `; ${document.cookie}`.split(`; ${opt.id}=`).pop().split(';').shift() : null;
        if (cookie) {
            const value = decodeURIComponent(escape(window.atob(cookie)));
            const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : null;
            if (valueElem) opt[valueElem].value = value;
            checkboxElem.prop('checked', true);
            const interval = setInterval(() => {
                if ($(".userlist_item").length) {
                    clearInterval(interval);
                    checkboxElem.triggerHandler('click');
                }
            }, 100);
        }

        const label = $('<label>', {
            id: `${optId}_label`,
            text: opt.desc,
            title: opt.id,
            for: optId
        }).appendTo(div);

        if (opt.textarea) {
            const textareaElem = $('<textarea>', {
                id: `${optId}_textarea`,
                val: opt.textarea.value,
                on: {
                    input: () => {
                        checkboxElem.prop('checked', false);
                        opt.textarea.value = textareaElem.val();
                    }
                }
            }).appendTo(fpOptContainer);
        }

        if (opt.range) {
            const rangeElem = $('<input>', {
                id: `${optId}_range`,
                type: 'range',
                css: { display: 'inline-block' },
                min: opt.range.min,
                max: opt.range.max,
                step: opt.range.step,
                val: opt.range.value,
                on: {
                    input: () => {
                        checkboxElem.prop('checked', false);
                        opt.range.value = rangeElem.val();
                    }
                }
            }).appendTo(fpOptContainer);
        }

        if (opt.text) {
            const textElem = $('<input>', {
                id: `${optId}_text`,
                type: 'text',
                val: opt.text.value,
                on: {
                    input: () => {
                        checkboxElem.prop('checked', false);
                        opt.text.value = textElem.val();
                    }
                }
            }).appendTo(fpOptContainer);
        }

        if (opt.setupFunc) opt.setupFunc(opt);
    });

    // Cookie buttons
    const cookieDiv = $('<div>', {
        id: 'cookieDiv'
    }).appendTo(holoBubble);

    const saveButton = $('<button>', {
        id: 'saveButton',
        html: 'Save<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGLTAk+Exw38csB6bhkc4lePQAhLGDsIZfmPTAtGAaTZOLfg0gLRguAC/BgaqacANqKuBjaGd4RkQtgNZRGnogPuggzgNT+EantJIA8lOItnTRAUr/uQNgo+Iz0Ag+JjBY9BmfgAjpbf/V5agRgAAAABJRU5ErkJggg==">',
        click: () => {
            options.forEach(opt => {
                const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : null;
                const value = valueElem ? opt[valueElem].value : $(`#holopeek_${opt.id}`).prop('checked') ? 1 : 0;
                document.cookie = $(`#holopeek_${opt.id}`).prop('checked')
                    ? `${opt.id}=${window.btoa(unescape(encodeURIComponent(value)))};path=/;expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toGMTString()};`
                    : `${opt.id}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            });
        }
    }).appendTo(cookieDiv);

    const resetButton = $('<button>', {
        id: 'resetButton',
        html: 'Reset<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPElEQVQ4y2NgGAJAgeE+w38ovA/k4QH/8UDqaCADkGw+WRqIERvVMNQ1PMKaMB7h1uDB8BhD+WOg6OAGADZZd6fzGEl6AAAAAElFTkSuQmCC">',
        click: () => {
            options.forEach(opt => {
                document.cookie = `${opt.id}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                $(`#holopeek_${opt.id}`).prop('checked', false);
            });
        }
    }).appendTo(cookieDiv);

    // Holopeek CSS
    const css = `
    #holopeek {
        width: 57px;
        height: 60px;
        z-index: 2147483647;
        position: fixed;
        padding: 0;
        bottom: 0;
        right: 42px;
        border: none;
        outline: none;
        background: none;
        background-image: url('https:///raw.githubusercontent.com/om3tcw/r/emotes/holopeek/polkapeek.png');
        background-repeat: no-repeat;
        image-rendering: crisp-edges;
    }
    .holoAnim {
        animation: peek-out ease-in 0.2s both;
    }
    .holoAnim:hover {
        animation: peek-in ease-out 0.2s both;
    }
    @keyframes peek-in {
        from { background-position: 0px 60px; }
        to { background-position: 0px 0; }
    }
    @keyframes peek-out {
        from { background-position: 0px 0; }
        to { background-position: 0px 60px; }
    }
    #holoBubble {
        flex-grow: 0;
        flex-direction: column;
        padding: 12px 16px;
        z-index: 2147483647;
        position: fixed;
        bottom: 48px;
        right: 90px;
        background: #fff;
        border-radius: 8px;
        max-height: 50%;
    }
    #holoBubble button {
        color: #000;
    }
    #holoBubble textarea {
        width: 100%;
        min-height: 128px;
        margin-bottom: 5px;
        resize: both;
    }
    #holoBubble label {
        color: #888;
    }
    #holoBubble input[type=checkbox] {
        margin-right: 8px;
    }
    #holoBubble input[type=range] {
        display: inline-block;
        margin-bottom: 5px;
    }
    #holoTail {
        width: 50px;
        height: 25px;
        z-index: 2147483647;
        position: fixed;
        bottom: 42px;
        right: 122px;
        background: #fff;
        transform: skew(15deg, 15deg);
    }
    #cookieDiv {
        margin-top: 12px;
        display: flex;
    }
    #cookieDiv button {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #cookieDiv button img {
        margin-left: 4px;
    }
    #fpOptContainer {
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
    }
    #resetButton {
        margin-left: 16px;
    }
    #pinContainer {
        display: flex;
        flex-direction: column-reverse;
    }
    #pin-dropdown > .dropdown-menu {
        width: 384px;
        max-height: calc(100vh - 50px);
        overflow-y: scroll;
        padding: 0;
        margin: 0;
        border: none;
    }
    #pinContainer > li {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 8px 0;
    }
    .pin-message {
        width: calc(100% - 32px);
        overflow-wrap: break-word;
        padding: 0 4px;
    }
    .pin-close {
        width: 24px;
        height: 24px;
        border-radius: 12px;
        margin: auto 4px;
        color: #fff;
        background: #888;
        border: none;
        outline: none;
        transition: 0.2s;
    }
    .pin-close:hover {
        background: #ccc;
        color: #333;
    }
    .navbar {
        background: #0008 !important;
    }
`;

    const style = document.createElement('style');
    if (style.styleSheet)
        style.styleSheet.cssText = css;
    else
        style.appendChild(document.createTextNode(css));
    document.getElementsByTagName('head')[0].appendChild(style);

})();

$('#messagebuffer').off('click').click(e => {
    let t = e.target, p = t.parentElement;
    if (e.button != 0) return;
    if (t.className == 'channel-emote')
        $('#chatline').val((i, v) => v + e.target.title + " ").focus();
});

// Slav's Enhancements
let soundposts;

let html2canvasScript = document.createElement('script');
html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
document.head.appendChild(html2canvasScript);

fetch('https://raw.githubusercontent.com/om3tcw/r/emotes/soundposts/soundposts.json')
    .then(response => response.json())
    .then(data => {
        soundposts = data;
        console.log(soundposts);
    })
    .catch(error => {
        console.error(error);
    });

function runescape(message) {
    const text = message.innerHTML.replace('/runescape', '');
    let html = '';
    let mynumber = 0;

    const parts = text.split(/(<[^>]*>)|\b(\w+)\b/g);

    parts.forEach(part => {
        if (part) {
            if (part.startsWith("<")) {
                const mydelay = mynumber * -50;
                html += `<span style="display: inline-block; position: relative; z-index: -1; animation: wave .66s linear infinite ${mydelay}ms">${part}</span>`;
                mynumber++;
            } else {
                const characters = part.split('');
                characters.forEach(char => {
                    const mydelay = mynumber * -50;
                    html += `<span style="display: inline-block; font-weight: bold; animation: wave .66s linear infinite ${mydelay}ms, glow 3s linear infinite">${char}</span>`;
                    mynumber++;
                });
            }
        }
    });

    message.innerHTML = html;
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
@keyframes confettiExplode {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--explodeX), var(--explodeY)) rotate(var(--rotation)) scale(1);
    opacity: 1;
  }
}

@keyframes confettiFall {
  0% {
    transform: translate(var(--explodeX), var(--explodeY)) rotate(var(--rotation));
    opacity: 1;
  }
  100% {
    transform: translate(var(--fallX), calc(var(--explodeY) + 100vh)) rotate(calc(var(--rotation) + 360deg));
    opacity: 0;
  }
}

.confetti {
  position: fixed;
  width: 12px;
  height: 12px;
  background-color: var(--color);
  transform-origin: center;
  z-index: 4;
}

.confetti.circle {
  border-radius: 50%;
}

.confetti.triangle {
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

.confetti.square {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.confetti.star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.confetti.heart {
  clip-path: path('M0.5,1 C0.5,0 0,0.5 0,0.5 C0,0.5 0.5,0 0.5,0 C0.5,0 1,0.5 1,0.5 C1,0.5 0.5,1 0.5,1 Z');
}

@keyframes snapDisintegrate {
    0% {
      transform: translate(0,0);
      opacity: 1;
    }
    100% {
      transform: translate(50px, -50px) rotate(15deg);
      opacity: 0;
    }
  }

  .pixel-fragment {
    position: absolute;
    width: 1px;
    height: 1px;
    z-index: 9999;
    animation: snapDisintegrate 1.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

function yay(message) {
    const text = message.innerHTML.replace('/yay', '');
    message.innerHTML = text;

    const rect = message.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00',
        '#ff00ff', '#00ffff', '#ff8800', '#ff0088'
    ];
    const shapes = ['circle', 'triangle', 'square', 'star', 'heart'];
    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;

        confetti.style.left = `${centerX}px`;
        confetti.style.top = `${centerY}px`;

        confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);

        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = 50 + Math.random() * 100;
        const explodeX = Math.cos(angle) * distance;
        const explodeY = Math.sin(angle) * distance * 0.6;

        confetti.style.setProperty('--explodeX', `${explodeX}px`);
        confetti.style.setProperty('--explodeY', `${explodeY}px`);
        confetti.style.setProperty('--fallX', `${explodeX + (Math.random() - 0.5) * 200}px`);
        confetti.style.setProperty('--rotation', `${Math.random() * 360}deg`);

        const explodeDuration = 0.5;
        const fallDuration = 1.5 + Math.random();
        const delay = Math.random() * 0.2;

        confetti.style.animation = `
      confettiExplode ${explodeDuration}s ease-out ${delay}s forwards,
      confettiFall ${fallDuration}s ease-in ${explodeDuration + delay}s forwards
    `;

        document.body.appendChild(confetti);

        setTimeout(() => {
            document.body.removeChild(confetti);
        }, (explodeDuration + fallDuration + delay) * 1000);
    }
}

function snap(message) {
    // Remove the command from the message
    const text = message.innerHTML.replace('/snap', '');
    message.innerHTML = text;

    html2canvas(message).then(canvas => {
        const rect = message.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Hide the original message content (we will replace it with pixels)
        message.style.visibility = 'hidden';

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Create a container for the pixel fragments
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = rect.left + 'px';
        container.style.top = rect.top + 'px';
        container.style.width = rect.width + 'px';
        container.style.height = rect.height + 'px';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);

        // Create pixel elements
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // Skip fully transparent pixels
                if (a === 0) continue;

                const pixel = document.createElement('div');
                pixel.className = 'pixel-fragment';
                pixel.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                pixel.style.left = x + 'px';
                pixel.style.top = y + 'px';

                // Delay each pixel based on its vertical position
                const delay = (y / height) * 1; // Adjust scale as needed
                pixel.style.animationDelay = delay + 's';

                container.appendChild(pixel);
            }
        }

        // Remove container after the animation completes
        setTimeout(() => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 3000);
    });
}

// Update the formatMessage function to include snap
function formatMessage(message) {
    if (message.innerHTML.startsWith('/runescape')) {
        runescape(message);
    } else if (message.innerHTML.startsWith('/yay')) {
        yay(message);
    } else if (message.innerHTML.startsWith('/snap')) {
        snap(message);
    }
}

const messageBuffer = document.getElementById('messagebuffer');
let playedSoundposts = [];

document.querySelectorAll('#messagebuffer [class|="chat-msg"]').forEach(element => {
    const mymessage = element.lastElementChild;
    formatMessage(mymessage);
});

function setCookie(name, value) {
    document.cookie = `${name}=${value};expires=${new Date(Date.now() + 86400000).toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}


let soundpostState = getCookie("soundpostState") === "true";

const soundpostButton = document.createElement("button");
soundpostButton.style.backgroundImage = soundpostState
    ? "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/schizo.gif')"
    : "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/medicated.png')";
soundpostButton.style.backgroundSize = "cover";

soundpostButton.addEventListener("click", () => {
    soundpostState = !soundpostState;
    setCookie("soundpostState", soundpostState);
    soundpostButton.style.backgroundImage = soundpostState
        ? "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/schizo.gif')"
        : "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/medicated.png')";
});
const chatInputRow = document.getElementById("chatinputrow");
chatInputRow.appendChild(soundpostButton);

function nicomessage(myplayer, mycontainer, mymsg) {
    mycontainer.appendChild(mymsg);

    mymsg.addEventListener("transitionend", function () {
        mymsg.remove();
    }, { once: true });

    setTimeout(function () {
        mymsg.remove();
    }, 10000);

    let maxLane = Math.floor(myplayer.clientHeight / 32) - 1;
    let lane = Math.floor(Math.random() * (maxLane + 1));
    let playerWidth = myplayer.clientWidth;
    let thisWidth = mymsg.clientWidth;

    mymsg.style.top = (32 * lane) + 'px';
    mymsg.style.right = (0 - thisWidth) + 'px';
    mymsg.classList.add('moving');
    requestAnimationFrame(function () {
        mymsg.style.visibility = 'visible';
        mymsg.style.right = playerWidth + 'px';
    });
}

function nicoprocess(mymsg, myclass) {
    const container = document.getElementsByClassName("videochatContainer")[0];
    const player = document.getElementById("ytapiplayer");
    if (!container || !player) return;

    if (mymsg.innerHTML.trim()) {
        let txt = document.createElement("div");
        txt.classList.add('videoText');
        if (myclass.trim()) txt.classList.add(myclass);
        txt.style.visibility = "hidden";
        txt.innerHTML = mymsg.innerHTML;

        const imgs = txt.getElementsByTagName("img");
        let loadedImgs = 0;

        [...imgs].forEach(img => {
            img.onload = () => {
                if (++loadedImgs === imgs.length) nicomessage(player, container, txt);
            };
        });

        if (imgs.length === 0) nicomessage(player, container, txt);
    }
}

$('.head-NNDCSS').remove();
$('.videochatContainer').remove();

const NNDCSSRules = `
  .videoText {
    color: white;
    position: absolute;
    z-index: 1;
    cursor: default;
    white-space: nowrap;
    font-family: 'Meiryo', sans-serif;
    letter-spacing: 0.063em;
    user-select: none;
    text-shadow: 0 -0.063em #000, 0.063em 0 #000, 0 0.063em #000, -0.063em 0 #000;
    pointer-events: none;
  }
  .videoText.moving {
    transition: right ${7}s linear, left ${7}s linear;
  }
  .videoText.greentext {
    color: #789922;
  }
  .videoText img, .videochatContainer .channel-emote {
    box-shadow: none!important;
    vertical-align: middle!important;
    display: inline-block!important;
    transition: none!important;
  }
  .videoText.shout {
    color: #f00;
  }
`;

$('<style />', {
    'class': 'head-NNDCSS',
    text: NNDCSSRules
}).appendTo('head');

$('.embed-responsive').prepend($('<div/>', {
    'class': 'videochatContainer'
}));

let soundpostPlaybackState = {};
const defaultVolume = 0.1;
const defaultAdditionalPlayTime = 3;

function initializeSoundpost(emote, soundurl, preload = false) {
    if (!soundpostPlaybackState[emote]) {
        soundpostPlaybackState[emote] = {
            audio: new Audio(soundurl),
            totalPlayTime: 0,
            isPlaying: false,
            timeout: null,
            isPreloaded: false
        };

        soundpostPlaybackState[emote].audio.volume = defaultVolume;
        if (preload) {
            soundpostPlaybackState[emote].audio.addEventListener('canplaythrough', () => {
                soundpostPlaybackState[emote].isPreloaded = true;
            }, { once: true });
        }
    }
}

function playSoundpost(emote, additionalPlayTime = defaultAdditionalPlayTime) {
    const soundpost = soundpostPlaybackState[emote];
    soundpost.totalPlayTime += additionalPlayTime;

    if (!soundpost.isPlaying && soundpost.isPreloaded) {
        soundpost.isPlaying = true;
        soundpost.audio.play();
    }

    clearTimeout(soundpost.timeout);

    const remainingTime = soundpost.audio.duration - soundpost.audio.currentTime;
    const playDuration = Math.min(soundpost.totalPlayTime, remainingTime);

    soundpost.timeout = setTimeout(() => {
        soundpost.audio.pause();
        soundpost.isPlaying = false;
        soundpost.audio.currentTime = 0;
        soundpost.totalPlayTime = 0;
    }, playDuration * 1000);
}

const emoteMap = {
    ":nyaggernap:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggernap.jpg",
    ":yakuless:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/yakuless.gif",
    ":nightynightnyagger:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nightynightnyagger.png",
    ":chinpo:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/chinpo.png",
    ":sharingiscaring:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/sharingiscaring.png",
    ":pardner:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/pardner.png",
    ":nyaggerfed:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggerfed.png",
    ":nyaggerfish:": "https://raw.githubusercontent.com/puchigire/r/emotes/emotes/nyaggerfish.png"
};

// Holiday Gift
let NNDState = getCookie("NNDState") === "true";
let holidayCheerState = getCookie("holidayCheerState") === "true";
let holidayFriendState = getCookie("holidayFriendState") === "true";

(() => {
    const userlistDiv = document.getElementById('userlist');
    const container = document.createElement('div');

    const img = document.createElement('img');
    img.src = 'https://www.dl.dropboxusercontent.com/s/95aq2iykyeva6wtxgfs1z/Illustration.png?rlkey=0y60uq7zzw7fbtg6mjr6ml2ov&st=7aag6qpd&dl=0';
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    img.style.cursor = 'pointer';

    const placeholderText = document.createElement('span');
    placeholderText.style.display = 'none';
    placeholderText.textContent = '';

    container.appendChild(img);
    container.appendChild(placeholderText);
    userlistDiv.prepend(container);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998';
    overlay.style.display = 'none';

    const windowDiv = document.createElement('div');
    windowDiv.style.position = 'fixed';
    windowDiv.style.top = '50%';
    windowDiv.style.left = '50%';
    windowDiv.style.transform = 'translate(-50%, -50%)';
    windowDiv.style.backgroundColor = '#2B2B2B'; // Dark slate color
    windowDiv.style.color = '#FFFFFF'; // White text
    windowDiv.style.padding = '30px';
    windowDiv.style.borderRadius = '8px'; // Rounded corners
    windowDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Subtle shadow
    windowDiv.style.zIndex = '9999';
    windowDiv.style.display = 'none';
    windowDiv.style.width = '400px'; // Width to make it consistent
    windowDiv.style.fontFamily = 'Arial, sans-serif'; // Modern font
    windowDiv.style.textAlign = 'center'; // Center content

    // Add header text
    const header = document.createElement('h2');
    header.textContent = "Slav's Surprise Box";
    header.style.marginTop = '0';
    header.style.marginBottom = '20px';
    header.style.fontSize = '18px';
    header.style.color = 'white';
    windowDiv.appendChild(header);

    // Create container for NND button and label
    const nndContainer = document.createElement('div');
    nndContainer.style.display = 'flex';
    nndContainer.style.justifyContent = 'center';
    nndContainer.style.alignItems = 'center';
    nndContainer.style.margin = '20px 0';

    const nndLabel = document.createElement('span');
    nndLabel.textContent = 'NND Mode:';
    nndLabel.style.marginRight = '10px';
    nndLabel.style.color = 'white';
    nndLabel.style.fontSize = '14px';

    const NNDButton = document.createElement("button");
    NNDButton.textContent = NNDState ? "ON" : "OFF";
    NNDButton.style.backgroundColor = '#444';
    NNDButton.style.color = '#FFF';
    NNDButton.style.border = 'none';
    NNDButton.style.padding = '8px 16px';
    NNDButton.style.borderRadius = '4px';
    NNDButton.style.cursor = 'pointer';

    NNDButton.addEventListener('mouseover', () => {
        NNDButton.style.backgroundColor = '#555';
    });

    NNDButton.addEventListener('mouseout', () => {
        NNDButton.style.backgroundColor = '#444';
    });

    NNDButton.addEventListener("click", () => {
        NNDState = !NNDState;
        setCookie("NNDState", NNDState);
        NNDButton.textContent = NNDState ? "ON" : "OFF";
    });

    nndContainer.appendChild(nndLabel);
    nndContainer.appendChild(NNDButton);
    windowDiv.appendChild(nndContainer);

    // Create container for Holiday Cheer button and label
    const cheerContainer = document.createElement('div');
    cheerContainer.style.display = 'flex';
    cheerContainer.style.justifyContent = 'center';
    cheerContainer.style.alignItems = 'center';
    cheerContainer.style.margin = '20px 0';

    const cheerLabel = document.createElement('span');
    cheerLabel.textContent = 'Holiday Cheer:';
    cheerLabel.style.marginRight = '10px';
    cheerLabel.style.color = 'white';
    cheerLabel.style.fontSize = '14px';

    const cheerButton = document.createElement("button");
    cheerButton.textContent = holidayCheerState ? "ON" : "OFF";
    cheerButton.style.backgroundColor = '#444';
    cheerButton.style.color = '#FFF';
    cheerButton.style.border = 'none';
    cheerButton.style.padding = '8px 16px';
    cheerButton.style.borderRadius = '4px';
    cheerButton.style.cursor = 'pointer';

    cheerButton.addEventListener('mouseover', () => {
        cheerButton.style.backgroundColor = '#555';
    });

    cheerButton.addEventListener('mouseout', () => {
        cheerButton.style.backgroundColor = '#444';
    });

    if (holidayCheerState)
        startSnowfall();
    cheerButton.addEventListener("click", () => {
        holidayCheerState = !holidayCheerState;
        setCookie("holidayCheerState", holidayCheerState);
        cheerButton.textContent = holidayCheerState ? "ON" : "OFF";
        if (holidayCheerState) {
            startSnowfall();
        } else {
            stopSnowfall();
        }
    });

    cheerContainer.appendChild(cheerLabel);
    cheerContainer.appendChild(cheerButton);
    windowDiv.appendChild(cheerContainer);

    // Create container for Holiday friend button and label
    const friendContainer = document.createElement('div');
    friendContainer.style.display = 'flex';
    friendContainer.style.justifyContent = 'center';
    friendContainer.style.alignItems = 'center';
    friendContainer.style.margin = '20px 0';

    const friendLabel = document.createElement('span');
    friendLabel.textContent = 'Holiday Friend:';
    friendLabel.style.marginRight = '10px';
    friendLabel.style.color = 'white';
    friendLabel.style.fontSize = '14px';

    const friendButton = document.createElement("button");
    friendButton.textContent = holidayFriendState ? "ON" : "OFF";
    friendButton.style.backgroundColor = '#444';
    friendButton.style.color = '#FFF';
    friendButton.style.border = 'none';
    friendButton.style.padding = '8px 16px';
    friendButton.style.borderRadius = '4px';
    friendButton.style.cursor = 'pointer';

    const friendHelp = document.createElement('span');
    friendHelp.textContent = 'Random Friend each time! Toggle off/on for a new one!';
    friendContainer.style.display = 'flex';
    friendContainer.style.justifyContent = 'center';
    friendContainer.style.alignItems = 'center';
    friendContainer.style.margin = '20px 0';
    friendHelp.style.color = 'white';
    friendHelp.style.fontSize = '14px';

    friendButton.addEventListener('mouseover', () => {
        friendButton.style.backgroundColor = '#555';
    });

    friendButton.addEventListener('mouseout', () => {
        friendButton.style.backgroundColor = '#444';
    });

    let petElements = [];
    if (holidayFriendState)
        createPet();
    friendButton.addEventListener("click", () => {
        holidayFriendState = !holidayFriendState;
        setCookie("holidayFriendState", holidayFriendState);
        friendButton.textContent = holidayFriendState ? "ON" : "OFF";
        if (holidayFriendState) {
            createPet();
        } else {
            destroyPet();
        }
    });

    friendContainer.appendChild(friendLabel);
    friendContainer.appendChild(friendButton);
    windowDiv.appendChild(friendContainer);
    windowDiv.appendChild(friendHelp);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.bottom = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = '#444'; // Darker button style
    closeButton.style.color = '#FFF';
    closeButton.style.border = 'none';
    closeButton.style.padding = '8px 16px';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';

    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = '#555';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = '#444';
    });

    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        windowDiv.style.display = 'none';
    });

    windowDiv.appendChild(closeButton);
    document.body.appendChild(overlay);
    document.body.appendChild(windowDiv);

    img.addEventListener('click', () => {
        overlay.style.display = 'block';
        windowDiv.style.display = 'block';
    });

    function startSnowfall() {
        const snowflake = document.createElement('style');
        snowflake.textContent = `
            @keyframes snow {
                0% { transform: translateY(0); }
                100% { transform: translateY(100vh); }
            }
            .snowflake {
                position: fixed;
                top: -10px;
                left: 0;
                right: 0;
                margin: 0 auto;
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                animation: snow 10s linear infinite;
            }
        `;
        document.head.appendChild(snowflake);
        snowInterval = setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            const pos = Math.random() * window.innerWidth;
            flake.style.left = pos + 'px';
            flake.style.right = window.innerWidth - pos + 'px';
            document.body.appendChild(flake);
            setTimeout(() => flake.remove(), 10000);
        }, 200);
    }

    function stopSnowfall() {
        clearInterval(snowInterval);
        document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
    }

    function makeNewPosition($container) {

        // Get viewport dimensions (remove the dimension of the div)
        var h = $container.height() - 50;
        var w = $container.width() - 50;

        var nh = Math.floor(Math.random() * h);
        var nw = Math.floor(Math.random() * w);

        return [nh, nw];

    }

    function animateDiv($target) {
        var newq = makeNewPosition($target.parent());
        var oldq = $target.offset();
        var speed = calcSpeed([oldq.top, oldq.left], newq);

        $target.animate({
            top: newq[0],
            left: newq[1]
        }, speed, function () {
            animateDiv($target);
        });

    };

    function calcSpeed(prev, next) {

        var x = Math.abs(prev[1] - next[1]);
        var y = Math.abs(prev[0] - next[0]);

        var greatest = x > y ? x : y;

        var speedModifier = 0.1;

        var speed = Math.ceil(greatest / speedModifier);

        return speed;

    }

    function createPet() {
        const pets = [
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorubae.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorusuisei.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorureine.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumio.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorusex.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruina.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumori.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruwatson.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorugura.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukiara.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorufauna.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorusana.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukronii.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumumei.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorubagfriend.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruirys.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorucoco.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruroboco.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorupolka.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorurisu.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruiofi.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumoona.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruanya.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruollie.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorusora.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumiko.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruazki.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumel.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorufubuki.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumatsuri.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruaki.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruhaachama.gif')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruaqua.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorushion.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruayame.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorusubaru.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruokayu.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukorone.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorupekora.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorurushia.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruflare.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorunoel.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumarine.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruchoco.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukanata.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruwatame.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorutowa.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruluna.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorunene.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorubotan.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorulaplus.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorului.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukoyori.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruchloe.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruiroha.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/lamypadoru.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorupomu.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukobo.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padoruzeta.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorukaela.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorubijou.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorumococo.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/padorushiori.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/889bf491fabfc08df6a2c691e3c0ec7215e07240/emotes/padorugigi.png')",
            "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/emotes/padorucecilia.png')"
        ];

        const rng = Math.floor(Math.random() * pets.length);
        const petElement = document.createElement('div');
        petElement.classList.add('pet-' + rng);
        petElement.style.backgroundImage = pets[rng];
        petElement.style.backgroundSize = 'contain';
        petElement.style.backgroundRepeat = 'no-repeat';
        petElement.style.width = '75px';
        petElement.style.height = '75px';
        petElement.style.position = 'fixed';
        petElement.style.zIndex = '5';
        document.body.appendChild(petElement);
        $(document).ready(function () {
            animateDiv($('.pet-' + rng));
        });
        petElements.push(petElement);
    }

    function destroyPet() {
        petElements.forEach(pet => pet.remove());
        petElements = [];
    }

})();

socket.on("chatMsg", ({ username, msg, meta, time }) => {
    if (!['[server]', '[voteskip]', '<Kusa>'].includes(username.toLowerCase())) {
        const mymessage = messageBuffer.lastElementChild.lastElementChild;

        if (mymessage.innerHTML.startsWith('/yay') && soundpostState) {
            const myaudio = new Audio("https://www.dl.dropboxusercontent.com/s/z0n3hnw8ky79rwhdokfso/nenesmile.ogg?rlkey=bezzj2pn6c9rj0pqco5kbf7bk&st=ythhncur&dl=0");
            myaudio.volume = defaultVolume;
            myaudio.play();
        }

        formatMessage(mymessage);

        if (NNDState) {
            if (!meta['addClass'])
                meta['addClass'] = '';
            nicoprocess(mymessage, meta.addClass);
        }

        const userChatClass = `chat-msg-${username}`;
        const parentElement = mymessage.closest(`.${userChatClass}`);
        const isMJMessage = mymessage.innerHTML.startsWith('MJ:');
        const offTopicEnabled = document.getElementById('holopeek_WatchalongOfftopic').checked ||
            document.getElementById('holopeek_WatchalongOfftopic2').checked;

        if (isMJMessage) {
            if (!offTopicEnabled) {
                parentElement.style.display = 'none';
                hiddenMJMessages.push(parentElement);
            } else {
                parentElement.style.display = 'block';
                const timestampElem = parentElement?.querySelector('.timestamp');
                timestampElem.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/refs/heads/emotes/eyes/nyagger.png')";
                mymessage.innerHTML = mymessage.innerHTML.replace(/^MJ: /, '');
            }
        } else {
            parentElement.style.display = 'block';
            const timestampElem = parentElement?.querySelector('.timestamp');
            timestampElem.style.backgroundImage = '';
        }

        Object.keys(emoteMap).forEach(emote => {
            const escapedEmote = emote.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&');
            if (offTopicEnabled) {
                mymessage.innerHTML = mymessage.innerHTML.replace(new RegExp(escapedEmote, 'g'),
                    `<img class="channel-emote" title="${emote}" src="${emoteMap[emote]}">`);
            } else {
                mymessage.innerHTML = mymessage.innerHTML.replace(new RegExp(escapedEmote, 'g'), '');
            }
        });

        if (soundpostState) {
            const emotes = mymessage.querySelectorAll('.channel-emote[title]');
            emotes.forEach((emote) => {
                const emoteTitle = emote.title;
                const soundpost = soundposts[emoteTitle];

                if (soundpost) {
                    const preload = (emoteTitle === ":homuhomu:" || emoteTitle === ":rratate:");
                    initializeSoundpost(emoteTitle, soundpost.soundurl, preload);

                    if (preload && soundpostPlaybackState[emoteTitle].isPreloaded) {
                        playSoundpost(emoteTitle, 5);
                    } else if (preload) {
                        soundpostPlaybackState[emoteTitle].audio.addEventListener('canplaythrough', () => {
                            playSoundpost(emoteTitle, 3);
                        }, { once: true });
                    } else if (!playedSoundposts.includes(soundpost.soundurl)) {
                        const myaudio = new Audio(soundpost.soundurl);
                        myaudio.volume = defaultVolume;
                        myaudio.play();
                        playedSoundposts.push(soundpost.soundurl);
                    }
                }
            });

            if (mymessage.innerHTML.startsWith('boo') && soundpostState) {
                const myaudio = new Audio("https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/boo.ogg");
                myaudio.volume = defaultVolume;
                myaudio.play();
            }
        }
        playedSoundposts = [];
    }
});
