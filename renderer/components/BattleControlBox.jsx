import ActionMenu from './ActionMenu.jsx'
import MoveMenu from './MovesMenu.jsx'
import PokeSelection from './PokeSelection.jsx'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

export default function BattleControlBox({ battleLog, handlers, availableMoves, availablePokemon,
 switchRequired, animationPlaying, currentLog }) {

  const [menuState, setMenuState] = useState('main') // 'main' | 'moves' | 'pokemon'
  // inside your component, alongside your other state:
  const logContainerRef = useRef(null)


  //let effectiveMenuState = availableMoves.length === 0 ? 'main' : menuState;
  let effectiveMenuState = animationPlaying === false ? (switchRequired ? 'pokemon' : menuState) : 'waiting';

  useEffect(() => {

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }

  }, [battleLog, effectiveMenuState])

  return (
    <>
      {effectiveMenuState !== 'waiting' && (
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800
                     ${effectiveMenuState !== 'pokemon' ? 'grid grid-cols-5' : ''}`}>

          {/* Columna izquierda: log de combate */}
          {effectiveMenuState !== 'pokemon' && (
            <div className="p-4 border-r-2 border-gray-300 overflow-y-scroll  col-span-2" ref={logContainerRef}>
              <ul className="text-lg leading-snug">
                {
                  battleLog.map((log, index) => <li key={`log-${index}`}>{log}</li>)
                }
              </ul>
            </div>
          )}

          {/* Columna derecha: menú de acciones */}
          <div className="flex items-center justify-center col-span-3">
            {effectiveMenuState === 'main' && (
              <ActionMenu
                onFight={() => setMenuState('moves')}
                onSwitch={() => setMenuState('pokemon')}
                onRun={handlers.onRun}
              />
            )}

            {effectiveMenuState === 'moves' && (
              <MoveMenu
                onSelectMove={handlers.onMakeMove}
                onBack={() => setMenuState('main')}
                availableMoves={availableMoves}
              />
            )}

            {effectiveMenuState === 'pokemon' && (
              <PokeSelection
                onSelectPokemon={(name) => {

                  handlers.onSelectPokemon(name);
                  setMenuState('main');

                }}
                onBack={() => setMenuState('main')}
                availablePokemon={availablePokemon}
                forced={switchRequired}
              />
            )}

          </div>

        </div>
      )
      }
      {effectiveMenuState === 'waiting' && (
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800 flex items-center justify-center`}>
          <p className="text-lg font-semibold">{currentLog}</p>
        </div>
      )
      }
    </>
  )
}