export function shortAddress(address: string | undefined | null) {
  if (address === undefined || address === null) {
    return ''
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
