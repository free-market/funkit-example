import React from 'react'
import { useMetaMask } from 'metamask-react'
import { assetRefs } from './assetRefs'
import { WalletBalances } from '@freemarket/react'
import { type WalletBalancesProps } from '@freemarket/react/build/asset/WalletBalances'
import { getChainDisplayName } from './lib/getChainDisplayName'
import { useDemoAppStore } from './store'

interface Props {
  style?: React.CSSProperties
}

export default function MetaMaskUI({ style }: Props) {
  const { workflowInvocationCount } = useDemoAppStore(state => ({
    workflowInvocationCount: state.workflowInvocationCount,
  }))

  const { status, connect, account, chainId, ethereum } = useMetaMask()

  if (status === 'initializing') {
    return <div style={style}></div>
  }

  if (status === 'unavailable') {
    return <div style={style}>MetaMask is not available</div>
  }

  if (status === 'notConnected') {
    return (
      <button
        style={style}
        onClick={() => {
          void connect()
        }}
      >
        Connect to MetaMask
      </button>
    )
  }
  if (status === 'connecting') {
    return <div style={style}>Connecting...</div>
  }

  if (status === 'connected') {
    const walletBalancesProps: WalletBalancesProps = {
      stdProvider: ethereum,
      address: account ?? '',
      assetRefs,
      fungibleTokens: [],
      refreshToken: workflowInvocationCount,
    }

    return (
      <div style={style}>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content', gridColumnGap: 10 }}>
          <div>Connected:</div>
          <div>{getChainDisplayName(chainId)}</div>
          <div>Address:</div>
          <div>{account}</div>
        </div>
        {account && (
          <div style={{}}>
            <WalletBalances {...walletBalancesProps} />
          </div>
        )}
      </div>
    )
  }
  return null
}
