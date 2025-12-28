const STYLES = {
    CONFETTI_STYLE: `custom_modules/custom_css_injection/confetti-css.js`,
    HOLOPEEK_STYLE: `custom_modules/custom_css_injection/holoPeek-css.js`,
    SNOW_STYLE: `custom_modules/custom_css_injection/snow-css.js`,
    PLAYER_STYLE: `custom_modules/custom_css_injection/sublime-player-css.js`
}

$(document).ready(() => {
    for (const styleURL of Object.values(STYLES)) {
        import(makeLiveCDNLink(styleURL));
    }
})
