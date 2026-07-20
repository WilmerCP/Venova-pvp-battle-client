import './index.css'
import bg from './assets/fondos/battlebgChampion.png'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, use } from 'react'
import { useLoaderData } from 'react-router-dom'
import BattleControlBox from './components/BattleControlBox.jsx'
import PokeStatusBar from './components/PokeStatusBar.jsx'
import PopupEnd from './components/PopupEnd.jsx'

import useBattleEvents from './hooks/useBattleEvents.js'

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

    const battleData = useLoaderData();

    const { battleLog, addBattleLog, player1, player2, battlerSrcs, availableMoves,
        availablePokemon, waiting, switchRequired, winner, animationQueue,
        pendingAnimation, setPendingAnimation } = useBattleEvents({ p1, p2 });

    const processingRef = useRef(false);

    const [p1VisibleHp, setP1VisibleHp] = useState(100);
    const [p2VisibleHp, setP2VisibleHp] = useState(100);

    const bar1Ref = useRef();
    const bar2Ref = useRef();

    const navigate = useNavigate()

    async function handleAnimation(animation) {

        console.log(animation)

        switch (animation.event) {

            case 'hpChange': {



                return new Promise((resolve) => {

                    const barRef = animation.player === 'p1' ? bar1Ref : bar2Ref;

                    if (animation.player == 'p1') {

                        if (p1VisibleHp === animation.newHP) {
                        return resolve();
                        }

                        setP1VisibleHp(animation.newHP)
                    } else {

                        if (p2VisibleHp === animation.newHP) {
                        return resolve();
                        }

                        setP2VisibleHp(animation.newHP)
                    }

                    const el = barRef.current;
                    if (!el) {

                        console.log('Problem with health bar div element');

                        return resolve(); // safety fallback
                    }

                    const onEnd = (e) => {
                        if (e.propertyName !== 'width') return; // filter to the property you're animating
                        el.removeEventListener('transitionend', onEnd);
                        resolve();
                    };
                    el.addEventListener('transitionend', onEnd);
                });

                break;
            }

            default:
                console.log('Wrong or unhandled animation event');
                Promise.resolve();

        }

    }



    async function processQueue() {

        console.log('hola')

        if (processingRef.current) return;
        processingRef.current = true;
        while (animationQueue.current.length > 0) {
            const animation = animationQueue.current.shift();
            await handleAnimation(animation);
        }
        processingRef.current = false;
    }

    useEffect(() => {
        processQueue();
    }, [pendingAnimation]);


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
                    <PokeStatusBar pkm={player2} hpToDisplay={p2VisibleHp} barRef={bar2Ref} positionClasses={'absolute top-24 left-8'} />
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
                    <PokeStatusBar pkm={player1} hpToDisplay={p1VisibleHp} barRef={bar1Ref} positionClasses={'absolute bottom-48 right-12'} />

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