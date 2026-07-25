
import MOVE_ANIMATIONS from '../lib/animaciones'

const src = 'moveAnimations/attack-1.png'

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



    const Xcoor = frameWidth * (frame % spriteSheet.cols)
    const Ycoor = frameHeight * Math.floor(frame / spriteSheet.cols)
    const totalFrames = spriteSheet.totalFrames !== undefined ? spriteSheet.totalFrames : spriteSheet.cols * spriteSheet.rows
    const totalDuration = totalFrames * frameDuration

    //Optional scaling effect
    const scaleFrom = spriteSheet.scaleFrom ?? 1
    const scaleTo = spriteSheet.scaleTo ?? 1
    const progress = totalFrames > 1 ? frame / (totalFrames - 1) : 1
    const scale = scaleFrom + (scaleTo - scaleFrom) * progress

    //Optional falling effect
    const fallFrom = spriteSheet.fallFrom ?? 0
    const fallTo = spriteSheet.fallTo ?? 0
    const easedProgress = progress * progress
    const yOffset = fallFrom + (fallTo - fallFrom) * easedProgress

    useEffect(() => {

        if (moveDesc.name) {
            if (MOVE_ANIMATIONS.moves[moveDesc.name] !== undefined) {

                setSpriteSheet(MOVE_ANIMATIONS.moves[moveDesc.name]);

            } else if (moveDesc.heal && moveDesc.category === 'Status') {

                setSpriteSheet(MOVE_ANIMATIONS.default.heal);

            } else if (MOVE_ANIMATIONS.elemental[moveDesc.type][moveDesc.category] !== undefined) {

                setSpriteSheet(MOVE_ANIMATIONS.elemental[moveDesc.type][moveDesc.category]);

            } else {

                switch (moveDesc.category) {

                    case 'Physical':
                        setSpriteSheet(MOVE_ANIMATIONS.default.physical);
                        break;

                    case 'Special':
                        setSpriteSheet(MOVE_ANIMATIONS.default.special);
                        break;

                    case 'Status':
                        if (moveDesc.target === 'self') {
                            setSpriteSheet(MOVE_ANIMATIONS.default.status_self);
                        } else {
                            setSpriteSheet(MOVE_ANIMATIONS.default.status_other);
                        }
                        break;

                    default:
                        setSpriteSheet(MOVE_ANIMATIONS.default.physical);
                        break;

                }

            }
        }

    }, [moveDesc]);


    useEffect(() => {

        setFrame(0);
        startTimeRef.current = null
        nextTickIdRef.current = null
        callbackFiredRef.current = null

        function tick(now) {

            if (startTimeRef.current === null) {
                startTimeRef.current = now;
            }

            const elapsed_time = now - startTimeRef.current
            const progress = totalDuration > 0 ? Math.min(elapsed_time / totalDuration, 1) : 1

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


    }, [spriteSheet]);


    return (
        <div

            className={classes}
            style={{
                width: frameWidth,
                height: frameHeight,
                backgroundImage: `url(moveAnimations/${spriteSheet.src})`,
                backgroundPosition: `-${Xcoor}px -${Ycoor}px`,
                backgroundRepeat: "no-repeat",
                //backgroundColor: 'blue',
                transform: `scale(${scale}) translateY(${yOffset}px)`,
                transformOrigin: 'center center',
                transition: 'transform 100ms ease-out',
            }}
        />
    );


}