import MOVE_ANIMATIONS from '../lib/animaciones'
import EFFECTS from '../lib/efectos'

const frameWidth = 192
const frameHeight = 192
const frameDuration = 100 // in milliseconds

import { useEffect, useRef, useState } from 'react'

export default function MoveAnimation({ classes = '', onComplete, moveDesc }) {

    const [frame, setFrame] = useState(0);
    const [spriteSheet, setSpriteSheet] = useState(MOVE_ANIMATIONS.default);

    const startTimeRef = useRef(null);
    const nextTickIdRef = useRef(null);
    const callbackFiredRef = useRef(null);

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

    let isFront = moveDesc.target == 'p1';
    isFront = spriteSheet.invertTarget ? !isFront : isFront;

    const background = spriteSheet.back ? isFront : false;

    let positionClasses = isFront ? 'fixed bottom-32 left-22 w-64': 'fixed top-12 right-12 w-48';

    useEffect(() => {

        if (!moveDesc.name) return;

        // 1. Resolver el sheet de forma SINCRONA
        let sheet;

        if (moveDesc.event == 'effect') {

            sheet = EFFECTS[moveDesc.name];

        } else if (MOVE_ANIMATIONS.moves[moveDesc.name] !== undefined) {

            sheet = MOVE_ANIMATIONS.moves[moveDesc.name];

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

        // 2. Calcular totalFrames/totalDuration ACA, del sheet recien resuelto,
        //    no de las variables del render (que todavia tienen el sheet viejo).
        const totalFrames = sheet.totalFrames !== undefined
            ? sheet.totalFrames
            : sheet.cols * sheet.rows;

        const totalDuration = sheet.frameDuration !== undefined
            ? totalFrames * sheet.frameDuration
            : totalFrames * frameDuration;

        function tick(now) {
            if (startTimeRef.current === null) startTimeRef.current = now;

            const elapsed_time = now - startTimeRef.current;
            const progress = totalDuration > 0 ? Math.min(elapsed_time / totalDuration, 1) : 1;
            const currentFrame = Math.min(Math.floor(totalFrames * progress), totalFrames - 1);
            setFrame(currentFrame);

            if (progress < 1) {
                nextTickIdRef.current = requestAnimationFrame(tick);
            } else if (!callbackFiredRef.current) {
                callbackFiredRef.current = true;
                onComplete?.();
            }
        }

        nextTickIdRef.current = requestAnimationFrame(tick);

        return () => {
            if (nextTickIdRef.current !== null) {
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
                transition: 'transform 100ms ease-out',
                zIndex: background ? 5 : 15
            }}
        />
    );
}