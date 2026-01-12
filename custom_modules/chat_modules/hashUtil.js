// hashUtils.js — deterministic rare roll helpers

export function getDeterministicRoll(components) {
    const seed = components.join(''); 
    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    
    return Math.abs(hash) % 100;
}

export function shouldPlayRareDeterministic($message, emoteTitle, rareSoundposts) {
    const rareSound = rareSoundposts[emoteTitle];
    if (!rareSound) return false;

    // Timestamp
    const tsSpan = $message.find('.timestamp');
    const timestamp = tsSpan.length
        ? tsSpan.text().trim().replace(/[\[\]]/g, '')   
        : Math.floor(Date.now() / 1000).toString();

    // Username
    const username = $message.find('.username')
        .text()
        .replace(':', '')
        .trim() || 'anonymous';

    // Message content
    const msgClone = $message.clone();
    msgClone.find('.username, .timestamp').remove();
    const msgText = msgClone.text().trim();

    // current video ID
    let videoId = '';
    if (window.PLAYER?.getVideoId) {
        videoId = window.PLAYER.getVideoId() || '';
    }

    const roll = getDeterministicRoll([
        timestamp,
        username,
        msgText,
        emoteTitle,
        videoId
    ]);

console.log(`[Rare Hash] ${emoteTitle} | seed parts: ${[timestamp, username, msgText, emoteTitle, videoId]} | roll: ${roll}/${rareSound.Chance}`);

    return roll < rareSound.Chance;
}
