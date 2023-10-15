import { type Auth, type FunWallet as BaseFunWallet, Operation } from '@funkit/core'
import {
  type Workflow,
  type EvmTransactionExecutor,
  type Arguments,
  type TransactionParams,
  type ExecutionLog,
  type ExecuteWorkflowOptions,
  executeWorkflow as executeWorkflowHelper,
  assert,
  type ExecutionEventHandler,
  getChainFromProvider,
} from '@freemarket/client-sdk'
import { useCreateFun as baseUseCreateFun, useConnector, usePrimaryAuth } from '@funkit/react'
import { FunTransactionExecutor } from './FunTransactionExecutor'

type UseCreateFunReturn = Omit<ReturnType<typeof baseUseCreateFun>, 'funWallet'> & {
  funWallet: FunWallet | null
}

type ExecuteWorkflowFunc = (workflow: Workflow, args?: Arguments, eventHandler?: ExecutionEventHandler) => Promise<ExecutionLog[]>
export type FunWallet = BaseFunWallet & {
  executeWorkflow: ExecuteWorkflowFunc
}

export function useCreateFun(): UseCreateFunReturn {
  const ret = baseUseCreateFun() as UseCreateFunReturn
  const [auth] = usePrimaryAuth()
  const connector = useConnector({ index: 0, autoConnect: true })
  const { provider } = connector

  // const funWallet: any = ret.funWallet;
  const { funWallet, account } = ret

  if (funWallet && account && provider && !funWallet.executeWorkflow) {
    // the function to be appended to the funWallet object
    const executeWorkflow: ExecuteWorkflowFunc = async (workflow: Workflow, args?: Arguments, handler?: ExecutionEventHandler) => {
      const userAddress = await funWallet.getAddress()
      const startChain = await getChainFromProvider(provider.provider)
      const executeWorkflowOptions: ExecuteWorkflowOptions = {
        workflow,
        userAddress,
        providers: provider.provider,
        executors: new FunTransactionExecutor(funWallet, auth, provider.provider),
        handler,
        args,
        startChain,
      }
      return executeWorkflowHelper(executeWorkflowOptions)
    }

    // append the function to the funWallet object
    executeWorkflow.bind(funWallet)
    funWallet.executeWorkflow = executeWorkflow
  }

  return ret
}
