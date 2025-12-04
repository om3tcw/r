function chatToVideoRatio(self) {
    self.cssData = 
        `#videowrap { width: ${100 - self.value}%}
        #videowrap-header { display: none; }
        #chatwrap { width: ${self.value}%}}` 
}

function chatTransparency(self) {
    const alpha = (100 - self.value) / 100;
    const bgColor = `rgba(0, 0, 0, ${alpha})`;
    self.cssData = 
        `#userlist, #messagebuffer { background-color: ${bgColor} !important; }
        .linewrap { background-color: ${bgColor}; }`
}

//test this with localstorage
//nuke it asap
function chatVideoOnly(self) {
    self.lunaButton = $('<button>', {id: 'lunaButton',});

    $('body').append(self.lunaButton);
    self.lunaButton.css({
        'width': '46px',
        'height': '100px',
        'background': `url('${CURRENT_CDN}/custom_modules/holopeek/lunapeek.png')`,
        'position': 'absolute',
        'right': '0',
        'top': '0',
        'padding': '0',
        'z-index': '2147483647',
        'border': 'none',
        'outline': 'none',
        'opacity': '0',
        'transition': '.25s'
        });
    self.lunaButton.hover(
        function mouseEnter() {
            $(this).css('opacity', 1);
        },
        function mouseLeave() {
            $(this).css('opacity', 0);
        }
    );
    
    const $chatwrap = $(chatwrap);
    self.cssData = `
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
        #lunaButton { display: block; !important; }`
    self.lunaButton.on('click', () => {
    const isToggled = $chatwrap.css('pointer-events') !== 'none';

    $chatwrap.css({
        'pointer-events': isToggled ? 'none' : 'all',
        'opacity': isToggled ? 0.25 : 1
    });
    
});
}

function changeHoloPeekImage(self) { 
    let imageUrl = self.inputElement.val();
    let $holoPeekImg = $('#holopeek_img')
    $holoPeekImg.css("background-image", `url(${imageUrl})`);
    window.setupAnimationForHoloPeekImg($holoPeekImg, imageUrl);
}

//Needs globally visible scope for the tabcontainer
function cleanupVerticalLayout(self) {
    window.$tabContainer.show();
}

//Globally visible scope update
function verticalLayout(self) {
    if ($("#videowrap").length < 1) {
        window.restoreVideo();
    }
    self.tabs = window.$tabContainer.hide();
    self.cssData = `
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

let blackBg = makeLiveCDNLink("emotes/custom_modules/holopeek/black.png");
let polkaPeek = makeLiveCDNLink("custom_modules/holopeek/polkapeek.png");

export const holoPeekObjects = [
    {
        optionName: "verticalLayout", 
        optionDescription: "Vertical Layout", 
        optionFunc: verticalLayout, 
        cleanupFunc: cleanupVerticalLayout
    },
    {
        optionName: "changeBackground", 
        optionDescription: "Custom Background", 
        optionFunc: (self) => self.cssData = `body { background-image: url(${self.inputElement.val()}); }`, 
        type: "text", 
        defaultValue: blackBg
    },
    {
        optionName: "changeHoloPeekImage", 
        optionDescription: "Change HoloPeek Image", 
        optionFunc: changeHoloPeekImage,
        type: "text", 
        defaultValue: polkaPeek
    },
    {
        optionName: "imageHover",
        optionDescription: "Image hover will never be real",
    },
    {
        optionName: "revealSpoilers",
        optionDescription: "Reveal Spoilers",
        optionFunc: (self) => self.cssData = `.spoiler { color: #ff8; }`,
    },
    {
        optionName: "chatToVideoRatio", 
        optionDescription: "Chat:Video Ratio",
        optionFunc: chatToVideoRatio,
        type: "range",
        defaultValue: 50
    },
    {
        optionName: "chatTransparency",
        optionDescription: "Chat Transparency",
        optionFunc: chatTransparency,
        type: "range",
        defaultValue: 50
    },
    {
        optionName: "invertChatPosition",
        optionDescription: "Invert Chat Position",
        optionFunc: (self) => self.cssData = `#main { flex-direction: row-reverse !important; }`
    },
    {
        optionName: "hidePlaylist",
        optionDescription: "Hide Playlist",
        optionFunc: (self) => self.cssData = `#MainTabContainer { display: none; }`
    },
    {
        optionName: "hideNavBar",
        optionDescription: "Hide Navbar",
        optionFunc: (self) => self.cssData = 
            `#mainpage { padding-top: 0 !important; }
            nav.navbar { display: none !important; }`
    },
    {
        optionName: "hideScrollbars",
        optionDescription: "Hide Scrollbars",
        optionFunc: (self) => self.cssData = 
            `::-webkit-scrollbar { width: 0 !important; }
            * { scrollbar-width: none !important; }`
    },
    {
        optionName: "chatVideoOnly",
        optionDescription: "Chat & Video only",
        optionFunc: chatVideoOnly,
        cleanupFunc: (self) => self.lunaButton.remove(),
    },
	{
        optionName: "nndMode",
        optionDescription: "NND Mode",
        optionFunc: (self) => {
            const enabled = self.checkbox.prop('checked');
            localStorage.setItem('holopeek_nndMode', enabled);
            window.toggleNNDMode(enabled);
        },
        cleanupFunc: () => {
            localStorage.removeItem('holopeek_nndMode');
            window.toggleNNDMode(false);
        }
    },
	{
		optionName: "christmasSnow",
		optionDescription: "Snow",
		optionFunc: (self) => {
			if (self.checkbox.prop('checked')) {
				self.cssData = `#snow-container { display: block !important; }`;
			} else {
				self.cssData = `#snow-container { display: none !important; }`;
			}
		},
		cleanupFunc: (self) => {
			self.cssData = `#snow-container { display: none !important; }`;
		},
		defaultChecked: true
	},
    {
        optionName: "customCSS",
        optionDescription: "Custom CSS",
        type: "textarea",
        optionFunc: (self) => self.cssData = self.value
    }
]
