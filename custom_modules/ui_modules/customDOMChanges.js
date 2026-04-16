const $videowrap = $(videowrap);
$videowrap.append("<span id='vidchatcontrols' style='float:right'>");

let $chatwrap = $(chatwrap);
const $formElementsUnderChatWrap = $chatwrap.children('form')
const $emotelistbtn = $(emotelistbtn)
$emotelistbtn.detach().insertBefore($formElementsUnderChatWrap)

const $navBar = $(".nav.navbar-nav");
const $audioOnly = $('<li><a id="audio-only"">A/O</a></li>');
const $holoDex = $("<li class='dropdown'><a target='_blank' href='https://holodex.net/home'>HoloDex</a></li>");

$navBar.append($holoDex);
$navBar.append($audioOnly);

$($audioOnly).click(() => {
    $videowrap.toggle();
});

const $motdwrap = $(motdwrap);
const $motd = $(motd);
const $navbarMotdToggle = $('<li>').append($('<a>', {
    id: 'navbar-motd-toggle',
    href: 'javascript:void(0)',
    text: 'MOTD',
}));

function showIntegratedMotd() {
    $motdwrap.show();
    $motd.show();
    $('#togglemotd').find('.glyphicon-plus')
        .removeClass('glyphicon-plus')
        .addClass('glyphicon-minus');
}

function hideIntegratedMotd() {
    $motdwrap.hide();
    $motd.hide();
    $('#togglemotd').find('.glyphicon-minus')
        .removeClass('glyphicon-minus')
        .addClass('glyphicon-plus');
}

$navbarMotdToggle.appendTo($navBar);
$navbarMotdToggle.on('click', () => {
    if ($motdwrap.is(':visible') && $motd.is(':visible')) {
        hideIntegratedMotd();
        return;
    }

    showIntegratedMotd();
});

const baseSetMotd = Callbacks.setMotd;
Callbacks.setMotd = function (newMotd) {
    baseSetMotd.apply(this, arguments);

    if (newMotd !== "") {
        showIntegratedMotd();
    }
};

const $userlist = $(userlist);
const $messagebuffer = $(messagebuffer);
const $chatheader = $(chatheader);
const $main = $(main);

$userlist.removeAttr('style');
$messagebuffer.removeAttr('style');

$main.addClass("flex");

let resolvePromise
export const DOMrebuiltPromise = new Promise((resolve) => {
    resolvePromise = resolve
});
//This rebuilds the DOM and makes it fullscreen. neat.
(() => {
    $chatheader.after('<div id="chatdisplayrow" class="row"></div>')
        .next().append($userlist, $messagebuffer)
        .after('<div id="chatinputrow" class="row"></div>')
        .next().append($emotelistbtn, $formElementsUnderChatWrap);
    resolvePromise();
})();

const mikoDing = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/om3tcw.ogg');
mikoDing.loop = true;
mikoDing.volume = 0.1;

const $navBarBrand = $('.navbar-brand');
$navBarBrand.attr('href', 'https://files.catbox.moe/om3tcw.webm');
$navBarBrand.on('mouseenter', () => mikoDing.play());
$navBarBrand.on('mouseleave', () => mikoDing.pause());

const githubEmoteFolder = "https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/";
// Emote metatag update when?
const randomEmotePool = [
    "anyascone.png",    "anyasip.png",          "anyachicken.png",      "anyaseesyourhotpocket.png",
    "anyatoast.png",    "anyachocoshroom.png",  "anyasourdough.png",    "anyaminecraft.png", 
    "anyaclif.png",     "anyasalman.png",       "anyaeggsandwich.png",  "anyashitpost.png", 
    "anyacereal.png",   "anyatect.png",         "anyasteak.png",        "anyanoodle.png", 
    "anyagogurt.png",   "anyapolitan.png",      "anyagraph.png",        "anyaoreoshake.png", 
    "anyataco.png",     "anyacorndog.png",      "anyaparfait.png",      "anyasandwich.png", 
    "anyamage.png",     "anyapirouette.png",    "anyafry.png",          "anyadonut.png", 
    "anyaknife.png",    "anyaahituna.png",      "anyapumpkinpie.png",   "anyasandwich2.png", 
    "anyart.png",       "anyamouth.png",        "anyawithagun.png",     "anyan.png", 
    "anyainahair.png",  "anyagoslings.png",     "anyacube.png",         "anyamelonsoda.png", 
    "anyamami.png",     "anyablink.png",        "anyawarp.png",         "aranya.png",  
    "anyamail.png",     "anyatoast2.png",       "anyawrappedburger.png","anyasugarcookie.png", 
    "anyachurro.png",   "anyapizza.png",        "anyateef.png",         "anyabread.png",
    "anyavampire.png",
];

const drawRandomEmote = () => randomEmotePool[Math.floor(Math.random() * randomEmotePool.length)];

$emotelistbtn.click(function () {
    $(this).css("background-image", `url("${githubEmoteFolder}`+ drawRandomEmote());
}).html("");

