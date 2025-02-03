import { Person } from './person/Person';
import { PersonProfileJson } from './person/PersonProfileJson';
import { initDusterJob } from './jobs/dusterJobManager';
import { config } from '../shared/dusterJobConfig';
import * as utils from '../shared/utils';

import rpc from 'rage-rpc';

function onPlayerReady(_, info) {
    const player = info.player;
    const personId = player.name; // do not use in production!
    const personProfile = new PersonProfileJson(personId);

    player.ncw = {};
    player.ncw.person = new Person(personId, personProfile);

    const pos = new mp.Vector3(config.respawnPos.x, config.respawnPos.y, config.respawnPos.z);
    utils.respawnPlayer(player, pos);
}
rpc.on('ncw.playerReady', onPlayerReady);

function onPlayerQuit(player) {
    if (!player.ncw || !player.ncw.person) {
        return;
    }
    const person = player.ncw.person;
    const job = person.getJob();

    if (job) {
        job.finish();
    }
    delete player.ncw.person;
    delete player.ncw;
}
mp.events.add('playerQuit', onPlayerQuit);

initDusterJob();
