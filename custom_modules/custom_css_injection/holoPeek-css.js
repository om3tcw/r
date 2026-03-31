(function injectHoloPeekStyle() {
    const cssHoloPeek = `
        #holopeek {
            z-index: 40000;
            position: fixed;
            padding: 0;
            bottom: 0px;
            right: calc(100px + 5vw);
            border: none;
            outline: none;
            background: none;
        }

        #holopeek_img {
            position: relative;
            width: 100%;
            height: 100%;
            bottom: 0px;
            background-size: contain;
            z-index: -39999;
            background-repeat: no-repeat;
            pointer-events: none;
            background-position: bottom;
        }

        #holopeek > #holopeek_img {
            background-position: bottom;
            animation: peek-out ease-in 0.2s both;
        }

        #holopeek:hover > #holopeek_img {
            animation: peek-in ease-out 0.2s both;
        }


        @keyframes peek-in {
        from { background-position-y: calc(100% + var(--holoPeek-img-y-offset)); }
        to { background-position-y: bottom; }
        }

        @keyframes peek-out {
        from { background-position-y: bottom; }
        to { background-position-y: calc(100% + var(--holoPeek-img-y-offset)); }
        }

        #holoPeekBubble {
            padding: 1.1vh 12px;
            z-index: 4000;
            position: fixed;
            bottom: 6.5vh;
            right: 6.5vw;
            background: #fff;
            border-radius: 8px;
            height: 50%;
        }
        #holoPeekBubbleTail {
            width: 7vw;
            height: 9vh;
            z-index: 2147483647;
            position: fixed;
            bottom: 6vh;
            right: 9.5vw;
            background: #fff;
            transform: skew(15deg, 15deg);
            z-index: 5;
        }
        #holoPeekBubble button {
            color: #000;
            z-index: 50;
        }
        #holoPeekBubble textarea {
            width: 95%;
            min-height: 128px;
        }
        #holoPeekBubble label {
            position: relative;
            z-index: 50;
            color: #888;
        }
        #holoPeekBubble input:not([type="checkbox"]) {
            display: block;
            margin-bottom: 5px;
            width: 95%
        }
        #holoPeekBubble input[type=checkbox] {
            margin-right: 8px;
            margin-left: 5px
        }
        #localStorageButtonsDiv {
            padding-top: 1vh;
            margin-top: 1px;
            display: flex;
        }
        #localStorageButtonsDiv button {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #localStorageButtonsDiv button img {
            margin-left: 4px;
        }
        #holoPeekItemsContainer {
            align-items: flex-start;
            overflow-y: scroll;
            display: inline-flex;
            flex-direction: column;
            height: 80%;
            max-height: 83%;
        }
        .holoPeekGroup {
            width: 100%;
            margin-bottom: 6px;
        }
        .holoPeekGroupToggle {
            width: 95%;
            text-align: left;
            border: none;
            background: #eee;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 700;
        }
        .holoPeekGroupItems {
            padding-top: 4px;
        }
        #shared-tts-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 95%;
            padding: 4px 5px 8px;
        }
        #shared-tts-controls .shared-tts-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #shared-tts-controls .shared-tts-row button {
            flex: 1 1 auto;
        }
        #shared-tts-controls input[type="range"] {
            width: 100%;
            margin: 0;
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
    const $styleElement = $("<style>");

    $styleElement.text(cssHoloPeek);

    $("head").append($styleElement);
})();
