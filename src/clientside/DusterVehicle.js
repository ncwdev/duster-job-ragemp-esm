import { EntityParticleEffect } from './EntityParticleEffect';

const localPlayer = mp.players.local;

const DRIVER_OUT = 1;
const DRIVER_IN = 2;
const DRIVER_END_JOB = 3;

async function entityHandle(entity) {
    // ждем макс 2 сек
    for (let i = 0; entity.handle === 0 && i < 20; ++i) {
        await mp.game.waitAsync(100);
    }
}

export class DusterVehicle {
    config = null;
    vehicle = null;
    smokeEffect = null;

    driverStatus = DRIVER_OUT;

    constructor(config) {
        this.config = config;

        this.smokeEffect = new EntityParticleEffect(config.smokeEffect);
    }

    async isLoaded(vehicle) {
        await entityHandle(vehicle);

        if (vehicle.handle) {
            vehicle.freezePosition(true);
            this.vehicle = vehicle;
            return true;
        }
        return false;
    }

    start() {
        this.vehicle.freezePosition(false);
        this.driverStatus = DRIVER_OUT;
    }

    stop() {
        this.driverStatus = DRIVER_END_JOB;

        if (mp.vehicles.exists(this.vehicle)) {
            this.vehicle.setEngineOn(false, false, true);
        }
    }

    inGame() {
        return (mp.vehicles.exists(this.vehicle) && this.vehicle.handle && localPlayer.vehicle === this.vehicle);
    }

    renderSmoke() {
        if (this.smokeEffect) {
            this.smokeEffect.play(this.vehicle, -0.15, -5.0, 0.5);
        }
    }

    getPosition() {
        return this.vehicle.position;
    }

    checkDriverStatus() {
        if (this.driverStatus === DRIVER_OUT) {
            if (localPlayer.vehicle) {
                this.driverStatus = DRIVER_IN;
            }
        } else if (this.driverStatus === DRIVER_IN) {
            if (!localPlayer.vehicle) {
                this.driverStatus = DRIVER_END_JOB;
            }
        }
    }

    hasDriver() {
        return this.driverStatus !== DRIVER_END_JOB;
    }
}
