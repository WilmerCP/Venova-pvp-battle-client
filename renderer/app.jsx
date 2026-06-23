// app.jsx
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './inicio.jsx'
import Battle from './battle.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/battle" element={<Battle />} />
    </Routes>
  )
}