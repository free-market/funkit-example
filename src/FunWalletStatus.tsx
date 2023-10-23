import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
  usePrimaryAuth,
} from '@funkit/react'
import { shortAddress } from './lib/utils'
import { useEffectOnce } from './useEffectOnce'
import { WalletBalances } from '@freemarket/react'
import { type AssetReference } from '@freemarket/client-sdk'
import { type WalletBalancesProps } from '@freemarket/react/build/asset/WalletBalances'
import { useMetaMask } from 'metamask-react'
import { assetRefs } from './assetRefs'
import { useDemoAppStore } from './store'

// const FUN_WALLET_CONFIG = {
//   apiKey: 'oh42D6bae967fwsTJBrqgfFZbTcCqvo8ljL1yGdc',
//   chain: Goerli,
//   gasSponsor: {
//     sponsorAddress: '0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad' as `0x${string}`, // Gasless payments on Goerli. Please switch to another gas sponsor method, or prefund your wallet on mainnet!
//   },
// }

// const DEFAULT_CONNECTORS = [MetamaskConnector()]

// void configureNewFunStore({
//   config: FUN_WALLET_CONFIG,
//   connectors: DEFAULT_CONNECTORS,
// })

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
      // console.log('initializeFunAccount', initWalletMutex.current)
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
        {/* <div>connector address</div>
        <div>{shortAddress(connectorAccount)}</div> */}

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
