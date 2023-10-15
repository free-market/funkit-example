import React, { useState } from 'react'
import { AnimatedNumber, AssetAmountView, AssetAmountsView, AssetView } from '@freemarket/args-ui-react'
import { type AssetAmount, type AssetReference } from '@freemarket/client-sdk'
import { useEffectOnce } from '../useEffectOnce'
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkflowAssetsProps {}

export default function WorkflowAssets(props: WorkflowAssetsProps) {
  const assetRefNative: AssetReference = {
    type: 'native',
  }
  const assetRefToken: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }

  const assetBalances: AssetAmount[] = [
    {
      asset: assetRefNative,
      amount: '1100000000000000000',
    },
    {
      asset: assetRefToken,
      amount: '10000000',
    },
  ]

  return (
    <div>
      <div>Workflow Assets</div>
      {/* <AssetView assetRef={assetRefNative} chain={'arbitrum'} /> */}
      {/* <AssetView assetRef={assetRefToken} chain={'arbitrum'} /> */}
      {/* <AssetAmountView assetRef={assetRefToken} chain={'arbitrum'} amount={'1200000000000000000'} /> */}
      <AssetAmountsView assetAmounts={assetBalances} chain={'arbitrum'} fungibleTokens={[]} />
      <AnimatedNumber value={20} />
      <AnimatedNumber value={40} />
    </div>
  )
}
