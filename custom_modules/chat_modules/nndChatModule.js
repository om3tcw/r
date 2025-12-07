(() => {
  if (window.NND_MODULE_ACTIVE) return;
  window.NND_MODULE_ACTIVE = true;

  let container = null;
  let style = null;
  let listener = null;
  let activeMessages = 0;
  let queue = [];
  let delayTimer = null;

  // CHANGE THESE VALUES TO TWEAK NND MODE
  const CONFIG = {
    maxMessages: 15,           // Max messages on screen at once
    delayWhenFull: 1500,       // Delay in ms when full (1500 = 1.5 seconds)
    minDuration: 4,            // Fastest scroll time (seconds)
    maxDuration: 9,            // Slowest scroll time (seconds)
    fontSize: '2.6rem',        // Text size
    emojiHeight: '2.8em',      // Emote size
    colors: ['#FFFFFF','#FFFF00','#FF00FF','#00FFFF','#FF8000','#00FF00','#FF0080','#0088FF','#FF1493','#7FFF00']
  };

  function init() {
    if (container) return;

    style = document.createElement('style');
    style.textContent = `
      .nnd-container{position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;display:none}
      .nnd-msg{position:absolute;white-space:nowrap;font-weight:bold;font-size:${CONFIG.fontSize};line-height:1.1;
               text-shadow:none!important;
               animation:nnd-scroll linear forwards;will-change:transform}
      .nnd-msg img{height:${CONFIG.emojiHeight}!important;width:auto!important;vertical-align:middle;
                   image-rendering:pixelated;margin:0 3px;display:inline-block}
      @keyframes nnd-scroll{from{transform:translateX(110vw)}to{transform:translateX(-100%)}}
    `;
    document.head.appendChild(style);

    container = document.createElement('div');
    container.className = 'nnd-container';
    document.body.appendChild(container);
  }

  function spawnMessage(html) {
    const el = document.createElement('div');
    el.className = 'nnd-msg';

    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('.username').forEach(u => u.remove());
    el.innerHTML = temp.innerHTML || html;

    el.style.top = Math.random() * 90 + 5 + 'vh';
    const duration = Math.random() * (CONFIG.maxDuration - CONFIG.minDuration) + CONFIG.minDuration;
    el.style.animationDuration = duration + 's';

    el.style.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

    container.appendChild(el);
    activeMessages++;

    el.addEventListener('animationend', () => {
      el.remove();
      activeMessages--;
      processQueue();
    }, { once: true });
  }

  function processQueue() {
    if (queue.length === 0) return;

    if (activeMessages < CONFIG.maxMessages) {
      spawnMessage(queue.shift());
      if (queue.length > 0 && activeMessages < CONFIG.maxMessages) {
        setTimeout(processQueue, 50);
      }
    } else if (!delayTimer) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        processQueue();
      }, CONFIG.delayWhenFull);
    }
  }

  function createMessage(html) {
    init();
    queue.push(html);
    processQueue();
  }

  function enable() {
    if (listener) return;
    init();
    container.style.display = 'block';
    listener = d => {
      if (d.msg.startsWith('/me ') || d.username === '[server]') return;
      createMessage(d.msg);
    };
    socket.on('chatMsg', listener);
  }

  function disable() {
    if (container) container.style.display = 'none';
    if (listener) { socket.off('chatMsg', listener); listener = null; }
    container.innerHTML = '';
    queue = [];
    activeMessages = 0;
    if (delayTimer) clearTimeout(delayTimer);
  }

  window.toggleNNDMode = on => on ? enable() : disable();
})();