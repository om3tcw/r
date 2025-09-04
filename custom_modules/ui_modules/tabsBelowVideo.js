export const $tabContainer = $('<div id="MainTabContainer"></div>').appendTo('#videowrap');
export const $tabsNavigator = $('<ul class="nav nav-tabs" role="tablist"></ul>').appendTo($tabContainer);
export const $tabContent = $('<div class="tab-content"></div>').appendTo($tabContainer);

const $containerList = () => $('<li>', {
    role: 'presentation'
})

let $playlistControlButtons =  $('#rightcontrols').detach();
let $playlistRows = $('#playlistrow').detach().removeClass('row');

const $playlistTab = $('<div>', {
    role: 'tabpanel',
    class: 'tab-pane active',
    id: 'playlistTab'
});

$playlistTab.appendTo($tabContent);
$playlistTab.append($playlistControlButtons)
$playlistTab.append($playlistRows);

let $playlistContainer = $containerList();
$playlistContainer.appendTo($tabsNavigator);

const playlistButton = $('<a>', {
    role: "tab",
    "data-toggle": "tab",
    "aria-expanded": "false",
    href: "#playlistTab",
    text: "Playlist"
});

playlistButton.appendTo($playlistContainer);

const $pollsTab = $('<a>', {
    role: 'tab',
    'data-toggle': 'tab',
    'aria-expanded': 'false',
    href: '#pollsTab',
    text: 'Polls ' 
});

const $pollsBadge = $('<span>', {
    id: 'pollsbadge',
    class: 'badge',
    style: 'background-color:#FFF;color:#000;'
});

let $pollsContainer = $containerList();
$pollsContainer.append($pollsTab).append($pollsBadge);
$pollsContainer.appendTo($tabsNavigator);

$pollsContainer.on("click", function () {
    $('#pollsbadge').text('');
});

const $newPollBtn = $('#newpollbtn').detach();

const $pollsTabDiv = $('<div>', { 
    role: "tabpanel",
    class: "tab-pane",
    id: "pollsTab"
}) 
const $pollHistoryDiv = $('<div>', {
    class: "col-lg-12 col-md-12", 
    id: "pollhistory"
})
$pollHistoryDiv.appendTo($pollsTabDiv);

$pollsTabDiv.appendTo($tabContent);

$pollsTabDiv.prepend($newPollBtn);

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

$('<div role="tabpanel" class="tab-pane" id="calendarTab"><iframe width="100%" height="600" frameborder="0" scrolling="auto"></iframe></div>').appendTo($tabContent);
$('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab">Oshi Eyes</a></li>').appendTo($tabsNavigator);
const oshiEyesForm = 'https://docs.google.com/forms/d/1oqO8DIIyxuKVPvhXSAmxNCy5zCkS8XQAhEKi8a9BK1g/viewform?';

$('#calendarTab iframe').attr('src', oshiEyesForm + '&');
$('#leftpane').remove();
