import { type Auth, type FunWallet } from '@funkit/core'
import {
  type Workflow,
  type Arguments,
  type ExecutionLog,
  type ExecuteWorkflowOptions,
  executeWorkflow as executeWorkflowHelper,
  type ExecutionEventHandler,
  getChainFromProvider,
} from '@freemarket/client-sdk'
import { FunTransactionExecutor } from './FunTransactionExecutor'

type ExecuteWorkflowFunc = (workflow: Workflow, args?: Arguments, eventHandler?: ExecutionEventHandler) => Promise<ExecutionLog[]>

interface ExecuteWorkflowMixin {
  executeWorkflow: ExecuteWorkflowFunc
}

export function addWorkflowRunner<T extends FunWallet>(
  funWallet: T | null,
  auth: Auth,
  provider: any | undefined
): (T & ExecuteWorkflowMixin) | null {
  if (!funWallet || !provider) {
    return null
  }
  const fw = funWallet as T & ExecuteWorkflowMixin
  if (!fw.executeWorkflow) {
    // the function to be appended to the funWallet object
    const executeWorkflow = async (workflow: Workflow, args?: Arguments, handler?: ExecutionEventHandler) => {
      const userAddress = await funWallet.getAddress()
      const startChain = await getChainFromProvider(provider)
      const executeWorkflowOptions: ExecuteWorkflowOptions = {
        workflow,
        userAddress,
        providers: provider,
        executors: new FunTransactionExecutor(funWallet, auth, provider),
        handler,
        args,
        startChain,
      }
      return executeWorkflowHelper(executeWorkflowOptions)
    }

    // append the function to the funWallet object
    executeWorkflow.bind(funWallet)
    fw.executeWorkflow = executeWorkflow
  }

  return fw
}
