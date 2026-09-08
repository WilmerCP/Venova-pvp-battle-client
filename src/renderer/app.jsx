// src/renderer/app.jsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BattlePage from './pages/BattlePage.jsx'
import TeamBuilder from './pages/TeamBuilder.jsx'
import TeamPage from './pages/TeamPage.jsx'
import HostBattle from './pages/HostBattle.jsx'

import { getRandomPin } from './helpers.js'
import JoinBattle from './pages/JoinBattle.jsx'
import Settings from './pages/Settings.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/battle',
    element: <BattlePage />
    
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