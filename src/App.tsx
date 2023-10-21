import React from 'react'
import './dark-mode.css'
import './App.css'

import FunWalletStatus from './FunWalletStatus'

// import Fun from "./Fun";
// import MetaMaskDemo from './WorkflowMetamask'
import MetaMaskUI from './MetamaskUI'
import SectionContainer from './SectionContainer'
import WorkflowRunner from './WorkflowRunner'

export default function App() {
  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <h1>{'Free Market <> Fun.xyz'}</h1>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            // alignItems: 'center',
            gap: 30,
            padding: 20,
          }}
        >
          <SectionContainer title="Meta Mask">
            <MetaMaskUI />
          </SectionContainer>
          <SectionContainer title="Fun">
            <FunWalletStatus />
          </SectionContainer>
          <WorkflowRunner />
        </div>
      </div>
    </div>
  )
}
