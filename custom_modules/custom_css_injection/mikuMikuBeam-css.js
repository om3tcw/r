(function injectMikuMikuBeamStyles() {
  const styleId = "miku-miku-beam-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const cssMikuMikuBeam = `
    :root {
      --miku-miku-beam-emitter-image-url: url("https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/takomiku.png");
      --miku-miku-beam-active-duration: 8000ms;
      --miku-miku-beam-fire-delay: 10350ms;
      --miku-miku-beam-impact-spark-delay: 10520ms;
    }

    #miku-miku-beam-overlay {
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 2147483000;
    }

    #miku-miku-beam-overlay:empty {
      display: none;
    }

    .miku-miku-beam-shot {
      position: absolute;
      inset: 0;
    }

    .miku-miku-beam-label {
      position: fixed;
      min-width: 230px;
      max-width: min(420px, calc(100vw - 32px));
      padding: 8px 14px;
      border: 1px solid rgba(176, 255, 248, 0.78);
      border-radius: 999px;
      background:
        linear-gradient(135deg, rgba(9, 34, 45, 0.96), rgba(4, 93, 117, 0.84)),
        linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0));
      color: #f3ffff;
      font: 700 12px/1.25 "Trebuchet MS", Verdana, sans-serif;
      letter-spacing: 0.08em;
      text-align: center;
      white-space: normal;
      box-shadow:
        0 0 18px rgba(34, 255, 244, 0.34),
        inset 0 0 10px rgba(255, 255, 255, 0.18);
      opacity: 0;
      transform: translate(56px, 10px) scale(0.92);
      animation: miku-miku-beam-label-in 0.68s ease-out forwards;
    }

    .miku-miku-beam-label.is-counting {
      animation:
        miku-miku-beam-label-in 0.68s ease-out forwards,
        miku-miku-beam-label-hum 1.15s ease-in-out 0.7s infinite;
    }

    .miku-miku-beam-label-text {
      display: block;
      opacity: 1;
      transform: scale(1);
      overflow-wrap: anywhere;
    }

    .miku-miku-beam-label-text.miku-miku-beam-callout {
      letter-spacing: 0.04em;
      text-shadow: 0 0 10px rgba(201, 255, 255, 0.7);
    }

    .miku-miku-beam-label-text.miku-miku-beam-step-pop {
      animation: miku-miku-beam-step-pop 0.32s ease-out;
    }

    .miku-miku-beam-emitter {
      position: fixed;
      width: 144px;
      height: 144px;
      opacity: 0;
      background: center / contain no-repeat;
      filter:
        drop-shadow(0 0 16px rgba(64, 255, 223, 0.42))
        drop-shadow(0 0 38px rgba(34, 151, 255, 0.28));
      transform: translate(calc(-50% + 240px), -50%) scaleX(-1) scale(0.18);
      animation:
        miku-miku-beam-emitter-enter 2.4s cubic-bezier(0.18, 0.9, 0.2, 1)
        forwards;
    }

    .miku-miku-beam-emitter::before,
    .miku-miku-beam-emitter::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    .miku-miku-beam-emitter::before {
      background:
        var(
          --miku-miku-beam-emitter-image-url,
          url("https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/takomiku.png")
        )
        center / contain no-repeat;
      animation:
        miku-miku-beam-emitter-core 0.8s linear 0.2s infinite,
        miku-miku-beam-emitter-firing
        var(--miku-miku-beam-active-duration, 8000ms) linear
        var(--miku-miku-beam-fire-delay, 10350ms) forwards;
    }

    .miku-miku-beam-emitter::after {
      inset: 8px;
      border-radius: 50%;
      background:
        radial-gradient(circle, rgba(183, 255, 250, 0.56) 0 18%, rgba(63, 232, 255, 0.24) 18% 42%, rgba(63, 232, 255, 0) 42% 100%);
      filter: blur(10px);
      opacity: 0;
      animation:
        miku-miku-beam-emitter-halo 0.9s ease-out 1.7s forwards,
        miku-miku-beam-emitter-charge 0.72s ease-out 2.45s forwards,
        miku-miku-beam-emitter-burn-glow
        var(--miku-miku-beam-active-duration, 8000ms) linear
        var(--miku-miku-beam-fire-delay, 10350ms) forwards;
    }

    .miku-miku-beam-pivot {
      position: fixed;
      width: 0;
      height: 0;
      transform-origin: 0 50%;
    }

    .miku-miku-beam-ray {
      position: absolute;
      left: 0;
      top: -15px;
      height: 30px;
      border-radius: 999px;
      opacity: 0;
      transform: scaleX(0.05);
      transform-origin: 0 50%;
      background:
        radial-gradient(circle at 0 50%, rgba(255, 255, 255, 0.94) 0 7%, rgba(255, 255, 255, 0) 20%),
        linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0 7%, rgba(218, 255, 252, 0.98) 7% 18%, rgba(145, 255, 239, 0.96) 18% 42%, rgba(82, 232, 255, 0.9) 42% 70%, rgba(63, 176, 255, 0.56) 70% 88%, rgba(63, 176, 255, 0) 100%);
      box-shadow:
        0 0 12px rgba(255, 255, 255, 0.88),
        0 0 28px rgba(39, 255, 232, 0.88),
        0 0 72px rgba(39, 157, 255, 0.56);
      overflow: visible;
      backface-visibility: hidden;
      will-change: transform, opacity;
      animation:
        miku-miku-beam-fire var(--miku-miku-beam-active-duration, 8000ms)
        linear var(--miku-miku-beam-fire-delay, 10350ms) forwards;
    }

    .miku-miku-beam-ray::before,
    .miku-miku-beam-ray::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
    }

    .miku-miku-beam-ray::before {
      inset: 9px -2px;
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.96) 26%, rgba(255, 255, 255, 0.7) 62%, rgba(255, 255, 255, 0.18) 86%, rgba(255, 255, 255, 0) 100%);
      box-shadow:
        0 0 18px rgba(255, 255, 255, 0.96),
        0 0 32px rgba(196, 255, 255, 0.52);
      filter: blur(0.3px);
      animation: miku-miku-beam-core-pulse 1.25s ease-in-out infinite;
    }

    .miku-miku-beam-ray::after {
      inset: -18px -10px;
      background:
        linear-gradient(90deg, rgba(122, 255, 245, 0.1) 0%, rgba(228, 255, 253, 0.36) 18%, rgba(114, 255, 244, 0.26) 54%, rgba(114, 255, 244, 0) 100%);
      opacity: 0.86;
      filter: blur(12px);
      animation: miku-miku-beam-sheen 1.5s linear infinite;
    }

    .miku-miku-beam-impact {
      position: fixed;
      width: 108px;
      height: 108px;
      border-radius: 50%;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.2);
      background:
        radial-gradient(circle, rgba(255, 255, 255, 0.98) 0 10%, rgba(225, 255, 252, 0.96) 10% 24%, rgba(112, 255, 232, 0.84) 24% 42%, rgba(36, 186, 255, 0.4) 42% 70%, rgba(36, 186, 255, 0) 70% 100%);
      box-shadow:
        0 0 24px rgba(255, 255, 255, 0.82),
        0 0 60px rgba(71, 245, 255, 0.84),
        0 0 100px rgba(31, 151, 255, 0.32);
      animation:
        miku-miku-beam-impact var(--miku-miku-beam-active-duration, 8000ms)
        linear var(--miku-miku-beam-fire-delay, 10350ms) forwards;
    }

    .miku-miku-beam-impact::before,
    .miku-miku-beam-impact::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }

    .miku-miku-beam-impact::before {
      border: 2px solid rgba(196, 255, 255, 0.9);
      box-shadow: 0 0 18px rgba(154, 255, 246, 0.64);
      opacity: 0;
      animation:
        miku-miku-beam-impact-ring 0.56s ease-out
        var(--miku-miku-beam-impact-spark-delay, 10520ms) forwards;
    }

    .miku-miku-beam-impact::after {
      inset: -24px;
      background:
        conic-gradient(
          from 0deg,
          rgba(255, 255, 255, 0) 0deg 32deg,
          rgba(152, 255, 247, 0.8) 32deg 52deg,
          rgba(255, 255, 255, 0) 52deg 108deg,
          rgba(152, 255, 247, 0.72) 108deg 126deg,
          rgba(255, 255, 255, 0) 126deg 214deg,
          rgba(152, 255, 247, 0.76) 214deg 238deg,
          rgba(255, 255, 255, 0) 238deg 360deg
        );
      filter: blur(2px);
      opacity: 0;
      animation:
        miku-miku-beam-sparks 0.54s ease-out
        var(--miku-miku-beam-impact-spark-delay, 10520ms) forwards;
    }

    #messagebuffer > div.miku-miku-beam-targeting,
    #messagebuffer > div.miku-miku-beam-disintegrating {
      position: relative;
      isolation: isolate;
    }

    #messagebuffer > div.miku-miku-beam-targeting {
      z-index: 1;
      filter: brightness(1.12) saturate(1.28);
    }

    #messagebuffer > div.miku-miku-beam-targeting::after {
      content: "";
      position: absolute;
      inset: -3px -7px;
      border: 1px solid rgba(157, 255, 247, 0.92);
      border-radius: 5px;
      box-shadow:
        0 0 12px rgba(78, 255, 243, 0.62),
        inset 0 0 12px rgba(206, 255, 255, 0.3);
      opacity: 0;
      animation: miku-miku-beam-lock-on 0.38s ease-out forwards;
      pointer-events: none;
    }

    #messagebuffer > div.miku-miku-beam-disintegrating {
      pointer-events: none;
      overflow: hidden;
      transform-origin: 50% 50%;
      will-change: transform, filter, opacity;
      box-shadow:
        0 0 18px rgba(255, 173, 71, 0.26),
        0 0 44px rgba(255, 72, 0, 0.16);
      animation:
        miku-miku-beam-disintegrate var(--miku-miku-beam-active-duration, 8000ms)
        linear forwards;
    }

    #messagebuffer > div.miku-miku-beam-disintegrating::before,
    #messagebuffer > div.miku-miku-beam-disintegrating::after {
      content: "";
      position: absolute;
      inset: -3px;
      pointer-events: none;
    }

    #messagebuffer > div.miku-miku-beam-disintegrating::before {
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(216, 255, 252, 0.86) 42%, rgba(79, 255, 237, 0.96) 54%, rgba(255, 255, 255, 0) 100%);
      filter: blur(8px);
      mix-blend-mode: screen;
      transform: translateX(120%) skewX(-18deg);
      animation:
        miku-miku-beam-sweep var(--miku-miku-beam-active-duration, 8000ms)
        linear forwards;
    }

    #messagebuffer > div.miku-miku-beam-disintegrating::after {
      background:
        radial-gradient(circle at 50% 52%, rgba(255, 252, 238, 0.34) 0 10%, rgba(255, 214, 114, 0.28) 18%, rgba(255, 120, 16, 0.18) 34%, rgba(255, 120, 16, 0) 60%),
        linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 224, 146, 0.18) 28%, rgba(255, 128, 22, 0.24) 62%, rgba(255, 70, 0, 0.08) 100%),
        radial-gradient(circle at 18% 48%, rgba(255, 244, 210, 0.18) 0 4%, rgba(255, 244, 210, 0) 16%),
        radial-gradient(circle at 58% 52%, rgba(255, 216, 146, 0.18) 0 5%, rgba(255, 216, 146, 0) 18%),
        radial-gradient(circle at 84% 46%, rgba(255, 162, 92, 0.22) 0 4%, rgba(255, 162, 92, 0) 16%);
      background-repeat: no-repeat;
      mix-blend-mode: screen;
      opacity: 0;
      filter: blur(0.5px) saturate(1.08);
      animation:
        miku-miku-beam-fragments var(--miku-miku-beam-active-duration, 8000ms)
        linear forwards,
        miku-miku-beam-heat-bloom
        var(--miku-miku-beam-active-duration, 8000ms) linear forwards;
    }

    @keyframes miku-miku-beam-label-in {
      0% { opacity: 0; transform: translate(56px, 10px) scale(0.92); }
      100% { opacity: 1; transform: translate(0, 0) scale(1); }
    }

    @keyframes miku-miku-beam-label-hum {
      0% { box-shadow: 0 0 18px rgba(34, 255, 244, 0.34), inset 0 0 10px rgba(255, 255, 255, 0.18); }
      50% { box-shadow: 0 0 22px rgba(95, 255, 244, 0.46), inset 0 0 14px rgba(255, 255, 255, 0.24); }
      100% { box-shadow: 0 0 18px rgba(34, 255, 244, 0.34), inset 0 0 10px rgba(255, 255, 255, 0.18); }
    }

    @keyframes miku-miku-beam-step-pop {
      0% { transform: translate(0, 0) scale(1); }
      45% { transform: translate(0, 0) scale(1.08); }
      100% { transform: translate(0, 0) scale(1); }
    }

    @keyframes miku-miku-beam-emitter-enter {
      0% { opacity: 0; transform: translate(calc(-50% + 240px), -50%) scaleX(-1) scale(0.18); }
      20% { opacity: 0.65; }
      78% { opacity: 1; transform: translate(-50%, -50%) scaleX(-1) scale(1.02); }
      100% { opacity: 1; transform: translate(-50%, -50%) scaleX(-1) scale(0.96); }
    }

    @keyframes miku-miku-beam-emitter-core {
      0% { transform: scale(0.97); opacity: 0.82; }
      50% { transform: scale(1.03); opacity: 1; }
      100% { transform: scale(0.97); opacity: 0.82; }
    }

    @keyframes miku-miku-beam-emitter-firing {
      0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
      10% { opacity: 1; transform: translate(-2px, 1px) rotate(-1deg) scale(1.02); }
      20% { opacity: 1; transform: translate(3px, -2px) rotate(1deg) scale(1.03); }
      30% { opacity: 1; transform: translate(-3px, 2px) rotate(-1.1deg) scale(1.04); }
      40% { opacity: 1; transform: translate(2px, -1px) rotate(0.8deg) scale(1.03); }
      50% { opacity: 1; transform: translate(-4px, 1px) rotate(-1.2deg) scale(1.04); }
      60% { opacity: 1; transform: translate(3px, -2px) rotate(1.1deg) scale(1.03); }
      70% { opacity: 1; transform: translate(-2px, 2px) rotate(-0.9deg) scale(1.02); }
      82% { opacity: 0.96; transform: translate(2px, -1px) rotate(0.7deg) scale(1.01); }
      100% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.9); }
    }

    @keyframes miku-miku-beam-emitter-halo {
      0% { opacity: 0; transform: scale(0.66); }
      32% { opacity: 0.8; }
      100% { opacity: 0; transform: scale(1.2); }
    }

    @keyframes miku-miku-beam-emitter-charge {
      0% {
        opacity: 0;
        transform: scale(0.88);
      }
      40% {
        opacity: 0.95;
        transform: scale(1.08);
      }
      100% {
        opacity: 0;
        transform: scale(1.32);
      }
    }

    @keyframes miku-miku-beam-emitter-burn-glow {
      0% { opacity: 0.22; transform: scale(0.9); filter: blur(10px) brightness(1); }
      12% { opacity: 0.75; transform: scale(1.08); filter: blur(12px) brightness(1.35); }
      32% { opacity: 0.58; transform: scale(1.02); filter: blur(11px) brightness(1.2); }
      54% { opacity: 0.82; transform: scale(1.14); filter: blur(13px) brightness(1.45); }
      76% { opacity: 0.64; transform: scale(1.06); filter: blur(12px) brightness(1.28); }
      100% { opacity: 0; transform: scale(1.24); filter: blur(15px) brightness(1.5); }
    }

    @keyframes miku-miku-beam-core-pulse {
      0% { opacity: 0.84; transform: scaleX(0.992); }
      50% { opacity: 1; transform: scaleX(1); }
      100% { opacity: 0.84; transform: scaleX(0.992); }
    }

    @keyframes miku-miku-beam-sheen {
      0% { opacity: 0.62; transform: scaleY(0.94); }
      50% { opacity: 0.9; transform: scaleY(1); }
      100% { opacity: 0.62; transform: scaleY(0.95); }
    }

    @keyframes miku-miku-beam-fire {
      0% { opacity: 0; transform: scaleX(0.05); }
      3% { opacity: 1; transform: scaleX(1.02); }
      92% { opacity: 1; transform: scaleX(1); }
      100% { opacity: 0; transform: scaleX(0.98); }
    }

    @keyframes miku-miku-beam-impact {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
      4% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
      18% { opacity: 0.82; transform: translate(-50%, -50%) scale(1.18); }
      54% { opacity: 0.74; transform: translate(-50%, -50%) scale(1.08); }
      86% { opacity: 0.68; transform: translate(-50%, -50%) scale(1.15); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.32); }
    }

    @keyframes miku-miku-beam-impact-ring {
      0% { opacity: 0; transform: scale(0.4); }
      38% { opacity: 1; }
      100% { opacity: 0; transform: scale(1.36); }
    }

    @keyframes miku-miku-beam-sparks {
      0% { opacity: 0; transform: rotate(0deg) scale(0.55); }
      40% { opacity: 0.9; }
      100% { opacity: 0; transform: rotate(48deg) scale(1.18); }
    }

    @keyframes miku-miku-beam-lock-on {
      0% {
        opacity: 0;
        transform: scale(1.04);
      }
      55% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0.86;
        transform: scale(1);
      }
    }

    @keyframes miku-miku-beam-disintegrate {
      0% {
        opacity: 1;
        filter: brightness(1.32) saturate(1.4) drop-shadow(0 0 3px rgba(255, 193, 96, 0.34));
        transform: none;
      }
      4% {
        opacity: 1;
        filter: brightness(1.82) saturate(1.92) drop-shadow(0 0 5px rgba(255, 146, 41, 0.42));
        transform: translate(7px, -3px) rotate(0.5deg) scale(1.01);
      }
      10% {
        opacity: 1;
        filter: brightness(2.02) saturate(2.05) blur(0.4px) drop-shadow(0 0 8px rgba(255, 118, 24, 0.55));
        transform: translate(-8px, 3px) rotate(-0.7deg) scale(1.015);
      }
      16% {
        opacity: 1;
        filter: brightness(1.86) saturate(1.94) blur(0.25px) drop-shadow(0 0 6px rgba(255, 168, 63, 0.38));
        transform: translate(9px, -4px) rotate(0.8deg) scale(1.018);
      }
      24% {
        opacity: 0.99;
        filter: brightness(2.16) saturate(2.12) blur(0.5px) drop-shadow(0 0 10px rgba(255, 95, 0, 0.6));
        transform: translate(-10px, 4px) rotate(-0.9deg) scale(1.02);
      }
      34% {
        opacity: 0.98;
        filter: brightness(1.98) saturate(2.06) blur(0.4px) drop-shadow(0 0 8px rgba(255, 154, 43, 0.5));
        transform: translate(11px, -5px) rotate(1deg) scale(1.018);
      }
      46% {
        opacity: 0.96;
        filter: brightness(2.24) saturate(2.14) blur(0.65px) drop-shadow(0 0 12px rgba(255, 96, 0, 0.68));
        transform: translate(-13px, 5px) rotate(-1.1deg) skewX(-4deg) scale(1.015);
      }
      58% {
        opacity: 0.93;
        filter: brightness(2.1) saturate(2) blur(0.55px) drop-shadow(0 0 10px rgba(255, 141, 24, 0.54));
        transform: translate(10px, -4px) rotate(0.9deg) skewX(2deg) scale(1.01);
      }
      72% {
        opacity: 0.88;
        filter: brightness(2.36) saturate(2.1) blur(1px) drop-shadow(0 0 14px rgba(255, 105, 0, 0.72));
        transform: translate(-16px, 4px) rotate(-1.3deg) skewX(-7deg) scale(0.995);
      }
      84% {
        opacity: 0.78;
        filter: brightness(2.52) saturate(1.86) blur(1.9px) drop-shadow(0 0 18px rgba(255, 90, 0, 0.78));
        transform: translate(12px, -6px) rotate(1.1deg) skewX(6deg) scale(0.97);
      }
      92% {
        opacity: 0.54;
        filter: brightness(2.82) saturate(1.5) blur(4.4px) drop-shadow(0 0 24px rgba(255, 102, 0, 0.66));
        transform: translate(-28px, -2px) rotate(-2.8deg) skewX(-16deg) scaleX(0.94);
      }
      100% {
        opacity: 0;
        filter: brightness(3.05) saturate(1.16) blur(10px) drop-shadow(0 0 28px rgba(255, 128, 0, 0.48));
        transform: translate(-56px, -8px) rotate(-4deg) skewX(-22deg) scale(0.84, 0.92);
      }
    }

    @keyframes miku-miku-beam-sweep {
      0% {
        opacity: 0;
        transform: translateX(120%) skewX(-18deg);
      }
      8% {
        opacity: 0.95;
      }
      80% {
        opacity: 1;
        transform: translateX(-84%) skewX(-18deg);
      }
      100% {
        opacity: 0;
        transform: translateX(-130%) skewX(-18deg);
      }
    }

    @keyframes miku-miku-beam-fragments {
      0% {
        opacity: 0.14;
        transform: translate(0, 0) scale(0.98);
      }
      18% {
        opacity: 0.26;
        transform: translate(-2px, -3px) scale(1);
      }
      40% {
        opacity: 0.42;
        transform: translate(-6px, -7px) scale(1.04);
      }
      68% {
        opacity: 0.56;
        transform: translate(-12px, -12px) scale(1.08);
      }
      86% {
        opacity: 0.48;
        transform: translate(-18px, -16px) scale(1.12);
      }
      100% {
        opacity: 0;
        transform: translate(-24px, -22px) scale(1.16);
      }
    }

    @keyframes miku-miku-beam-heat-bloom {
      0% {
        filter: blur(0.45px) saturate(1.08) brightness(1.02);
      }
      50% {
        filter: blur(1.1px) saturate(1.34) brightness(1.26);
      }
      100% {
        filter: blur(3px) saturate(1.56) brightness(1.52);
      }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = cssMikuMikuBeam;
  document.head.appendChild(styleElement);
})();
