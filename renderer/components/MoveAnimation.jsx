
import MOVE_ANIMATIONS from '../lib/animaciones'

const src = 'moveAnimations/attack-1.png'

const frameWidth = 192
const frameHeight = 192

import { useEffect, useRef, useState } from 'react'

export default function MoveAnimation({ classes = '', onComplete, moveDesc }) {

    const [frame, setFrame] = useState(0);
    const [spriteSheet, setSpriteSheet] = useState(MOVE_ANIMATIONS.default);

    const Xcoor = frameWidth * (frame % spriteSheet.cols)
    const Ycoor = frameHeight * Math.floor(frame / spriteSheet.cols)
    const totalFrames = spriteSheet.totalFrames !== undefined ? spriteSheet.totalFrames : spriteSheet.cols * spriteSheet.rows

    useEffect(() => {

        if (moveDesc.name) {
            if (MOVE_ANIMATIONS.moves[moveDesc.name] !== undefined) {

                setSpriteSheet(MOVE_ANIMATIONS.moves[moveDesc.name]);

            } else if(moveDesc.heal && moveDesc.category === 'Status') {

                setSpriteSheet(MOVE_ANIMATIONS.default.heal);

            }else if(MOVE_ANIMATIONS.elemental[moveDesc.type][moveDesc.category] !== undefined) {

                setSpriteSheet(MOVE_ANIMATIONS.elemental[moveDesc.type][moveDesc.category]);

            }else {

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
        const interval = setInterval(() => {
            setFrame(prev => {
                if (prev >= totalFrames - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 100)

        return () => clearInterval(interval)
    }, [totalFrames])

    useEffect(() => {
        if (frame >= totalFrames - 1) {
            onComplete?.();
        }
    }, [frame])

    return (
        <div

            className={classes}
            style={{
                width: frameWidth,
                height: frameHeight,
                backgroundImage: `url(moveAnimations/${spriteSheet.src})`,
                backgroundPosition: `-${Xcoor}px -${Ycoor}px`,
                backgroundRepeat: "no-repeat",
                //backgroundColor: 'blue'
            }}
        />
    );


}