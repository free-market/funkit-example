/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { type ExecutionLog } from '@freemarket/client-sdk'

export type SelectedWorkflow = 'wrap' | 'unwrap'

interface State {
  isWorkflowRunning: boolean
  executionLogs?: ExecutionLog[]
  workflowInvocationCount: number
  selectedWorkflow: SelectedWorkflow
}

interface Actions {
  setWorkflowRunning: (b: boolean) => void
  setWorkflowExecutionLogs: (executionLogs: ExecutionLog[]) => void
  incrementWorkflowInvocationCount: () => void
  setSelectedWorkflow: (selectedWorkflow: SelectedWorkflow) => void
}

export const useDemoAppStore = create(
  devtools(
    immer<State & Actions>(set => ({
      isWorkflowRunning: false,
      workflowInvocationCount: 0,
      selectedWorkflow: 'wrap',
      setWorkflowRunning(b) {
        set(state => {
          state.isWorkflowRunning = b
        })
      },
      setWorkflowExecutionLogs(executionLogs) {
        set(state => {
          state.executionLogs = executionLogs
        })
      },
      incrementWorkflowInvocationCount() {
        set(state => {
          state.workflowInvocationCount++
        })
      },
      setSelectedWorkflow(selectedWorkflow: SelectedWorkflow) {
        set(state => {
          state.selectedWorkflow = selectedWorkflow
        })
      },
    })),
    { name: 'Demo App' }
  )
)
