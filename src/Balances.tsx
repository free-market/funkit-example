import React, { useCallback, useEffect } from 'react'
import { useMetaMask } from 'metamask-react'
import { type Provider, Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
// import { Memoize } from '@freemarket/client-sdk'
import { Memoize } from './memoize-decorator'

import { type BigNumber } from '@ethersproject/bignumber'
import { formatNumber } from '@freemarket/client-sdk'
const abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

const NATIVE_ASSET_ADDRESS = '0x0'

interface AssetMetadata {
  symbol: string
  decimals: number
}

class AssetUtils {
  address: string
  provider: Provider
  constructor(address: string, provider: Provider) {
    this.address = address
    this.provider = provider
  }

  @Memoize()
  async getMetadata(assetAddress: string): Promise<AssetMetadata> {
    if (assetAddress === NATIVE_ASSET_ADDRESS) {
      return { symbol: 'Native', decimals: 18 }
    }
    const erc20 = this.contract()
    const [symbol, decimals] = await Promise.all([erc20.symbol() as Promise<string>, erc20.decimals() as Promise<BigNumber>])
    return { symbol, decimals: decimals.toNumber() }
  }

  async getBalance(assetAddress: string): Promise<string> {
    const bn = await (assetAddress === NATIVE_ASSET_ADDRESS ? this.getNativeBalance() : this.getErc20Balance(assetAddress))
    return bn.toString()
  }

  async getErc20Balance(erc20Address: string): Promise<string> {
    const bn = await this.contract().balanceOf(erc20Address)
    return bn.toString()
  }

  async getNativeBalance(): Promise<string> {
    const bn = await this.provider.getBalance(this.address)
    return bn.toString()
  }

  private contract() {
    return new Contract(this.address, abi, this.provider)
  }
}

interface AssetBalance {
  assetAddress: string
  balance: string
}

interface Props {
  address: string | null | undefined
  style?: React.CSSProperties
  hideNative?: boolean
  erc20Addresses?: string[]
}

function Balances(props: Props) {
  const { ethereum } = useMetaMask()
  const [balances, setBalances] = React.useState<AssetBalance[]>([])
  const [assetMetadata, setAssetMetadata] = React.useState(new Map<string, AssetMetadata>())
  console.log('props.address', props.address)

  const readBalances = async (ethereum: any, address: string | null | undefined) => {
    if (!ethereum || !address) {
      return
    }

    // set up to read balances
    const web3Provider = new Web3Provider(ethereum)
    const balanceUtils = new AssetUtils(address, web3Provider)
    const assetAddresses: string[] = []
    const assetBalancePromises: Array<Promise<string>> = []

    // collect promises for stuff we need to read
    if (props.hideNative !== true) {
      assetAddresses.push(NATIVE_ASSET_ADDRESS)
      assetBalancePromises.push(balanceUtils.getNativeBalance())
    }
    for (const erc20Address of props.erc20Addresses ?? []) {
      assetAddresses.push(erc20Address)
      assetBalancePromises.push(balanceUtils.getErc20Balance(erc20Address))
    }

    const balances = await Promise.all(assetBalancePromises)
    const newBalances: AssetBalance[] = []
    for (let i = 0; i < assetAddresses.length; i++) {
      console.log('balances[i]', balances[i])
      newBalances.push({ assetAddress: assetAddresses[i], balance: balances[i] })
    }
    setBalances(newBalances)

    // get assetMetadata
    const mapMetadata = new Map<string, AssetMetadata>()
    const metaDataArray = await Promise.all(assetAddresses.map(assetAddress => balanceUtils.getMetadata(assetAddress)))
    for (let i = 0; i < assetAddresses.length; i++) {
      mapMetadata.set(assetAddresses[i], metaDataArray[i])
    }
    setAssetMetadata(mapMetadata)
  }

  useEffect(() => {
    void readBalances(ethereum, props.address)
  }, [ethereum, props.address])

  return (
    <div>
      {balances.map((balance, i) => {
        const metadata = assetMetadata.get(balance.assetAddress)
        const symbol = metadata?.symbol ?? balance.assetAddress
        const decimals = metadata?.decimals ?? 18
        return (
          <div key={i}>
            {symbol}: {formatNumber(balance.balance, decimals, 5)}
          </div>
        )
      })}
    </div>
  )
}

export default Balances
