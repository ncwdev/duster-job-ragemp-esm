export class JobReception {
    ped = null;
    blip = null;

    constructor(config) {
        const pos = new mp.Vector3(config.pos.x, config.pos.y, config.pos.z);
        this.ped = mp.peds.new(mp.game.joaat(config.pedModel), pos, config.rot, 0);

        this.blip = mp.blips.new(config.blipId, pos, {
            shortRange: true,
            color: config.blipColor,
            scale: config.blipScale,
            name: config.blipName
        });
    }

    destroy() {
        if (mp.peds.exists(this.ped)) {
            this.ped.destroy();
        }
        if (mp.blips.exists(this.blip)) {
            this.blip.destroy();
        }
    }
}
