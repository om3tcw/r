(() => {
    'use strict';
    //Moving controls around
	$('#videowrap').append("<span id='vidchatcontrols' style='float:right'>");
	$('#emotelistbtn').detach().insertBefore('#chatwrap>form').wrap('<div id="emotebtndiv"></div>').text('Emotes').attr('title', 'Emote List');
	$('#leftcontrols').remove();
		
	
	
	var previousMessage = "";

$('.navbar-brand').attr('href','https://files.catbox.moe/om3tcw.webm');
	
$("#togglemotd").html("X").click(function(){
    $("#motdwrap").hide();
});

$(".nav.navbar-nav").append('<li><a id="videotoggylogg" href="javascript:void(0)">A/O</a></li>'); 
$("#videotoggylogg").click(function(){
    if($("#videowrap:visible").length) {
        $("#videowrap").hide();
        $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-lg-12 col-md-12");
    } else {
        $("#videowrap").show();
        $("#chatwrap").removeClass("col-lg-12 col-md-12").addClass("col-lg-5 col-md-5");
    }
});

$(".nav.navbar-nav").append('<li><a id="togglemotd" href="javascript:void(0)">MOTD</a></li>'); 
$("#togglemotd").click(function(){
    if($("#motdwrap:visible").length) {
        $("#motdwrap").hide();
    } else {
        $("#motdwrap").show();
        $("#motd").show();
    }
});
	
$("#main").addClass("flex").children().first().children().first().after('<div id="chatdisplayrow" class="row"></div>').next().append($("#userlist,#messagebuffer").removeAttr("style")).after('<div id="chatinputrow" class="row"></div>').next().append($("#emotebtndiv,#chatwrap>form"))

//mikoboat
    const mikoDing = document.createElement("audio");
    mikoDing.setAttribute('src','https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/sounds/om3tcw.mp3');
    mikoDing.loop = true;
    mikoDing.volume = 0.1;
    document.getElementsByClassName("navbar-brand")[0].onmouseenter = () => mikoDing.play();
    document.getElementsByClassName("navbar-brand")[0].onmouseleave = () => mikoDing.pause();


//  ===========================================  EMOTE BUTTON  ========================================== //
var randomEmotePool= [
	"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyascone.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasip.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachicken.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatoast.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacado.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachocoshroom.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasourdough.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaminecraft.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaclif.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasalman.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaeggsandwich.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyashitpost.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacereal.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatect.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasteak.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyanoodle.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyastroopwafel.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagogurt.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawrappedburger.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapolitan.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagraph.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaoreoshake.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyataco.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacorndog.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaparfait.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasandwich.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasandwich2.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamage.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapirouette.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyafry.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyafoiegraswithcaviar.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyadonut.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamelonsoda.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaknife.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaahituna.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapumpkinpie.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyaseesyourhotpocket.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyart.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamouth.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawithagun.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyan.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyachurro.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyasugarcookie.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyainahair.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyagoslings.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyacube.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamami.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyablink.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyawarp.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/aranya.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyapizza.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyamail.png"
	,"https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/anyatoast2.png"
	];

function drawRandomEmote(){
	return randomEmotePool[Math.floor(Math.random() *randomEmotePool.length)];
};

$("#emotelistbtn").click(function(){
	$(this).css("background-image","url("+drawRandomEmote()+")");
}).html("")



    // --- holo Button ---


    const button = document.createElement('button');
    button.id = 'holopeek';
    button.classList = 'holoAnim';
    button.onclick = () => {
        document.getElementById('holopeek').classList.toggle('holoAnim');
        const bubble = document.getElementById('holoBubble');
        bubble.style.display = bubble.style.display === 'none' ? 'flex' : 'none';
        const tail = document.getElementById('holoTail');
        tail.style.display = tail.style.display === 'none' ? 'block' : 'none';
    }
    document.body.append(button);

    const tail = document.createElement('div');
    tail.id = 'holoTail';
    tail.style.display = 'none';
    document.body.append(tail);

    const bubble = document.createElement('div');
    bubble.id = 'holoBubble';
    bubble.style.display = 'none';
    document.body.append(bubble);


    // --- User's guide ---


    const userGuide = document.createElement('a');
    userGuide.href = "https:///github.com/om3tcw/r/blob/emotes/holopeek/User%20Guide.txt";
    userGuide.target = "_blank";
    userGuide.innerHTML = "User's guide";
    userGuide.style.color = "#888";
    userGuide.style.fontSize = "small";
    userGuide.style.textAlign = "end";
    bubble.append(userGuide);

    // --- Checkbox Options ---


    const options = [{
        id: 'background',
        desc: 'Change Background',
        func: self => {
            const checkboxElem = document.getElementById(`holopeek_${self.id}`);
            const textElem = document.getElementById(`holopeek_${self.id}_text`);
            if (checkboxElem && textElem) self.css = checkboxElem.checked && textElem.value && textElem.value !== '' ? `body { background-image: url(${textElem.value}); }` : null;
        },
        text: {
            value: 'https:///raw.githubusercontent.com/om3tcw/r/emotes/holopeek/black.png',
            inputEvent: self => {
                document.getElementById(`holopeek_${self.id}`).checked = false;
                self.text.value = document.getElementById(`holopeek_${self.id}_text`).value;
            }
        }
	}, {
        id: 'image_hower',
        desc: 'Enable image on link hover',
		func: self => {ImageHoverEnable = !ImageHoverEnable;}
    }, 
/* 	{
        id: 'poll_alert',
        desc: 'Add a poll sound alert',
		func: self => {votingpoll: null}
    },  */
	{
        id: 'reveal_spoilers',
        desc: 'Reveal spoilers',
        css: `.spoiler { color: #ff8; }`
    }, {
        id: 'chat_video_ratio',
        desc: '>chat:video ratio',
        func: self => {
            const checkboxElem = document.getElementById(`holopeek_${self.id}`);
            const rangeElem = document.getElementById(`holopeek_${self.id}_range`);
            if (checkboxElem && rangeElem) {
                self.css = checkboxElem.checked ? `
                #videowrap { width: ${(100 - rangeElem.value)}% !important; }
                #videowrap-header {display:none} #chatwrap { width: ${rangeElem.value}% !important; }` : null;
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
    }, {
        id: 'chat_transparency',
        desc: 'Chat Transparency',
        func: self => {
            const checkboxElem = document.getElementById(`holopeek_${self.id}`);
            const rangeElem = document.getElementById(`holopeek_${self.id}_range`);
            if (checkboxElem && rangeElem) {
                self.css = checkboxElem.checked ? `
                #userlist { background-color: rgba(0, 0, 0, ${(1 - rangeElem.value)}) !important; }
                .linewrap { background-color: rgba(0,0,0,${(1 - rangeElem.value)}) }` : null;
            }
        },
        range: {
            value: .5,
            min: 0,
            max: 1,
            step: .05,
            inputEvent: self => {
                document.getElementById(`holopeek_${self.id}`).checked = false;
                self.range.value = document.getElementById(`holopeek_${self.id}_range`).value;
            }
        }
    }, {
        id: 'chat_video_only',
        desc: 'Chat & video only, no bullshit',
        setupFunc: self => {
            const lunaButton = document.createElement('button');
            lunaButton.id = 'lunaButton';
            lunaButton.onclick = () => {
                const chatwrap = document.getElementById('chatwrap');
                chatwrap.style.pointerEvents = chatwrap.style.pointerEvents === 'none' ? 'all' : 'none';
                chatwrap.style.opacity = chatwrap.style.pointerEvents === 'none' ? 0.25 : 1;
            }
            document.body.append(lunaButton);

            const css = `
            #lunaButton {width:46px;height:100px;background: url('https:///raw.githubusercontent.com/om3tcw/r/emotes/holopeek/lunapeek.png');position:absolute;right:0;top:0;padding: 0;z-index: 2147483647;border: none;outline: none;display:none;opacity:0;transition:.25s}
            #lunaButton:hover {opacity:1;transition:.25s}`;
            const style = document.createElement('style');
            if (style.styleSheet) style.styleSheet.cssText = css;
            else style.appendChild(document.createTextNode(css));
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        css: `
        #mainpage { padding-top: 0 !important; background: #000 !important; }
        ::-webkit-scrollbar { width: 0 !important; } *{ scrollbar-width: none !important; }
        #chatheader, #userlist, #videowrap-header, #vidchatcontrols, #pollwrap, #MainTabContainer, .timestamp, nav.navbar {display:none !important;}
        #chatwrap {position:fixed;width:100%;}
        #videowrap {width: 100vw; height: 56.25vw;max-height: 100vh;max-width: 177.78vh;position: absolute;margin: 0 0 0 auto !important;padding: 0 !important;top:0;bottom:0;left:0;right:0;}
        #emotelistbtn {background-size: cover;background-position: initial;outline: none;}
        #chatinputrow button {background-position-y: -12px;height:20px;background-color: transarent;border: none;border-radius: 0 8px 0 0;}
        form input#chatline {padding: 8px; background: none;}
        #emotebtndiv + form {background: none;image-rendering: pixelated;}
        #chatinputrow {flex-direction: row;}
        #messagebuffer div.nick-hover .username { color: #84f !important; }
        #messagebuffer div.nick-highlight .username { color: #f8f !important; }
        #messagebuffer div.nick-highlight.nick-hover .username { color: #fff !important; }
        #messagebuffer div{background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-hover {background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-highlight {background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-highlight.nick-hover {background-color: #0000 !important;box-shadow: none !important;}
        .linewrap {background-color: #0000 !important;box-shadow: none !important;text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        .username {text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        form { background:none !important; }
        #chatline {box-shadow:none !important;height:20px;background-size: 44px !important;background-position: 0 -8px !important;}
        input.form-control[type=text] { color: #fff; height:20px; text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        #main { height: 100% !important;}
        input.form-control[type=text]::placeholder {color: #ccc !important;}
        :focus::-webkit-input-placeholder { color: #ccc !important;}
        .embed-responsive {max-height:100% !important}
        #lunaButton {display: block}
        `
    }, {
        id: 'invert_chat_position',
        desc: 'Invert chat position',
        css: `#main {flex-direction:row-reverse !important}`
    }, {
        id: 'hide_playlist',
        desc: 'Hide playlist',
        css: `#MainTabContainer{display:none}`
    }, {
        id: 'hide_navbar',
        desc: 'Hide navbar',
        css: `#mainpage { padding-top: 0 !important; } nav.navbar { display: none !important; }`
    }, {
        id: 'hide_scrollbar',
        desc: 'Hide scrollbar',
        css: `::-webkit-scrollbar { width: 0 !important; } *{ scrollbar-width: none !important; }`
    }, {
        id: 'custom_CSS',
        desc: 'Custom CSS',
        func: self => {
            const checkboxElem = document.getElementById(`holopeek_${self.id}`);
            const textAreaElem = document.getElementById(`holopeek_${self.id}_textarea`);
            if (checkboxElem && textAreaElem) self.css = checkboxElem.checked ? (textAreaElem.value || '') : null;
        },
        textarea: {
            value: `.userlist_item {height:14px}
#videowrap-header,.profile-box hr{display:none}
#messagebuffer>div>span>div{background-color:#0000}
#queue,#queue + div,.queue_entry,#pollwrap>div{box-shadow: none !important;border-radius: 0;}
.queue_entry:hover:not(.queue_active),.userlist_item:hover{background-color: #84f8 !important;}
.navbar{min-height:32px;}
a.navbar-brand{background-size: auto 45px;}
.navbar-brand{height:32px;padding:0;display: flex;align-items: center;cursor: pointer;}
.nav-tabs {background: #0008;}
.nav>li, .nav>li:focus{margin-bottom: 0;background: none !important;}
.nav>li>a, #nav-collapsible>form{color: #ccc;margin:0;border:none !important; padding:6px 16px !important;border-radius: 0;}
.nav>li>a:hover, .nav>li.activ, .nav>li.open>a.dropdown-toggle{background: none !important;text-shadow: #0ff 0 0 4px}
.navbar-collapse .btn-sm {margin: 2px;}
#MainTabContainer>ul>li.active>a, #MainTabContainer>ul>li:hover>a{color: #fff;background: none;text-shadow: #0ff 0 0 4px;cursor: pointer !important;}
.container-fluid{padding:0}
#videowrap{padding:0 0 0 350px}
.row {margin: 0;}
#chatheader{box-shadow:none;background-color: #000a;}
#mainpage {padding-top:32px}
.navbar {border:none; box-shadow:none !important; background-color:#000a !important}
.profile-box {min-height: 0;background-color: #000c;border: none;padding: 8px 8px 0px 8px;}
.profile-box p {margin: 4px 0 8px 0;}
.profile-image {border: none;margin: 0 8px 4px 0;}
.linewrap {z-index: 10;}
#emotelistbtn {outline: none;padding:0 16px;background-size: contain;background-position: center;}
#chatinputrow button {border: none;border-radius: 0;width:32px;height:32px;background-color:#0000}
#chatinputrow,#chatinputrow form {height:32px}
form input#chatline {padding: 0 0 0 5px;height:32px}
#emotebtndiv + form {background-color: #000a;image-rendering: pixelated;}
form input#chatline {background-size: auto:}
#messagebuffer{background: none;}
#messagebuffer .username {margin-top:0;}
#main {height: 100% !important;}
#messagebuffer div{background-color: #0008;}
#messagebuffer div.nick-hover {background-color: #4288 !important;box-shadow: none !important;}
#messagebuffer div.nick-highlight {background-color: #84f8 !important;box-shadow: none !important;}
#messagebuffer div.nick-highlight.nick-hover {background-color: #f8f8 !important;}
#messagebuffer div.nick-highlight .username {color: #f8f;}
#messagebuffer {box-shadow: none;}
#userlist {box-shadow: none;background: #0008;}
#main.flex>#chatwrap {box-shadow: none;}
.embed-responsive {box-shadow: none;margin: 0;background-color: #000;}
#pollwrap>div {margin: 0;}
.queue_active.queue_temp {border-radius: 0;}
#rightcontrols, #rightpane {box-shadow: none;background: #0008;border-radius: 0;}
#pollwrap {min-height:0px}
#pin-dropdown>.dropdown-menu {max-height: calc(100vh - 32px) !important}
#messagebuffer {padding: 0px}`,
            inputEvent: self => {
                document.getElementById(`holopeek_${self.id}`).checked = false;
                self.textarea.value = document.getElementById(`holopeek_${self.id}_textarea`).value;
            }
        },
    }, {
        id: 'vertical_layout',
        desc: 'Vertical layout',
        css: `.navbar, #videowrap-header {display:none}
        #mainpage {padding:0;height:auto !important}
        #main{flex-direction:column-reverse !important}
        #videowrap, #chatwrap{width:100%;margin:0; padding:0}`
   
    }, {
        id: 'vertical_layout2',
        desc: 'Vertical layout 2',
        css: `
                #chatwrap {position:fixed;width:100%;height:auto;top:60vw;bottom:0;}
        #videowrap {width: 100vw; height: 56.25vw;max-height: 100vh;max-width: 177.78vh;position:absolute;margin: 0 0 0 auto !important;padding: 0 !important;top:32px;bottom:0;left:0;right:0;}
        #main { height: 100% !important;}
		.linewrap {background-color: #0000 !important;box-shadow: none !important;}
		#videowrap-header  {display:none !important;}
        `
    }
	];

    const fplegend = document.createElement('p');
    fplegend.innerHTML = 'Options';
    fplegend.style.textAlign = 'center';
    bubble.appendChild(fplegend);

    const fpOptContainer = document.createElement('div');
    fpOptContainer.id = 'fpOptContainer';
    bubble.append(fpOptContainer);

    options.forEach(opt => {
        const div = document.createElement('div');
        fpOptContainer.append(div);

        const optId = `holopeek_${opt.id}`;
        const checkboxElem = document.createElement('input');
        checkboxElem.id = optId;
        checkboxElem.type = 'checkbox';

        const optFunc = () => {
            if (opt.func) opt.func(opt);
            if (document.getElementById(`${optId}_style`)) document.getElementById(`${optId}_style`).remove();
            if (opt.css && checkboxElem.checked) {
                const style = document.createElement('style');
                style.id = `${optId}_style`;
                if (style.styleSheet) style.styleSheet.cssText = opt.css;
                else style.appendChild(document.createTextNode(opt.css));
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }
        checkboxElem.onclick = () => optFunc();
        div.append(checkboxElem);

        // Load cookie option
        const parts = `; ${document.cookie}`.split(`; ${opt.id}=`);
        const cookie = (parts.length === 2) ? parts.pop().split(';').shift() : null;
        if (cookie) {
            const value = decodeURIComponent(escape(window.atob(cookie)));
            const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : null;
            if (valueElem) opt[valueElem].value = value;
            document.getElementById(`holopeek_${opt.id}`).checked = true;
            const interval = setInterval(() => {
                if (document.getElementsByClassName("userlist_item").length) {
                    clearInterval(interval);
                    optFunc();
                }
            }, 100);
        }

        const label = document.createElement('label');
        label.id = `${optId}_label`;
        label.innerHTML = opt.desc;
        label.title = opt.id;
        label.htmlFor = optId;
        div.append(label);

        if (opt.textarea) {
            const textareaElem = document.createElement('textarea');
            textareaElem.id = `${optId}_textarea`;
            if (opt.textarea.value) textareaElem.value = opt.textarea.value;
            if (opt.textarea.inputEvent) textareaElem.oninput = () => opt.textarea.inputEvent(opt);
            fpOptContainer.append(textareaElem);
        }

        if (opt.range) {
            const rangeElem = document.createElement('input');
            rangeElem.id = `${optId}_range`;
            rangeElem.type = 'range';
            rangeElem.style.display = 'inlineBlock !important';
            if (opt.range.min) rangeElem.min = opt.range.min;
            if (opt.range.max) rangeElem.max = opt.range.max;
            if (opt.range.step) rangeElem.step = opt.range.step;
            if (opt.range.value) rangeElem.defaultValue = opt.range.value;
            if (opt.range.inputEvent) rangeElem.oninput = () => opt.range.inputEvent(opt);
            fpOptContainer.append(rangeElem);
        }

        if (opt.text) {
            const textElem = document.createElement('input');
            textElem.id = `${optId}_text`;
            textElem.type = 'text';
            if (opt.text.value) textElem.value = opt.text.value;
            if (opt.text.inputEvent) textElem.oninput = () => opt.text.inputEvent(opt);
            fpOptContainer.append(textElem);
        }

        if (opt.setupFunc) opt.setupFunc(opt);
    });


    // --- Cookie buttons ---


    const cookieDiv = document.createElement('div');
    cookieDiv.id = 'cookieDiv';
    bubble.append(cookieDiv);

    const saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.innerHTML = 'Save<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGLTAk+Exw38csB6bhkc4lePQAhLGDsIZfmPTAtGAaTZOLfg0gLRguAC/BgaqacANqKuBjaGd4RkQtgNZRGnogPuggzgNT+EantJIA8lOItnTRAUr/uQNgo+Iz0Ag+JjBY9BmfgAjpbf/V5agRgAAAABJRU5ErkJggg==">';
    saveButton.onclick = () => options.forEach(opt => {
        const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : null;
        const value = valueElem ? opt[valueElem].value : document.getElementById(`holopeek_${opt.id}`).checked ? 1 : 0;
        document.cookie = document.getElementById(`holopeek_${opt.id}`).checked
            ? `${opt.id}=${window.btoa(unescape(encodeURIComponent(value)))};path=/;expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toGMTString()};`
            : `${opt.id}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });
    cookieDiv.append(saveButton);

    const resetButton = document.createElement('button');
    resetButton.id = 'resetButton';
    resetButton.innerHTML = 'Reset<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPElEQVQ4y2NgGAJAgeE+w38ovA/k4QH/8UDqaCADkGw+WRqIERvVMNQ1PMKaMB7h1uDB8BhD+WOg6OAGADZZd6fzGEl6AAAAAElFTkSuQmCC">';;
    resetButton.onclick = () => options.forEach(opt => {
        document.cookie = `${opt.id}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.getElementById(`holopeek_${opt.id}`).checked = false;
    });
    cookieDiv.append(resetButton);


    // --- holopeek css ---


    const css = `#holopeek {width: 57px;height: 60px;z-index: 2147483647;position: fixed;padding: 0;bottom: 0;right: 42px;border: none;outline: none;background: none;
        background-image: url('https:///raw.githubusercontent.com/om3tcw/r/emotes/holopeek/polkapeek.png');background-repeat: no-repeat;image-rendering: crisp-edges;}
        .holoAnim {animation: peek-out ease-in .2s both;}
        .holoAnim:hover {animation: peek-in ease-out .2s both;}
        @keyframes peek-in {from {background-position: 0px 60px;} to {background-position: 0px 0;}}
        @keyframes peek-out {from {background-position: 0px 0;} to {background-position: 0px 60px;}}
        #holoBubble {flex-grow: 0;flex-direction: column;padding: 12px 16px;z-index: 2147483647;position: fixed;bottom: 48px;right: 90px;background: #fff;border-radius: 8px;max-height:50%;}
        #holoBubble button {color: #000;}
        #holoBubble textarea {width: 100%;min-height: 128px;margin-bottom: 5px;resize: both;}
        #holoBubble label {color: #888;}
        #holoBubble input[type=checkbox] {margin-right: 8px;}
        #holoBubble input[type=range] {display: inline-block;margin-bottom: 5px;}
        #holoTail {width: 50px;height: 25px;z-index: 2147483647;position: fixed;bottom: 42px;right: 122px;background: #fff;transform: skew(15deg, 15deg);}
        #cookieDiv {margin-top: 12px;display:flex;}
        #cookieDiv button {width: 100%;display: flex;justify-content: center;align-items: center;}
        #cookieDiv button img {margin-left:4px}
        #fpOptContainer {overflow-y: scroll;display:flex;flex-direction:column}
        #resetButton {margin-left:16px}
        
        #pinContainer {display:flex;flex-direction:column-reverse;}
        #pin-dropdown>.dropdown-menu {width: 384px;max-height: calc(100vh - 50px);overflow-y:scroll;padding:0;margin:0;border:none;}
        #pinContainer>li {display:flex;flex-direction:row;align-items: center;margin:8px 0}
        .pin-message {width: calc(100% - 32px);overflow-wrap: break-word;padding: 0 4px;}
        .pin-close {width:24px;height:24px;border-radius:12px;margin: auto 4px;color:#fff;background:#888;border:none;outline:none;transition:.2s}
        .pin-close:hover {background:#ccc;color:#333}
        .navbar {background:#0008 !important;}`;
    const style = document.createElement('style');
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    document.getElementsByTagName('head')[0].appendChild(style);

})();

$('#messagebuffer').off('click').click(e => { 
    let t = e.target, p = t.parentElement;
    if(e.button != 0) return;
    if(t.className == 'channel-emote')
        $('#chatline').val((i, v) => v + e.target.title + " ").focus();
})

// --- Slav's Enhancements ---
var soundposts;

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
  
    parts.forEach((part) => {
      if (part) {
        if (part.startsWith("<")) {
          const mydelay = mynumber * -50;
          html += `<span style="display: inline-block; position: relative; z-index: -1; animation: wave .66s linear infinite ${mydelay}ms">${part}</span>`;
          mynumber++;
        } else {
          const characters = part.split('');
          characters.forEach((char) => {
            const mydelay = mynumber * -50;
            html += `<span style="display: inline-block; font-weight: bold; animation: wave .66s linear infinite ${mydelay}ms, glow 3s linear infinite">${char}</span>`;
            mynumber++;
          });
        }
      }
    });

    message.innerHTML = html;
}

function formatMessage(message){
    if (message.innerHTML.startsWith('/runescape'))
    {
        runescape(message);
    }
}

const messageBuffer = document.getElementById('messagebuffer');
let playedSoundposts = [];

const chatMsgElements = document.querySelectorAll('#messagebuffer [class|="chat-msg"]').forEach((element) => {
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
  
var soundpostState = getCookie("soundpostState") === "true" ? true : false;

const soundpostButton = document.createElement("button");
soundpostButton.style.backgroundImage = soundpostState
    ? "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/schizo.gif')"
    : "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/medicated.png')";
soundpostButton.style.backgroundSize = "contain";

let challengeActive = false;
let clickedDuringChallenge = false;

soundpostButton.addEventListener("click", () => {
    if (challengeActive) return;

    if (soundpostState) {
        challengeActive = true;
        clickedDuringChallenge = false;  

setTimeout(() => {
    soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/emotes/other/skiull.gif?" + new Date().getTime() + "')";
    soundpostButton.style.backgroundColor = "transparent";
}, 0);

        const initialSound = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/other/skillcheck.mp3');
        initialSound.play();

        setTimeout(() => {
            let clickWindowOpen = false;
            const clickWindowStart = 1100;
            const clickWindowEnd = clickWindowStart + 200;
            const clickHandler = () => {
                clickedDuringChallenge = true;
                if (clickWindowOpen) {
                    const successSound = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/other/success.mp3');
                    successSound.play();
                    soundpostState = false;
                    soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/medicated.png')";
                    setCookie("soundpostState", soundpostState);
                } else {
                    const failureSound = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/other/fail.ogg');
                    failureSound.play();
                    setTimeout(() => {
                        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/schizo.gif?" + new Date().getTime() + "')";
                    }, 0);
                }

                soundpostButton.removeEventListener("click", clickHandler);
            };
            soundpostButton.addEventListener("click", clickHandler);
            setTimeout(() => {
                clickWindowOpen = true;
                setTimeout(() => {
                    clickWindowOpen = false;
                }, 200);
            }, clickWindowStart);
            setTimeout(() => {
                if (!clickedDuringChallenge) {
                    const failureSound = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/other/fail.ogg');
                    failureSound.play();
                    setTimeout(() => {
                        soundpostButton.style.backgroundImage = "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/schizo.gif?" + new Date().getTime() + "')";
                    }, 0);
                }
                soundpostButton.removeEventListener("click", clickHandler);
                soundpostButton.disabled = true;
                setTimeout(() => {
                    challengeActive = false; 
                    soundpostButton.disabled = false;
                }, 150);
            }, 1300);
        }, 0);
    } else {
        soundpostState = !soundpostState;
        setCookie("soundpostState", soundpostState);
        soundpostButton.style.backgroundImage = soundpostState
            ? "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/schizo.gif')"
            : "url('https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/medicated.png')";
    }
});

const chatInputRow = document.getElementById("chatinputrow");
chatInputRow.appendChild(soundpostButton);

function nicomessage(myplayer, mycontainer, mymsg) {
    mycontainer.appendChild(mymsg);

    mymsg.addEventListener("transitionend", function() {
        mymsg.remove();
    }, { once: true });
	
	setTimeout(function() {
        mymsg.remove();
    }, 10000);

    let maxLane = Math.floor(myplayer.clientHeight / 32) - 1;
    let lane = Math.floor(Math.random() * (maxLane + 1));
    let playerWidth = myplayer.clientWidth;
    let thisWidth = mymsg.clientWidth;

    mymsg.style.top = (32 * lane) + 'px';
    mymsg.style['right'] = (0 - thisWidth) + 'px';
	mymsg.classList.add('moving');
    requestAnimationFrame(function() {
        mymsg.style.visibility = 'visible';
        mymsg.style['right'] = playerWidth + 'px';
    });
}

function nicoprocess(mymsg, myclass) {
    const container = document.getElementsByClassName("videochatContainer")[0];
    const player = document.getElementById("ytapiplayer");
    if (!container || !player)
        return;
    if (mymsg.innerHTML !== null && typeof mymsg.innerHTML === "string" && mymsg.innerHTML.trim().length > 0) {
        let txt = document.createElement("div");
        txt.classList.add('videoText');
        if (myclass && myclass.trim().length > 0)
            txt.classList.add(myclass);
        txt.style.visibility = "hidden";
        txt.innerHTML = mymsg.innerHTML;

        const imgs = txt.getElementsByTagName("img");
        let loadedImgs = 0;

        for (let i = 0; i < imgs.length; i++) {
            imgs[i].onload = function() {
                loadedImgs++;
                if (loadedImgs >= imgs.length)
                    nicomessage(player, container, txt);
            };
        }
        if (imgs.length === 0) {
            nicomessage(player, container, txt);
        }
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

socket.on("chatMsg", ({ username, msg, meta, time }) => {
	if( username.toLowerCase() !== '[server]' &&
		username.toLowerCase() !== '[voteskip]') {
			
		const mymessage = messageBuffer.lastElementChild.lastElementChild;
		formatMessage(mymessage);
		
//		if (!meta['addClass'])
//                meta['addClass'] = '';
//		nicoprocess(mymessage, meta.addClass);

		if(soundpostState){
			const emotes = mymessage.querySelectorAll('.channel-emote[title]');
			emotes.forEach((emote) => {
				const soundpost = soundposts[emote.title];
				if (soundpost !== undefined && !playedSoundposts.includes(soundpost.soundurl)) {
					var myaudio = new Audio(soundpost.soundurl);
					myaudio.volume = 0.1;
					myaudio.play();
					playedSoundposts.push(soundpost.soundurl);
				}
			});
			
			if (mymessage.innerHTML.startsWith('boo'))
			{
				var myaudio = new Audio("https://www.dl.dropboxusercontent.com/s/q5gcc34vb4g8ldyl9i3sj/boo.ogg?rlkey=kf608v08840vbm9ici0o9g404&dl=0");
					myaudio.volume = 0.1;
					myaudio.play();
			}
		}
		playedSoundposts = [];
	}
});
