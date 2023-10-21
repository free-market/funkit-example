import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
  usePrimaryAuth,
} from '@funkit/react'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { shortAddress } from './lib/utils'
import { useEffectOnce } from './useEffectOnce'
import { WalletBalances, type WalletBalancesProps } from '@freemarket/react'
import { type AssetReference } from '@freemarket/client-sdk'
import { useMetaMask } from 'metamask-react'
import { assetRefs } from './assetRefs'
import { useDemoAppStore } from './store'

interface ConnectorButtonProps {
  index: number
}

const ConnectorButton = ({ index }: ConnectorButtonProps) => {
  const { active, activate, deactivate, connectorName, connector } = useConnector({ index })

  return (
    <button
      onClick={() => {
        if (active) {
          deactivate(connector)
          return
        }
        activate(connector)
      }}
    >
      {active ? 'Disconnect' : 'Connect'} {connectorName}{' '}
    </button>
  )
}

export default function FunWalletStatus() {
  const { workflowInvocationCount } = useDemoAppStore(state => ({
    workflowInvocationCount: state.workflowInvocationCount,
  }))
  const { ethereum } = useMetaMask()
  const useConnResult = useConnector({ index: 0, autoConnect: true })
  //   console.log('useConnResult', useConnResult)
  const { account: connectorAccount, active } = useConnResult

  // Step 3: Use the initializeFunAccount method to create your funWallet object
  const useCreateFunResult = useCreateFun()
  //   console.log('useCreateFunResult', useCreateFunResult)
  const { account, initializeFunAccount, funWallet } = useCreateFunResult

  // Step 4: Use the auth and funWallet to perform actions (ie: swap, transfer, etc.)
  const [auth] = usePrimaryAuth()

  const initWalletMutex = useRef(false)

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
      // console.log('initializeFunAccount', initWalletMutex.current)
      if (!initWalletMutex.current) {
        initWalletMutex.current = true
        const uniqueId = await auth.getWalletUniqueId()
        console.log('calling initializeFunAccount')
        void initializeFunAccount({
          users: [{ userId: convertToValidUserId(connectorAccount) }],
          index: Math.floor(Math.random() * 10000000),
          uniqueId,
        })
      }
    } catch (e) {
      console.error('error during initializeFunAccount', e)
    }
  }, [connectorAccount, auth, funWallet])

  useEffect(() => {
    void initializeSingleAuthFunAccount()
  }, [auth, connectorAccount])

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
        {/* <div>connector address</div>
        <div>{shortAddress(connectorAccount)}</div> */}

        <div>Address:</div>
        <div>{account}</div>
      </div>

      {active && account && (
        <div style={{}}>
          <div>Wallet Balances</div>
          <WalletBalances {...walletBalancesProps} />
        </div>
      )}
      {!active && <div>Metamask is not connected. Please connect to Metamask to continue with FunWallet.</div>}
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
