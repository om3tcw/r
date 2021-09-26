(() => {
    'use strict';

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
    userGuide.href = "https://github.com/om3tcw/r/blob/emotes/holopeek/User%20Guide.txt";
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
            value: 'https://raw.githubusercontent.com/om3tcw/r/emotes/holopeek/black.png',
            inputEvent: self => {
                document.getElementById(`holopeek_${self.id}`).checked = false;
                self.text.value = document.getElementById(`holopeek_${self.id}_text`).value;
            }
        }
    }, {
        id: 'poll_alert',
        desc: 'Add a poll sound alert',
        func: self => pollAlert = !pollAlert
    }, {
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
            #lunaButton {width:46px;height:100px;background: url('https://raw.githubusercontent.com/om3tcw/r/emotes/holopeek/lunapeek.png');position:absolute;right:0;top:0;padding: 0;z-index: 2147483647;border: none;outline: none;display:none;opacity:0;transition:.25s}
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
form input#chatline {padding: 0 0 0 64px;height:32px}
#emotebtndiv + form {background-color: #000a;image-rendering: pixelated;}
form input#chatline {background-position: -32px -16px;background-size: 88px;}
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
   
    }];

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
        background-image: url('https://raw.githubusercontent.com/om3tcw/r/emotes/holopeek/polkapeek.png');background-repeat: no-repeat;image-rendering: crisp-edges;}
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
