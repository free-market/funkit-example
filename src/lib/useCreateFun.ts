import {
  type Workflow,
  type Arguments,
  type ExecuteWorkflowOptions,
  executeWorkflow as executeWorkflowHelper,
  getChainFromProvider,
  Executors,
  type EvmTransactionExecutor,
} from '@freemarket/client-sdk'
import { useCreateFun as baseUseCreateFun, useConnector, usePrimaryAuth } from '@funkit/react'
import { FunTransactionExecutor } from './FunTransactionExecutor'
import { type FunWallet } from './FunWallet'
import { usePrimaryConnector } from '@funkit/react/dist/hooks/util'

type UseCreateFunReturn = Omit<ReturnType<typeof baseUseCreateFun>, 'funWallet'> & {
  funWallet: FunWallet
}

type ExecuteWorkflowFunc = FunWallet['executeWorkflow']

export function useCreateFun(): UseCreateFunReturn {
  const ret = baseUseCreateFun() as UseCreateFunReturn
  const [auth] = usePrimaryAuth()
  const primaryConnector = usePrimaryConnector()
  const {
    connector: { provider },
  } = useConnector({ index: 0, autoConnect: true })

  // const funWallet: any = ret.funWallet;
  const { funWallet, account } = ret
  const funWalletAsAny: any = funWallet

  if (funWallet && account && provider && !funWallet.executeWorkflow) {
    const executeWorkflow: ExecuteWorkflowFunc = async (workflow: Workflow, args?: Arguments) => {
      const userAddress = await funWallet.getAddress()
      const chain = await getChainFromProvider(provider as any)
      const executor: EvmTransactionExecutor = new FunTransactionExecutor(funWallet, auth, primaryConnector)
      const executeWorkflowOptions: ExecuteWorkflowOptions = {
        workflow,
        userAddress,
        providers: provider as any,
        executors: executor,
        handler: event => {
          console.log('workflow event:', event)
        },
        args,
      }
      return executeWorkflowHelper(executeWorkflowOptions)
    }
    executeWorkflow.bind(funWallet)
    funWallet.executeWorkflow = executeWorkflow
  }

  return ret
}
