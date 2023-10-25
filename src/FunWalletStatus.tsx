import { useState, useCallback, useEffect, useRef } from 'react'
import { convertToValidUserId, useConnector, useCreateFun, usePrimaryAuth } from '@funkit/react'
import { WalletBalances, type WalletBalancesProps } from '@freemarket/react'
import { useMetaMask } from 'metamask-react'
import { useDemoAppStore } from './store'

import { type AssetReference } from '@freemarket/client-sdk'

export const assetRefs: AssetReference[] = [
  {
    type: 'native',
  },
  {
    type: 'fungible-token',
    symbol: 'WETH',
  },
]

export default function FunWalletStatus() {
  const { workflowInvocationCount } = useDemoAppStore(state => ({
    workflowInvocationCount: state.workflowInvocationCount,
  }))
  const { ethereum } = useMetaMask()
  const useConnResult = useConnector({ index: 0, autoConnect: true })
  const { account: connectorAccount } = useConnResult
  const useCreateFunResult = useCreateFun()
  const { account, initializeFunAccount, funWallet } = useCreateFunResult
  const [auth] = usePrimaryAuth()
  const initWalletMutex = useRef(false)
  const [walletInitialized, setWalletInitialized] = useState(false)

  const initializeSingleAuthFunAccount = useCallback(async () => {
    if (funWallet) {
      // console.log('funWallet already initialized')
      return
    }
    if (!connectorAccount) {
      // console.log('connectorAccount not initialized')
      return
    }
    if (!auth) {
      // console.log('auth not initialized')
      return
    }
    try {
      if (!initWalletMutex.current) {
        initWalletMutex.current = true
        const uniqueId = await auth.getWalletUniqueId()
        console.log('calling initializeFunAccount')
        await initializeFunAccount({
          users: [{ userId: convertToValidUserId(connectorAccount) }],
          index: Math.floor(Math.random() * 10000000),
          uniqueId,
        })
        setWalletInitialized(true)
      }
    } catch (e) {
      console.error('error during initializeFunAccount', e)
    }
  }, [connectorAccount, auth, funWallet])

  useEffect(() => {
    console.log('useEffect initializeSingleAuthFunAccount', auth, connectorAccount)
    void initializeSingleAuthFunAccount()
  }, [auth, connectorAccount, walletInitialized])

  const walletBalancesProps: WalletBalancesProps = {
    stdProvider: ethereum,
    address: account ?? '',
    assetRefs,
    fungibleTokens: [],
    refreshToken: workflowInvocationCount,
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'min-content min-content', columnGap: 10, whiteSpace: 'nowrap' }}>
        <div>Address:</div>
        <div>{account}</div>
      </div>

      {account && (
        <div style={{}}>
          <WalletBalances {...walletBalancesProps} />
        </div>
      )}
      {!account && <div>Metamask is not connected. Please connect to Metamask to continue with FunWallet.</div>}
      {/* {active && !account && (
        <div>
          <button
            onClick={() => {
              void initializeSingleAuthFunAccount()
            }}
          >
            Create New Fun Wallet
          </button>
        </div>
      )} */}
    </div>
  )
}
