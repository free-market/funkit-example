import React, { useCallback, useState } from 'react'
import { WorkflowArgumentsForm } from '@freemarket/react'
import { type ExecutionEventHandler, type Arguments, type Workflow } from '@freemarket/client-sdk'
import { useDemoAppStore, type SelectedWorkflow } from './store'
import { addWorkflowRunner } from './lib/addWorkflowRunner'
import SectionContainer from './SectionContainer'
import { Operation, useConnector, useCreateFun, usePrimaryAuth } from '@funkit/react'
import SelectBar, { type SelectBarItem } from './SelectBar'
import CircularProgress from './CircularProgress'

const workflows: Record<string, Workflow> = {
  unwrap: {
    parameters: [
      {
        name: 'startAmount',
        label: 'Amount',
        description: 'The amount you want to unwrap',
        type: 'amount',
      },
    ],
    steps: [
      {
        type: 'unwrap-native',
        amount: '{{ startAmount }}',
        source: 'caller',
      },
    ],
  },
  wrap: {
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
  },
}

const selectBarItems: SelectBarItem[] = [
  {
    label: 'Wrap',
    value: 'wrap',
  },
  {
    label: 'Unwrap',
    value: 'unwrap',
  },
]

export default function WorkflowExecutor() {
  const [status, setStatus] = useState('idle')
  const {
    isWorkflowRunning,
    setWorkflowRunning,
    executionLogs,
    setExecutionLogs,
    incrementWorkflowInvocationCount,
    selectedWorkflow,
    setOperation,
  } = useDemoAppStore(state => ({
    isWorkflowRunning: state.isWorkflowRunning,
    setWorkflowRunning: state.setWorkflowRunning,
    setExecutionLogs: state.setWorkflowExecutionLogs,
    executionLogs: state.executionLogs,
    incrementWorkflowInvocationCount: state.incrementWorkflowInvocationCount,
    selectedWorkflow: state.selectedWorkflow,
    setOperation: state.setSelectedWorkflow,
  }))
  const workflowEventHandler: ExecutionEventHandler = e => {
    setStatus(e.message)
  }
  const { funWallet: baseFunWallet } = useCreateFun()
  const [auth] = usePrimaryAuth()
  const {
    connector: { provider },
  } = useConnector({ index: 0, autoConnect: true })
  const funWallet = addWorkflowRunner(baseFunWallet, auth, provider)

  const workflow = workflows[selectedWorkflow]
  const handleSubmit = useCallback(
    async (args: Arguments) => {
      if (!isWorkflowRunning && funWallet) {
        setWorkflowRunning(true)
        const result = await funWallet.executeWorkflow(workflow, args, workflowEventHandler)
        setWorkflowRunning(false)
        setExecutionLogs(result)
        incrementWorkflowInvocationCount()
        console.log('result', result)
      }
    },
    [funWallet, selectedWorkflow]
  )

  function getStatusPrefix() {
    switch (status) {
      case 'Workflow has completed successfully':
        return '✅'
      case 'idle':
        return ' '
      default:
        return <CircularProgress></CircularProgress>
    }
  }
  return (
    <>
      <SectionContainer title="Workflow Status">
        <div style={{ display: 'flex' }}>
          <div style={{ width: 30 }}>{getStatusPrefix()}</div>

          {status}
        </div>
      </SectionContainer>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 8 }}>Operation: </div>
        <SelectBar
          items={selectBarItems}
          onSelect={newSelection => {
            setOperation(newSelection as SelectedWorkflow)
          }}
          selected={selectedWorkflow}
        />
      </div>
      <SectionContainer title="Workflow Parameters">
        <WorkflowArgumentsForm workflow={workflow} onSubmit={handleSubmit} />
      </SectionContainer>
    </>
  )
}
