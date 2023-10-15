import { useCreateFun } from '@funkit/react'
import React from 'react'
import Balances from './Balances'

export default function FunWalletBalances() {
  const { account, initializeFunAccount, funWallet } = useCreateFun()
  console.log('account', account)

  return (
    <div>
      <Balances address={account} />
    </div>
  )
}
