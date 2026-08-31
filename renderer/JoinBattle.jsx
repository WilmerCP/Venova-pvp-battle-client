import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import p1 from './assets/iguana.png'
import p2 from './assets/zamuro.png'
import BlockyButton from './components/BlockyButton'

export default function JoinBattle() {
    const navigate = useNavigate()
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

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
            className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center select-none"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay para oscurecer el fondo y dar contraste */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            {/* Contenedor Principal (Tarjeta Estilo Arcade) */}
            <form
                onSubmit={handleJoin}
                className="relative z-10 flex w-[90%] max-w-md flex-col items-center gap-6 rounded-2xl border-4 border-amber-950 bg-stone-900/90 p-8 shadow-[0_10px_0_0_rgba(0,0,0,0.8)] backdrop-blur-md"
            >
                {/* Título */}
                <h1 className="font-['Russo_One'] text-4xl uppercase tracking-wider text-amber-300 drop-shadow-[0_4px_0_#5a1010]">
                    Unirse a Batalla
                </h1>

                {/* Subtítulo */}
                <p className="text-center font-semibold text-amber-100/90 text-sm md:text-base">
                    Ingresa el PIN que te compartió tu rival para entrar a la sala
                </p>

                {/* Campo de Entrada de PIN */}
                <div className="w-full flex flex-col items-center gap-2">
                    <input
                        type="text"
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value.toUpperCase())
                            if (error) setError('')
                        }}
                        placeholder="PIN AQUÍ"
                        maxLength={6}
                        className="w-full rounded-xl border-4 border-black bg-stone-950 px-4 py-3 text-center font-['Russo_One'] text-3xl tracking-widest text-amber-300 uppercase placeholder-stone-600 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] outline-none transition-colors focus:border-amber-500"
                    />

                    {/* Mensaje de error si el PIN está vacío */}
                    {error && (
                        <span className="text-xs font-bold text-red-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {error}
                        </span>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className="flex w-full justify-center gap-4 pt-2">
                    <BlockyButton color="#e43926" onClick={() => navigate('/')}>
                        Volver
                    </BlockyButton>
                    <BlockyButton color="#28a745" type="submit">
                        Entrar
                    </BlockyButton>
                </div>
            </form>

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
        </div>
    )
}