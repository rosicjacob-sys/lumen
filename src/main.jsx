import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import './styles/global.css'
import App from './App'
import { FORCE_REDUCED_MOTION } from './lib/env'

// ?rm=1 test hook: mirror prefers-reduced-motion for CSS as well as JS.
if (FORCE_REDUCED_MOTION) document.documentElement.classList.add('force-rm')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
