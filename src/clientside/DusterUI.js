const outputChatBox = mp.gui.chat.push;
const notify = mp.game.graphics.notify;

export class DusterUI {
    config = null;

    constructor(config) {
        this.config = config;

        outputChatBox('Начать работу: /duster');
    }

    showInstruction() {
        notify('~b~Точки орошения отмечены на карте.');
        notify('~b~Чтобы уволиться с работы, просто выйди из самолета.');

        outputChatBox('!{#FFFF00}Руль высоты по-умолчанию - клавиши Num8 и Num5.');
    }

    showFinalStats(points, expa) {
        outputChatBox(`!{#00FF00}Всего точек за подход: ${points}, опыт: ${expa}`);
    }

    updateProgress(levelInfo, playerPointsNumber, gotPoints, gotExpa) {
        let curPoints = 0;
        if (levelInfo.isLast || levelInfo.lvl === 1) {
            curPoints = playerPointsNumber;
        } else {
            const prevLevelInfo = this.config.levels[levelInfo.lvl - 2];
            curPoints = playerPointsNumber - prevLevelInfo.pointsAbsNum;
        }
        if (levelInfo.isLast) {
            outputChatBox(`Опыт: ${gotExpa}. Уровень: ${levelInfo.lvl}. Всего точек: ${playerPointsNumber}`);
        } else {
            outputChatBox(`Опыт: ${gotExpa}. Уровень: ${levelInfo.lvl}. Прогресс: ${curPoints}/${levelInfo.pointsDelta}. Точек: ${gotPoints}`);
        }
    }

    onGotPoint(expa) {
        notify(`~g~Опыт за точку: ~y~+${expa}`);
        mp.game.audio.playSoundFrontend(-1, 'Hack_Success', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS', true);
    }
}
