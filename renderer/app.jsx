// app.jsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from './inicio.jsx'
import Battle from './battle.jsx'

/*function waitForBattleReady() {
  return new Promise((resolve, reject) => {
    const collected = { players: {}, team: null }

    const checkComplete = () => {
      if (collected.players.p1 && collected.players.p2 && collected.team) {
        cleanup()
        resolve(collected)
      }
    }

    const onPlayer = (data) => {
      collected.players[data.id] = data.name
      checkComplete()
    }

    const onTeam = (data) => {
      collected.team = data
      checkComplete()
    }

    function cleanup() {
      window.electronAPI.off('player')
      window.electronAPI.off('team')
    }

    window.electronAPI.on('player', onPlayer)
    window.electronAPI.on('team', onTeam)

    // Optional: fail safe if it never resolves
    setTimeout(() => {
      cleanup()
      reject(new Error('Timed out waiting for battle to start'))
    }, 15000)
  })
}*/

const router = createHashRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/battle',
    element: <Battle />,
    loader: async () => {
      if (!window.electronAPI) {
        throw new Error('electronAPI not available')
      }

      //const initialData = await waitForBattleReady();

      return window.electronAPI.startRandomBattle()
    }
  }
])

export default function App() {
  return <RouterProvider router={router} />
}