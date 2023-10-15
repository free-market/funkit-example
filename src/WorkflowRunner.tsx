import React, { useCallback, useState } from 'react'
import './dark-mode.css'
import './App.css'

import { WorkflowArgumentsForm } from '@freemarket/args-ui-react'
import { type ExecutionEventHandler, type Arguments, type Workflow } from '@freemarket/client-sdk'
import FunWalletStatus from './FunWalletStatus'

// import Fun from "./Fun";
// import MetaMaskDemo from './WorkflowMetamask'
import MetaMaskUI from './MetamaskUI'
import FunWalletBalances from './FunWalletBalances'
import { useDemoAppStore } from './store'
import { useCreateFun } from './lib/FunWallet'
import WorkflowAssets from './lib/WorkflowAssets'
import SectionContainer from './SectionContainer'
const workflow: Workflow = {
  steps: [
    {
      type: 'wrap-native',
      amount: '{{ startAmount }}',
      source: 'caller',
    },
  ],
  parameters: [
    {
      name: 'startAmount',
      label: 'Amount',
      description: 'The amount you want to wrap',
      type: 'amount',
    },
  ],
}

export default function WorkflowExecutor() {
  const [status, setStatus] = useState('idle')
  const { isWorkflowRunning, setWorkflowRunning, executionLogs, setExecutionLogs, incrementWorkflowInvocationCount } = useDemoAppStore(
    state => ({
      isWorkflowRunning: state.isWorkflowRunning,
      setWorkflowRunning: state.setWorkflowRunning,
      setExecutionLogs: state.setWorkflowExecutionLogs,
      executionLogs: state.executionLogs,
      incrementWorkflowInvocationCount: state.incrementWorkflowInvocationCount,
    })
  )
  const workflowEventHandler: ExecutionEventHandler = e => {
    setStatus(e.message)
  }
  const createFun = useCreateFun()
  const { funWallet } = createFun
  console.log('*funWallet*', !!funWallet)
  const handleSubmit = useCallback(
    async (args: Arguments) => {
      console.log('submit', isWorkflowRunning, args)
      console.log('*funWallet*', !!funWallet)
      if (!isWorkflowRunning && funWallet) {
        setWorkflowRunning(true)
        const result = await funWallet.executeWorkflow(workflow, args, workflowEventHandler)
        setWorkflowRunning(false)
        setExecutionLogs(result)
        incrementWorkflowInvocationCount()
        console.log('result', result)
      }
    },
    [funWallet]
  )
  return (
    <>
      <SectionContainer title="Workflow Status">{status}</SectionContainer>
      <SectionContainer title="Workflow Parameters">
        <WorkflowArgumentsForm workflow={workflow} onSubmit={handleSubmit} />
      </SectionContainer>
    </>
  )
}
