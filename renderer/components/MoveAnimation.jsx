import MOVE_ANIMATIONS from '../lib/animaciones'
import EFFECTS from '../lib/efectos'

const frameWidth = 192
const frameHeight = 192
const frameDuration = 100 // in milliseconds
const LOG_TIME = 800 //ms

import { useEffect, useRef, useState } from 'react'

export default function MoveAnimation({ classes = '', onComplete, moveDesc }) {

    console.log(moveDesc);

    const [frame, setFrame] = useState(0);
    const [spriteSheet, setSpriteSheet] = useState(MOVE_ANIMATIONS.default);
    const [skipTransition, setSkipTransition] = useState(false);

    const startTimeRef = useRef(null);
    const nextTickIdRef = useRef(null);
    const callbackFiredRef = useRef(null);
    const loopsCompletedRef = useRef(0);
    const currentLoopRef = useRef(0);

    // Estos son solo para el RENDER (posición del background, escala, etc.)
    // Se actualizan solos cuando spriteSheet cambia de estado.
    const Xcoor = frameWidth * (frame % spriteSheet.cols)
    const Ycoor = frameHeight * Math.floor(frame / spriteSheet.cols)

    const scaleFrom = spriteSheet.scaleFrom ?? 1
    const scaleTo = spriteSheet.scaleTo ?? 1
    const totalFramesForRender = spriteSheet.totalFrames !== undefined ? spriteSheet.totalFrames : spriteSheet.cols * spriteSheet.rows
    const progress = totalFramesForRender > 1 ? frame / (totalFramesForRender - 1) : 1
    const scale = scaleFrom + (scaleTo - scaleFrom) * progress

    const fallFrom = spriteSheet.fallFrom ?? 0
    const fallTo = spriteSheet.fallTo ?? 0
    const easedProgress = progress * progress
    const yOffset = fallFrom + (fallTo - fallFrom) * easedProgress

    const slideFrom = spriteSheet.slideFrom ?? 0
    const slideTo = spriteSheet.slideTo ?? 0
    const xOffset = slideFrom + (slideTo - slideFrom) * progress

    let isFront = moveDesc.target == 'x1';
    isFront = spriteSheet.forceOnSelf ? moveDesc.player == 'x1' : isFront;

    const background = spriteSheet.back ? isFront : false;

    let positionClasses = isFront ? 'fixed bottom-32 left-22 w-64' : 'fixed top-12 right-12 w-48';

    useEffect(() => {
        console.log('[MoveAnim] efecto disparado, moveDesc:', moveDesc, 'ref:', moveDesc);

        if (!moveDesc.name) return;

        // 1. Resolver el sheet de forma SINCRONA
        let sheet;

        if (moveDesc.event == 'effect') {

            sheet = EFFECTS[moveDesc.name];

            if (!sheet) {
                console.error('[MoveAnimation] Efecto no encontrado en EFFECTS:', moveDesc.name, moveDesc);
            }

        } else if (MOVE_ANIMATIONS.moves[moveDesc.name] !== undefined) {

            sheet = MOVE_ANIMATIONS.moves[moveDesc.name];

            if (sheet.doNotAnimate) {

                const skipTimeoutId = setTimeout(() => {
                    onComplete?.();
                }, LOG_TIME);

                return () => {
                    clearTimeout(skipTimeoutId);
                };

            }

        } else if (moveDesc.heal && moveDesc.category === 'Status') {

            sheet = MOVE_ANIMATIONS.default.heal;

        } else if (MOVE_ANIMATIONS.elemental[moveDesc.type]?.[moveDesc.category] !== undefined) {

            sheet = MOVE_ANIMATIONS.elemental[moveDesc.type][moveDesc.category];

        } else {

            switch (moveDesc.category) {
                case 'Physical':
                    sheet = MOVE_ANIMATIONS.default.physical;
                    break;
                case 'Special':
                    sheet = MOVE_ANIMATIONS.default.special;
                    break;
                case 'Status':
                    sheet = moveDesc.target === 'self'
                        ? MOVE_ANIMATIONS.default.status_self
                        : MOVE_ANIMATIONS.default.status_other;
                    break;
                default:
                    sheet = MOVE_ANIMATIONS.default.physical;
                    break;
            }
        }

        setSpriteSheet(sheet);
        setFrame(0);
        startTimeRef.current = null;
        callbackFiredRef.current = false;
        loopsCompletedRef.current = 0;
        currentLoopRef.current = 0; 
        setSkipTransition(false); 

        // 2. Calcular totalFrames/totalDuration ACA, del sheet recien resuelto,
        //    no de las variables del render (que todavia tienen el sheet viejo).
        const totalFrames = sheet.totalFrames !== undefined
            ? sheet.totalFrames
            : sheet.cols * sheet.rows;

        const totalDuration = sheet.frameDuration !== undefined
            ? totalFrames * sheet.frameDuration
            : totalFrames * frameDuration;

        const totalRepeats = sheet.repeat ?? 1;

        let frameCount = 0;

        function tick(now) {
            try {
                frameCount++;

                if (startTimeRef.current === null) startTimeRef.current = now;

                const elapsed_time = now - startTimeRef.current;

                const currentLoop = Math.min(Math.floor(elapsed_time / totalDuration), totalRepeats - 1);
                const loopElapsed = elapsed_time - currentLoop * totalDuration;
                const loopProgress = totalDuration > 0 ? Math.min(loopElapsed / totalDuration, 1) : 1;

                const currentFrame = Math.min(Math.floor(totalFrames * loopProgress), totalFrames - 1);

                // Si cambiamos de loop, saltar el transition en este frame
                if (currentLoop !== currentLoopRef.current) {
                    currentLoopRef.current = currentLoop;
                    setSkipTransition(true);
                    setFrame(currentFrame);
                    // Reactivar el transition en el siguiente frame de pintado
                    requestAnimationFrame(() => setSkipTransition(false));
                } else {
                    setFrame(currentFrame);
                }

                const isLastLoop = currentLoop >= totalRepeats - 1;
                const finished = isLastLoop && loopProgress >= 1;

                if (!finished) {
                    nextTickIdRef.current = requestAnimationFrame(tick);
                } else if (!callbackFiredRef.current) {
                    callbackFiredRef.current = true;
                    //console.log('[MoveAnim] onComplete disparado', sheet.src, 'frames totales corridos:', frameCount);
                    onComplete?.();
                }
            } catch (err) {
                console.error('[MoveAnim] EXCEPCION EN TICK', err, { frameCount });
                onComplete?.(); // liberar la promesa igual, no dejar colgada la app
            }
        }

        nextTickIdRef.current = requestAnimationFrame(tick);

        return () => {
            if (nextTickIdRef.current !== null) {
                //console.log('[MoveAnim] cleanup — cancelando rAF', sheet?.src);
                cancelAnimationFrame(nextTickIdRef.current);
            }
        };

    }, [moveDesc]);

    return (
        <div
            className={positionClasses}
            style={{
                width: frameWidth,
                height: frameHeight,
                backgroundImage: `url(moveAnimations/${spriteSheet.src})`,
                backgroundPosition: `-${Xcoor}px -${Ycoor}px`,
                backgroundRepeat: "no-repeat",
                transform: `scale(${scale}) translateY(${yOffset}px) translateX(${xOffset}px)`,
                transformOrigin: 'center center',
                transition: skipTransition ? 'none' : 'transform 100ms ease-out',
                zIndex: background ? 5 : 15
            }}
        />
    );
}