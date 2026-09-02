import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import p1 from './assets/iguana.png'
import p2 from './assets/zamuro.png'
import BlockyButton from './components/BlockyButton'
import Toast from './components/Toast';

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function App() {
  const navigate = useNavigate()

  const [msg, setMsg] = useState(null); //Toast Component

  const handlePvpBattle = async (path) => {

    let team = await window.electronAPI.getSelectedTeam();

    if (!team) {

      setMsg("¡Necesitas un equipo para combatir!");

    } else {

      navigate(path);

    }

  }

  return (
    <div
      className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Botón de configuración (esquina superior derecha) */}
      <button
        type="button"
        className="absolute top-5 right-5 text-amber-100 hover:text-amber-300 transition-transform duration-200 hover:scale-110 active:scale-95 z-10"
        title="Configuración"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 w-9 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <h1
        className="text-6xl font-extrabold text-amber-100 tracking-wide z-5 font-['Russo_One']"
        style={{
          textShadow: `
            3px 3px 0 #5a1010,
            -1px -1px 0 #5a1010,
            1px -1px 0 #5a1010,
            -1px 1px 0 #5a1010,
            0 6px 10px rgba(0,0,0,0.4)
          `
        }}
      >
        Venova Legends
      </h1>
      <p
        className="text-lg text-amber-100 font-medium tracking-wide z-5"
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
      >
        Desafia a tus oponentes en combates épicos
      </p>

      {/* Contenedor ÚNICAMENTE para los botones */}
      <div className="flex space-x-3 mt-4 scale-90 z-10">
        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <BlockyButton color="#059669" onClick={() => navigate('/battle', { state: { mode: 'random', playerIdentity: 'p1' } })}>
            Combatir
          </BlockyButton>
        </div>

        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <BlockyButton color="#d97706" onClick={() => navigate('/teamPage')}>
            Equipo
          </BlockyButton>
        </div>

        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <BlockyButton color="#78350F" onClick={() => navigate('/teamBuilder')}>
            Editor
          </BlockyButton>
        </div>

        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <BlockyButton color="#B45309" onClick={()=>{handlePvpBattle('./hostBattle')}}>
            Hostear
          </BlockyButton>
        </div>

        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <BlockyButton color="#F59E0B" onClick={()=>{handlePvpBattle('./joinBattle')}}>
            Unirse
          </BlockyButton>
        </div>
      </div>

      {/* Imágenes afuera del contenedor de botones para mantener su posición original relativa a la pantalla */}
      <img src={p1} alt="Player 1" className="w-64 absolute left-5 bottom-10 transform" />
      <img src={p2} alt="Player 2" className="w-64 absolute right-5 top-10 transform" />
      <Toast show={msg !== null} onClose={() => setMsg(null)} message={msg} type={'warning'}/>
    </div>
  )
}