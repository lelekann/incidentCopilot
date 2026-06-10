import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ShipmentProvider } from './data/ShipmentContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShipmentProvider>
      <App />
    </ShipmentProvider>
  </StrictMode>,
)
