import * as utils from '../shared/utils';

export class FieldManager {
    curField = -1;
    markers = [];
    capturePointDist = 10;

    config = null;

    constructor(config) {
        this.config = config;
    }

    isEmpty() {
        return this.markers.length === 0;
    }

    generateNewField(levelInfo) {
        this.cleanup();

        this.capturePointDist = levelInfo.dist;
        this.curField = utils.getRandomIndexNoRepeat(this.config.fields.length, this.curField);

        const field = this.config.fields[this.curField];
        const centerPos = new mp.Vector3(field.x, field.y, field.z + utils.getRandomInt(-10, 10));

        // выберем случайное направление
        const angle = utils.getRandomInt(0, 360);
        let radius = -(field.delta * (levelInfo.fieldPoints - 1) / 2);
        for (let i = 0; i < levelInfo.fieldPoints; ++i) {
            let p1 = { x: 0, y: 0 };
            p1 = utils.xyInFrontOfPos(p1, angle, radius);

            const z = 0.001 * radius * radius; // парабола
            const x = p1.x;
            const y = 3 * Math.atan(x * 0.1);
            const pos = new mp.Vector3(p1.x + centerPos.x, y + centerPos.y, z + centerPos.z);

            radius += field.delta;

            const item = {};
            item.blip = mp.blips.new(this.config.pointBlipId, pos, {
                shortRange: false,
                color: this.config.pointBlipColor,
                scale: this.config.pointBlipScale,
                name: this.config.pointBlipName,
            });
            let scale = levelInfo.dist;
            if (levelInfo.lvl >= 8) {
                scale = this.config.levels[6].dist;
            }
            item.scale = scale;
            this.markers.push(item);
        }
    }

    renderMarkers() {
        const markerId = this.config.markerId;
        for (let i = 0, len = this.markers.length; i < len; ++i) {
            const item = this.markers[i];
            if (item.blip && item.blip.handle) {
                const pos = item.blip.getCoords();
                const scale = item.scale;
                mp.game.graphics.drawMarker(markerId, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, scale, scale, scale, 0, 255, 0, 255, false, true, 2, false, null, null, false);
            }
        }
    }

    checkProximity(vehiclePos) {
        for (let i = 0, len = this.markers.length; i < len; ++i) {
            const item = this.markers[i];
            if (item.blip && item.blip.handle) {
                const pos = item.blip.getCoords();
                const dist = utils.getDistance3d(vehiclePos, pos);
                if (dist <= this.capturePointDist) {
                    this.markers.splice(i, 1);
                    item.blip.destroy();
                    return true;
                }
            }
        }
        return false;
    }

    cleanup() {
        this.markers.forEach(obj => {
            if (mp.blips.exists(obj.blip)) {
                obj.blip.destroy();
            }
        });
        this.markers = [];
    }
}
