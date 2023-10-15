import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MetaMaskProvider } from 'metamask-react'
import './lib/initFun'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <MetaMaskProvider>
      <App />
    </MetaMaskProvider>
  </React.StrictMode>
)
