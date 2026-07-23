//Custom hook to handle battle events

import { useEffect, useState, useRef } from 'react'

import MENSAJES from '../lib/mensajes.js'

export default function useBattleEvents({ p1, p2 }) {

    const animationQueue = useRef([]); //Animate 1 by 1
    const [pendingAnimation, setPendingAnimation] = useState(0);

    const [battlerSrcs, setBattlerSrcs] = useState({});

    const [player1, setPlayer1] = useState(p1);
    const [player2, setPlayer2] = useState(p2);

    //Refs to keep track of the latest player state in event handlers
    const player1Ref = useRef(player1)
    const player2Ref = useRef(player2)

    //Synchronize refs with state whenever player1 or player2 changes
    useEffect(() => { player1Ref.current = player1 }, [player1])
    useEffect(() => { player2Ref.current = player2 }, [player2])

    const [battleLog, setBattleLog] = useState([]);

    const [availableMoves, setAvailableMoves] = useState([]);
    const [availablePokemon, setAvailablePokemon] = useState([]);

    const [waiting, setWaiting] = useState(false); //Waiting for opponent
    const [switchRequired, setSwitchRequired] = useState(false); //Need to choose a pokemon

    const [winner, setWinner] = useState(null);

    function addBattleLog(log) {

        setBattleLog((prev) => [...prev, log])

    }

    //Function to get the path of the icon for a given pokemon number
    function getMiniSrc(number) {
        const key = `icon${String(number).padStart(3, '0')}.png`;
        return `/minis/${key}`;
    }

    //Function to get the path of the battle sprite for a given pokemon number
    function getBattlerSrc(number, { back = false, shiny = false } = {}) {
        const suffix = `${shiny ? 's' : ''}${back ? 'b' : ''}`;
        const key = `${String(number).padStart(3, '0')}${suffix}.png`;
        return `/battlers/${key}`;
    }

    function scheduleAnimation(animation) {

        animationQueue.current.push(animation);
        setPendingAnimation(v => v + 1);

    }

    function handlePlayer(data) {

        if (data.id === 'p1') {
            setPlayer1((prev) => ({ ...prev, playerName: data.name }))
        }

        if (data.id === 'p2') {
            setPlayer2((prev) => ({ ...prev, playerName: data.name }))
        }

    }

    function handleSwitch(data) {

        console.log(data.name + ' switched in!')

        if (data.player === 'p1') {

            setSwitchRequired(false);

            if (data.maxHp == 100) {

                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                let log

                if (data.reason == 'drag') {
                    log = `¡${data.name} ha sido forzado a combatir!`
                } else {
                    log = `¡${data.name}, yo te elijo!`
                }

                scheduleAnimation({
                    event: 'pkmSwitch',
                    player: 'p1',
                    newSrc: getBattlerSrc(data.num, { back: true, shiny: data.shiny }),
                    pkmData: data,
                    log: log
                });

                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p1',
                    newHP: data.hp
                });

                addBattleLog(log)


            } else {

                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

            }


        }



        if (data.player === 'p2') {


            if (data.maxHp == 100) {

                setWaiting(false)

                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                let log

                if (data.reason == 'drag') {
                    log = `¡${data.name} rival ha sido forzado a combatir!`
                } else {
                    log = `¡${data.name} rival ha entrado en combate!`
                }

                scheduleAnimation({
                    event: 'pkmSwitch',
                    player: 'p2',
                    newSrc: getBattlerSrc(data.num, { back: false, shiny: data.shiny }),
                    pkmData: data,
                    log: log
                });

                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p2',
                    newHP: data.hp
                });

                addBattleLog(log)

            } else {

                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

            }
        }
    }

    function handleMove(data) {
        const pkm = data.source.player === 'p1' ? player1Ref.current.pkmName : player2Ref.current.pkmName;
        let log = `${pkm} usó ${data.move}`;
        addBattleLog(log);
        setWaiting(false);
        scheduleAnimation({
            event: 'move',
            log: log
        });
    }

    function handleFaint(data) {
        if (data.player === 'p1') {

            setPlayer1((prev) => ({ ...prev, pkmName: null, number: null, currentHP: 0, currentHPPercentage: 0 }))
            addBattleLog(`¡${data.name} se debilitó!`)
            setAvailableMoves([])
            setSwitchRequired(true)

            scheduleAnimation({
                event: 'hpChange',
                player: 'p1',
                newHP: 0
            });

            scheduleAnimation({
                event: 'faint',
                player: 'p1'
            });

            setAvailablePokemon((prev) => {

                prev.forEach((poke) => {

                    if (poke.name == data.name) {
                        poke.currentHp = 0;
                        poke.status = 'fnt';
                    }

                })

                return prev;

            })
        }

        if (data.player === 'p2') {
            setPlayer2((prev) => ({ ...prev, pkmName: null, number: null, currentHP: 0, currentHPPercentage: 0 }))

            scheduleAnimation({
                event: 'hpChange',
                player: 'p2',
                newHP: 0
            });

            scheduleAnimation({
                event: 'faint',
                player: 'p2'
            });

            addBattleLog(`¡El ${data.name} salvaje se debilitó!`)
        }
    }

    function handleDamage(data) {

        //Data.maxHp might be 0 in case of fainted pokemon
        if (data.player === 'p1') {

            //pokemon fainted
            if (data.hp === 0) {

                //Let Faint function handle it
                return

            } else {
                setPlayer1((prev) => ({
                    ...prev,
                    currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                    currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                }))

            }

            //Add animation only once
            if (data.maxHp == 100) {
                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p1',
                    newHP: data.hp
                });
            }

        }

        if (data.player === 'p2') {
            if (data.maxHp === 0) {

                //Let Faint function handle it
                return

            } else {
                setPlayer2((prev) => ({
                    ...prev,
                    currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                    currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                }))
            }

            //Add animation only once
            if (data.maxHp == 100) {
                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p2',
                    newHP: data.hp
                });
            }
        }
    }

    function handleHeal(data) {


        if (data.player === 'p1') {


            setPlayer1((prev) => ({
                ...prev,
                currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
            }))

            if (data.maxHp == 100) {


                let log;

                if (data.reason !== undefined) {

                    log = `¡${data.name} ha recuperado salud gracias a ${data.reason}!`

                } else {

                    log = `¡${data.name} ha recuperado salud!`

                }

                addBattleLog(log);

                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p1',
                    newHP: data.hp,
                    log: log
                });

            }


        }

        if (data.player === 'p2') {

            setPlayer2((prev) => ({
                ...prev,
                currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
            }))

            if (data.maxHp == 100) {

                let log;

                if (data.reason !== undefined) {

                    log = `¡${data.name} rival ha recuperado salud gracias a ${data.reason}!`

                } else {

                    log = `¡${data.name} rival ha recuperado salud!`

                }

                addBattleLog(log);

                scheduleAnimation({
                    event: 'hpChange',
                    player: 'p2',
                    newHP: data.hp,
                    log: log
                });


            }

        }
    }

    function handleTeam(data) {
        setAvailableMoves(data.active[0].moves)
        console.log('Available moves updated:', data.active[0].moves)
        console.log(data.side.pokemon)

        data.side.pokemon.forEach((poke) => {

            poke.icon = getMiniSrc(poke.num)

        })

        setAvailablePokemon(data.side.pokemon)
    }

    function handleForceSwitch(data) {
        if (data.side.id === 'p2') {
            setPlayer2((prev) => ({ ...prev, pkmName: null, number: null }))
            setWaiting(false);
        }

        if (data.side.id === 'p1') {
            //addBattleLog(`¡${player1.pkmName} se ha debilitado!`)
            setPlayer1((prev) => ({ ...prev, pkmName: null, number: null }))
            setSwitchRequired(true);
            setWaiting(false);

        }
    }

    function handleStatus(data) {
        if (data.player === 'p2') {
            setPlayer2((prev) => ({ ...prev, status: data.status }))

            let log = `¡${data.pkmName} rival ${MENSAJES[data.status]}!`

            scheduleAnimation({
                event: 'statusChange',
                player: 'p2',
                newStatus: data.status,
                log: log
            });

            addBattleLog(log)

        }

        if (data.player === 'p1') {
            setPlayer1((prev) => ({ ...prev, status: data.status }))

            let log = `¡${data.pkmName} ${MENSAJES[data.status]}!`

            scheduleAnimation({
                event: 'statusChange',
                player: 'p1',
                newStatus: data.status,
                log: log
            });
            addBattleLog(log)

        }
    }

    function handleStatusRecover(data) {
        if (data.player === 'p2') {
            setPlayer2((prev) => ({ ...prev, status: 'none' }))

            addBattleLog(`¡${data.pkmName} ${MENSAJES[`${data.status}-recover`]}!`)

        }

        if (data.player === 'p1') {
            setPlayer1((prev) => ({ ...prev, status: 'none' }))
            addBattleLog(`¡${data.pkmName} ${MENSAJES[`${data.status}-recover`]}!`)

        }
    }

    function handleWait(data) {

        setWaiting(true);

    }

    function handleCrit(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡${data.name} ha recibido un golpe crítico!`);


        } else {

            addBattleLog(`¡${data.name} rival ha recibido un golpe crítico!`);

        }

    }

    function handleSuperEffective(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡El ataque a ${data.name} fue super efectivo!`);


        } else {

            addBattleLog(`¡El ataque a ${data.name} rival fue super efectivo!`);

        }

    }

    function handleResisted(data) {

        if (data.player == 'p1') {

            addBattleLog(`El ataque a ${data.name} no es muy efectivo...`);


        } else {

            addBattleLog(`El ataque a ${data.name} rival no es muy efectivo...`);

        }

    }

    function handleMiss(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡${data.name} falló!`);


        } else {

            addBattleLog(`¡El ataque de ${data.name} rival ha fallado!`);

        }

    }

    function handleCant(data) {

        let msj = MENSAJES[`cant-[${data.reason}]`];

        if (msj !== undefined) {

            if (data.player == 'p1') {

                addBattleLog(msj.replace('{pkm}', data.name));


            } else {

                addBattleLog(msj.replace('{pkm}', `${data.name} rival`));

            }

        } else {

            addBattleLog(`Error: unhandled reason for event: [cant] -> ${data.reason}`)

        }

    }

    function handleImmune(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡${data.name} es inmune al ataque!`);


        } else {

            addBattleLog(`¡${data.name} rival es inmune al ataque!`);

        }

    }

    function handleEndItem(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡${data.name} ha perdido el objeto ${data.item}!`);


        } else {

            addBattleLog(`¡${data.name} rival ha perdido el objeto ${data.item}!`);

        }

    }

    function handleStartSideCondition(data) {

        let msj = MENSAJES[`side-condition-[${data.condition}]`];

        if (msj !== undefined) {

            if (data.player == 'p1') {

                addBattleLog(msj.replace('{pkm}', `${player1Ref.current.pkmName}`));


            } else {

                addBattleLog(msj.replace('{pkm}', `${player2Ref.current.pkmName} rival`));

            }

        } else {

            addBattleLog(`Error: unhandled side condition -> ${data.origin} ${data.condition}`)

        }

    }

    function handleReplace(data) {

        if (data.player === 'p1') {

            addBattleLog(`¡La ilusión de ${data.name} ha sido revelada!`)

            setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, gender: data.gender, shiny: data.shiny }))

        }

        if (data.player === 'p2') {

            addBattleLog(`¡La ilusión de ${data.name} rival ha sido revelada!`)
            setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, gender: data.gender, shiny: data.shiny }))

        }
    }

    function handleStartVolatile(data) {

        let msj = MENSAJES[`[${data.effect}]-start`];

        if (msj !== undefined) {

            if (data.player === 'p1') {

                addBattleLog(msj.replace('{pkm}', data.name))

            }

            if (data.player === 'p2') {

                addBattleLog(msj.replace('{pkm}', data.name + ' rival'))

            }
        } else {

            console.log('No message for start volatile:', data.effect)

        }
    }

    function handleEndVolatile(data) {

        let msj = MENSAJES[`[${data.effect}]-end`];

        if (msj !== undefined) {

            if (data.player === 'p1') {

                addBattleLog(msj.replace('{pkm}', data.name))

            }

            if (data.player === 'p2') {

                addBattleLog(msj.replace('{pkm}', data.name + ' rival'))

            }
        } else {

            console.log('No message for end volatile:', data.effect)

        }
    }

    function handleClearAllBoost(data) {

        let msj = MENSAJES[`clear-all-boost`];
        addBattleLog(msj);

    }

    function handleBattleEnd(data) {

        if (data.result == 'win') {

            if (data.winner == player1Ref.current.playerName) {

                addBattleLog(`¡Has ganado!`);
                setWinner('p1');

            }

            if (data.winner == player2Ref.current.playerName) {

                addBattleLog(`¡Has perdido!`);
                setWinner('p2');

            }
        }

    }

    function handleFail(data) {

        addBattleLog(data.line);

        /*if (data.player == 'p1') {

            //addBattleLog(`¡${data.name} falló!`);

        } else {

            //addBattleLog(`¡${data.name} rival falló!`);

        }*/

    }

    function handleTransform(data) {

        if (data.player == 'p1') {

            addBattleLog(`¡${data.name} se ha transformado en ${data.targetName}!`);
            scheduleAnimation({
                event: 'transform',
                player: 'p1',
                newSrc: getBattlerSrc(player2Ref.current.number, { back: true, shiny: player2.shiny })
            });


        } else {

            addBattleLog(`¡${data.name} rival se ha transformado en ${data.targetName}!`);
            scheduleAnimation({
                event: 'transform',
                player: 'p2',
                newSrc: getBattlerSrc(player1Ref.current.number, { back: false, shiny: player1.shiny })
            });

        }

    }

    //Miscelaneous effect activated
    function handleEffect(data) {

        let msj = MENSAJES[`effect-[${data.effect}]`];

        if (msj) {

            if (data.player == 'p1') {

                addBattleLog(msj.replace('{pkm}', `${data.name}`));

            } else {


                addBattleLog(msj.replace('{pkm}', `${data.name} rival`));

            }

        } else {

            addBattleLog(`Error: unhandled effect -> ${data.effect}`);

        }

    }

    //Positive or negative stat boost
    function handleBoost(data) {

        let msj = MENSAJES[`boost-${data.stat}-[${data.amount}]`];
        msj = data.negative ? msj.replace('aumentado', 'bajado') : msj;

        if (data.player == 'p1') {

            addBattleLog(msj.replace('{pkm}', `${data.name}`));

        } else {


            addBattleLog(msj.replace('{pkm}', `${data.name} rival`));

        }


    }

    useEffect(() => {
        const handlers = {
            'player': handlePlayer,
            'switch': handleSwitch,
            'move': handleMove,
            'faint': handleFaint,
            'damage': handleDamage,
            'heal': handleHeal,
            'team': handleTeam,
            'forceSwitch': handleForceSwitch,
            'status': handleStatus,
            'statusRecover': handleStatusRecover,
            'wait': handleWait,
            'crit': handleCrit,
            'superEffective': handleSuperEffective,
            'resisted': handleResisted,
            'miss': handleMiss,
            'cant': handleCant,
            'immune': handleImmune,
            'enditem': handleEndItem,
            'startSideCondition': handleStartSideCondition,
            'replace': handleReplace,
            'startVolatile': handleStartVolatile,
            'clearAllBoost': handleClearAllBoost,
            'endVolatile': handleEndVolatile,
            'battleEnd': handleBattleEnd,
            'fail': handleFail,
            'transform': handleTransform,
            'effect': handleEffect,
            'boost': handleBoost
        }

        Object.entries(handlers).forEach(([channel, handler]) => {
            window.electronAPI.on(channel, handler)
        })

        return () => {
            Object.keys(handlers).forEach(channel => window.electronAPI.off(channel))
        }
    }, [])

    {/*useEffect(() => {
        async function load() {
            const src1 = getBattlerSrc(player1.number, { back: true, shiny: player1.shiny });
            const src2 = getBattlerSrc(player2.number, { back: false, shiny: player2.shiny });
            setBattlerSrcs({ src1, src2 });
        }
        load();
    }, [player1.number, player2.number]);*/}

    return {
        battleLog, addBattleLog, player1, player2, battlerSrcs, setBattlerSrcs, availableMoves,
        availablePokemon, waiting, switchRequired, winner, animationQueue, pendingAnimation
    }

}