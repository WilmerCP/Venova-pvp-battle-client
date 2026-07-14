import './index.css'
import bg from './assets/fondos/battlebgChampion.png'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import BattleControlBox from './components/BattleControlBox.jsx'
import PokeStatusBar from './components/PokeStatusBar.jsx'
import PopupEnd from './components/PopupEnd.jsx'

import MENSAJES from './lib/mensajes.js'

let p1 = {

    playerName: 'Jugador 1',
    pkmName: 'Iguasauro',
    shiny: false,
    maxHP: 250,
    currentHP: 250,
    currentHPPercentage: 100,
    level: 50,
    gender: 'male',
    status: 'none',
    number: 80


}

let p2 = {

    playerName: 'Jugador 2',
    pkmName: 'Zacarth',
    shiny: false,
    maxHP: 100,
    currentHP: 100,
    level: 50,
    gender: 'female',
    status: 'none',
    number: 150

}

const movesTemplate = [
    { move: 'Mordisco', pp: 15, maxpp: 15, type: 'Dark', disabled: false, target: 'normal' },
    { move: 'Garra Dragon', pp: 10, maxpp: 10, type: 'Dragon', disabled: false, target: 'self' },
    { move: 'Lanzallamas', pp: 5, maxpp: 8, type: 'Fire', disabled: false, target: 'normal' },
    { move: 'Velocidad Extrema', pp: 5, maxpp: 5, type: 'Normal', disabled: false, target: 'normal' },
]




