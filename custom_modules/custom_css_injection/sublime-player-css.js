(function injectSublimePlayerStyle() {
    const cssSublime = `
        .video-js {
            font-size: 10px;
            color: #fff;
        }

        .vjs-sublime-skin .vjs-big-play-button {
            font-size: 8em;
            line-height: 1.5em;
            height: 1.5em;
            width: 3em;
            border: 0;
            border-radius: 0.3em;
            left: 50%;
            top: 50%;
            margin-left: -1.5em;
            margin-top: -0.75em;
        }

        .video-js .vjs-control-bar,
        .video-js .vjs-big-play-button,
        .video-js .vjs-volume-menu-button .vjs-menu-content,
        .video-js .vjs-volume-panel .vjs-volume-control {
            background-color: transparent;
        }

        .video-js .vjs-slider {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            height: 6.5px;
            display: flex !important;
            align-items: center !important;
        }

        .video-js .vjs-volume-level,
        .video-js .vjs-play-progress,
        .video-js .vjs-slider-bar {
            background: #fff;
        }

        .video-js .vjs-play-progress:before,
        .video-js .vjs-volume-level:before {
            content: "" !important;
            display: block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            position: absolute;
            top: 45% !important;
            right: -6px;
            transform: translateY(-50%) !important;
            margin: 0 !important;
            z-index: 1;
        }

        .video-js .vjs-progress-holder .vjs-load-progress,
        .video-js .vjs-progress-holder .vjs-load-progress div,
        .video-js .vjs-progress-holder .vjs-play-progress,
        .video-js .vjs-progress-holder .vjs-tooltip-progress-bar {
            height: 6.5px;
        }

        .video-js .vjs-load-progress {
            background: rgba(115, 133, 159, 0.5);
        }

        .video-js .vjs-load-progress div {
            background: rgba(115, 133, 159, 0.75);
        }

        .vjs-sublime-skin .vjs-poster {
            outline: none;
            outline: 0;
        }

        .vjs-sublime-skin:hover .vjs-big-play-button {
            background-color: transparent;
        }

        .vjs-sublime-skin .vjs-fullscreen-control:before,
        .vjs-sublime-skin.vjs-fullscreen .vjs-fullscreen-control:before {
            content: '';
        }

        .vjs-sublime-skin.vjs-fullscreen .vjs-fullscreen-control {
            background: #fff;
        }

        .vjs-sublime-skin .vjs-fullscreen-control {
            border: 3px solid #fff;
            box-sizing: border-box;
            cursor: pointer;
            margin-top: -7px;
            top: 50%;
            height: 14px;
            width: 22px;
            margin-right: 10px;
        }

        .vjs-sublime-skin.vjs-fullscreen .vjs-fullscreen-control:after {
            background: #000;
            content: "";
            display: block;
            position: absolute;
            bottom: 0;
            left: 0;
            height: 5px;
            width: 5px;
        }

        .vjs-sublime-skin .vjs-progress-holder {
            margin: 0;
        }

        .vjs-sublime-skin .vjs-progress-control .vjs-progress-holder:after {
            border-radius: 2px;
            display: block;
            height: 6.5px;
        }

        .vjs-sublime-skin .vjs-progress-control .vjs-load-progress,
        .vjs-sublime-skin .vjs-progress-control .vjs-play-progress {
            border-radius: 2px;
            height: 6.5px;
        }

        .vjs-sublime-skin .vjs-playback-rate {
            display: none;
        }

        .vjs-sublime-skin .vjs-progress-control {
            margin-right: 50px;
        }

        .vjs-sublime-skin .vjs-time-control {
            right: 55px;
            display: block;
            position: absolute;
        }

        .vjs-sublime-skin .vjs-volume-menu-button,
        .vjs-sublime-skin .vjs-volume-panel {
            width: 6em;
            position: absolute;
            right: 0;
            margin-right: 30px;
        }

        .vjs-sublime-skin .vjs-volume-bar {
            height: 6.5px;
            width: 100%;
            margin: 0;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.3) !important;
        }

        .vjs-sublime-skin .vjs-volume-level {
            height: 6.5px;
            background: #fff !important;
        }

        .vjs-sublime-skin .vjs-volume-panel .vjs-volume-control {
            display: flex !important;
            align-items: center !important;
            position: relative;
            left: 5px;
            opacity: 1;
            width: 3em;
            height: 30px;
        }

        .video-js .vjs-current-time { display: block; }
        .video-js .vjs-time-divider { display: block; }
        .video-js .vjs-duration { display: block; }
        .video-js .vjs-remaining-time { display: none; }
    `;
    const $styleElement = $("<style>");
    $styleElement.text(cssSublime);
    $("head").append($styleElement);
})();