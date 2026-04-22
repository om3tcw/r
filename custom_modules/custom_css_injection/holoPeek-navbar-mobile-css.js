(function injectHoloPeekNavbarMobileStyle() {
    const cssHoloPeekNavbarMobile = `
        #holopeek-navbar-item > #holopeek {
            position: relative;
            z-index: 40000;
            bottom: auto;
            right: auto;
            display: block;
            cursor: pointer;
        }

        #holopeek-navbar-item #holoPeekBubble {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: fixed;
            top: 52px;
            right: 8px;
            bottom: auto;
            left: 8px;
            width: auto;
            height: min(62vh, 420px);
            max-height: calc(100vh - 120px);
        }

        #holopeek-navbar-item #holoPeekItemsContainer {
            align-items: center;
            width: 100%;
        }

        #holopeek-navbar-item .holoPeekGroupToggle {
            text-align: center;
        }
    `;

    const $styleElement = $("<style>");
    $styleElement.text(cssHoloPeekNavbarMobile);
    $("head").append($styleElement);
})();
