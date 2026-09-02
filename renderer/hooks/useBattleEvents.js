//Custom hook to handle battle events

import { useEffect, useState, useRef } from 'react'
import { getMiniSrc, getBattlerSrc } from '../helpers.js'

import MENSAJES from '../lib/mensajes.js'
import EFFECTS from '../lib/efectos.js'


export default function useBattleEvents({ p1, p2, mode, playerIdentity }) {

    const opponentIdentity = playerIdentity === 'p1' ? 'p2' : 'p1';

    function replacePokemonName(msj, player, name) {

    if (player == playerIdentity) {

        return msj.replace('{pkm}', `${name}`);

    } else {


        return msj.replace('{pkm}', `${name} rival`);

    }


}

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

    const [waiting, setWaiting] = useState(true); //Waiting for opponent
    const [switchRequired, setSwitchRequired] = useState(false); //Need to choose a pokemon


    function getPosition(player){

        if(!player) return null;

        return player == playerIdentity ? "x1" : "x2";

    }

    function addBattleLog(log) {

        setBattleLog((prev) => [...prev, log])

    }

    function scheduleAnimation(animation) {

        animationQueue.current.push(animation);
        setPendingAnimation(v => v + 1);

    }

    function updatePlayer(player, data) {
        const setPlayer = player === playerIdentity ? setPlayer1 : setPlayer2;
        setPlayer((prev) => ({ ...prev, ...data }));
    }

    function handlePlayer(data) {

        if (data.id === playerIdentity) {
            setPlayer1((prev) => ({ ...prev, playerName: data.name }))
        }

        if (data.id === opponentIdentity) {
            setPlayer2((prev) => ({ ...prev, playerName: data.name }))
        }

    }

    function handleSwitch(data) {

        //console.log('Switch event:', data)

        //console.log(data.name + ' switched in!')

        setWaiting(false);

        if (data.player === playerIdentity) {

            setSwitchRequired(false);

            if (data.maxHp == 100) {

                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                let log

                if (data.reason == 'drag') {
                    log = `¡${data.name} ha sido forzado a combatir!`
                } else {
                    log = `¡${data.name}, yo te elijo!`
                }

                const femaleSprite = data.num == 55 && data.gender == 'F' ? true : false

                scheduleAnimation({
                    event: 'pkmSwitch',
                    position: 'x1',
                    newSrc: getBattlerSrc(data.num, { back: true, shiny: data.shiny, femaleSprite: femaleSprite }),
                    pkmData: data,
                    log: log,
                    batonPass: data.batonPass
                });

                scheduleAnimation({
                    event: 'hpChange',
                    position: 'x1',
                    newHP: data.hp
                });

                addBattleLog(log)


            } else {

                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

            }


        }



        if (data.player === opponentIdentity) {


            if (data.maxHp == 100) {

                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                let log

                if (data.reason == 'drag') {
                    log = `¡${data.name} rival ha sido forzado a combatir!`
                } else {
                    log = `¡${data.name} rival ha entrado en combate!`
                }

                scheduleAnimation({
                    event: 'pkmSwitch',
                    position: 'x2',
                    newSrc: getBattlerSrc(data.num, { back: false, shiny: data.shiny }),
                    pkmData: data,
                    batonPass: data.batonPass,
                    log: log
                });

                scheduleAnimation({
                    event: 'hpChange',
                    position: 'x2',
                    newHP: data.hp
                });

                addBattleLog(log)

            } else {

                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

            }
        }
    }

    function handleMove(data) {
        const pkm = data.source.name;
        let log = `${pkm} usó ${data.translation}`;
        addBattleLog(log);
        setWaiting(false);

        if (data.ability !== null) {

            let position = data.ofPokemon ? getPosition(data.ofPokemon.player) : getPosition(data.source.player)

            scheduleAnimation({
                event: 'ability',
                pkmName: data.ofPokemon ? data.ofPokemon.name : pkm,
                abilityName: data.ability,
                position: position,
                translation: data.abilityTranslation
            });

        }

        scheduleAnimation({
            event: 'move',
            target: getPosition(data.target !== null ? data.target.player : null),
            targetType: data.targetType,
            still: data.still,
            missed: data.missed,
            type: data.type,
            category: data.category,
            heal: data.heal,
            name: data.move,
            log: log,
            player: getPosition(data.source.player),
        });
    }

    function handleFaint(data) {

        const log = replacePokemonName('¡{pkm} se debilitó', data.player, data.name);

        if (data.player === playerIdentity) {

            setPlayer1((prev) => ({ ...prev, pkmName: null, number: null, currentHP: 0, currentHPPercentage: 0 }))
            addBattleLog(log)
            setAvailableMoves([])
            setSwitchRequired(true)

            scheduleAnimation({
                event: 'hpChange',
                position: 'x1',
                newHP: 0
            });

            scheduleAnimation({
                event: 'faint',
                position: 'x1',
                log: log
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

        if (data.player === opponentIdentity) {
            setPlayer2((prev) => ({ ...prev, pkmName: null, number: null, currentHP: 0, currentHPPercentage: 0 }))

            scheduleAnimation({
                event: 'hpChange',
                position: 'x2',
                newHP: 0
            });

            scheduleAnimation({
                event: 'faint',
                position: 'x2',
                log: log
            });

            addBattleLog(log)
        }
    }

    function handleDamage(data) {

        console.log('Damage event:', data)

        //const isPercentageHP = data.maxHp === 100;

        if (data.from) {
            logDamageReason(data);
        }

        updatePlayerHP(data.player, data);
    }

    function logDamageReason(data) {
        const log = MENSAJES[`damage-[${data.from}]`];

        if (log === undefined) {
            addBattleLog(`Unhandled damage reason ${data.from}`);
            return;
        }

        const resolvedLog = replacePokemonName(log, data.player, data.name);

        if (data.from === 'confusion') {
            scheduleAnimation({
                event: 'effect',
                target: getPosition(data.player),
                log: resolvedLog,
                name: 'selfHit'
            });
        } else if (EFFECTS[data.from]) {

            scheduleAnimation({
                event: 'effect',
                target: getPosition(data.player),
                log: resolvedLog,
                name: data.from
            })

        } else if (data.ability) {

            scheduleAnimation({
                event: 'ability',
                pkmName: data.ofPokemon ? data.ofPokemon.name : data.name,
                abilityName: data.ability,
                player: data.ofPokemon ? getPosition(data.ofPokemon.player) : getPosition(data.source.player),
                translation: data.abilityTranslation
            });

            scheduleAnimation({
                event: 'log',
                log: resolvedLog
            });

        } else {

            scheduleAnimation({
                event: 'log',
                log: resolvedLog
            });

        }

        addBattleLog(resolvedLog);
    }

    function updatePlayerHP(player, data) {

        // Pokemon fainted — let the Faint function handle it
        if (data.hp === 0) return;

        const isPercentageHP = data.maxHp === 100;
        const setPlayer = player === playerIdentity ? setPlayer1 : setPlayer2;

        setPlayer((prev) => ({
            ...prev,
            currentHP: isPercentageHP ? prev.currentHP : data.hp,
            currentHPPercentage: isPercentageHP ? data.hp : prev.currentHP,
        }));

        if (isPercentageHP) {
            scheduleAnimation({ event: 'hpChange', position: getPosition(player), newHP: data.hp });
        }
    }

    function handleHeal(data) {


        updatePlayer(data.player, {
            //currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
            currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
        })

        //if (data.maxHp == 100) {

        let log;

        switch (data.reason) {

            case 'drain':

                log = data.ofPokemon ? `¡{pkm} ha drenado la salud de ${data.ofPokemon.name}!` : `¡{pkm} ha absorbido puntos de salud!`;

                break;
            case 'Ingrain':

                log = `¡{pkm} se ha nutrido con sus raíces!`

                break;

            case 'Aqua Ring':

                log = `¡{pkm} ha recuperado salud con Acua Aro!`

                break;

            case 'Leftovers':

                log = `¡{pkm} ha recuperado salud gracias a Restos!`

                break;

            case 'Wish':

                log = `¡El Deseo de {pkm} se ha realizado!`

                scheduleAnimation({
                    event: 'effect',
                    target: getPosition(data.player),
                    name: data.from
                })

                break;

            default:

                log = data.reason ? `¡{pkm} ha recuperado salud gracias a ${data.reason}!` : `¡{pkm} ha recuperado salud!`

        }

        log = replacePokemonName(log, data.player, data.name);

        addBattleLog(log);

        scheduleAnimation({
            event: 'hpChange',
            position: getPosition(data.player),
            newHP: data.hp,
            log: log
        });


    }

    function handleTeam(data) {

        console.log('Team event:', data)
        setAvailableMoves(data.active[0].moves)
        //console.log('Available moves updated:', data.active[0].moves)
        //console.log(data.side.pokemon)

        data.side.pokemon.forEach((poke) => {

            poke.icon = getMiniSrc(poke.num)

        })

        setAvailablePokemon(data.side.pokemon)
    }

    function handleForceSwitch(data) {
        if (data.side.id === opponentIdentity) {
            setPlayer2((prev) => ({ ...prev, pkmName: null, number: null }))
            setWaiting(false);
        }

        if (data.side.id === playerIdentity) {
            //addBattleLog(`¡${player1.pkmName} se ha debilitado!`)
            setPlayer1((prev) => ({ ...prev, pkmName: null, number: null }))
            setSwitchRequired(true);
            setWaiting(false);

        }
    }

    function handleStatus(data) {

        if (data.ability) {

            scheduleAnimation({
                event: 'ability',
                pkmName: data.ofPokemon ? data.ofPokemon.name : data.pkmName,
                abilityName: data.ability,
                player: data.ofPokemon ? getPosition(data.ofPokemon.player) : getPosition(data.player),
                translation: data.abilityTranslation
            });

        }

        updatePlayer(data.player, { status: data.status })

        const log = replacePokemonName(MENSAJES[data.status], data.player, data.pkmName);

        scheduleAnimation({
            event: 'statusChange',
            position: getPosition(data.player),
            newStatus: data.status,
            log: log
        });

        addBattleLog(log)

    }

    function handleStatusRecover(data) {

        let msj = MENSAJES[`${data.status}-recover`];

        if (!msj) {

            addBattleLog(`Error: unhandled status recover -> ${data.status}`)
            return;

        }

        let log = replacePokemonName(msj, data.player, data.pkmName);

        updatePlayer(data.player, { status: 'none' })

        scheduleAnimation({
            event: 'statusChange',
            position: getPosition(data.player),
            newStatus: 'none',
            log: log
        });

        addBattleLog(log)


    }

    function handlePrepare(data) {
        // Handle the (charge moves) prepare event

        console.log('Prepare event:', data)

        let log = MENSAJES[`prepare-[${data.move}]`];

        if (log !== undefined) {

            log = replacePokemonName(log, data.player, data.name);

            switch (data.move) {

                case 'Dive':
                case 'Dig':
                case 'Fly': {

                    scheduleAnimation({
                        event: 'prepare',
                        move: data.move,
                        position: getPosition(data.player),
                        pkm: data.name,
                        log: log
                    })


                    break;

                }

                default:

                    scheduleAnimation({
                        event: 'log',
                        log: log
                    })

            }

            addBattleLog(log);

        } else {

            addBattleLog(`Error: unhandled prepare move -> ${data.move}`)


        }
    }

    function handleWait(data) {

        setWaiting(true);

    }

    function handleCrit(data) {

        let msg = `¡{pkm} ha recibido un golpe crítico!`
        msg = replacePokemonName(msg,data.player,data.name);

        addBattleLog(msg);

    }

    function handleSuperEffective(data) {

        let msg = `¡El ataque a {pkm} fue super efectivo!`
        msg = replacePokemonName(msg,data.player,data.name);

        addBattleLog(msg);

    }

    function handleResisted(data) {

        let msg = `El ataque a {pkm} no es muy efectivo...`
        msg = replacePokemonName(msg,data.player,data.name);

        addBattleLog(msg);

    }

    function handleMiss(data) {

        let log = `¡{pkm} ha fallado!`;
        log = replacePokemonName(log, data.player, data.name);
        addBattleLog(log);

        scheduleAnimation({
            event: 'log',
            log: log
        })

    }

    function handleCant(data) {

        let msj = MENSAJES[`cant-[${data.reason}]`];

        if (msj !== undefined) {

            msj = replacePokemonName(msj, data.player, data.name);
            addBattleLog(msj);

            if (EFFECTS[data.reason]) {

                scheduleAnimation({
                    event: 'effect',
                    target: getPosition(data.player),
                    log: msj,
                    name: data.reason
                })

            } else {

                scheduleAnimation({
                    event: 'log',
                    log: msj
                })

            }


        } else {

            addBattleLog(`Error: unhandled reason for event: [cant] -> ${data.reason}`)

        }

    }

    function handleImmune(data) {

        let msj = `¡{pkm} es inmune al ataque!`
        msj = replacePokemonName(msj, data.player, data.name);
        addBattleLog(msj);

        scheduleAnimation({
            event: 'log',
            log: msj
        })

    }

    function handleEndItem(data) {

        let msj = `¡{pkm} ha perdido el objeto ${data.item}!`
        msj = replacePokemonName(msj, data.player, data.name);

        addBattleLog(msj);

        scheduleAnimation({
            event: 'log',
            log: msj
        })

    }

    function handleStartSideCondition(data) {

        let msj = MENSAJES[`side-condition-[${data.condition}]`];

        if (msj !== undefined) {

            if (data.player == playerIdentity) { //No recibe nombre de pokemon, sino de entrenador nadamas

                msj = msj.replace('{pkm}', `${player1Ref.current.pkmName}`);


            } else {

                msj = msj.replace('{pkm}', `${player2Ref.current.pkmName} rival`);

            }

            addBattleLog(msj);

            scheduleAnimation({
                event: 'log',
                log: msj
            })

        } else {

            addBattleLog(`Error: unhandled side condition -> ${data.origin} ${data.condition}`)

        }

    }

    function handleEndSideCondition(data) {

        let msj = MENSAJES[`side-condition-end-[${data.condition}]`];

        if (msj !== undefined) {

            if (data.player == 'p1') {

                msj = msj.replace('{pkm}', `${player1Ref.current.pkmName}`);


            } else {

                msj = msj.replace('{pkm}', `${player2Ref.current.pkmName} rival`);

            }

            addBattleLog(msj);

            scheduleAnimation({
                event: 'log',
                log: msj
            })

        } else {

            addBattleLog(`Error: unhandled side condition -> ${data.origin} ${data.condition}`)

        }

    }

    //Zoroak illusion
    function handleReplace(data) {

        let msj = `¡La ilusión de {pkm} ha sido revelada!`
        msj = replacePokemonName(msj, data.player, data.name);
        addBattleLog(msj);

        scheduleAnimation({
            event: 'transform',
            player: getPosition(data.player),
            newSrc: getBattlerSrc(data.num, { back: data.player == playerIdentity ? true : false, shiny: data.shiny }),
            log: msj
        });

        updatePlayer(data.player, { pkmName: data.name, number: data.num, level: data.level, gender: data.gender, shiny: data.shiny })

    }

    function handleStartVolatile(data) {

        if (data.ability) {

            scheduleAnimation({
                event: 'ability',
                pkmName: data.ofPokemon ? data.ofPokemon.name : data.name,
                abilityName: data.ability,
                player: data.ofPokemon ? getPosition(data.ofPokemon.player) : getPosition(data.player),
                translation: data.abilityTranslation
            });

        }

        let msj = MENSAJES[`[${data.effect}]-start`];

        if (data.effect == 'Disable' && data.extraInfo !== undefined) {

            const moveName = MOVES[data.extraInfo].translation ? MOVES[data.extraInfo].translation : MOVES[data.extraInfo].name;

            msj = `¡El movimiento ${moveName} de {pkm} ha sido desactivado!`;

        }

        if (msj !== undefined) {

            msj = replacePokemonName(msj, data.player, data.name);

            addBattleLog(msj);

            scheduleAnimation({
                event: 'volatileStart',
                effect: data.effect,
                position: getPosition(data.player),
                pokemon: data.name,
                log: msj
            })

        } else {

            console.log('No message for start volatile:', data.effect)

        }
    }

    function handleEndVolatile(data) {

        let msj = MENSAJES[`[${data.effect}]-end`];

        if (msj !== undefined) {

            msj = replacePokemonName(msj, data.player, data.name);

            addBattleLog(msj);

            scheduleAnimation({
                event: 'endVolatile',
                effect: data.effect,
                position: getPosition(data.player),
                pokemon: data.name,
                log: msj
            })

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
                //setWinner('p1');

                scheduleAnimation({
                    event: 'battleEnd',
                    winner: 'x1',
                    log: `¡Has ganado!`
                });

            }

            if (data.winner == player2Ref.current.playerName) {

                addBattleLog(`¡Has perdido!`);
                //setWinner('p2');

                scheduleAnimation({
                    event: 'battleEnd',
                    winner: 'x2',
                    log: `¡Has perdido!`
                });

            }
        }

    }

    function handleFail(data) {
        //addBattleLog(data.line);

        const { player, name, action, effectFrom, effectOf, isWeak } = data;

        let msj;

        switch (action) {
            case 'unboost':
                if (effectFrom) {
                    msj = `¡La reducción de estadísticas no tuvo efecto en {pkm}!`;
                } else {
                    msj = `¡Las estadísticas de {pkm} no pudieron bajar!`;
                    addBattleLog(data.line);
                }
                break;

            case 'heal':
                msj = `¡{pkm} ya tiene la vida completa!`;
                break;

            case 'tox':
            case 'psn':
                msj = `¡{pkm} ya está envenenado!`;
                break;

            case 'slp':
                msj = `¡{pkm} ya está dormido!`;
                break;

            case 'par':
                msj = `¡{pkm} ya está paralizado!`;
                break;

            case 'brn':
                msj = `¡{pkm} ya está quemado!`;
                break;

            case 'frz':
                msj = `¡{pkm} ya está congelado!`;
                break;

            case 'move: Substitute':
                msj = isWeak
                    ? `¡{pkm} no tiene suficiente PS para hacer un sustituto!`
                    : `¡{pkm} ya tiene un sustituto!`;
                break;

            default:
                msj = `¡{pkm} falló!`;
                break;
        }

        msj = replacePokemonName(msj, data.player, data.name);

        addBattleLog(msj);
        scheduleAnimation({
            event: 'log',
            log: msj
        })


    }


    //Ditto transforming
    function handleTransform(data) {

        if (data.player == 'p1') {

            let log = `¡${data.name} se ha transformado en ${data.targetName}!`;
            scheduleAnimation({
                event: 'transform',
                position: getPosition('p1'),
                newSrc: getBattlerSrc(player2Ref.current.number, { back: true, shiny: player2.shiny }),
                log: log
            });

            addBattleLog(log);


        } else {

            let log = `¡${data.name} rival se ha transformado en ${data.targetName}!`;
            scheduleAnimation({
                event: 'transform',
                position: getPosition('p2'),
                newSrc: getBattlerSrc(player1Ref.current.number, { back: false, shiny: player1.shiny }),
                log: log
            });

            addBattleLog(log);

        }

    }

    //Miscelaneous effect activated
    function handleEffect(data) {

        let msj = MENSAJES[`effect-[${data.effect}]`];

        if (msj) {

            msj = replacePokemonName(msj, data.player, data.name);

            addBattleLog(msj);

            if (EFFECTS[data.effect]) {

                scheduleAnimation({
                    event: 'effect',
                    target: getPosition(data.player),
                    log: msj,
                    name: data.effect
                })

            } else {

                scheduleAnimation({
                    event: 'log',
                    log: msj
                })

            }

        } else {

            addBattleLog(`Error: unhandled effect -> ${data.effect}`);

        }

    }

    //Positive or negative stat boost
    function handleBoost(data) {

        let msj = MENSAJES[`boost-${data.stat}-[${data.amount}]`];

        if (data.amount !== '0') {

            msj = data.negative ? msj.replace('aumentado', 'bajado') : msj;

        } else {

            msj = data.negative ? msj.replace('subir', 'bajar') : msj;

        }

        msj = replacePokemonName(msj, data.player, data.name);

        addBattleLog(msj);

        scheduleAnimation({
            event: 'log',
            log: msj
        });

    }

    function handleAbility(data) {

        scheduleAnimation({
            event: 'ability',
            pkmName: data.name,
            abilityName: data.ability,
            position: getPosition(data.player),
            translation: data.translation
        });

    }

    function handleWeather(data) {

        if (data.ability) {

            scheduleAnimation({
                event: 'ability',
                pkmName: data.ofPokemon.name,
                abilityName: data.ability,
                position: getPosition(data.ofPokemon.player),
                translation: data.abilityTranslation
            });

        }

        let log = data.upkeep ? MENSAJES[`upkeep-[${data.type}]`] : MENSAJES[`weather-[${data.type}]`];

        scheduleAnimation({
            event: 'weather',
            type: data.type,
            log,
            upkeep: data.upkeep
        });

        addBattleLog(log);

    }

    function handleError(msg) {

        addBattleLog(msg);

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
            'endSideCondition': handleEndSideCondition,
            'replace': handleReplace,
            'startVolatile': handleStartVolatile,
            'clearAllBoost': handleClearAllBoost,
            'endVolatile': handleEndVolatile,
            'battleEnd': handleBattleEnd,
            'fail': handleFail,
            'transform': handleTransform,
            'effect': handleEffect,
            'boost': handleBoost,
            'ability': handleAbility,
            'prepare': handlePrepare,
            'weather': handleWeather,
            'error': handleError
        }

        Object.entries(handlers).forEach(([channel, handler]) => {
            window.electronAPI.on(channel, handler)
        })

        console.log(mode);
        if (mode === 'random') {
            console.log('Starting random battle...');
            window.electronAPI.startRandomBattle();
        } else {
            window.electronAPI.battleUIReady();
        }

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
        availablePokemon, waiting, switchRequired, animationQueue, pendingAnimation, setWaiting
    }

}