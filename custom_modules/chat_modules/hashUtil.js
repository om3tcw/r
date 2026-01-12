export function shouldPlayRareDeterministic($message, emoteTitle, rareSoundposts) {
    const rareSound = rareSoundposts[emoteTitle];
    if (!rareSound) return false;

    const now = Math.floor(Date.now() / 1000);             
    const bucketSeconds = Math.floor(now / 5) * 5;       

    const seed = bucketSeconds.toString() + emoteTitle;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    const roll = Math.abs(hash) % 100;

    console.log(
        `[Rare Test] ${emoteTitle} | ` +
        `client bucket: ${bucketSeconds} | ` +
        `seed: ${seed} | ` +
        `roll: ${roll}/${rareSound.Chance}`
    );

    return roll < rareSound.Chance;
}
