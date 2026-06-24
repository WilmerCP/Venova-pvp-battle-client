// app.jsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from './inicio.jsx'
import Battle from './battle.jsx'

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
      return window.electronAPI.startRandomBattle()
    }
  }
])

export default function App() {
  return <RouterProvider router={router} />
}