import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/index.css'
import BlockyButton from '../components/BlockyButton'

import { useTheme } from '../context/ThemeContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function JoinBattle() {
    const navigate = useNavigate()
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    const { battleAnimations, setBattleAnimations, weatherAnimations, setWeatherAnimations } = useSettings();

    const { activeThemeId, setActiveThemeId, theme, themes } = useTheme();

    const { specialBackground, logBackground, contrastText } = theme;

    const handleJoin = (e) => {
        e.preventDefault()

        // Validación básica del PIN
        if (!pin.trim() || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
            setError('Por favor, ingresa un PIN válido');
            return;
        }

        // Limpiamos errores y redirigimos a la sala o lógica de conexión
        setError('')
        if (!window.electronAPI) {
            throw new Error('electronAPI not available')
        }

        window.electronAPI.joinBattle(pin);
    }

    useEffect(() => {

        window.electronAPI.on('matched', () => {

            console.log('Matched event received, navigating to battle...');

            navigate('/battle', { state: { mode: 'pvp', playerIdentity: 'p2' } })

        })

        return () => {

            window.electronAPI.off('matched')

        }

    }, [])

    return (
        <div
            className={`relative flex h-screen w-screen flex-col items-center justify-center
                 overflow-hidden select-none ${specialBackground}`}>
            {/* Overlay para oscurecer el fondo y dar contraste */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

            {/* Contenedor Principal*/}
            <div
                className="relative z-10 flex w-[90%]  flex-col items-center gap-6 rounded-2xl border-4 border-amber-950 bg-stone-900/90 p-8 shadow-[0_10px_0_0_rgba(0,0,0,0.8)] backdrop-blur-md"
            >
                {/* Título */}
                <h1 className="font-['Russo_One'] text-4xl uppercase tracking-wider text-amber-300 drop-shadow-[0_4px_0_#5a1010]">
                    Ajustes
                </h1>

                {/* Subtítulo */}
                <p className="text-center font-semibold text-amber-100/90 text-sm md:text-base">
                    Personaliza tu experiencia de batalla
                </p>

                {/* Opciones */}
                <div className="flex w-full flex-col gap-5">

                    {/* Animaciones de Batalla */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-amber-950 bg-stone-800/80 px-4 py-3">
                        <span className="font-semibold text-amber-100">Animaciones de Batalla</span>
                        <button
                            type="button"
                            onClick={() => setBattleAnimations(battleAnimations => !battleAnimations)}
                            className={`relative h-7 w-14 rounded-full border-2 border-amber-950 transition-colors duration-200 ${battleAnimations ? 'bg-green-600' : 'bg-stone-600'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-amber-100 shadow-md transition-all duration-200 ${battleAnimations ? 'left-[30px]' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Animaciones de Clima */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-amber-950 bg-stone-800/80 px-4 py-3">
                        <span className="font-semibold text-amber-100">Animaciones de Clima</span>
                        <button
                            type="button"
                            onClick={() => setWeatherAnimations(weatherAnimations => !weatherAnimations)}
                            className={`relative h-7 w-14 rounded-full border-2 border-amber-950 transition-colors duration-200 ${weatherAnimations ? 'bg-green-600' : 'bg-stone-600'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-amber-100 shadow-md transition-all duration-200 ${weatherAnimations ? 'left-[30px]' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Selector de Tema */}
                    <div className="flex flex-col gap-2 rounded-xl border-2 border-amber-950 bg-stone-800/80 px-4 py-3">
                        <span className="font-semibold text-amber-100">Tema</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {themes.map((t,index) => (
                                <button
                                    key={`theme-${index}`}
                                    type="button"
                                    onClick={() => setActiveThemeId(index)}
                                    className={`flex-shrink-0 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase transition-all ${activeThemeId === index
                                            ? 'border-amber-300 bg-amber-300/20 text-amber-300'
                                            : 'border-amber-950/60 text-amber-100/60 hover:border-amber-950'
                                        }`}
                                    style={{ boxShadow: activeThemeId === index ? `0 3px 0 0 ${t.color}` : 'none' }}
                                >
                                    {index}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Botones de Acción */}
                <div className="flex w-full justify-center gap-4 pt-2">
                    <BlockyButton color="#e43926" onClick={() => navigate('/')}>
                        Volver
                    </BlockyButton>
                    {/*
                    <BlockyButton color="#28a745" onClick={() => { }}>
                        Guardar
                    </BlockyButton>
                    */}
                </div>
            </div>
        </div>
    )
}