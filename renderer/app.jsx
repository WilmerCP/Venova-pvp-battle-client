// app.jsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from './inicio.jsx'
import Battle from './battle.jsx'
import TeamBuilder from './teamBuilder.jsx'
import TeamPage from './TeamPage.jsx'
import HostBattle from './HostBattle.jsx'

import { getRandomPin } from './helpers.js'
import JoinBattle from './JoinBattle.jsx'
import Settings from './Settings.jsx'

import { ThemeProvider } from './ThemeContext.jsx';
import { SettingsProvider } from './SettingsContext.jsx';

const router = createHashRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/battle',
    element: <Battle />
    
  },
  {
    path: '/settings',
    element: <Settings />
    
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
  {
    path: '/hostBattle',
    element: <HostBattle />,
    loader: async () => {

      console.log('Generating random pin for hosting battle...');

     if (!window.electronAPI) {
        throw new Error('electronAPI not available')
      }


      const pin = getRandomPin();

      return window.electronAPI.hostBattle(pin);
    },
  },

  {
    path: '/joinBattle',
    element: <JoinBattle />
  },
])

export default function App() {
  return <ThemeProvider>
    <SettingsProvider>
    <RouterProvider router={router} />
    </SettingsProvider>
  </ThemeProvider>
}