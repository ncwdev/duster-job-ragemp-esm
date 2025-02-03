import rpc from 'rage-rpc';
import './dusterJob.js';

function init() {
    rpc.triggerServer('ncw.playerReady');
}

mp.events.add('playerReady', init);
