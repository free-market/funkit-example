import { getChainFromId } from '@freemarket/client-sdk'
import { capitalizeFirstLetter } from './utils'

export function getChainDisplayName(chainId: string | null) {
  if (chainId === null) {
    return ''
  }
  let s = chainId
  if (s.startsWith('0x')) {
    s = s.slice(2)
  }
  const chainNum = parseInt(s, 16)
  const chain = getChainFromId(chainNum)
  return capitalizeFirstLetter(chain)
}
