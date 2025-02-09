// Работа орошителя
import { DusterJob } from './DusterJob.js';
import { config } from '../../shared/dusterJobConfig';
import rpc from 'rage-rpc';

const DRIVER_SEAT = 0;

async function hireDusterPilot(player) {
    try {
        player.removeFromVehicle();

        const job = new DusterJob(config);
        job.hire(player);

        const vehicle = job.createPlane();
        if (!vehicle) {
            job.clear();

            player.notify('~r~Не удалось создать самолет');
            console.log('hireDusterPilot(): cannot create duster');
            return;
        }
        rpc.triggerClient(player, 'ncw.waitDusterVehicle', vehicle);
    } catch (e) {
        console.error('hireDusterPilot() failed with exception', e);
    }
}

function onDusterVehicleReady(vehicleId, info) {
    const player = info.player;
    if (!player.ncw || !player.ncw.person) {
        return;
    }
    const person = player.ncw.person;
    const job = person.getJob();
    if (!job) {
        console.error(`onDusterVehicleReady(): cannot find job for player ${player.name}`);
        return;
    }
    const vehicle = job.getVehicle();
    if (!vehicle || vehicle.id !== vehicleId) {
        console.error(`onDusterVehicleReady(): cannot find vehicle with id ${vehicleId} for player ${player.name}`);
        return;
    }
    if (mp.players.exists(player) && mp.vehicles.exists(vehicle)) {
        player.putIntoVehicle(vehicle, DRIVER_SEAT);

        const points = person.getDusterJobPoints();
        rpc.triggerClient(player, 'ncw.onDusterPilotHired', points);

        console.log(`onDusterVehicleReady(): ${player.name} started duster job`);
    } else {
        console.error('onDusterVehicleReady(): cannot hire pilot cause player or vehicle does not exist');
    }
}

function fireDusterPilot(_, info) {
    const player = info.player;
    if (!player.ncw || !player.ncw.person) {
        return;
    }
    const person = player.ncw.person;
    const job = person.getJob();

    if (job) {
        job.finish();
    }
    console.log(`fireDusterPilot(): ${player.name}`);
}

function payForDusterPoint(_, info) {
    // оплата за одну точку
    try {
        const player = info.player;
        if (!player.ncw || !player.ncw.person) {
            return;
        }
        const person = player.ncw.person;
        const job = person.getJob();
        if (!job) {
            return;
        }
        const price = job.payForPoint();
        return price;
    } catch(e) {
        console.error('payForDusterPoint() failed with exception', e);
        return 0;
    }
}

function cancelDusterJob(vehicleId, info) {
    console.log(`cancelDusterJob(): vehicleId = ${vehicleId}`);

    const player = info.player;
    fireDusterPilot(vehicleId, { player });
}

function playerDeath(player) {
    if (!player.ncw || !player.ncw.person) {
        return;
    }
    const person = player.ncw.person;
    const job = person.getJob();
    if (job && job.getName() === config.name) {
        // увольняем и варпаем к месту устройства
        rpc.triggerClient(player, 'ncw.endDusterJobForced');

        console.log(`dusterJobManager.playerDeath(): ${player.name} was respawned by duster job`);
    }
}

mp.events.addCommand('duster', player => {
    if (player.dimension !== 0) {
        console.error(`/duster: ${player.name} dimension = ${player.dimension}`);
        return;
    }
    if (!player.ncw || !player.ncw.person) {
        return;
    }
    const person = player.ncw.person;
    const job = person.getJob();

    if (job) {
        player.outputChatBox('~r~Вы уже работаете');
        return;
    }
    hireDusterPilot(player);
});

export function initDusterJob() {
    rpc.on('ncw.hireDusterPilot', hireDusterPilot);
    rpc.on('ncw.cancelDusterJob', cancelDusterJob);
    rpc.on('ncw.onDusterVehicleReady', onDusterVehicleReady);

    rpc.register('ncw.fireDusterPilot', fireDusterPilot);
    rpc.register('ncw.payForDusterPoint', payForDusterPoint);

    mp.events.add('playerDeath', playerDeath);
}
