export function shouldPlayRareDeterministic($message, emoteTitle, rareSoundposts) {
    const rareSound = rareSoundposts[emoteTitle];
    if (!rareSound) return false;

    // Get the server timestamp from the message
    const tsSpan = $message.find('.timestamp');
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
            console.warn('[Rare] Failed to parse timestamp:', timestampStr);
        }
    }

    // Fallback if timestamp missing or invalid
    if (secondsSinceDay === 0) {
        secondsSinceDay = Math.floor(Date.now() / 1000) % 86400;
        console.warn('[Rare] Using client fallback time');
    }

    // Bucket into 10-second intervals to absorb ping/timing differences
    const bucketSeconds = Math.floor(secondsSinceDay / 10) * 10;

    // Seed = bucket + emote (different emotes get different rolls in same bucket)
    const seed = bucketSeconds.toString() + emoteTitle;

    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // keep it 32-bit
    }

    const roll = Math.abs(hash) % 100;

    // Debug output
    console.log(
        `[Rare Test] ${emoteTitle} | ` +
        `original: ${timestampStr || 'missing'} | ` +
        `bucket: ${bucketSeconds} | ` +
        `seed: ${seed} | ` +
        `roll: ${roll}/${rareSound.Chance}`
    );

    return roll < rareSound.Chance;
}
