import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import p1 from './assets/iguana.png'
import p2 from './assets/zamuro.png'
import BlockyButton from './components/BlockyButton'
import Toast from './components/Toast'

import { useNavigate, useLoaderData } from 'react-router-dom'
import { useState, useEffect, use } from 'react'

export default function HostBattle() {
    const navigate = useNavigate()
    const battleData = useLoaderData()

    const [msg, setMsg] = useState(null); //Toast Component

    const copyPinToClipboard = () => {
        if (battleData?.pin) {
            navigator.clipboard.writeText(battleData.pin)
            setMsg('PIN copiado correctamente');
        }
    }

    useEffect(() => {

        window.electronAPI.on('matched', () => {

            navigate('/battle', { state: { mode: 'pvp', playerIdentity: 'p1' } })

        })

        return () => {

            window.electronAPI.off('matched')

        }

    }, [])

    return (
        <div
            className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center select-none"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay para oscurecer el fondo y dar contraste */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            {/* Contenedor Principal (Tarjeta Estilo Arcade) */}
            <div className="relative z-10 flex w-[90%] max-w-md flex-col items-center gap-6 rounded-2xl border-4 border-amber-950 bg-stone-900/90 p-8 shadow-[0_10px_0_0_rgba(0,0,0,0.8)] backdrop-blur-md">

                {/* Título */}
                <h1
                    className="font-['Russo_One'] text-4xl uppercase tracking-wider text-amber-300 drop-shadow-[0_4px_0_#5a1010]"
                >
                    Hostear Combate
                </h1>

                {/* Subtítulo */}
                <p className="text-center font-semibold text-amber-100/90 text-sm md:text-base">
                    Comparte este PIN con tu rival para iniciar la batalla
                </p>

                {/* Caja interactiva para el PIN */}
                <button
                    onClick={copyPinToClipboard}
                    title="Haz clic para copiar"
                    className="group relative flex w-full items-center justify-center rounded-xl border-4 border-black bg-amber-500/20 px-6 py-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] transition-all hover:bg-amber-500/30 active:scale-95"
                >
                    <span className="font-['Russo_One'] text-4xl tracking-widest text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {battleData?.pin || '----'}
                    </span>
                    <span className="absolute right-3 text-xs uppercase font-bold text-amber-200/60 group-hover:text-amber-200">
                        Copiar
                    </span>
                </button>

                {/* Botones de Acción */}
                <div className="flex w-full justify-center gap-4 pt-2">
                    <BlockyButton color="#e43926" onClick={() => navigate('/')}>
                        Volver
                    </BlockyButton>
                    <BlockyButton color="#dd8c21" onClick={() => navigate('/teamPage')}>
                        Revisar equipo
                    </BlockyButton>
                </div>
            </div>

            {/* Personajes flotantes en esquinas opuestas */}
            <img
                src={p1}
                alt="Player 1"
                className="absolute left-4 bottom-4 z-20 w-44 md:w-64 lg:w-80 transition-transform duration-300 hover:scale-105 pointer-events-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.7)]"
            />
            <img
                src={p2}
                alt="Player 2"
                className="absolute right-4 top-4 z-20 w-44 md:w-64 lg:w-80 transition-transform duration-300 hover:scale-105 pointer-events-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.7)]"
            />
            <Toast show={msg !== null} onClose={() => setMsg(null)} message={msg} type={'copy'} />
        </div>
    )
}