const STYLES = {
    CONFETTI_STYLE: `custom_modules/custom_css_injection/confetti-css.js`,
    HOLOPEEK_STYLE: `custom_modules/custom_css_injection/holoPeek-css.js`,
    MIKU_MIKU_BEAM_STYLE: `custom_modules/custom_css_injection/mikuMikuBeam-css.js`,
    MIGOBOTE_GOLD_STYLE: `custom_modules/custom_css_injection/migobotegold-css.js`,
    SNOW_STYLE: `custom_modules/custom_css_injection/snow-css.js`,
    UOH_MODE_STYLE: `custom_modules/custom_css_injection/uohmode-css.js`,
    PLAYER_STYLE: `custom_modules/custom_css_injection/sublime-player-css.js`
}

$(document).ready(() => {
    for (const styleURL of Object.values(STYLES)) {
        import(makeLiveCDNLink(styleURL));
    }
})
