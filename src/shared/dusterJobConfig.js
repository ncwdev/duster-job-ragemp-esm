export const config = Object.freeze({
    name: 'Орошитель',
    vehicle: 'duster',
    levels: [
        // dist - максимальное расстояние для захвата точки, уменьшается с уровнем, увеличивая сложность
        { lvl: 1, fieldPoints: 1, expa: 10, dist: 10, pointsDelta: 100 },
        { lvl: 2, fieldPoints: 2, expa: 10, dist: 9, pointsDelta: 200 },
        { lvl: 3, fieldPoints: 3, expa: 10, dist: 8, pointsDelta: 300 },
        { lvl: 4, fieldPoints: 4, expa: 10, dist: 7, pointsDelta: 500 },
        { lvl: 5, fieldPoints: 5, expa: 10, dist: 6, pointsDelta: 1000 },
        { lvl: 6, fieldPoints: 6, expa: 10, dist: 5.5, pointsDelta: 2000 },
        { lvl: 7, fieldPoints: 7, expa: 10, dist: 5, pointsDelta: 5000 },
        { lvl: 8, fieldPoints: 8, expa: 10, dist: 4.5, pointsDelta: 10000 },
        { lvl: 9, fieldPoints: 9, expa: 10, dist: 4, pointsDelta: 15000 },
        { lvl: 10, fieldPoints: 10, expa: 10, dist: 3.5, pointsDelta: 20000 },
        { lvl: 'бог', fieldPoints: 10, expa: 10, dist: 3, pointsDelta: 0, isLast: true },
    ],
    fields: [
        // delta - расстояние между точками, подобранное, чтобы все 10 точек разместились над полем
        { x: 1924.24, y: 4822.54, z: 71.37, delta: 15 },
        { x: 2038.16, y: 4908.74, z: 63.81, delta: 15 },
        { x: 2214.75, y: 5102.00, z: 86.77, delta: 15 },
        { x: 2346.68, y: 4999.61, z: 78.71, delta: 14 },
        { x: 2532.32, y: 4820.71, z: 58.20, delta: 14 },
        { x: 2853.27, y: 4632.36, z: 83.23, delta: 14 },
        { x: 2619.45, y: 4501.73, z: 71.23, delta: 16 },
    ],
    pedPos: { x: 2136.20, y: 4794.20, z: 41.01 },
    respawnPos: { x: 2138.0, y: 4791.24, z: 40.97 },
    // настройки спавна самолетов в воздухе, чтобы не стакались один в другом
    spawnSectors: 20,
    spawnRadius: 50,
    spawnHeight: 240,
    timeToDestroyVehicle: 1000, // через сколько удалить самолет, когда закончили работу
    reception: {
        // бот с иконкой
        rot: 20,
        blipId: 251,
        blipColor: 17,
        blipName: 'Работа: орошитель',
        blipScale: 1.0,
        pedModel: 'a_m_m_hillbilly_01',
    },
    smokeEffect: {
        dict: 'scr_carsteal4',
        name: 'scr_carsteal4_wheel_burnout',
        scale: 0.35,
        color: [255, 255, 0],
    },
    pointBlipId: 1, // кружок
    pointBlipColor: 2, // зеленый
});
