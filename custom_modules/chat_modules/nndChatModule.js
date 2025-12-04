(() => {
  if (window.NND_MODULE_ACTIVE) return;
  window.NND_MODULE_ACTIVE = true;

  // Configuration
  const CONFIG = {
    MAX_CONCURRENT_MSGS: 30,
    ANIMATION_MIN_DURATION: 4,
    ANIMATION_MAX_DURATION: 9,
    FONT_SIZE: '2.6rem',
    EMOJI_HEIGHT: '2.8em',
    TOP_MIN: 5,
    TOP_MAX: 95,
    REMOVE_DELAY: 10000,
    COLORS: [
      '#FFFFFF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF8000', '#00FF00', '#FF0080', '#0088FF',
      '#FF1493', '#7FFF00', '#FF6B6B', '#4ECDC4'
    ]
  };

  let container = null;
  let style = null;
  let socketListener = null;
  let activeMessages = 0;

  
  function extractContent(html) {
    if (!html) return '';
    
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    
    const timestamps = temp.querySelectorAll('.timestamp');
    timestamps.forEach(el => el.remove());
    
    
    const usernames = temp.querySelectorAll('.username');
    usernames.forEach(el => el.remove());
    
    
    let content = '';
    
    
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IMG') {
          
          const src = node.getAttribute('src');
          if (src) {
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = node.getAttribute('alt') || node.getAttribute('title') || '';
            img.style.height = CONFIG.EMOJI_HEIGHT;
            img.style.width = 'auto';
            img.style.verticalAlign = 'middle';
            img.style.imageRendering = 'pixelated';
            img.style.margin = '0 2px';
            img.style.display = 'inline-block';
            content += img.outerHTML + ' ';
          }
        } else if (node.tagName === 'STRONG' || node.tagName === 'B') {
          content += '<strong>';
          Array.from(node.childNodes).forEach(processNode);
          content += '</strong>';
        } else if (node.tagName === 'I' || node.tagName === 'EM') {
          content += '<em>';
          Array.from(node.childNodes).forEach(processNode);
          content += '</em>';
        } else {
          
          Array.from(node.childNodes).forEach(processNode);
        }
      }
    }
    
    
    Array.from(temp.childNodes).forEach(processNode);
    
    
    content = content.replace(/\s+/g, ' ').trim();
    
    return content;
  }

  
function simpleExtract(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove unwanted elements
  temp.querySelectorAll('.timestamp, .username').forEach(el => el.remove());

  let result = '';

  // Walk through nodes in ORIGINAL order
  const walker = document.createTreeWalker(
    temp,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'IMG') return NodeFilter.FILTER_ACCEPT;
          if (node.tagName === 'BR') return NodeFilter.FILTER_ACCEPT;
          if (node.classList?.contains('timestamp') || node.classList?.contains('username')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.tagName === 'IMG') {
      const src = node.getAttribute('src');
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = node.getAttribute('alt') || node.getAttribute('title') || '';
        img.style.cssText = `
          height: ${CONFIG.EMOJI_HEIGHT};
          width: auto;
          vertical-align: middle;
          image-rendering: pixelated;
          margin: 0 2px;
          display: inline-block;
        `;
        result += img.outerHTML;
      }
    } else if (node.tagName === 'BR') {
      result += '<br>';
    }
  }

  return result.trim();
}

  
  function init() {
    if (container) return;
    
    
    style = document.createElement('style');
    style.textContent = `
      .nnd-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
        display: none;
      }
      .nnd-msg {
        position: absolute;
        white-space: nowrap;
        font-weight: bold;
        font-size: ${CONFIG.FONT_SIZE};
        line-height: 1.1;
        text-shadow: 3px 3px 0 #000,
                     -3px -3px 0 #000,
                     3px -3px 0 #000,
                     -3px 3px 0 #000;
        animation: nnd-scroll linear forwards;
        transform: translateZ(0);
      }
      .nnd-msg img {
        height: ${CONFIG.EMOJI_HEIGHT} !important;
        width: auto !important;
        vertical-align: middle;
        image-rendering: pixelated;
        margin: 0 2px;
        display: inline-block;
      }
      @keyframes nnd-scroll {
        from { transform: translateX(110vw) translateZ(0); }
        to { transform: translateX(-100%) translateZ(0); }
      }
      @-webkit-keyframes nnd-scroll {
        from { -webkit-transform: translateX(110vw) translateZ(0); }
        to { -webkit-transform: translateX(-100%) translateZ(0); }
      }
    `;
    document.head.appendChild(style);
    
    
    container = document.createElement('div');
    container.className = 'nnd-container';
    document.body.appendChild(container);
  }

  
  function createMessage(html) {
    if (!container) init();
    
    // Remove oldest if at limit
    if (activeMessages >= CONFIG.MAX_CONCURRENT_MSGS) {
      const oldest = container.querySelector('.nnd-msg');
      if (oldest) {
        if (oldest._timeout) clearTimeout(oldest._timeout);
        oldest.remove();
        activeMessages--;
      }
    }
    
    
    const content = simpleExtract(html);
    if (!content) return;
    
    
    const el = document.createElement('div');
    el.className = 'nnd-msg';
    el.innerHTML = content;
    
    
    el.style.top = Math.random() * (CONFIG.TOP_MAX - CONFIG.TOP_MIN) + CONFIG.TOP_MIN + 'vh';
    const duration = Math.random() * (CONFIG.ANIMATION_MAX_DURATION - CONFIG.ANIMATION_MIN_DURATION) + CONFIG.ANIMATION_MIN_DURATION;
    el.style.animationDuration = duration + 's';
    el.style.webkitAnimationDuration = duration + 's';
    
    
    el.style.color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
    
    
    container.appendChild(el);
    activeMessages++;
    
    
    el.addEventListener('animationend', () => {
      if (el._timeout) clearTimeout(el._timeout);
      el.remove();
      activeMessages--;
    });
    
    
    el._timeout = setTimeout(() => {
      if (el.parentNode) {
        el.remove();
        activeMessages--;
      }
    }, CONFIG.REMOVE_DELAY);
  }

  
  function enable() {
    if (socketListener) return;
    init();
    container.style.display = 'block';
    
    socketListener = (data) => {
      if (data.msg.startsWith('/me ') || data.username === '[server]') return;
      createMessage(data.msg);
    };
    
    socket.on('chatMsg', socketListener);
  }

  function disable() {
    if (container) container.style.display = 'none';
    if (socketListener) {
      socket.off('chatMsg', socketListener);
      socketListener = null;
    }
    // Clear all messages
    if (container) {
      const messages = container.querySelectorAll('.nnd-msg');
      messages.forEach(msg => {
        if (msg._timeout) clearTimeout(msg._timeout);
        msg.remove();
      });
      activeMessages = 0;
    }
  }

  window.toggleNNDMode = (on) => on ? enable() : disable();

})();