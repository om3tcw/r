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
    };
};

const $chatBox = $(chatline);
const chatBoxDOM = $chatBox[0];
const ctrlKeyComboEvents = {
    '1'() {
        window.toggleVideo();
    },
    'a'() {
        if ($chatBox.val().length) {
            chatBoxDOM.focus();
            chatBoxDOM.setSelectionRange(0, $chatBox.val().length);
        }
    },
    'r'() {
        //Future: Change event.propagation logic so this only happens if you're on the chatbox.
        //Adding a space before the wrap so that emotes can autocomplete.
        surroundTextSelection($chatBox, "[r] ", "[/r]");
    },
    's'() {
        surroundTextSelection($chatBox, "[sp] ", "[/sp]");
    },
    'e'() {
        EMOTELISTMODAL.modal();
    }
};

$(window).on('keydown', (event) => {
    if (event.ctrlKey && !event.shiftKey) {
        const handler = ctrlKeyComboEvents[event.key.toLowerCase()];
        if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler();
        }
    }
});

function eraseStartingString($messageElement, commandString) {
    const $commandNode = $messageElement.contents()[0];
    const $formattedCommandNode = $commandNode.nodeValue.replace(commandString, "");
    $commandNode.nodeValue = $formattedCommandNode;
};

const runescapeStyles = document.createElement('style');
runescapeStyles.textContent = `
    .runescape-char {
        font-weight: bold;
        display: inline-block;
        animation: wave .66s linear infinite var(--delay), glow 3s linear infinite;
    }
    .runescape-image {
        position: relative;
        display: inline-block;
        animation: wave .66s linear infinite var(--delay);
    }`;
document.head.appendChild(runescapeStyles);

const createRunescapeSpan = (className) => (content, delay) => {
    const $span = $('<span>', {
        html: content,
        class: className
    });
    $span[0].style.setProperty('--delay', `${delay}ms`);
    return $span;
};
//Testing curried approach for fun
const runescapeAnimationChars = createRunescapeSpan('runescape-char');
const runescapeAnimationHTMLTags = createRunescapeSpan('runescape-image');

function runescape($messageElement) {
    eraseStartingString($messageElement, "/runescape");
    let newHTMLElements = []
    let delayCounter = 0;
    const matchHTMLTagsOrWords = /(<[^>]*>)|\b(\w+)\b/g;

    const parts = $messageElement.html().split(matchHTMLTagsOrWords);

    parts.forEach(part => {
        if (part) {
            let msDelay = delayCounter * -50;
            if (part.startsWith("<")) {
                newHTMLElements.push(runescapeAnimationHTMLTags(part, msDelay));
                delayCounter++;
            } else {
                const characters = part.split('');
                characters.forEach(char => {
                    newHTMLElements.push(runescapeAnimationChars(char, msDelay));
                    delayCounter++;
                    msDelay = delayCounter * -50;
                });
            }
        }
    });

    $messageElement.empty().append(newHTMLElements);
}

function yayConfetti($messageElement) {

    eraseStartingString($messageElement, "/yay");

    const rect = $messageElement[0].getBoundingClientRect();
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
    await window.waitForFunc("MESSAGE_PROCESSOR");
    MESSAGE_PROCESSOR.addTap(formatCommandMessage);
})();

