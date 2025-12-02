(function injectSnowStyles() {
  // Inject HTML once (check if exists to avoid duplicates)
  if (!document.getElementById('snow-container')) {
    const snowContainer = document.createElement('div');
    snowContainer.id = 'snow-container';
    snowContainer.style.display = 'none'; // Hidden by default
    document.body.appendChild(snowContainer);

    // Generate 50 snowflakes
    for (let i = 0; i < 50; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = '❄'; // Unicode snowflake; alternatives: '✻' or '❅'
      snowContainer.appendChild(flake);
    }
  }

  const cssSnow = `
    #snow-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999; /* On top of everything */
      display: none; /* Toggled via HoloPeek */
    }

    .snowflake {
      position: absolute;
      color: #fff;
      font-size: 1em; /* Randomize sizes in JS if needed, or use classes */
      text-shadow: 0 0 1px #000;
      user-select: none;
      animation: snowFall linear infinite, snowSway ease-in-out infinite;
    }

    /* Base fall animation: top to bottom */
    @keyframes snowFall {
      0% { top: -10%; }
      100% { top: 100vh; }
    }

    /* Sway animation: left-right wiggle */
    @keyframes snowSway {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); } /* Adjust for more/less sway */
    }

    /* Unique delays and durations for each flake (simulates randomness) */
    .snowflake:nth-of-type(1) { left: 10%; animation-duration: 10s, 3s; animation-delay: 0s, 0s; font-size: 0.8em; }
    .snowflake:nth-of-type(2) { left: 20%; animation-duration: 12s, 2s; animation-delay: 2s, 1s; font-size: 1.2em; opacity: 0.9; }
    .snowflake:nth-of-type(3) { left: 30%; animation-duration: 15s, 4s; animation-delay: 5s, 0.5s; font-size: 0.6em; }
    .snowflake:nth-of-type(4) { left: 40%; animation-duration: 8s, 2.5s; animation-delay: 1s, 2s; font-size: 1em; }
    .snowflake:nth-of-type(5) { left: 50%; animation-duration: 11s, 3s; animation-delay: 3s, 1.5s; font-size: 0.9em; }
    .snowflake:nth-of-type(6) { left: 60%; animation-duration: 13s, 2s; animation-delay: 4s, 0s; font-size: 1.1em; }
    .snowflake:nth-of-type(7) { left: 70%; animation-duration: 9s, 3.5s; animation-delay: 6s, 2s; font-size: 0.7em; }
    .snowflake:nth-of-type(8) { left: 80%; animation-duration: 14s, 2s; animation-delay: 1.5s, 1s; font-size: 1em; }
    .snowflake:nth-of-type(9) { left: 90%; animation-duration: 10s, 4s; animation-delay: 7s, 0.5s; font-size: 0.8em; }
    .snowflake:nth-of-type(10) { left: 5%; animation-duration: 12s, 3s; animation-delay: 0.5s, 2s; font-size: 1.3em; }
    /* ... Continue this pattern up to nth-of-type(50) for full effect. Vary left (1-100%), duration (8-15s), delay (0-7s), font-size (0.5-1.5em), and opacity (0.7-1) for variety. */

    /* Repeat for 11-50 with varied values... (abbreviated for brevity; generate via loop in JS if preferred) */
    .snowflake:nth-of-type(11) { left: 15%; animation-duration: 11s, 2.5s; animation-delay: 2.5s, 1.5s; font-size: 0.9em; }
    /* ... (up to 50) */
  `;

  const $styleElement = $('<style>');
  $styleElement.text(cssSnow);
  $('head').append($styleElement);
})();
