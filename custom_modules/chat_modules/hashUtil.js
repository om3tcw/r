export function shouldPlayRareDeterministic($message, emoteTitle, rareSoundposts) {
    const rareSound = rareSoundposts[emoteTitle];
    if (!rareSound) return false;


    const tsSpan = $message.find('.timestamp');
    const timestamp = tsSpan.length
        ? tsSpan.text().trim().replace(/[\[\]]/g, '')
        : Math.floor(Date.now() / 1000).toString();

    const seed = timestamp + emoteTitle;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    const roll = Math.abs(hash) % 100;


    console.log(`[Rare Test] ${emoteTitle} | timestamp: ${timestamp} | roll: ${roll}/${rareSound.Chance}`);

    return roll < rareSound.Chance;
}
