//Non functional non-implemented
function nicomessage(myplayer, mycontainer, mymsg) {
    mycontainer.appendChild(mymsg);

    mymsg.addEventListener("transitionend", function () {
        mymsg.remove();
    }, { once: true });

    setTimeout(function () {
        mymsg.remove();
    }, 10000);

    let maxLane = Math.floor(myplayer.clientHeight / 32) - 1;
    let lane = Math.floor(Math.random() * (maxLane + 1));
    let playerWidth = myplayer.clientWidth;
    let thisWidth = mymsg.clientWidth;

    mymsg.style.top = (32 * lane) + 'px';
    mymsg.style.right = (0 - thisWidth) + 'px';
    mymsg.classList.add('moving');
    requestAnimationFrame(function () {
        mymsg.style.visibility = 'visible';
        mymsg.style.right = playerWidth + 'px';
    });
}

function nicoprocess(mymsg, myclass) {
    const container = document.getElementsByClassName("videochatContainer")[0];
    const player = $("ytapiplayer");
    if (!container || !player) return;

    if (mymsg.innerHTML.trim()) {
        let txt = document.createElement("div");
        txt.classList.add('videoText');
        if (myclass.trim()) txt.classList.add(myclass);
        txt.style.visibility = "hidden";
        txt.innerHTML = mymsg.innerHTML;

        const imgs = txt.getElementsByTagName("img");
        let loadedImgs = 0;

        [...imgs].forEach(img => {
            img.onload = () => {
                if (++loadedImgs === imgs.length) nicomessage(player, container, txt);
            };
        });

        if (imgs.length === 0) nicomessage(player, container, txt);
    }
}

$('.head-NNDCSS').remove();
$('.videochatContainer').remove();

const NNDCSSRules = `
  .videoText {
    color: white;
    position: absolute;
    z-index: 1;
    cursor: default;
    white-space: nowrap;
    font-family: 'Meiryo', sans-serif;
    letter-spacing: 0.063em;
    user-select: none;
    text-shadow: 0 -0.063em #000, 0.063em 0 #000, 0 0.063em #000, -0.063em 0 #000;
    pointer-events: none;
  }
  .videoText.moving {
    transition: right ${7}s linear, left ${7}s linear;
  }
  .videoText.greentext {
    color: #789922;
  }
  .videoText img, .videochatContainer .channel-emote {
    box-shadow: none!important;
    vertical-align: middle!important;
    display: inline-block!important;
    transition: none!important;
  }
  .videoText.shout {
    color: #f00;
  }
`;

$('<style />', {
    'class': 'head-NNDCSS',
    text: NNDCSSRules
}).appendTo('head');

$('.embed-responsive').prepend($('<div/>', {
    'class': 'videochatContainer'
}));