export default function Battle() {

    const [battlerSrcs, setBattlerSrcs] = useState({});

    const [player1, setPlayer1] = useState(p1);
    const [player2, setPlayer2] = useState(p2);

    const [battleLog, setBattleLog] = useState([]);

    const [availableMoves, setAvailableMoves] = useState([]);
    const [availablePokemon, setAvailablePokemon] = useState([]);

    const [waiting, setWaiting] = useState(false); //Waiting for opponent
    const [switchRequired, setSwitchRequired] = useState(false); //Need to choose a pokemon

    const [winner, setWinner] = useState(null);

    const battleData = useLoaderData();

    //console.log(battleData)

    const navigate = useNavigate()

    function addBattleLog(log) {

        setBattleLog((prev) => [...prev, log])

    }

    useEffect(() => {
        window.electronAPI.onPlayer((data) => {

            if (data.id === 'p1') {
                setPlayer1((prev) => ({ ...prev, playerName: data.name }))
            }

            if (data.id === 'p2') {
                setPlayer2((prev) => ({ ...prev, playerName: data.name }))
            }

        })

        return () => {
            window.electronAPI.offPlayer()
        }
    }, [])

    useEffect(() => {
        window.electronAPI.onSwitch((data) => {

            console.log(data.name + ' switched in!')

            if (data.player === 'p1') {

                setSwitchRequired(false);

                if (data.maxHp == 100) {

                    setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                    if (data.reason == 'drag') {
                        addBattleLog(`¡${data.name} ha sido forzado a combatir!`)
                    } else {
                        addBattleLog(`¡${data.name}, yo te elijo!`)
                    }

                } else {

                    setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

                }


            }



            if (data.player === 'p2') {


                if (data.maxHp == 100) {

                    setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }))

                    if (data.reason == 'drag') {
                        addBattleLog(`¡${data.name} rival ha sido forzado a combatir!`)
                    } else {
                        addBattleLog(`¡${data.name} rival ha entrado en combate!`)
                    }

                } else {

                    setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHP: data.hp, maxHP: data.maxHp }))

                }
            }
        })
        return () => window.electronAPI.offSwitch()
    }, [])

    useEffect(() => {
        window.electronAPI.onMove((data) => {
            const pkm = data.source.player === 'p1' ? player1.pkmName : player2.pkmName;
            addBattleLog(`${pkm} usó ${data.move}`)
            setWaiting(false);
        })
        return () => window.electronAPI.offMove()
    }, [player1.pkmName, player2.pkmName])

    useEffect(() => {
        window.electronAPI.onFaint((data) => {
            if (data.player === 'p1') {
                setPlayer1((prev) => ({ ...prev, pkmName: null, number: null }))
                addBattleLog(`¡${data.name} se debilitó!`)
                setAvailableMoves([])
                setSwitchRequired(true)

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
                setPlayer2((prev) => ({ ...prev, pkmName: null, number: null }))
                addBattleLog(`¡El ${data.name} salvaje se debilitó!`)
            }
        })
        return () => window.electronAPI.offFaint()
    }, [])

    useEffect(() => {
        window.electronAPI.onDamage((data) => {

            //Data.maxHp might be 0 in case of fainted pokemon
            if (data.player === 'p1') {

                //pokemon fainted
                if (data.hp === 0) {
                    setPlayer1((prev) => ({ ...prev, currentHP: 0, currentHPPercentage: 0 }))


                } else {
                    setPlayer1((prev) => ({
                        ...prev,
                        currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                        currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                    }))
                }

            }

            if (data.player === 'p2') {
                if (data.maxHp === 0) {
                    setPlayer2((prev) => ({ ...prev, currentHP: 0, currentHPPercentage: 0 }))


                } else {
                    setPlayer2((prev) => ({
                        ...prev,
                        currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                        currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                    }))
                }
            }
        })
        return () => window.electronAPI.offDamage()
    }, [])

    useEffect(() => {
        window.electronAPI.onHeal((data) => {

            if (data.player === 'p1') {


                setPlayer1((prev) => ({
                    ...prev,
                    currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                    currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                }))

                if (data.maxHp == 100) {

                    if (data.reason !== null) {

                        addBattleLog(`¡${data.name} ha recuperado salud gracias a ${data.reason}!`)

                    } else {

                        addBattleLog(`¡${data.name} ha recuperado salud!`)

                    }


                }


            }

            if (data.player === 'p2') {

                setPlayer2((prev) => ({
                    ...prev,
                    currentHP: data.maxHp !== 100 ? data.hp : prev.currentHP,
                    currentHPPercentage: data.maxHp == 100 ? data.hp : prev.currentHP,
                }))

                if (data.maxHp == 100) {

                    if (data.reason !== null) {

                        addBattleLog(`¡${data.name} rival ha recuperado salud gracias a ${data.reason}!`)

                    } else {

                        addBattleLog(`¡${data.name} rival ha recuperado salud!`)

                    }


                }

            }
        })
        return () => window.electronAPI.offHeal()
    }, [])

    function getMiniSrc(number) {
        const key = `icon${String(number).padStart(3, '0')}.png`;
        return `/minis/${key}`;
    }

    useEffect(() => {
        window.electronAPI.onTeam((data) => {
            setAvailableMoves(data.active[0].moves)
            console.log('Available moves updated:', data.active[0].moves)
            console.log(data.side.pokemon)

            data.side.pokemon.forEach((poke) => {

                poke.icon = getMiniSrc(poke.num)

            })

            setAvailablePokemon(data.side.pokemon)
        })
        return () => window.electronAPI.offTeam()
    }, [])

    useEffect(() => {
        window.electronAPI.onForceSwitch((data) => {
            if (data.side.id === 'p2') {
                setPlayer2((prev) => ({ ...prev, pkmName: null, number: null }))
                setWaiting(false);
            }

            if (data.side.id === 'p1') {
                //addBattleLog(`¡${player1.pkmName} se ha debilitado!`)
                setPlayer1((prev) => ({ ...prev, pkmName: null, number: null }))
                setSwitchRequired(true);

            }
        })
        return () => window.electronAPI.offForceSwitch()
    }, [])

    useEffect(() => {
        window.electronAPI.onStatus((data) => {
            if (data.player === 'p2') {
                setPlayer2((prev) => ({ ...prev, status: data.status }))

                addBattleLog(`¡${data.pkmName} ${MENSAJES[data.status]}!`)

            }

            if (data.player === 'p1') {
                setPlayer1((prev) => ({ ...prev, status: data.status }))
                addBattleLog(`¡${data.pkmName} ${MENSAJES[data.status]}!`)

            }
        })
        return () => window.electronAPI.offStatus()
    }, [])

    useEffect(() => {
        window.electronAPI.onStatusRecover((data) => {
            if (data.player === 'p2') {
                setPlayer2((prev) => ({ ...prev, status: 'none' }))

                addBattleLog(`¡${data.pkmName} ${MENSAJES[`${data.status}-recover`]}!`)

            }

            if (data.player === 'p1') {
                setPlayer1((prev) => ({ ...prev, status: 'none' }))
                addBattleLog(`¡${data.pkmName} ${MENSAJES[`${data.status}-recover`]}!`)

            }
        })
        return () => window.electronAPI.offStatusRecover()
    }, [])

    useEffect(() => {
        window.electronAPI.onWait((data) => {

            setWaiting(true);

        })
        return () => window.electronAPI.offWait()
    }, [])

    useEffect(() => {
        window.electronAPI.onCrit((data) => {

            if (data.player == 'p1') {

                addBattleLog(`¡${data.name} ha recibido un golpe crítico!`);


            } else {

                addBattleLog(`¡${data.name} rival ha recibido un golpe crítico!`);

            }

        })
        return () => window.electronAPI.offCrit()
    }, [])

    useEffect(() => {
        window.electronAPI.onSuperEffective((data) => {

            if (data.player == 'p1') {

                addBattleLog(`¡El ataque a ${data.name} fue super efectivo!`);


            } else {

                addBattleLog(`¡El ataque a ${data.name} rival fue super efectivo!`);

            }

        })
        return () => window.electronAPI.offSuperEffective()
    }, [])

    useEffect(() => {
        window.electronAPI.onResisted((data) => {

            if (data.player == 'p1') {

                addBattleLog(`El ataque a ${data.name} no es muy efectivo...`);


            } else {

                addBattleLog(`El ataque a ${data.name} rival no es muy efectivo...`);

            }

        })
        return () => window.electronAPI.offResisted()
    }, [])

    useEffect(() => {
        window.electronAPI.onMiss((data) => {

            if (data.player == 'p1') {

                addBattleLog(`¡${data.name} falló!`);


            } else {

                addBattleLog(`¡El ataque de ${data.name} rival ha fallado!`);

            }

        })
        return () => window.electronAPI.offMiss()
    }, [])

    useEffect(() => {
        window.electronAPI.onCant((data) => {

            let msj = MENSAJES[`cant-${data.reason}`];

            if (msj !== undefined) {

                if (data.player == 'p1') {

                    addBattleLog(msj.replace('{pkm}', data.name));


                } else {

                    addBattleLog(msj.replace('{pkm}', `${data.name} rival`));

                }

            }else{

                addBattleLog(`Error: unhandled reason for event: [cant] -> ${data.reason}`)

            }

        })
        return () => window.electronAPI.offCant()
    }, [])

    useEffect(() => {
        window.electronAPI.onImmune((data) => {

            if (data.player == 'p1') {

                addBattleLog(`¡${data.name} es inmune al ataque!`);


            } else {

                addBattleLog(`¡${data.name} rival es inmune al ataque!`);

            }

        })
        return () => window.electronAPI.offImmune()
    }, [])

    useEffect(() => {
        window.electronAPI.onEndItem((data) => {

            if (data.player == 'p1') {

                addBattleLog(`¡${data.name} ha perdido el objeto ${data.item}!`);


            } else {

                addBattleLog(`¡${data.name} rival ha perdido el objeto ${data.item}!`);

            }

        })
        return () => window.electronAPI.offEndItem()
    }, [])

    useEffect(() => {
        window.electronAPI.onStartSideCondition((data) => {

            let msj = MENSAJES[`side-condition-[${data.condition}]`];

            if (msj !== undefined) {

                if (data.player == 'p1') {

                    addBattleLog(msj.replace('{pkm}', `${player2.pkmName}`));


                } else {

                    addBattleLog(msj.replace('{pkm}', `${player2.pkmName} rival`));

                }

            }else{

                addBattleLog(`Error: unhandled side condition -> ${data.origin} ${data.condition}`)

            }

        })
        return () => window.electronAPI.offStartSideCondition()
    }, [player1.pkmName, player2.pkmName])

    useEffect(() => {
        window.electronAPI.onReplace((data) => {

            if (data.player === 'p1') {

                addBattleLog(`¡La ilusión de ${data.name} ha sido revelada!`)

                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, gender: data.gender, shiny: data.shiny }))

            }

            if (data.player === 'p2') {

                addBattleLog(`¡La ilusión de ${data.name} rival ha sido revelada!`)
                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, gender: data.gender, shiny: data.shiny }))

            }
        })
        return () => window.electronAPI.offReplace()
    }, [])

    useEffect(() => {
        window.electronAPI.onStartVolatile((data) => {

            let msj = MENSAJES[`${data.effect}-start`];

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
        })
        return () => window.electronAPI.offStartVolatile()
    }, [])

    useEffect(() => {
        window.electronAPI.onClearAllBoost((data) => {

            let msj = MENSAJES[`clear-all-boost`];
            addBattleLog(msj);

        })
        return () => window.electronAPI.offClearAllBoost()
    }, [])

    useEffect(() => {
        window.electronAPI.onEndVolatile((data) => {

            let msj = MENSAJES[`${data.effect}-end`];

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
        })
        return () => window.electronAPI.offEndVolatile()
    }, [])

    useEffect(() => {
        window.electronAPI.onBattleEnd((data) => {

            if (data.result == 'win') {

                if (data.winner == player1.playerName) {

                    addBattleLog(`¡Has ganado!`);
                    setWinner('p1');

                }

                if (data.winner == player2.playerName) {

                    addBattleLog(`¡Has perdido!`);
                    setWinner('p2');

                }
            }

        })
        return () => window.electronAPI.offBattleEnd()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate('/')
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [navigate])

    const handlers = {

        onRun: () => {
            navigate('/')
        },

        onMakeMove: (move, disabled) => {

            if (disabled) {

                addBattleLog(`${player1.pkmName} no puede usar ${move}!`);

                return
            } else {
                window.electronAPI.makeMove(move)
            }
        },

        onSelectPokemon: (pokemonObj) => {

            if (pokemonObj.condition == '0 fnt') {

                addBattleLog(`¡${pokemonObj.name} no puede pelear más!`);

            } else if (pokemonObj.active) {

                addBattleLog(`¡${pokemonObj.name} ya está luchando!`);

            } else {

                window.electronAPI.selectPokemon(pokemonObj.name)

            }

        }

    }

    function getBattlerSrc(number, { back = false, shiny = false } = {}) {
        const suffix = `${shiny ? 's' : ''}${back ? 'b' : ''}`;
        const key = `${String(number).padStart(3, '0')}${suffix}.png`;
        return `/battlers/${key}`;
    }

    useEffect(() => {
        async function load() {
            const src1 = getBattlerSrc(player1.number, { back: true, shiny: player1.shiny });
            const src2 = getBattlerSrc(player2.number, { back: false, shiny: player2.shiny });
            setBattlerSrcs({ src1, src2 });
        }
        load();
    }, [player1.number, player2.number]);


    return (
        <>
            {winner && <PopupEnd winner={winner} onClose={() => { navigate('/') }} />}
            <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    height: '100vh'
                }}>
                {/* Sprite enemigo - arriba derecha */}
                {
                    player2.number &&
                    <img
                        src={battlerSrcs.src2}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className="absolute top-12 right-12 w-48" />
                }

                {/* HP del enemigo - flotando junto a su sprite */}

                {
                    player2.number &&
                    <PokeStatusBar pkm={player2} positionClasses={'absolute top-24 left-8'} />
                }

                {/* Sprite jugador - abajo izquierda */}
                {player1.number &&
                    <img
                        src={battlerSrcs.src1}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className="absolute bottom-32 left-12 w-64"
                    />
                }

                {/* HP del jugador - flotando junto a su sprite */}
                {
                    player1.number &&
                    <PokeStatusBar pkm={player1} positionClasses={'absolute bottom-48 right-12'} />

                }

                <BattleControlBox battleLog={battleLog} availableMoves={availableMoves} availablePokemon={availablePokemon} handlers={handlers} switchRequired={switchRequired} />

                {waiting && (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center absolute bottom-1/2 left-1/2 transform -translate-x-1/2">
                        <p>Esperando a que el rival tome una accion...</p>
                    </div>
                )}

            </div>
        </>
    )
}