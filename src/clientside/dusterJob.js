// ncwdev: работа орошитель полей
import rpc from 'rage-rpc';
import * as utils from '../shared/utils';
import { config } from '../shared/dusterJobConfig';
import { FeatureLevels } from '../shared/FeatureLevels';
import { EntityParticleEffect } from './EntityParticleEffect';

const localPlayer = mp.players.local;
const outputChatBox = mp.gui.chat.push;
const notify = mp.game.graphics.notify;

async function entityHandle(entity) {
    // ждем макс 2 сек
    for (let i = 0; entity.handle === 0 && i < 20; ++i) {
        await mp.game.waitAsync(100);
    }
}

const DRIVER_OUT = 1;
const DRIVER_IN = 2;
const DRIVER_END_JOB = 3;
let driverStatus = DRIVER_OUT;

const jobLevels = new FeatureLevels(config.levels);

const dusterLevels = config.levels;
const reception = config.reception;
const fields = config.fields;

let gotPoints = 0; // сколько взял точек на одном самолете
let gotExpa = 0; // сколько заработал опыта
let playerPointsNumber = 0; // общее число точек игрока - определяет уровень работы

let capturePointDist = 10; // берем из текущего уровня
let curField = -1;
let markers = [];
let jobVehicle = null;
let smokeEffect = null;

function getJobLevelInfo() {
    return jobLevels.getLevelInfoByPoints(playerPointsNumber);
}

function createJobReception() {
    const pedPos = new mp.Vector3(config.pedPos.x, config.pedPos.y, config.pedPos.z);
    reception.ped = mp.peds.new(mp.game.joaat(reception.pedModel), pedPos, reception.rot, 0);

    reception.blip = mp.blips.new(reception.blipId, pedPos, {
        shortRange: true,
        color: reception.blipColor,
        scale: reception.blipScale,
        name: reception.blipName,
    });
}

async function waitDusterVehicle(vehicle) {
    await entityHandle(vehicle);

    if (vehicle.handle) {
        vehicle.freezePosition(true);
        jobVehicle = vehicle;

        rpc.triggerServer('ncw.onDusterVehicleReady', vehicle.remoteId);
    } else {
        rpc.triggerServer('ncw.cancelDusterJob', vehicle.remoteId);
    }
}

function onDusterPilotHired(points) {
    playerPointsNumber = points;

    outputChatBox('!{#FFFF00}Руль высоты по-умолчанию - клавиши Num8 и Num5.');

    // ждем, пока игрок читает подсказку
    setTimeout(() => {
        if (mp.vehicles.exists(jobVehicle)) {
            jobVehicle.freezePosition(false);
            startDusterJob();
        }
    }, 3000);
}

function startDusterJob() {
    mp.events.add('render', renderDusterJob);

    gotExpa = 0;
    gotPoints = 0;
    driverStatus = DRIVER_OUT;

    addFieldPoints();

    notify('~b~Точки орошения отмечены на карте.');
    notify('~b~Чтобы уволиться с работы, просто выйди из самолета.');
}

function deleteCurrentField() {
    markers.forEach(obj => {
        obj.blip.destroy();
    });
    markers = [];
}

function addFieldPoints() {
    deleteCurrentField();

    const info = getJobLevelInfo();
    capturePointDist = info.dist;

    curField = utils.getRandomIndexNoRepeat(fields.length, curField);

    const field = fields[curField];
    const centerPos = new mp.Vector3(field.x, field.y, field.z + utils.getRandomInt(-10, 10));

    // выберем случайное направление
    const angle = utils.getRandomInt(0, 360);
    let radius = -(field.delta * (info.fieldPoints - 1) / 2);
    for (let i = 0; i < info.fieldPoints; ++i) {
        let p1 = {x: 0, y: 0};
        p1 = utils.xyInFrontOfPos(p1, angle, radius);

        const z = 0.001 * radius * radius; // парабола
        const x = p1.x;
        const y = 3 * Math.atan(x * 0.1);
        const pos = new mp.Vector3(p1.x + centerPos.x, y + centerPos.y, z + centerPos.z);

        radius += field.delta;

        const item = {};
        item.blip = mp.blips.new(config.pointBlipId, pos, {
            shortRange: false,
            color: config.pointBlipColor,
            scale: 0.75,
            name: 'Точка орошения',
        });
        let scale = info.dist;
        if (info.lvl >= 8) {
            scale = dusterLevels[6].dist;
        }
        item.scale = scale;
        markers.push(item);
    }
}

