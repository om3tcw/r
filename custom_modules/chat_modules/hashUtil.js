export function shouldPlayRareDeterministic($message, emoteTitle, rareSoundposts) {
    const rareSound = rareSoundposts[emoteTitle];
    if (!rareSound) return false;


    const $row = $message.closest('div[class^="chat-msg-"]');
    

    const tsSpan = $row.find('.timestamp');
    
    let timestampStr = tsSpan.length
        ? tsSpan.text().trim().replace(/[\[\]]/g, '')
        : null;

    let secondsSinceDay = 0;

    if (timestampStr && timestampStr.includes(':')) {
        try {
            const [h, m, s] = timestampStr.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
                secondsSinceDay = h * 3600 + m * 60 + s;
            }
        } catch (e) {
            console.warn('[Rare] Timestamp parse failed:', timestampStr);
        }
    }

    if (secondsSinceDay === 0) {
        secondsSinceDay = Math.floor(Date.now() / 1000) % 86400;
        console.warn('[Rare] Fallback to client time');
    }

    const bucketSeconds = Math.floor(secondsSinceDay / 6) * 6;

    const seed = bucketSeconds.toString() + emoteTitle;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    const roll = Math.abs(hash) % 100;

    // Debug
    console.log(
        `[Rare Test] ${emoteTitle} | ` +
        `original ts: ${timestampStr || 'missing'} | ` +
        `bucket: ${bucketSeconds} | ` +
        `seed: ${seed} | ` +
        `roll: ${roll}/${rareSound.Chance}`
    );

    return roll < rareSound.Chance;
}
