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

// oshieyes google

$('<div role="tabpanel" class="tab-pane" id="calendarTab"><iframe width="100%" height="600" frameborder="0" scrolling="auto"></iframe></div>').appendTo(tabContent);
$('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab">Oshi Eyes</a></li>').appendTo(tabList);
const oshiEyesForm = 'https://docs.google.com/forms/d/1oqO8DIIyxuKVPvhXSAmxNCy5zCkS8XQAhEKi8a9BK1g/viewform?';

$('#calendarTab iframe').attr('src', oshiEyesForm + '&');
$('#leftpane').remove();
