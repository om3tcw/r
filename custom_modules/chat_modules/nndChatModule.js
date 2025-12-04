// custom_modules/chat_modules/nndChatModule.js  ←  SIMPLIFIED APPROACH
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

  // SIMPLE EXTRACTOR - just get what we need
  function extractContent(html) {
    if (!html) return '';
    
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove timestamp (span with class "timestamp")
    const timestamps = temp.querySelectorAll('.timestamp');
    timestamps.forEach(el => el.remove());
    
    // Remove username (strong with class "username")
    const usernames = temp.querySelectorAll('.username');
    usernames.forEach(el => el.remove());
    
    // Now extract all img tags and text
    let content = '';
    
    // Function to process nodes
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IMG') {
          // Check if it looks like an emote (has src and maybe class="channel-emote")
          const src = node.getAttribute('src');
          if (src) {
            // Create clean image
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
          // For other elements, just process their children
          Array.from(node.childNodes).forEach(processNode);
        }
      }
    }
    
    // Process all child nodes of the temp div
    Array.from(temp.childNodes).forEach(processNode);
    
    // Clean up: remove multiple spaces and trim
    content = content.replace(/\s+/g, ' ').trim();
    
    return content;
  }

  // Even simpler: Just get all img tags and text
  function simpleExtract(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Find all images
    const images = Array.from(temp.querySelectorAll('img'));
    
    // Find all text nodes (excluding those in timestamp/username)
    let text = '';
    const walker = document.createTreeWalker(
      temp,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip text nodes inside timestamp or username
          let parent = node.parentElement;
          while (parent) {
            if (parent.classList && 
                (parent.classList.contains('timestamp') || 
                 parent.classList.contains('username'))) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      text += node.textContent + ' ';
    }
    
    // Build the result
    let result = '';
    
    // Add images
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        const newImg = document.createElement('img');
        newImg.src = src;
        newImg.alt = img.getAttribute('alt') || img.getAttribute('title') || '';
        newImg.style.cssText = `
          height: ${CONFIG.EMOJI_HEIGHT};
          width: auto;
          vertical-align: middle;
          image-rendering: pixelated;
          margin: 0 2px;
          display: inline-block;
        `;
        result += newImg.outerHTML + ' ';
      }
    });
    
    // Add text
    if (text.trim()) {
      result += text.trim();
    }
    
    return result.trim();
  }

  // Initialize
  function init() {
    if (container) return;
    
    // Add styles
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
    
    // Create container
    container = document.createElement('div');
    container.className = 'nnd-container';
    document.body.appendChild(container);
  }

  // Create message
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
    
    // Extract content
    const content = simpleExtract(html);
    if (!content) return;
    
    // Create element
    const el = document.createElement('div');
    el.className = 'nnd-msg';
    el.innerHTML = content;
    
    // Random position and animation
    el.style.top = Math.random() * (CONFIG.TOP_MAX - CONFIG.TOP_MIN) + CONFIG.TOP_MIN + 'vh';
    const duration = Math.random() * (CONFIG.ANIMATION_MAX_DURATION - CONFIG.ANIMATION_MIN_DURATION) + CONFIG.ANIMATION_MIN_DURATION;
    el.style.animationDuration = duration + 's';
    el.style.webkitAnimationDuration = duration + 's';
    
    // Random color
    el.style.color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
    
    // Add to container
    container.appendChild(el);
    activeMessages++;
    
    // Clean up after animation
    el.addEventListener('animationend', () => {
      if (el._timeout) clearTimeout(el._timeout);
      el.remove();
      activeMessages--;
    });
    
    // Fallback timeout
    el._timeout = setTimeout(() => {
      if (el.parentNode) {
        el.remove();
        activeMessages--;
      }
    }, CONFIG.REMOVE_DELAY);
  }

  // Enable/disable
  function enable() {
    if (socketListener) return;
    init();
    container.style.display = 'block';
    
    socketListener = (data) => {
      if (data.msg.startsWith('/me ') || data.username === '[server]') return;
      createMessage(data.msg);
    };
    
    socket.on('chatMsg', socketListener);
    console.log('NND Mode: ENABLED');
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
    console.log('NND Mode: DISABLED');
  }

  window.toggleNNDMode = (on) => on ? enable() : disable();
  
  // Auto-enable
  try {
    if (localStorage.getItem('holopeek_nndMode') === 'true') {
      // Wait for socket to be ready
      const checkSocket = setInterval(() => {
        if (typeof socket !== 'undefined' && socket) {
          clearInterval(checkSocket);
          enable();
        }
      }, 100);
    }
  } catch (e) {
    console.warn('Could not read NND Mode preference:', e);
  }

  // Debug helper
  window.debugNND = {
    test: (html) => {
      console.log('Input:', html);
      console.log('Output:', simpleExtract(html));
    },
    enable,
    disable
  };

  console.log('NND Module: SIMPLIFIED VERSION LOADED');
})();