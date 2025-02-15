// ncwdev: работа орошитель полей
import rpc from 'rage-rpc';
import { config } from '../shared/dusterJobConfig';
import { FeatureLevels } from '../shared/FeatureLevels';
import { JobReception } from './JobReception';
import { FieldManager } from './FieldManager';
import { DusterVehicle } from './DusterVehicle';
import { DusterUI } from './DusterUI';

let gotExpa = 0; // опыт, заработанный за сессию
let gotPoints = 0; // сколько взял точек на одном самолете
let playerPointsNumber = 0; // общее число точек игрока - определяет уровень работы

let ui = null;
let jobLevels = null;
let jobVehicle = null;
let fieldManager = null;

let checkProximityInterval = null;

function clearProximityInterval() {
    clearInterval(checkProximityInterval);
    checkProximityInterval = null;
}

function getJobLevelInfo() {
    return jobLevels.getLevelInfoByPoints(playerPointsNumber);
}

async function waitDusterVehicle(vehicle) {
    const isLoaded = await jobVehicle.isLoaded(vehicle);
    if (isLoaded) {
        rpc.triggerServer('ncw.onDusterVehicleReady', vehicle.remoteId);
    } else {
        rpc.triggerServer('ncw.cancelDusterJob', vehicle.remoteId);
    }
}

function onDusterPilotHired(points) {
    playerPointsNumber = points;

    ui.showInstruction();

    // ждем, пока игрок читает подсказки
    setTimeout(() => {
        startDusterJob();
    }, 3000);
}

function startDusterJob() {
    gotExpa = 0;
    gotPoints = 0;

    generateNewField();
    jobVehicle.start();

    mp.events.add('render', renderDusterJob);

    clearProximityInterval();
    checkProximityInterval = setInterval(() => {
        const vehiclePos = jobVehicle.getPosition();
        if (fieldManager.checkProximity(vehiclePos)) {
            gotDusterJobPoint();

            if (fieldManager.isEmpty()) {
                setTimeout(() => {
                    generateNewField();
                }, 100);
            }
        }
    }, config.checkProximityTime);
}

function generateNewField() {
    const info = getJobLevelInfo();
    fieldManager.generateNewField(info);
}

function endDusterJob() {
    jobVehicle.stop();
    fieldManager.cleanup();

    mp.events.remove('render', renderDusterJob);
    clearProximityInterval();

    rpc.callServer('ncw.fireDusterPilot').then(() => {
        if (gotPoints > 0) {
            ui.showFinalStats(gotPoints, gotExpa);
        }
    });
}

function renderDusterJob() {
    if (jobVehicle.inGame()) {
        jobVehicle.renderSmoke();
        fieldManager.renderMarkers();
    }
    jobVehicle.checkDriverStatus();
    if (!jobVehicle.hasDriver()) {
        endDusterJob();
    }
}

function gotDusterJobPoint() {
    rpc.callServer('ncw.payForDusterPoint').then(expa => {
        ++gotPoints;
        ++playerPointsNumber;
        gotExpa += expa;

        // прогресс уровня = игрок сделал точек на этом уровне / макс точек уровня
        const levelInfo = getJobLevelInfo();
        ui.updateProgress(levelInfo, playerPointsNumber, gotPoints, gotExpa);
        ui.onGotPoint(expa);
    });
}

function initDusterJob() {
    new JobReception(config.reception);

    ui = new DusterUI(config);
    jobLevels = new FeatureLevels(config.levels);
    fieldManager = new FieldManager(config);
    jobVehicle = new DusterVehicle(config);

    rpc.on('ncw.waitDusterVehicle', waitDusterVehicle);
    rpc.on('ncw.endDusterJobForced', endDusterJob);
    rpc.on('ncw.onDusterPilotHired', onDusterPilotHired);
}
mp.events.add('playerReady', initDusterJob);
