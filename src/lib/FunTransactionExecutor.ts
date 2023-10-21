import { type Auth, type FunWallet, type TransactionParams as FunTransactionParams } from '@funkit/core'
import { assert, type EvmTransactionExecutor, type TransactionParams, type TransactionReceipt } from '@freemarket/client-sdk'
import { Web3Provider } from '@ethersproject/providers'

export class FunTransactionExecutor implements EvmTransactionExecutor {
  funWallet: FunWallet
  auth: Auth
  provider: any
  constructor(funWallet: FunWallet, auth: Auth, provider: any) {
    this.funWallet = funWallet
    this.auth = auth
    this.provider = provider
  }

  async executeTransactions(transactionParamsArray: TransactionParams[]): Promise<TransactionReceipt[]> {
    const userAddress = await this.auth.getAddress()
    const operationBatch = await this.funWallet.createBatchOperation(
      this.auth,
      userAddress,
      transactionParamsArray as FunTransactionParams[]
    )
    const receipt = await this.funWallet.executeOperation(this.auth, operationBatch)
    assert(receipt.txId)
    const ethersProvider = new Web3Provider(this.provider)
    const txReceipt = await ethersProvider.getTransactionReceipt(receipt.txId)
    return [txReceipt]
  }
}
