(function injectTimeTokenStyles() {
  const cssTimeToken = `
    #time-token-composer-popup {
      position: absolute;
      z-index: 40010;
      min-width: 280px;
      max-width: min(440px, calc(100vw - 16px));
      color: #f2f4f8;
      background: rgba(30, 33, 40, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 7px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38);
      overflow: hidden;
      backdrop-filter: blur(6px);
    }

    #time-token-composer-popup.time-token-composer-hidden {
      display: none;
    }

    #time-token-composer-popup .time-token-composer-header {
      padding: 8px 10px 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: rgba(242, 244, 248, 0.8);
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #time-token-composer-popup .time-token-composer-content {
      max-height: min(300px, 42vh);
      overflow-y: auto;
      padding: 4px 0;
    }

    #time-token-composer-popup .time-token-composer-group + .time-token-composer-group {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    #time-token-composer-popup .time-token-composer-group-label {
      padding: 6px 10px 3px;
      font-size: 10px;
      font-weight: 600;
      text-align: right;
      color: rgba(242, 244, 248, 0.52);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    #time-token-composer-popup .time-token-composer-option {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 8px;
      padding: 6px 10px;
      border: 0;
      color: inherit;
      background: transparent;
      text-align: left;
      transition: background-color 120ms ease;
    }

    #time-token-composer-popup .time-token-composer-option:hover,
    #time-token-composer-popup .time-token-composer-option:focus,
    #time-token-composer-popup .time-token-composer-option.time-token-composer-option-active {
      outline: none;
      background: #2f6fbb;
    }

    #time-token-composer-popup .time-token-composer-option-preview {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 14px;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #time-token-composer-popup .time-token-composer-option-label {
      flex: 0 0 auto;
      font-size: 11px;
      color: rgba(242, 244, 248, 0.7);
      text-transform: none;
    }

    #time-token-composer-popup .time-token-composer-option.time-token-composer-option-active .time-token-composer-option-label,
    #time-token-composer-popup .time-token-composer-option:hover .time-token-composer-option-label {
      color: rgba(255, 255, 255, 0.84);
    }

    #time-token-composer-popup .time-token-composer-empty {
      padding: 10px;
      font-size: 12px;
      line-height: 1.4;
      color: rgba(242, 244, 248, 0.72);
    }

    time.time-token-rendered {
      display: inline-flex;
      align-items: center;
      padding: 0 0.28em;
      border-radius: 4px;
      color: #edf5ff;
      background: rgba(55, 88, 132, 0.46);
      white-space: nowrap;
    }
  `;

  $("<style>").text(cssTimeToken).appendTo("head");
})();
