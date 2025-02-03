import { FeatureLevels } from '../../shared/FeatureLevels';
import * as utils from '../../shared/utils';

const streamDistance = mp.config['stream-distance'];

export class DusterJob {
    name = '';
    config = null;
    jobLevels = null;

    player = null;
    vehicle = null;

    static dusterNumber = 0; // global counter

    constructor(config) {
        this.name = config.name;

        this.config = config;

        this.jobLevels = new FeatureLevels(config.levels);
    }

    getName() {
        return this.name;
    }

    getVehicle() {
        return this.vehicle;
    }

    hire(player) {
        this.player = player;

        const person = player.ncw.person;
        person.setJob(this);
    }

    createPlane() {
        // create a duster in the air, freeze and warp player into
        const pos = new mp.Vector3(this.config.pedPos.x, this.config.pedPos.y, this.config.pedPos.z);
        const angle = 360 / this.config.spawnSectors * DusterJob.dusterNumber;

        let dusterPos = new mp.Vector3(pos.x, pos.y, pos.z + this.config.spawnHeight);
        dusterPos = utils.xyInFrontOfPos(dusterPos, angle, this.config.spawnRadius);

        const distance = dusterPos.subtract(this.player.position).length();
        if (distance >= streamDistance) {
            console.log(`DusterJob.createPlane(): streamDistance = ${streamDistance}, distance = ${distance} - too far, cancel job`);
            return null;
        }

        const vehModel = mp.joaat(this.config.vehicle);
        const vehicle = mp.vehicles.new(vehModel, dusterPos, {
            dimension: 0,
        });
        this.vehicle = vehicle;

        ++DusterJob.dusterNumber;
        console.log(`DusterJob.createPlane(): global duster number = ${DusterJob.dusterNumber}, pos: ${dusterPos}`);

        return vehicle;
    }

    payForPoint() {
        const person = this.player.ncw.person;
        const points = person.getDusterJobPoints();
        const expa = person.getExpa();

        const levelInfo = this.jobLevels.getLevelInfoByPoints(points);
        const price = levelInfo.expa;

        person.setDusterJobPoints(points + 1);
        person.setExpa(expa + price);

        const msg = `DusterJob.payForPoint(): paid ${price} expa to '${this.player.name}', job lvl: ${levelInfo.lvl}, points: ${points + 1}, expa: ${expa + price}`;
        console.log('job_duster', msg);

        return price;
    }

    finish() {
        // вернем игрока на место устройства к ангару
        const respawnPos = new mp.Vector3(this.config.respawnPos.x, this.config.respawnPos.y, this.config.respawnPos.z);
        utils.respawnPlayer(this.player, respawnPos);

        // удалим самолет не сразу, так лучше выглядит
        setTimeout(() => {
            try {
                if (mp.vehicles.exists(this.vehicle)) {
                    this.vehicle.destroy();

                    console.log('DusterJob.finish(): vehicle destroyed');
                }
                this.clear();
            } catch(e) {
                console.error(e);
            }
        }, this.config.timeToDestroyVehicle);
    }

    clear() {
        if (this.player) {
            const person = this.player.ncw.person;
            person.setJob(null);
        }
        this.player = null;
        this.config = null;
        this.vehicle = null;
        this.jobLevels = null;
    }
};
