import { configureNewFunStore, MetamaskConnector, Goerli } from '@funkit/react'

const FUN_WALLET_CONFIG = {
  apiKey: 'oh42D6bae967fwsTJBrqgfFZbTcCqvo8ljL1yGdc',
  chain: Goerli,
  gasSponsor: {
    sponsorAddress: '0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad' as `0x${string}`,
  },
}

const DEFAULT_CONNECTORS = [MetamaskConnector()]

void configureNewFunStore({
  config: FUN_WALLET_CONFIG,
  connectors: DEFAULT_CONNECTORS,
})
