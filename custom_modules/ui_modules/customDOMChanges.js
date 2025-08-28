// UI Enhancements
//This fucking website has every fucking element as a global scope variable I swear to fukcvkigfn

/*  This was kept in the code for multiple years, it's assigned to the wrong DOM element.
    To fix, change $chatwrap.attr to the chatline JQuery element ($(chatline))

const watermark = 'om3tcw is cuter than usual';
$chatwrap.attr('placeholder', watermark);

*/

// Move controls around
const $chatwrap = $(chatwrap);
const $formElementsUnderChatWrap = $chatwrap.children('form')
const $videowrap = $(videowrap);
$videowrap.append("<span id='vidchatcontrols' style='float:right'>");

const $emotelistbtn = $(emotelistbtn)
$emotelistbtn.detach().insertBefore($formElementsUnderChatWrap)

//Sure
$(leftcontrols).remove();

export const $navBar = $(".nav.navbar-nav");
const $audioOnly = $('<li><a id="audio-only" href="javascript:void(0)">A/O</a></li>');
const $holoDex = $("<li class='dropdown'><a target='_blank' href='https://holodex.net/home'>HoloDex</a></li>");
const $kusasNewStupidAssBitForAugust = $("<li class='dropdown'><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScmTUBfSR1bgRjQskGCMhnNpV_wZTIyQ17oMAZA1FoD5LY7LA/viewform?usp=sharing&ouid=112222705232140937762'><img src='https://twemoji.maxcdn.com/v/latest/72x72/1f1ec-1f1e7.png' alt='UK Flag' style='width: 1em; vertical-align: middle; margin-right: 0.25em;'>UK Age Verification Form</a></li>");

$navBar.append($holoDex);
$navBar.append($kusasNewStupidAssBitForAugust)
$navBar.append($audioOnly);

$($audioOnly).click(() => {
    $videowrap.toggle();
});

const $togglemotd = $('<li><a id="togglemotd" href="javascript:void(0)">MOTD</a></li>');
const $motdwrap = $(motdwrap);
$motdwrap.on('click', () => $motdwrap.hide())
$togglemotd.appendTo($navBar);
$togglemotd.on('click', () => { 
    $motdwrap.toggle()
    $(motd).toggle();
})

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
    $(this).css("background-image", `url("${githubEmoteFolder}`+ drawRandomEmote() + ")");
}).html("");



