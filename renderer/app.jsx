// app.jsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from './inicio.jsx'
import Battle from './battle.jsx'
import TeamBuilder from './teamBuilder.jsx'
import TeamPage from './TeamPage.jsx'

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

      return window.electronAPI.startRandomBattle();
    },
    
  },
  {
    path: '/teamBuilder',
    element: <TeamBuilder />,
    loader: async () => {
      if (!window.electronAPI) {
        throw new Error('electronAPI not available')
      }

      return window.electronAPI.getDexData()
    },
  },
  {
    path: '/teamPage',
    element: <TeamPage />,
    loader: async () => {
      if (!window.electronAPI) {
        throw new Error('electronAPI not available')
      }

      return window.electronAPI.getDexData()
    },
  },
])

export default function App() {
  return <RouterProvider router={router} />
}