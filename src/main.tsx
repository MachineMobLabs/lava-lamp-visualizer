import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ProtectedContent } from './components/ProtectedContent'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProtectedContent>
      <App />
    </ProtectedContent>
  </React.StrictMode>,
)
