import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Simple error boundary
const rootElement = document.getElementById('root')
if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px; background: white;">Root element not found</div>'
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
