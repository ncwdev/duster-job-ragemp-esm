// Абстракция для уровней работ и других фич.
// Передаваемый конфиг должен содержать поле pointsDelta для каждого уровня, описывая прогресс.
// Последний уровень должен иметь поле isLast = true.

export class FeatureLevels {
    levelsConfig = null;

    linIterations = 0;
    binIterations = 0;

    constructor(levelsConfig) {
        this.levelsConfig = levelsConfig;

        let previous = 0;
        for (let i = 0; i < levelsConfig.length; ++i) {
            const info = levelsConfig[i];
            info.pointsAbsNum = info.pointsDelta + previous;
            previous = info.pointsAbsNum;
        }
    }

    getLevelInfoByPoints(points) {
        // return this.getLevelInfoLinear(points);
        return this.getLevelInfoBinary(points);
    }

    getLevelInfoLinear(points) {
        // версия с линейным поиском
        this.linIterations = 0;

        for (let i = 0; i < this.levelsConfig.length; ++i) {
            ++this.linIterations;
            const info = this.levelsConfig[i];
            if (points < info.pointsAbsNum || info.isLast) {
                return this.levelsConfig[i];
            }
        }
        return this.levelsConfig[0];
    }

    getLevelInfoBinary(points) {
        // версия с бинарным поиском
        this.binIterations = 0;
        let left = 0;
        let right = this.levelsConfig.length - 1;

        while (left <= right) {
            ++this.binIterations;
            const mid = Math.floor((left + right) / 2);
            const info = this.levelsConfig[mid];

            if (points < info.pointsAbsNum) {
                // переходим к левой части
                right = mid - 1;
            } else if (info.isLast || (mid < this.levelsConfig.length - 1 && points < this.levelsConfig[mid + 1].pointsAbsNum)) {
                if (info.isLast) {
                    return info;
                }
                return this.levelsConfig[mid + 1];
            } else {
                // переходим к правой части
                left = mid + 1;
            }
        }
        // Если не найдено, возвращаем первый уровень
        return this.levelsConfig[0];
    }
};
