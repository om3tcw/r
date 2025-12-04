// custom_modules/custom_css_injection/snow-css.js  ←  overwrite with this
(function injectGorgeousSnow() {
  if (document.getElementById('snow-container')) return;

  const container = document.createElement('div');
  container.id = 'snow-container';
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
    display: none;
  `;
  document.body.appendChild(container);

  // Generate all 350 flakes with unique properties
  const totalFlakes = 250 + 50 + 50;
  const flakeChars = ['❄', '❅', '❆', '✻', '✼', '❉', '❈'];

  for (let i = 1; i <= totalFlakes; i++) {
    const flake = document.createElement('div');
    flake.textContent = flakeChars[Math.floor(Math.random() * flakeChars.length)];
    flake.className = 'snowflake';

    let sizeClass = '';
    let fontSize = '1em';

    if (i <= 250) {
      // small
      fontSize = '0.8em';
    } else if (i <= 300) {
      // medium
      sizeClass = ' _md';
      fontSize = '1.5em';
    } else {
      // large
      sizeClass = ' _lg';
      fontSize = '2.25em';
    }

    const left = Math.random() * 120 - 20;           // -20vw to 100vw
    const blur = Math.random() < 0.5 ? 0 : 1;         // 50% chance of slight blur
    const flickrDuration = (Math.random() * 2 + 2); // 2–4s
    const flickrDelay = Math.random() * -2;
    const fallDuration = Math.random() * 20 + 10;    // 10–30s
    const fallDelay = Math.random() * -10;
    const drift = Math.random() * 40 - 20;           // -20vw to +20vw drift

    flake.style.cssText = `
      position: absolute;
      top: -10vh;
      left: ${left}vw;
      font-size: ${fontSize};
      color: #fff;
      opacity: 0.9;
      filter: blur(${blur}px);
      user-select: none;
      text-shadow: 0 0 10px rgba(255,255,255,0.8);
      animation:
        flickr ${flickrDuration}s ease-in-out ${flickrDelay}s infinite,
        fall-${i} ${fallDuration}s linear ${fallDelay}s infinite;
      will-change: transform, opacity;
    `;

    // Unique fall animation per flake (with custom drift)
    const style = document.createElement('style');
    style.textContent += `
      @keyframes fall-${i} {
        0%   { transform: translate(0, 0) rotate(0deg); }
        100% { transform: translate(${drift}vw, 110vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    container.appendChild(flake);
  }

  // Global animations
  const globalStyle = document.createElement('style');
  globalStyle.textContent = `
    @keyframes flickr {
      0%, 100% { opacity: 0.9; }
      50%      { opacity: 0.2; }
    }
    #snow-container.show { display: block !important; }
  `;
  document.head.appendChild(globalStyle);
})();