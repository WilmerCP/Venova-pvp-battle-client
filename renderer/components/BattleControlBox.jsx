import ActionMenu from './ActionMenu.jsx'
import MoveMenu from './MovesMenu.jsx'
import PokeSelection from './PokeSelection.jsx'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

export default function BattleControlBox({ battleLog, handlers, availableMoves, availablePokemon,
  switchRequired, animationPlaying, currentLog, battleEnded, waiting }) {

  const [menuState, setMenuState] = useState('main') // 'main' | 'moves' | 'pokemon'
  // inside your component, alongside your other state:
  const logContainerRef = useRef(null)


  let effectiveMenuState = switchRequired ? 'pokemon' : menuState;
  effectiveMenuState = waiting ? 'waiting' : effectiveMenuState;
  effectiveMenuState = battleEnded ? 'animating' : effectiveMenuState;
  effectiveMenuState = animationPlaying ? 'animating' : effectiveMenuState;

  useEffect(() => {

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }

  }, [battleLog, effectiveMenuState])

  return (
    <>
      {effectiveMenuState !== 'animating' && (
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800 z-20
                     ${effectiveMenuState !== 'pokemon' ? 'grid grid-cols-5' : ''}`}>

          {/* Columna izquierda: log de combate */}
          {effectiveMenuState !== 'pokemon' && (
            <div className="p-4 border-r-2 border-gray-300 overflow-y-scroll battle-log-scroll  col-span-2" ref={logContainerRef}>
              <ul className="text-base leading-snug font-mono">
                {
                  battleLog.map((log, index) => <li key={`log-${index}`}>{log}</li>)
                }
              </ul>
            </div>
          )}

          {/* Columna derecha: menú de acciones */}
          <div className="flex items-center justify-center col-span-3 special-background h-full">
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
                onSelectPokemon={(obj, index) => {

                  handlers.onSelectPokemon(obj, index);
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
      {effectiveMenuState === 'animating' && (
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800 flex items-center justify-center z-20`}>
          <p className="text-lg font-mono">{currentLog}</p>
        </div>
      )
      }
      {effectiveMenuState === 'waiting' && (
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-white border-t-4 border-gray-800 flex items-center justify-center z-20`}>
          <p className="text-lg font-mono">Esperando que el rival tome una accion...</p>
          <button
            onClick={handlers.onRun}
            className="bg-gray-500 hover:bg-gray-400 active:translate-y-[0.5] active:-translate-x-[0.5] active:border-1
                   text-white font-bold text-md py-2 px-3 rounded-sm
                   border-l-[3px] border-b-[3px] border-t-[1px] border-r-[1px] border-gray-700
                   transition-all duration-100 col-span-2 absolute bottom-5 right-5"
          >
            Rendirse
          </button>
        </div>
      )
      }
    </>
  )
}