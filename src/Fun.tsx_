import React, { useEffect } from 'react'
import { FunWalletParams } from '@funkit/core'
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
  Arbitrum,
  usePrimaryAuth,
  GlobalEnvOption,
} from '@funkit/react'
import { useState } from 'react'

//Step 1: Initialize the FunStore. This action configures your environment based on your ApiKey, chain, and the authentication methods of your choosing.
const DEFAULT_FUN_WALLET_CONFIG: GlobalEnvOption = {
  apiKey: 'hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf',
  chain: Arbitrum,
  gasSponsor: {
    sponsorAddress: '0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad', //Gasless payments on Goerli. Please switch to another gas sponsor method, or prefund your wallet on mainnet!
  },
}

const DEFAULT_CONNECTORS = [MetamaskConnector()]

configureNewFunStore({
  config: DEFAULT_FUN_WALLET_CONFIG,
  connectors: DEFAULT_CONNECTORS,
})

//Step 2: Use the connector button to connect your authentication method, in this case metamask.
interface Props {
  index: number
}
const ConnectorButton = ({ index }: Props) => {
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

export default function App() {
  const [receiptTxId, setReceiptTxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [deployed, setDeployed] = useState<boolean | undefined>(undefined)
  const [ethBalance, setEthBalance] = useState(0)

  const { account: connectorAccount, active, connector } = useConnector({ index: 0, autoConnect: true })

  //Step 3: Use the initializeFunAccount method to create your funWallet object
  const { account, initializeFunAccount, funWallet } = useCreateFun()

  //Step 4: Use the auth and funWallet to perform actions (ie: swap, transfer, etc.)
  const [auth] = usePrimaryAuth()

  useEffect(() => {
    if (funWallet) {
      funWallet.getDeploymentStatus().then(deployed => {
        setDeployed(deployed)
      })
      funWallet.getAssets().then(assets => {
        console.log('assets', assets)
      })
    }
  }, [funWallet])

  // useEffect(() => {
  //   if (connector) {
  //     connector.provider?.request
  //   }
  // },[connector])

  const initializeSingleAuthFunAccount = async () => {
    if (!connectorAccount) {
      alert('Metamask not connected. Please follow the steps.')
      return
    }
    const randomNumber = Math.random() * 10000000
    const funWalletParams: FunWalletParams = {
      users: [{ userId: convertToValidUserId(connectorAccount) }],
      uniqueId: randomNumber.toString(),
    }

    initializeFunAccount(funWalletParams).catch()
  }

  const createWallet = async () => {
    if (!funWallet) {
      alert('FunWallet not initialized. Please follow the steps.')
      return
    }

    // Add your custom action code here!
    setLoading(true)
    try {
      const asdf = await funWallet.getDeploymentStatus()
      if (!asdf) {
        const op = await funWallet.create(auth, await auth.getUserId())
        const receipt = await funWallet.executeOperation(auth, op)
        setReceiptTxId(receipt.txId!)
      }
    } finally {
      setLoading(false)
    }

    // FINAL STEP: Add your custom action logic here (swap, transfer, etc)
  }

  function getFunWalletButtonMessage(loading: boolean, receiptTxId: any, deployed: boolean | undefined) {
    if (loading) {
      return <div>Deploying...</div>
    }
    if (deployed === true) {
      return <div>Deployed</div>
    }
    if (receiptTxId) {
      return (
        <div>
          <a href={`https://goerli.etherscan.io/tx/${receiptTxId}`} target="_blank" rel="noreferrer">
            Transaction submitted!
          </a>{' '}
          View wallet on{' '}
          <a href={`https://goerli.etherscan.io/address/${account}`} target="_blank" rel="noreferrer">
            {' '}
            block explorer.{' '}
          </a>
        </div>
      )
    }
    if (deployed === false) {
      return <div>Not deployed</div>
    }
    return <div />
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 200px', columnGap: 20, margin: 20 }}>
        <ConnectorButton key={0} index={0}></ConnectorButton>
        <button onClick={initializeSingleAuthFunAccount}>Initialize FunWallet</button>
        <button onClick={createWallet}>Create FunWallet</button>
        <div>{active ? 'Metamask connected' : 'Metamask not connected'}</div>
        <div>{account && `Address: ${account.slice(0, 6)}....${account.slice(-4)}`}</div>
        {getFunWalletButtonMessage(loading, receiptTxId, deployed)}
      </div>
    </div>
  )
}
