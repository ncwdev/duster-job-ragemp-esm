export function respawnPlayer(player, pos) {
    player.spawn(pos);
    // hack to update position
    player.position = pos;
    player.health = 100;
}

// The maximum is exclusive and the minimum is inclusive
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function getDistance3d(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function xyInFrontOfPos(pos, heading, dist) {
    const rad = heading * Math.PI / 180.0;
    const res = new mp.Vector3(pos.x + dist * Math.sin(-rad), pos.y + dist * Math.cos(-rad), pos.z);
    return res;
}

export function getRandomIndexNoRepeat(arrayLen, curIndex) {
    // выбираем случайный индекс в массиве, гарантированно отличный от текущего curIndex
    if (arrayLen < 1) {
        throw new Error('Array length is 0');
    }
    if (arrayLen === 1) {
        return 0;
    }
    const randomOffset = getRandomInt(1, arrayLen - 1);
    return (curIndex + randomOffset) % arrayLen;
}
