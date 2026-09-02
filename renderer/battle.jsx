import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import playerBase from './assets/playerbase/playerbaseFieldSandEve.png'
import enemyBase from './assets/enemybase/enemybaseFieldSandEve.png'

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useLoaderData } from 'react-router-dom'
import BattleControlBox from './components/BattleControlBox.jsx'
import PokeStatusBar from './components/PokeStatusBar.jsx'
import PopupEnd from './components/PopupEnd.jsx'
import MoveAnimation from './components/MoveAnimation.jsx'
import AbilityFrame from './components/AbilityFrame.jsx'
import ConfirmDialog from './components/Popup.jsx'
import WaitingIndicator from './components/WaitingIndicator.jsx'

import useBattleEvents from './hooks/useBattleEvents.js'

import { SunnyLayer, RainLayer, HailLayer, SandstormLayer } from './components/Weather.jsx'

const LOG_TIME = 800 //ms

let p1 = {

    playerName: 'Jugador 1',
    pkmName: 'Iguasauro',
    shiny: false,
    maxHP: 250,
    currentHP: 250,
    currentHPPercentage: 100,
    level: 50,
    gender: 'M',
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
    gender: 'F',
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

        case 'Fly-p1':
            return 'fly-animation';

        case 'Fly-p2':
            return 'fly-animation';

        case 'Dig-p1':
            return 'dig-animation';

        case 'Dig-p2':
            return 'dig-animation';

        case 'Dive-p1':
            return 'dive-animation';

        case 'Dive-p2':
            return 'dive-animation';

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
    const location = useLocation();
    const mode = location.state?.mode; //solo | pvp
    const playerIdentity = location.state?.playerIdentity || 'p1'; // Default to 'p1' if not provided

    const { battleLog, addBattleLog, battlerSrcs, setBattlerSrcs, availableMoves,
        availablePokemon, waiting, switchRequired, animationQueue,
        pendingAnimation, setPendingAnimation, setWaiting } = useBattleEvents({ p1, p2, mode, playerIdentity });

    const processingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(true);

    const [p1Visible, setP1Visible] = useState(p1);
    const [p2Visible, setP2Visible] = useState(p2);
    const p1HPRef = useRef(100);
    const p2HPRef = useRef(100);

    //Health bar ref for animation handling
    const bar1Ref = useRef();
    const bar2Ref = useRef();

    //Floating divs ref for animation handling
    const statusBar1Ref = useRef();
    const statusBar2Ref = useRef();

    //Used for css animations
    const [currentAnimation, setCurrentAnimation] = useState(null);
    const [animationPlaying, setAnimationPlaying] = useState(false);

    //Animation resolve ref
    const resolveRef = useRef(null);

    //Current move data for animation
    const [currentMove, setCurrentMove] = useState(undefined);

    const [currentLog, setCurrentLog] = useState('');

    //Ability to display
    const [displayAbility, setDisplayAbility] = useState({ pkmName: undefined, abilityName: undefined, player: undefined });

    //Sprite image element ref for animation handling
    const sprite1Ref = useRef();
    const sprite2Ref = useRef();

    const navigate = useNavigate()

    const [winner, setWinner] = useState(null);

    const [substituteP1, setSubstituteP1] = useState(false);
    const [substituteP2, setSubstituteP2] = useState(false);

    const [hiddenP1, setHiddenP1] = useState(false);
    const [hiddenP2, setHiddenP2] = useState(false);

    const [weather, setWeather] = useState('none');

    const [popupData, setPopupData] = useState({
        title: null,
        description: null,
        action: null
    });

    async function handleAnimation(animation) {

        console.log(animation)

        switch (animation.event) {

            case 'move': {
                return new Promise((resolve) => {

                    if (animation.target === null || animation.still) {

                        const timeout = setTimeout(() => {
                            resolve();
                        }, LOG_TIME);

                    } else {

                        setCurrentMove(animation)
                        setAnimationPlaying(true)

                        const cleanup = () => {
                            setAnimationPlaying(false);
                            setCurrentMove(undefined);
                            setCurrentAnimation(null);
                            if (animation.player === 'x1') {//Origin
                                setHiddenP1(false);
                            } else {
                                setHiddenP2(false);
                            }
                            resolve();
                        };

                        resolveRef.current = cleanup;
                        const timeout = setTimeout(cleanup, 3000); // slightly more than your CSS transition duration

                    }

                });
                break;
            }

            case 'effect': {
                return new Promise((resolve) => {

                    if (!animation.target) {

                        const timeout = setTimeout(() => {
                            resolve();
                        }, LOG_TIME);

                    } else {

                        setCurrentMove(animation)
                        setAnimationPlaying(true)

                        resolveRef.current = resolve;
                        const timeout = setTimeout(() => {
                            resolve();
                            //setCurrentAnimation('none');
                            setAnimationPlaying(false);
                            setCurrentMove(undefined);
                        }, 3000); // slightly more than your CSS transition duration

                    }

                });
                break;
            }

            case 'hpChange': {

                return new Promise((resolve) => {

                    const barRef = animation.position === 'x1' ? bar1Ref : bar2Ref;
                    const hpRef = animation.position === 'x1' ? p1HPRef : p2HPRef;

                    if (hpRef.current === animation.newHP) {
                        return resolve();
                    }

                    hpRef.current = animation.newHP;

                    if (animation.position === 'x1') {

                        setP1Visible(prev => ({ ...prev, currentHPPercentage: animation.newHP }))

                    } else {

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
                        clearTimeout(timeout)
                        el.removeEventListener('transitionend', onEnd);
                        resolve();
                    };
                    el.addEventListener('transitionend', onEnd);
                });

                break;
            }

            case 'faint': {
                return new Promise((resolve) => {
                    const spriteRef = animation.position === 'x1' ? sprite1Ref : sprite2Ref;
                    const elPkm = spriteRef.current;

                    //const statusBarRef = animation.position === 'x1' ? statusBar1Ref : statusBar2Ref;
                    //const elBar = statusBarRef.current;

                    if (!elPkm) {
                        console.log('Problem with sprite element');
                        return resolve();
                    }

                    const hidePlayer = () => {
                        setCurrentAnimation('none');
                        if (animation.position === 'x1') {
                            setP1Visible(prev => ({ ...prev, number: undefined, pkmName: undefined }));
                        } else {
                            setP2Visible(prev => ({ ...prev, number: undefined, pkmName: undefined }));
                        }
                    };

                    if (animation.position === 'x1') {

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
                    const spriteRef = animation.position === 'x1' ? sprite1Ref : sprite2Ref;
                    const data = animation.pkmData;

                    // Apply state first — this is what mounts/updates the <img>
                    if (animation.position === 'x1') {
                        setBattlerSrcs(prev => ({ ...prev, src1: animation.newSrc }));
                        setP1Visible(prev => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp, gender: data.gender, shiny: data.shiny }));
                        if (!animation.batonPass) {
                            setSubstituteP1(false); // Remove the substitute
                        }
                    } else {
                        setBattlerSrcs(prev => ({ ...prev, src2: animation.newSrc }));
                        setP2Visible(prev => ({ ...prev, pkmName: data.name, number: data.num, level: data.level, status: data.status, currentHPPercentage: data.hp, gender: data.gender, shiny: data.shiny }));
                        if (!animation.batonPass) {
                            setSubstituteP2(false);
                        }
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

                            setCurrentAnimation(animation.position === 'x1' ? 'switch-p1' : 'switch-p2');

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

                    if (animation.position === 'x2') {
                        setP2Visible((prev) => ({ ...prev, status: animation.newStatus }))

                    }

                    if (animation.position === 'x1') {
                        setP1Visible((prev) => ({ ...prev, status: animation.newStatus }))

                    }

                    const timeout = setTimeout(() => {
                        resolve();
                    }, LOG_TIME);

                });

            }

            case 'transform': {

                return new Promise((resolve) => {

                    if (animation.position === 'x2') {
                        setBattlerSrcs(prev => ({ ...prev, src2: animation.newSrc }));

                    }

                    if (animation.position === 'x1') {
                        setBattlerSrcs(prev => ({ ...prev, src1: animation.newSrc }));

                    }

                    const timeout = setTimeout(() => {
                        resolve();
                    }, LOG_TIME);

                });

            }

            case 'log': {

                return new Promise((resolve) => {

                    const timeout = setTimeout(() => {
                        resolve();
                    }, LOG_TIME);

                });

            }

            case 'ability': {

                return new Promise((resolve) => {

                    console.log('HABILIDAD ACTIVADA')

                    setDisplayAbility({ ...animation })


                    const timeout = setTimeout(() => {

                        setDisplayAbility(undefined);
                        resolve();
                    }, 1500);

                });

            }

            case 'battleEnd': {

                return new Promise((resolve) => {

                    const timeout = setTimeout(() => {

                        setWinner(animation.winner);
                        resolve();
                    }, 1500);

                });

            }

            case 'volatileStart': {
                switch (animation.effect) {
                    case 'Substitute': {
                        if (animation.position === 'x2') setSubstituteP2(true);
                        if (animation.position === 'x1') setSubstituteP1(true);
                        return new Promise((resolve) => setTimeout(resolve, LOG_TIME));
                    }
                    case 'confusion': {
                        return handleAnimation({ target: animation.player, event: 'effect', name: 'confusion' });
                    }
                    default:
                        return new Promise((resolve) => setTimeout(resolve, LOG_TIME));
                }
            }

            case 'endVolatile': {
                switch (animation.effect) {
                    case 'Substitute': {
                        if (animation.position === 'x2') setSubstituteP2(false);
                        if (animation.position === 'x1') setSubstituteP1(false);
                        return handleAnimation({ target: animation.player, event: 'effect', name: 'Substitute' });
                    }
                    case 'confusion': {
                        return handleAnimation({ target: animation.player, event: 'effect', name: 'confusion' });
                    }
                    default:
                        return new Promise((resolve) => setTimeout(resolve, LOG_TIME));
                }
            }



            case 'weather': {

                return new Promise((resolve) => {

                    if (!animation.upkeep) {
                        setWeather(animation.type);
                    }

                    const timeout = setTimeout(() => {
                        resolve();
                    }, LOG_TIME);

                });

            }

            case 'prepare': {

                return new Promise((resolve) => {

                    const spriteRef = animation.position === 'x1' ? sprite1Ref : sprite2Ref;
                    const elPkm = spriteRef.current;


                    if (!elPkm) {
                        console.log('Problem with sprite element');
                        return resolve();
                    }

                    const hidePlayer = () => {
                        setCurrentAnimation('none');
                        if (animation.position === 'x1') {
                            setHiddenP1(true);
                        } else {
                            setHiddenP2(true);
                        }
                    };

                    if (animation.position == 'x1') {

                        setCurrentAnimation(`${animation.move}-p1`)

                    } else {

                        setCurrentAnimation(`${animation.move}-p2`)

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


            default:
                console.log('Wrong or unhandled animation event');
                return Promise.resolve();

        }

    }



    async function processQueue() {
        if (processingRef.current) return;
        console.log('Processing the queue')
        processingRef.current = true;
        setIsProcessing(true);

        try {
            while (animationQueue.current.length > 0) {
                console.log('Loop')
                const animation = animationQueue.current.shift();

                if (animation.log) {

                    setCurrentLog(animation.log);

                }

                await handleAnimation(animation);
            }
        } catch (err) {
            console.error('Error procesando animación:', err);
        } finally {
            processingRef.current = false;
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

            setPopupData({
                title: "Rendirse",
                description: "¿Quieres abandonar el combate?",
                action: () => { navigate('/') }
            })

        },

        onMakeMove: (move, disabled) => {

            if (disabled) {

                addBattleLog(`${player1.pkmName} no puede usar ${move}!`);

                return
            } else if (processingRef.current == false) {
                window.electronAPI.makeMove(move)
                setWaiting(true);
            }
        },

        onSelectPokemon: (pokemonObj, slot) => {

            if (pokemonObj.condition == '0 fnt') {

                addBattleLog(`¡${pokemonObj.name} no puede pelear más!`);

            } else if (pokemonObj.active) {

                addBattleLog(`¡${pokemonObj.name} ya está luchando!`);

            } else if (processingRef.current == false) {

                window.electronAPI.selectPokemon(slot);
                setWaiting(true);

            }

        }

    }

    useEffect(() => {
        return () => {
            // esto corre cuando el componente se desmonta (navegás a otra ruta)
            window.electronAPI?.leaveBattle();
        };
    }, []);

    return (
        <>
            {winner && <PopupEnd winner={winner} onClose={() => { navigate('/') }} />}

            <ConfirmDialog
                open={popupData.action !== null}
                title={popupData.title}
                description={popupData.description}
                onConfirm={popupData.action}
                onCancel={() => setPopupData({ title: null, description: null, action: null })}
                variant='danger'
            />

            <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    height: '100vh'
                }}>

                {/* Animacion de movimiento */}

                {animationPlaying && <MoveAnimation onComplete={() => {
                    setAnimationPlaying(false);
                    resolveRef.current?.();
                }}
                    moveDesc={currentMove}

                />}


                {/* Sprite enemigo - arriba derecha */}
                {
                    p2Visible.number && !hiddenP2 &&
                    <img
                        src={!substituteP2 ? battlerSrcs.src2 : '/sustituto-front.png'}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className={`${getSpriteAnimationClass(currentAnimation, 'p2')} absolute z-10 ${!substituteP2 ? 'top-12 right-12 w-48' : 'top-28 right-20 w-30'}`}
                        ref={sprite2Ref}
                    />
                }
                
                   
                <img
                    src={enemyBase}
                    className={`absolute z-9 top-35 right-1 w-73 h-auto`}
                    alt="Enemy Base"
                />

                {/* HP del enemigo - flotando junto a su sprite */}

                {
                    p2Visible.number &&
                    <PokeStatusBar pkm={p2Visible} barRef={bar2Ref} statusBarRef={statusBar2Ref} positionClasses={`absolute top-24 left-8 z-15 ${getBarAnimationClass(currentAnimation, 'p2')} ${(battlerSrcs.src2 == undefined || currentAnimation == 'faint-p2') && 'hidden'}`} />
                }

                {/* Barra para mostrar las habilidades activadas P2 */}

                {displayAbility !== undefined && displayAbility.player == 'p2' &&

                    <AbilityFrame pkmName={displayAbility.pkmName} abilityName={displayAbility.translation} positionClasses="absolute top-48 right-0 slide-in-right" side={'right'} />

                }

                {/* Sprite jugador - abajo izquierda */}
                {p1Visible.number && !hiddenP1 &&
                    <img
                        src={!substituteP1 ? battlerSrcs.src1 : '/sustituto-back.png'}
                        onError={(e) => e.target.src = '/battlers/000.png'}
                        className={`${getSpriteAnimationClass(currentAnimation, 'p1')} absolute z-10 ${!substituteP1 ? 'bottom-40 left-12 w-64' : 'bottom-25 left-12 w-50'}`}
                        ref={sprite1Ref}
                    />
                }


                <img
                    src={playerBase}
                    className={`absolute z-9 bottom-40 -left-3 w-90 h-auto`}
                    alt="Player Base"
                />


                {/* HP del jugador - flotando junto a su sprite */}
                {
                    p1Visible.number &&
                    <PokeStatusBar pkm={p1Visible} barRef={bar1Ref} statusBarRef={statusBar1Ref} positionClasses={`absolute bottom-48 right-12 z-15 ${getBarAnimationClass(currentAnimation, 'p1')} ${(battlerSrcs.src1 == undefined || currentAnimation == 'faint-p1') && 'hidden'}`} />

                }

                {/* Barra para mostrar las habilidades activadas P1*/}

                {displayAbility !== undefined && displayAbility.player == 'p1' &&

                    <AbilityFrame pkmName={displayAbility.pkmName} abilityName={displayAbility.translation} positionClasses="absolute bottom-48 left-0 slide-in-left" side={'left'} />

                }

                <BattleControlBox battleLog={battleLog} availableMoves={availableMoves} availablePokemon={availablePokemon} handlers={handlers} switchRequired={switchRequired} animationPlaying={isProcessing} currentLog={currentLog} battleEnded={winner !== null} waiting={waiting} />

                {waiting && (
                    <WaitingIndicator />
                )}

                {weather !== 'none' &&
                    <img
                        src={`${weather}_icon.png`}
                        onError={(e) => { e.target.style.display = 'none' }}
                        className={` absolute z-10 bottom-[17em] right-[3em] w-9`}
                    />
                }

            </div>
            {weather === "SunnyDay" && <SunnyLayer visible={true} />}
            {weather === "RainDance" && <RainLayer intensity={130} />}
            {weather === "Hail" && <HailLayer intensity={45} />}
            {weather === "Sandstorm" && <SandstormLayer />}
        </>
    )
}