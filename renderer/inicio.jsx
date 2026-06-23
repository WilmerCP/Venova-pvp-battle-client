import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import p1 from './assets/iguana.png'
import p2 from './assets/zamuro.png'

import { useNavigate } from 'react-router-dom'

export default function App() {

  const navigate = useNavigate()


  return (
    <div className="flex flex-col items-center justify-center h-screen relative"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh'
      }}>
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
      <p className="text-lg text-amber-100 font-medium tracking-wide z-5"
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
          Desafia a tus oponentes en combates épicos</p>
      <div className="flex space-x-4 mt-4">
        <button className="bg-blue-600 hover:bg-blue-500 active:translate-y-1 active:border-b-2
             text-white font-bold text-lg tracking-wide py-3 px-6 rounded-lg
             border-b-[6px] border-blue-900
             transition-all duration-100 z-5"
             onClick={() => navigate('/battle')}>
          Combatir
        </button>
        <button className="bg-amber-500 hover:bg-amber-400 active:translate-y-1 active:border-b-2
             text-white font-bold text-lg tracking-wide py-3 px-6 rounded-lg
             border-b-[6px] border-amber-800
             transition-all duration-100 z-5">
          Equipos
        </button>
        <img src={p1} alt="Player 1" className="w-64 absolute left-5 bottom-10 transform" />
        <img src={p2} alt="Player 2" className="w-64 absolute right-5 top-10 transform" />
      </div>
    </div>
  )
}