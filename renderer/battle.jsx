import './index.css'
import bg from './assets/fondos/battlebgChampion.png'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BattleControlBox from './components/BattleControlBox.jsx'
import PokeStatusBar from './components/PokeStatusBar.jsx'

let p1 = {

    name: 'Iguasauro',
    shiny: false,
    maxHP: 100,
    currentHP: 100,
    level: 50,
    gender: 'male',
    status: 'paralyzed',
    number: 20


}

let p2 = {

    name: 'Zacarth',
    shiny: false,
    maxHP: 100,
    currentHP: 50,
    level: 50,
    gender: 'female',
    status: 'poisoned',
    number: 150

}

let battleLog = `¡Un ${p2.name} salvaje apareció!`

export default function Battle() {

    const [battlerSrcs, setBattlerSrcs] = useState({});

    const navigate = useNavigate()

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
        }

    }

    async function getBattlerSrc(number, { back = false, shiny = false } = {}) {
        const suffix = `${back ? 'b' : ''}${shiny ? 's' : ''}`;
        const key = `./assets/battlers/${String(number).padStart(3, '0')}${suffix}.png`;
        const module = await import(key);
        return module.default;
    }

    useEffect(() => {
        async function load() {
            const src1 = await getBattlerSrc(p1.number, { back: true, shiny: p1.shiny });
            const src2 = await getBattlerSrc(p2.number, { back: false, shiny: p2.shiny });
            setBattlerSrcs({ src1, src2 });
        }
        load();
    }, []);


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
            <img
                src={battlerSrcs.src2}
                className="absolute top-12 right-12 w-48"
            />

            {/* HP del enemigo - flotando junto a su sprite */}

            <PokeStatusBar pkm={p2} positionClasses={'absolute top-24 left-8'} />

            {/* Sprite jugador - abajo izquierda */}
            <img
                src={battlerSrcs.src1}
                className="absolute bottom-32 left-12 w-64"
            />

            {/* HP del jugador - flotando junto a su sprite */}
            <PokeStatusBar pkm={p1} positionClasses={'absolute bottom-48 right-12'} />

            <BattleControlBox battleLog={battleLog} handlers={handlers} />


        </div>
    )
}