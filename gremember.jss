@import url(https://fonts.googleapis.com/css?family=Lato:900|Creepster);
html {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background: #000000;
  background: -webkit-gradient(linear, left top, right bottom, color-stop(68%, #000000), color-stop(75%, #ff0000), color-stop(81%, #cccccc), color-stop(81%, #cccccc), color-stop(91%, #111111), color-stop(95%, #000000), color-stop(95%, #000000));
  background: -webkit-linear-gradient(-45deg, #000000 68%, #ff0000 75%, #cccccc 81%, #cccccc 81%, #111111 91%, #000000 95%, #000000 95%);
  background: -webkit-linear-gradient(315deg, #000000 68%, #ff0000 75%, #cccccc 81%, #cccccc 81%, #111111 91%, #000000 95%, #000000 95%);
  background: linear-gradient(135deg, #000000 68%, #ff0000 75%, #cccccc 81%, #cccccc 81%, #111111 91%, #000000 95%, #000000 95%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#000000', GradientType=1 );  
}

.grid {
  width: 100%;
  height: 100%;
  background: -webkit-repeating-linear-gradient(45deg, #ff0000, rgba(255, 0, 0, 0.7) 1px, #ff0000 2px, transparent 6px, transparent 150px);
  background: repeating-linear-gradient(45deg, #ff0000, rgba(255, 255, 255, 0.7) 1px, #ff0000 2px, transparent 6px, transparent 150px);
}
.Absolute-Center {
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
body {
  counter-reset: littledevil 0;
  -webkit-touch-callout: none;
  overflow: hidden;
  margin: 0;
}
.input-demon:checked {
  counter-increment: littledevil;
}
.sum:after {
  content: counter(littledevil);
}
.input-demon ~ .minion {
  opacity: 0;
  -webkit-transition: 0.3s cubic-bezier(0, .43, 1, 0);
  transition: 0.3s cubic-bezier(0, .43, 1, 0);
  -webkit-animation: move 8s infinite alternate;
  animation: move 8s infinite alternate;
}
.input-demon1:not(:checked) ~ .minion1, .input-demon2:not(:checked) ~ .minion2, .input-demon3:not(:checked) ~ .minion3, .input-demon4:not(:checked) ~ .minion4, .input-demon5:not(:checked) ~ .minion5, .input-demon6:not(:checked) ~ .minion6, .input-demon7:not(:checked) ~ .minion7, .input-demon8:not(:checked) ~ .minion8 {
  opacity: 1;
}
.input-demon1:checked ~ .minion1 span, .input-demon2:checked ~ .minion2 span, .input-demon3:checked ~ .minion3 span, .input-demon4:checked ~ .minion4 span, .input-demon5:checked ~ .minion5 span, .input-demon6:checked ~ .minion6, .input-demon7:checked ~ .minion7 span, .input-demon8:checked ~ .minion8 span {
  display: block;
}
.minion {
  position: absolute;
  left: 0;
  cursor: crosshair;
  background-image: url(https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/gremember.gif);
  background-repeat: no-repeat;
  width: 191px;
  height: 144px;
  z-index: 2;
}
.minion>span {
  display: none;
  position: absolute;
  z-index: 2;
  text-align: center;
  color: rgba(255,252,252,0.5);
  font-weight: bolder;
  width: 100px;
  height: 100px;
}
.minion>span:before {
  content: "☠";
  font-size: 150px;
}

.minion1 {
  top: 10%;
  -webkit-animation-delay: -2s!important;
  animation-delay: -2s!important;
  -webkit-transform: scale(0.9);
  -ms-transform: scale(0.9);
  transform: scale(0.9);
}
.minion2 {
  top: 20%;
  -webkit-animation-delay: -4s!important;
  animation-delay: -4s!important;
  -webkit-transform: scale(0.8);
  -ms-transform: scale(0.8);
  transform: scale(0.8);
}
.minion3 {
  top: 30%;
  -webkit-animation-delay: -3s!important;
  animation-delay: -3s!important;
  -webkit-transform: scale(1.15);
  -ms-transform: scale(1.15);
  transform: scale(1.15);
}
.minion4 {
  top: 40%;
  -webkit-animation-delay: -8s!important;
  animation-delay: -8s!important;
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
}
.minion5 {
  top: 50%;
  -webkit-animation-delay: -16s!important;
  animation-delay: -16s!important;
  -webkit-transform: scale(0.9);
  -ms-transform: scale(0.9);
  transform: scale(0.9);
}
.minion6 {
  top: 60%;
  -webkit-animation-delay: -9s!important;
  animation-delay: -9s!important;
  -webkit-transform: scale(1.2);
  -ms-transform: scale(1.2);
  transform: scale(1.2);
}
.minion7 {
  top: 70%;
  -webkit-animation-delay: -6s!important;
  animation-delay: -6s!important;
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
}
.minion8 {
  top: 80%;
  -webkit-animation-delay: -12s!important;
  animation-delay: -12s!important;
  -webkit-transform: scale(0.7);
  -ms-transform: scale(0.7);
  transform: scale(0.7);
}
 @-webkit-keyframes move {
0% {
left:0%;
}
20% {
left:20%;
top:50%;
}
40% {
top:30%;
left:60%;
}
60% {
top:80%;
left:80%;
}
80% {
top:10%;
left:20%;
}
100% {
top:30%;
left:20%;
}
}
 @keyframes move {
0% {
left:0%;
}
20% {
left:20%;
top:50%;
}
40% {
top:30%;
left:60%;
}
60% {
top:80%;
left:80%;
}
80% {
top:10%;
left:20%;
}
100% {
top:30%;
left:20%;
}
}
/* Page Stying  */
h1  {
    z-index: 1;
  font-size: 10vw;
  color: #ff0000;
  padding-top: 25%;
  font-family: 'Creepster', cursive;
  letter-spacing: 10px;
  text-shadow: 5px 3px 0px #000;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  text-align: center;
  width: 100%;
  letter-spacing: 10px;
  -webkit-text-stroke-width: 1px;
   -webkit-text-stroke-color: black;
}

h2  {
    z-index: 1;
  font-size: 7vw;
  color: grey;
  padding-left:17%;
  padding-top: 35%;
  font-family: 'Creepster', cursive;
  letter-spacing: 10px;
  text-shadow: 5px 3px 0px #000;
  margin: auto;
  position: absolute;
  padding-top: 200px;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  text-align: center;
  width: 100%;
  height: 50%;
  letter-spacing: 10px;
  -webkit-text-stroke-width: 1px;
   -webkit-text-stroke-color: black;
} 

.gargolden {position:relative;
top:-20px;
left:722px;
}
.gargolden {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 24px;
  color: gold;
}
.gargolden img {
  margin-right: 10px;
  width: 50px; 
  height: auto;
}

function setCookieWithExpiry(name, value, minutes) {
  const now = new Date();
  now.setTime(now.getTime() + (minutes * 60 * 1000));
  const expires = now.toUTCString(); 
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
let demonInteractionStarted = false;
let cookieSet = false; 
function checkForGremember() {
  const chatMsgElements = document.querySelectorAll('.chat-msg-Kusa'); 

  for (const specificClassElement of chatMsgElements) {
    const lastChild = specificClassElement.lastElementChild; 
    const gremeberElement = lastChild?.querySelector('.channel-emote[title=":gremember:"]'); 
    const timestampElement = specificClassElement.querySelector('.timestamp'); 
    if (timestampElement) {
      const messageTime = parseTimestamp(timestampElement.textContent.match(/\[([^\]]+)\]/)[1]);

      
      if (gremeberElement && !demonInteractionStarted && messageTime > startTime) {
        if (!cookieSet) { 
          setCookieWithExpiry('gremember_cookie', 'active', 10); 
          cookieSet = true; 
        }
        startDemonInteraction(); 
        demonInteractionStarted = true; 
        return true; 
      }
    }
  }
  return false;
}

function startDemonInteraction() {
  const wrapperHTML = `
    <div class="wrapper2">
      <div class="grid2">
        <div class="container2">
          <h2 class="killer">FOREVER</h2>
          <h1 class="demon">SEPTEMBER</h1>
        </div>
      </div>
      <input class="input-demon input-demon1" type="radio" id="demon1">
      <input class="input-demon input-demon2" type="radio" id="demon2">
      <input class="input-demon input-demon3" type="radio" id="demon3">
      <input class="input-demon input-demon4" type="radio" id="demon4">
      <input class="input-demon input-demon5" type="radio" id="demon5">
      <input class="input-demon input-demon6" type="radio" id="demon6">
      <input class="input-demon input-demon7" type="radio" id="demon7">
      <input class="input-demon input-demon8" type="radio" id="demon8">
      <label for="demon1" class="minion minion1"><span></span></label>
      <label for="demon2" class="minion minion2"><span></span></label>
      <label for="demon3" class="minion minion3"><span></span></label>
      <label for="demon4" class="minion minion4"><span></span></label>
      <label for="demon5" class="minion minion5"><span></span></label>
      <label for="demon6" class="minion minion6"><span></span></label>
      <label for="demon7" class="minion minion7"><span></span></label>
      <label for="demon8" class="minion minion8"><span></span></label>
      <div class="sum">GREMBERS Destroyed: </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', wrapperHTML);
  const audio = new Audio('https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/doyouremember.ogg');
  audio.play();

  const inputs = document.querySelectorAll('.input-demon');
  const h1 = document.querySelector('.demon');
  const h2 = document.querySelector('.killer');
  const wrapper2 = document.querySelector('.wrapper2');

  function checkAllDemonsClicked() {
    const allChecked = Array.from(inputs).every(input => input.checked);
    if (allChecked) {
      h1.remove();
      h2.remove();
      audio.pause();
      audio.currentTime = 0; 
      wrapper2.remove();
      
      // Create the new element for gargolden
      const gargoldenDiv = document.createElement('div');
      gargoldenDiv.classList.add('gargolden');

      const img = document.createElement('img');
      img.src = 'https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/gargolden.png';
      img.alt = 'Gargolden';
      const text = document.createElement('span');
      text.textContent = 'Claim your om3tcw gold in chat';    
      gargoldenDiv.appendChild(img);
      gargoldenDiv.appendChild(text);  
      document.body.appendChild(gargoldenDiv);   
      setTimeout(() => {
        gargoldenDiv.remove();
      }, 10000);
    }
  }
  inputs.forEach(input => {
    input.addEventListener('change', checkAllDemonsClicked);
  });
}
socket.on("chatMsg", ({ username }) => {
  checkForGremember();
  checkChatMessages(); 
});

function setCookie(name, value, minutes) {
  const now = new Date();
  now.setTime(now.getTime() + (minutes * 60 * 1000)); 
  const expires = now.toUTCString(); 
  const maxAge = minutes * 60; 
  document.cookie = `${name}=${value}; expires=${expires}; max-age=${maxAge}; path=/`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function applyStyles(variableName) {
  const style = document.createElement('style');
  style.innerHTML = `
    .userlist-${variableName} {
      color: #FFD700 !important;
      font-weight: bold !important;
    }
    .chat-msg-${variableName} .username {
      color: #FFD700 !important;
      font-weight: bold !important;
    }
  `;
  document.head.appendChild(style);
}
function checkChatMessages() {
  if (getCookie('gremember_cookie')) {
    const chatMsgElements = document.querySelectorAll('[class^="chat-msg-"]');
    chatMsgElements.forEach((specificClassElement) => {
      const className = specificClassElement.className;
      const timestampElement = specificClassElement.querySelector('.timestamp');
      if (timestampElement) {
        const messageTime = parseTimestamp(timestampElement.textContent.match(/\[([^\]]+)\]/)[1]);
        if (messageTime > startTime) {
          const lastChild = specificClassElement.lastElementChild;
          const gargoldenEmote = lastChild?.querySelector('.channel-emote[title=":gargolden:"]');
          if (gargoldenEmote) {
            const variableName = className.match(/chat-msg-(.+?)(\s|$)/)[1];
            applyStyles(variableName);
          }
        }
      }
    });
  }
}
function parseTimestamp(timestamp) {
  const [hours, minutes, seconds] = timestamp.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
}
const startTime = new Date();
