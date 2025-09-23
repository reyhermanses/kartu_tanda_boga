import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<App />)
} else {
  document.body.innerHTML = '<div style="height:100vh;background:#dc2626;color:white;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">BOGA GROUP - FALLBACK</div>'
}