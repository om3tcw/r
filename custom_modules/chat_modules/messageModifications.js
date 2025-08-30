const defaultVolume = 0.1;

function surroundTextSelection($textField, leftSurroundString, rightSurroundString) {
    let textFieldDOM = $textField[0]
    const caretPositionStart = textFieldDOM.selectionStart;
    const caretPositionEnd = textFieldDOM.selectionEnd;
    const textValue = $textField.val();
    if (textFieldDOM === document.activeElement) {
        if (caretPositionStart === caretPositionEnd) {
            $textField.val(
                textValue.substring(0, caretPositionStart) +
                leftSurroundString +
                textValue.substring(caretPositionStart, caretPositionEnd) +
                rightSurroundString +
                textValue.substring(caretPositionEnd, textValue.length));
            textFieldDOM.setSelectionRange(
                caretPositionStart + leftSurroundString.length,
                caretPositionStart + leftSurroundString.length);
        } else if (caretPositionStart < caretPositionEnd) {
            $textField.val(
                textValue.substring(0, caretPositionStart) +
                leftSurroundString +
                textValue.substring(caretPositionStart, caretPositionEnd) +
                rightSurroundString +
                textValue.substring(caretPositionEnd, textValue.length));
            textFieldDOM.setSelectionRange(
                caretPositionEnd + (leftSurroundString.length + rightSurroundString.length),
                caretPositionEnd + (leftSurroundString.length + rightSurroundString.length));
        }
    }
}

$(window).on('keydown', (event) => {
    const $chatBox = $(chatline);
    const chatBoxDOM = $chatBox[0]

    if (event.ctrlKey && !event.shiftKey) {
        switch (event.key) {
            case 'a':
                if ($chatBox.val().length) {
                    chatBoxDOM.focus();
                    chatBoxDOM.setSelectionRange(0, $chatBox.val().length);
                }
                break;
            case 's':
                event.preventDefault();
                event.stopPropagation(event);
                surroundTextSelection($chatBox, "[sp]", "[/sp]")
                break;
            case 'r':
                if (document.activeElement === chatBoxDOM) {
                    event.preventDefault();
                    event.stopPropagation(event);
                    event.returnValue = false;
                    surroundTextSelection($chatBox, "[r]", "[/r]");
                    break;
                }
        }
    }
});

function runescape($message) {

    const text = $message.text().replace('/runescape', '');
    let html = '';
    let mynumber = 0;

    const parts = text.split(/(<[^>]*>)|\b(\w+)\b/g);

    parts.forEach(part => {
        if (part) {
            if (part.startsWith("<")) {
                const mydelay = mynumber * -50;
                html += `<span style="display: inline-block; position: relative; z-index: -1; animation: wave .66s linear infinite ${mydelay}ms">${part}</span>`;
                mynumber++;
            } else {
                const characters = part.split('');
                characters.forEach(char => {
                    const mydelay = mynumber * -50;
                    html += `<span style="display: inline-block; font-weight: bold; animation: wave .66s linear infinite ${mydelay}ms, glow 3s linear infinite">${char}</span>`;
                    mynumber++;
                });
            }
        }
    });

    $message.html(html);
}

function yayConfetti($message) {

    const $text = $message.text().replace('/yay', '');
    $message.text($text);

    const rect = $message[0].getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00',
        '#ff00ff', '#00ffff', '#ff8800', '#ff0088'
    ];
    const shapes = ['circle', 'triangle', 'square', 'star', 'heart'];
    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;

        confetti.style.left = `${centerX}px`;
        confetti.style.top = `${centerY}px`;

        confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);

        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = 50 + Math.random() * 100;
        const explodeX = Math.cos(angle) * distance;
        const explodeY = Math.sin(angle) * distance * 0.6;

        confetti.style.setProperty('--explodeX', `${explodeX}px`);
        confetti.style.setProperty('--explodeY', `${explodeY}px`);
        confetti.style.setProperty('--fallX', `${explodeX + (Math.random() - 0.5) * 200}px`);
        confetti.style.setProperty('--rotation', `${Math.random() * 360}deg`);

        const explodeDuration = 0.5;
        const fallDuration = 1.5 + Math.random();
        const delay = Math.random() * 0.2;

        confetti.style.animation = `
        confettiExplode ${explodeDuration}s ease-out ${delay}s forwards,
        confettiFall ${fallDuration}s ease-in ${explodeDuration + delay}s forwards
    `;

        document.body.appendChild(confetti);

        setTimeout(() => {
            document.body.removeChild(confetti);
        }, (explodeDuration + fallDuration + delay) * 1000);
    }
}

function formatCommandMessage($messageElement) {
    let $text = $messageElement.text();
    if (!$text.startsWith('/')) {
        return
    }

    if ($text.startsWith('/runescape')) {
        runescape($messageElement);
    } else if ($text.startsWith('/yay')) {
        yayConfetti($messageElement);
        playNeneYaySound();
    } else if ($text.startsWith('/boo')) {
        playBooSound();
    }
}

function playNeneYaySound() {
    if (window.SOUNDPOST_STATE) {
        let myaudio = new Audio("https://www.dl.dropboxusercontent.com/s/z0n3hnw8ky79rwhdokfso/nenesmile.ogg?rlkey=bezzj2pn6c9rj0pqco5kbf7bk&st=ythhncur&dl=0");
        myaudio.volume = defaultVolume;
        myaudio.play();
    }
}

function playBooSound() {
    if (window.SOUNDPOST_STATE) {
        let myaudio = new Audio("https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/soundposts/sounds/boo.ogg");
        myaudio.volume = defaultVolume;
        myaudio.play();
    }
}

(async () => {
    await window.waitForFunc("chatMsgSocketTapFunctions");

    window.chatMsgSocketTapFunctions.push(formatCommandMessage);
})();

