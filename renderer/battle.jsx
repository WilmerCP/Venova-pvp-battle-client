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

function getSpriteAnimationClass(animationDesc, playerId) {

    if (animationDesc == null) return '';
    if (!animationDesc.includes(playerId)) return '';

    switch (animationDesc) {

        case 'faint-p1':
            return 'faint-animation';

        case 'faint-p2':
            return 'faint-animation';

        case 'switch-p1':
            return 'sendout-animation';

        case 'switch-p2':
            return 'sendout-animation';

        default:
            return '';
    }

}

function getBarAnimationClass(animationDesc, playerId) {

    if (animationDesc == null) return '';
    if (!animationDesc.includes(playerId)) return '';

    switch (animationDesc) {

        case 'switch-p1':
            return 'slide-in-right';

        case 'switch-p2':
            return 'slide-in-left';

        default:
            return '';
    }


}


export default function Battle() {

    const battleData = useLoaderData();

    const { battleLog, addBattleLog, battlerSrcs, setBattlerSrcs, availableMoves,
        availablePokemon, waiting, switchRequired, winner, animationQueue,
        pendingAnimation, setPendingAnimation } = useBattleEvents({ p1, p2 });

    const processingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(true);

    const [p1Visible, setP1Visible] = useState(p1);
    const [p2Visible, setP2Visible] = useState(p2);

    //Health bar ref for animation handling
    const bar1Ref = useRef();
    const bar2Ref = useRef();

    //Floating divs ref for animation handling
    const statusBar1Ref = useRef();
    const statusBar2Ref = useRef();

    //Used for css animations
    const [currentAnimation, setCurrentAnimation] = useState(null);
    
    const [currentLog, setCurrentLog] = useState('');

    //Sprite image element ref for animation handling
    const sprite1Ref = useRef();
    const sprite2Ref = useRef();

    const navigate = useNavigate()

    async function handleAnimation(animation) {

        console.log(animation)

        switch (animation.event) {

            case 'hpChange': {

                return new Promise((resolve) => {

                    const barRef = animation.player === 'p1' ? bar1Ref : bar2Ref;

                    if (animation.player == 'p1') {

                        if (p1Visible.currentHPPercentage === animation.newHP) {
                            return resolve();
                        }

                        setP1Visible(prev => ({ ...prev, currentHPPercentage: animation.newHP }))
                    } else {

                        if (p2Visible.currentHPPercentage === animation.newHP) {
                            return resolve();
                        }

                        setP2Visible(prev => ({ ...prev, currentHPPercentage: animation.newHP }))
                    }

                    const el = barRef.current;
                    if (!el) {

                        console.log('Problem with health bar div element');

                        return resolve(); // safety fallback
                    }

                    const timeout = setTimeout(() => {
                        el.removeEventListener('transitionend', onEnd);
                        resolve();
                    }, 1100); // slightly more than your CSS transition duration

                    const onEnd = (e) => {
                        if (e.propertyName !== 'width') return; // filter to the property you're animating
                        el.removeEventListener('transitionend', onEnd);
                        resolve();
                    };
                    el.addEventListener('transitionend', onEnd);
                });

                break;
            }

            case 'faint': {
                return new Promise((resolve) => {
                    const spriteRef = animation.player === 'p1' ? sprite1Ref : sprite2Ref;
                    const elPkm = spriteRef.current;

                    //const statusBarRef = animation.player === 'p1' ? statusBar1Ref : statusBar2Ref;
                    //const elBar = statusBarRef.current;

                    if (!elPkm) {
                        console.log('Problem with sprite element');
                        return resolve();
                    }

                    const hidePlayer = () => {
                        setCurrentAnimation('none');
                        if (animation.player === 'p1') {
                            setP1Visible(prev => ({ ...prev, number: undefined, pkmName: undefined }));
                        } else {
                            setP2Visible(prev => ({ ...prev, number: undefined, pkmName: undefined }));
                        }
                    };

                    if (animation.player == 'p1') {

                        setCurrentAnimation('faint-p1')

                    } else {

                        setCurrentAnimation('faint-p2')

                    }


                    const timeout = setTimeout(() => {
                        elPkm.removeEventListener('animationend', onEnd);
                        hidePlayer();
                        resolve();
                    }, 1000); // safety fallback, same reasoning as before

                    const onEnd = (e) => {
                        clearTimeout(timeout);
                        elPkm.removeEventListener('animationend', onEnd);
                        hidePlayer();
                        resolve();
                    };
                    elPkm.addEventListener('animationend', onEnd);
                });
                break;
            }

            case 'pkmSwitch': {
                return new Promise((resolve) => {
                    const spriteRef = animation.player === 'p1' ? sprite1Ref : sprite2Ref;
                    const data = animation.pkmData;

                    // Apply state first — this is what mounts/updates the <img>
                    if (animation.player === 'p1') {
                        setBattlerSrcs(prev => ({ ...prev, src1: animation.newSrc }));
                        setP1Visible(prev => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }));
                    } else {
                        setBattlerSrcs(prev => ({ ...prev, src2: animation.newSrc }));
                        setP2Visible(prev => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp }));
                    }

                    // Wait for the DOM to actually reflect the mount before touching refs
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const elPkm = spriteRef.current;
                            if (!elPkm) {
                                console.log('Problem with elements on switch animation handler');
                                resolve();
                                return;
                            }

                            setCurrentAnimation(animation.player === 'p1' ? 'switch-p1' : 'switch-p2');

                            const timeout = setTimeout(() => {
                                elPkm.removeEventListener('animationend', onEnd);
                                setCurrentAnimation('none');
                                resolve();
                            }, 1000);

                            const onEnd = (e) => {
                                clearTimeout(timeout);
                                elPkm.removeEventListener('animationend', onEnd);
                                setCurrentAnimation('none');
                                resolve();
                            };
                            elPkm.addEventListener('animationend', onEnd);
                        });
                    });
                });
            }

            case 'statusChange': {

                return new Promise((resolve) => {

                    if (animation.player === 'p2') {
                        setP2Visible((prev) => ({ ...prev, status: animation.newStatus }))

                    }

                    if (animation.player === 'p1') {
                        setP1Visible((prev) => ({ ...prev, status: animation.newStatus }))

                    }

                    resolve();

                });

            }

            case 'transform': {

                return new Promise((resolve) => {

                    if (animation.player === 'p2') {
                        setBattlerSrcs(prev => ({ ...prev, src2: animation.newSrc }));

                    }

                    if (animation.player === 'p1') {
                        setBattlerSrcs(prev => ({ ...prev, src1: animation.newSrc }));

                    }

                    resolve();

                });

            }



            default:
                console.log('Wrong or unhandled animation event');
                Promise.resolve();

        }

    }



    async function processQueue() {
        if (processingRef.current) return;
        console.log('Processing the queue')
        processingRef.current = true;
        setIsProcessing(true);
        while (animationQueue.current.length > 0) {
            const animation = animationQueue.current.shift();

            if(animation.log){

                setCurrentLog(animation.log);

            }

            await handleAnimation(animation);
        }
        processingRef.current = false;
        if (battleLog.length > 0) {
            setIsProcessing(false);
        }
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
            } else if (processingRef.current == false) {
                window.electronAPI.makeMove(move)
            }
        },

        onSelectPokemon: (pokemonObj) => {

            if (pokemonObj.condition == '0 fnt') {

                addBattleLog(`¡${pokemonObj.name} no puede pelear más!`);

            } else if (pokemonObj.active) {

                addBattleLog(`¡${pokemonObj.name} ya está luchando!`);

            } else if (processingRef.current == false) {

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
                    p2Visible.number &&
                    <img
                        src={battlerSrcs.src2}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className={`${getSpriteAnimationClass(currentAnimation, 'p2')} absolute top-12 right-12 w-48`}
                        ref={sprite2Ref}
                    />
                }

                {/* HP del enemigo - flotando junto a su sprite */}

                {
                    p2Visible.number &&
                    <PokeStatusBar pkm={p2Visible} barRef={bar2Ref} statusBarRef={statusBar2Ref} positionClasses={`absolute top-24 left-8 ${getBarAnimationClass(currentAnimation, 'p2')} ${(battlerSrcs.src2 == undefined || currentAnimation == 'faint-p2') && 'hidden'}`} />
                }

                {/* Sprite jugador - abajo izquierda */}
                {p1Visible.number &&
                    <img
                        src={battlerSrcs.src1}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className={`${getSpriteAnimationClass(currentAnimation, 'p1')} absolute bottom-32 left-12 w-64`}
                        ref={sprite1Ref}
                    />
                }

                {/* HP del jugador - flotando junto a su sprite */}
                {
                    p1Visible.number &&
                    <PokeStatusBar pkm={p1Visible} barRef={bar1Ref} statusBarRef={statusBar1Ref} positionClasses={`absolute bottom-48 right-12 ${getBarAnimationClass(currentAnimation, 'p1')} ${(battlerSrcs.src1 == undefined || currentAnimation == 'faint-p1') && 'hidden'}`} />

                }

                <BattleControlBox battleLog={battleLog} availableMoves={availableMoves} availablePokemon={availablePokemon} handlers={handlers} switchRequired={switchRequired} animationPlaying={isProcessing} currentLog={currentLog} />

                {waiting && (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center absolute bottom-1/2 left-1/2 transform -translate-x-1/2">
                        <p>Esperando a que el rival tome una accion...</p>
                    </div>
                )}

            </div>
        </>
    )
}