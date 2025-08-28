let customCss = `
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
    `;
