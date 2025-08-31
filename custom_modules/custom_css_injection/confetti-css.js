(function injectConfettiStyles() {
  const cssConfetti = `
    @keyframes confettiExplode {
      0% {
        transform: translate(0, 0) rotate(0deg) scale(0);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translate(var(--explodeX), var(--explodeY)) rotate(var(--rotation)) scale(1);
        opacity: 1;
      }
    }

    @keyframes confettiFall {
      0% {
        transform: translate(var(--explodeX), var(--explodeY)) rotate(var(--rotation));
        opacity: 1;
      }
      100% {
        transform: translate(var(--fallX), calc(var(--explodeY) + 100vh)) rotate(calc(var(--rotation) + 360deg));
        opacity: 0;
      }
    }

    .confetti {
      position: fixed;
      width: 12px;
      height: 12px;
      background-color: var(--color);
      transform-origin: center;
      z-index: 4;
    }

    .confetti.circle {
      border-radius: 50%;
    }

    .confetti.triangle {
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }

    .confetti.square {
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    }

    .confetti.star {
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    }

    .confetti.heart {
      clip-path: path('M0.5,1 C0.5,0 0,0.5 0,0.5 C0,0.5 0.5,0 0.5,0 C0.5,0 1,0.5 1,0.5 C1,0.5 0.5,1 0.5,1 Z');
    }

    `;
  const $styleElement = $('<style>');

  $styleElement.text(cssConfetti);

  $('head').append($styleElement);
})();

