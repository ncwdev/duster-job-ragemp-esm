const setPtfxAssetNextCall = mp.game.graphics.setPtfxAssetNextCall;
const hasNamedPtfxAssetLoaded = mp.game.streaming.hasNamedPtfxAssetLoaded;
const setParticleFxNonLoopedColour = mp.game.graphics.setParticleFxNonLoopedColour;
const startParticleFxNonLoopedOnEntity = mp.game.graphics.startParticleFxNonLoopedOnEntity;

export class EntityParticleEffect {
    config = {
        dict: 'core',
        name: 'ent_sht_flame',
        scale: 1.0,
        color: [255, 255, 255],
    };

    constructor(config) {
        mp.game.streaming.requestNamedPtfxAsset(config.dict);

        this.config = config;
    }

    play(entity, offsetX, offsetY, offsetZ) {
        const c = this.config;
        if (hasNamedPtfxAssetLoaded(c.dict) && entity.handle) {
            setParticleFxNonLoopedColour(c.color[0], c.color[1], c.color[2]);
            setPtfxAssetNextCall(c.dict);
            startParticleFxNonLoopedOnEntity(c.name, entity.handle, offsetX, offsetY, offsetZ, 0, 0, 0, c.scale, false, true, false);
        }
    }
}
