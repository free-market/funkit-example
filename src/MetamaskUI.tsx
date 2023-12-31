import { useMetaMask } from 'metamask-react'
import { getChainDisplayName } from '@freemarket/client-sdk'

interface Props {
  style?: React.CSSProperties
}

export default function MetaMaskUI({ style }: Props) {
  const { status, connect, account, chainId } = useMetaMask()

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
    return (
      <div style={style}>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content', gridColumnGap: 10 }}>
          <div>Connected:</div>
          <div>{getChainDisplayName(chainId)}</div>
          <div>Address:</div>
          <div>{account}</div>
        </div>
      </div>
    )
  }
  return null
}