function endDusterJob() {
    driverStatus = DRIVER_END_JOB;

    mp.events.remove('render', renderDusterJob);

    let vehicleId = 0;
    if (mp.vehicles.exists(jobVehicle)) {
        vehicleId = jobVehicle.remoteId;
        jobVehicle.setEngineOn(false, false, true);
    }
    deleteCurrentField();

    rpc.callServer('ncw.fireDusterPilot', vehicleId).then(() => {
        if (gotPoints > 0) {
            outputChatBox(`!{#00FF00}Всего точек за подход: ${gotPoints}, опыт: ${gotExpa}`);
        }
    });
}

function renderDusterJob() {
    if (jobVehicle && mp.vehicles.exists(jobVehicle) && jobVehicle.handle && localPlayer.vehicle === jobVehicle) {
        if (smokeEffect) {
            smokeEffect.play(jobVehicle, -0.15, -5.0, 0.5);
        }
        const pos1 = jobVehicle.position;
        for (let i = 0, len = markers.length; i < len; ++i) {
            const item = markers[i];
            if (item.blip && item.blip.handle) {
                const pos = item.blip.getCoords();
                const scale = item.scale;
                mp.game.graphics.drawMarker(6, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, scale, scale, scale, 0, 255, 0, 255, false, true, 2, false, null, null, false);

                const dist = utils.getDistance3d(pos1, pos);
                if (dist <= capturePointDist) {
                    gotDusterJobPoint(item);
                    markers.splice(i, 1);

                    if (markers.length === 0) {
                        setTimeout(() => {
                            addFieldPoints();
                        }, 100);
                    }
                    break;
                }
            }
        }
    }
    if (driverStatus === DRIVER_OUT) {
        if (localPlayer.vehicle) {
            driverStatus = DRIVER_IN;
        }
    } else if (driverStatus === DRIVER_IN) {
        if (!localPlayer.vehicle) {
            driverStatus = DRIVER_END_JOB;
            endDusterJob();
        }
    }
}

function updateDusterJobGui() {
    // прогресс уровня = игрок сделал точек на этом уровне / макс точек уровня
    const levelInfo = getJobLevelInfo();

    let curPoints = 0;
    if (levelInfo.isLast || levelInfo.lvl === 1) {
        curPoints = playerPointsNumber;
    } else {
        const prevLevelInfo = dusterLevels[levelInfo.lvl - 2];
        curPoints = playerPointsNumber - prevLevelInfo.pointsAbsNum;
    }
    if (levelInfo.isLast) {
        outputChatBox(`Опыт: ${gotExpa}. Уровень: ${levelInfo.lvl}. Всего точек: ${playerPointsNumber}`);
    } else {
        outputChatBox(`Опыт: ${gotExpa}. Уровень: ${levelInfo.lvl}. Прогресс: ${curPoints}/${levelInfo.pointsDelta}. Точек: ${gotPoints}`);
    }
}

function gotDusterJobPoint(item) {
    item.blip.destroy();

    rpc.callServer('ncw.payForDusterPoint').then(expa => {
        ++gotPoints;
        ++playerPointsNumber;
        gotExpa += expa;

        updateDusterJobGui();

        notify(`~g~Опыт за точку: ~y~+${expa}`);
        mp.game.audio.playSoundFrontend(-1, 'Hack_Success', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS', true);
    });
}

function initDusterJob() {
    createJobReception();

    smokeEffect = new EntityParticleEffect(config.smokeEffect);

    rpc.on('ncw.waitDusterVehicle', waitDusterVehicle);
    rpc.on('ncw.endDusterJobForced', endDusterJob);
    rpc.on('ncw.onDusterPilotHired', onDusterPilotHired);

    outputChatBox('Начать работу: /duster');
}

mp.events.add('playerReady', initDusterJob);
