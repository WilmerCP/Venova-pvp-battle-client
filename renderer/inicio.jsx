import './index.css'
import bg from './assets/fondos/battlebgChampion.png'
import p1 from './assets/iguana.png'
import p2 from './assets/zamuro.png'
import BlockyButton from './components/BlockyButton'

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
        <BlockyButton color="#e43926" onClick={() => navigate('/battle')}>Combatir</BlockyButton>
        <BlockyButton color="#dd8c21" onClick={() => navigate('/teamBuilder')}>Equipos</BlockyButton>
        <img src={p1} alt="Player 1" className="w-64 absolute left-5 bottom-10 transform" />
        <img src={p2} alt="Player 2" className="w-64 absolute right-5 top-10 transform" />
      </div>
    </div>
  )
}