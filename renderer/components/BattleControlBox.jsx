import ActionMenu from './ActionMenu.jsx'
import MoveMenu from './MovesMenu.jsx'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

export default function BattleControlBox({ battleLog, handlers, availableMoves }) {

  const [menuState, setMenuState] = useState('main') // 'main' | 'moves'
  // inside your component, alongside your other state:
  const logContainerRef = useRef(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [battleLog])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800
                     grid grid-cols-5">

      {/* Columna izquierda: log de combate */}
      <div className="p-4 border-r-2 border-gray-300 overflow-y-scroll  col-span-2" ref={logContainerRef}>
        <ul className="text-lg leading-snug">
          {
            battleLog.map((log, index) => <li key={`log-${index}`}>{log}</li>)
          }
        </ul>
      </div>

      {/* Columna derecha: menú de acciones */}
      <div className="flex items-center justify-center col-span-3">
        {menuState === 'main' && (
          <ActionMenu
            onFight={() => setMenuState('moves')}
            onSwitch={handlers.onSwitch}
            onRun={handlers.onRun}
          />
        )}

        {menuState === 'moves' && (
          <MoveMenu
            onSelectMove={handlers.onMakeMove}
            onBack={() => setMenuState('main')}
            availableMoves={availableMoves}
          />
        )}
      </div>

    </div>
  )
}