import './index.css'
import bg from './assets/fondos/battlebgChampion.png'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import BattleControlBox from './components/BattleControlBox.jsx'
import PokeStatusBar from './components/PokeStatusBar.jsx'

let p1 = {

    playerName: 'Jugador 1',
    pkmName: 'Iguasauro',
    shiny: false,
    maxHP: 100,
    currentHP: 100,
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

    const [availableMoves, setAvailableMoves] = useState(movesTemplate);

    const [waiting, setWaiting] = useState(false); //Waiting for opponent

    const battleData = useLoaderData();

    //console.log(battleData)

    const navigate = useNavigate()

    function addBattleLog(log){

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
            if (data.player === 'p1') {
                setPlayer1((prev) => ({ ...prev, pkmName: data.name, number: data.num }))
            }

            if (data.player === 'p2') {
                setPlayer2((prev) => ({ ...prev, pkmName: data.name, number: data.num }))
                addBattleLog(`¡Un ${data.name} salvaje apareció!`)
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
            }

            if (data.player === 'p2') {
                setPlayer2((prev) => ({ ...prev, pkmName: null, number: null }))
                addBattleLog(`¡El ${data.name} salvaje se debilitó!`)
            }
        })
        return () => window.electronAPI.offFaint()
    }, [])

    useEffect(() => {
        window.electronAPI.onTeam((data) => {
            setAvailableMoves(data.active[0].moves)
            console.log('Available moves updated:', data.active[0].moves)
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

            }
        })
        return () => window.electronAPI.offForceSwitch()
    }, [])

    useEffect(() => {
        window.electronAPI.onWait((data) => {

            setWaiting(true);
            
        })
        return () => window.electronAPI.offWait()
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

        onMakeMove: (move) => {

            window.electronAPI.makeMove(move)
        }

    }

    async function getBattlerSrc(number, { back = false, shiny = false } = {}) {
        const suffix = `${shiny ? 's' : ''}${back ? 'b' : ''}`;
        const key = `${String(number).padStart(3, '0')}${suffix}.png`;
        return `/battlers/${key}`;
    }

    useEffect(() => {
        async function load() {
            const src1 = await getBattlerSrc(player1.number, { back: true, shiny: player1.shiny });
            const src2 = await getBattlerSrc(player2.number, { back: false, shiny: player2.shiny });
            setBattlerSrcs({ src1, src2 });
        }
        load();
    }, [player1.number, player2.number]);


    return (
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

            <BattleControlBox battleLog={battleLog} availableMoves={availableMoves} handlers={handlers} />

            {waiting && (
                <div className="bg-white p-6 rounded-lg shadow-lg text-center absolute bottom-1/2 left-1/2 transform -translate-x-1/2">
                        <p>Esperando a que el rival tome una accion...</p>
                </div>
            )}

        </div>
    )
}