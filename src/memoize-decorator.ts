interface MemoizeArgs {
  expiring?: number
  hashFunction?: boolean | ((...args: any[]) => any)
  tags?: string[]
}

export function Memoize(args?: MemoizeArgs | MemoizeArgs['hashFunction']) {
  let hashFunction: MemoizeArgs['hashFunction']
  let duration: MemoizeArgs['expiring']
  let tags: MemoizeArgs['tags']

  if (typeof args === 'object') {
    hashFunction = args.hashFunction
    duration = args.expiring
    tags = args.tags
  } else {
    hashFunction = args
  }

  return (target: unknown, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    if (descriptor.value != null) {
      descriptor.value = getNewFunction(descriptor.value, hashFunction, duration, tags)
    } else if (descriptor.get != null) {
      descriptor.get = getNewFunction(descriptor.get, hashFunction, duration, tags)
    } else {
      throw new Error('Only put a Memoize() decorator on a method or get accessor.')
    }
  }
}

export function MemoizeExpiring(expiring: number, hashFunction?: MemoizeArgs['hashFunction']) {
  return Memoize({
    expiring,
    hashFunction,
  })
}

const clearCacheTagsMap = new Map<string, Array<Map<any, any>>>()

export function clear(tags: string[]): number {
  const cleared = new Set<Map<any, any>>()
  for (const tag of tags) {
    const maps = clearCacheTagsMap.get(tag)
    if (maps) {
      for (const mp of maps) {
        if (!cleared.has(mp)) {
          mp.clear()
          cleared.add(mp)
        }
      }
    }
  }
  return cleared.size
}

function getNewFunction(
  this: any,
  originalMethod: () => void,
  hashFunction?: MemoizeArgs['hashFunction'],
  duration: number = 0,
  tags?: MemoizeArgs['tags']
) {
  const propMapName = Symbol(`__memoized_map__`)

  // The function returned here gets called instead of originalMethod.
  return function (this: any, ...args: any[]) {
    let returnedValue: any

    // Get or create map
    // eslint-disable-next-line no-prototype-builtins
    if (!this.hasOwnProperty(propMapName)) {
      Object.defineProperty(this, propMapName, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: new Map<any, any>(),
      })
    }
    const myMap: Map<any, any> = this[propMapName]

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (clearCacheTagsMap.has(tag)) {
          clearCacheTagsMap.get(tag)?.push(myMap)
        } else {
          clearCacheTagsMap.set(tag, [myMap])
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (hashFunction || args.length > 0 || duration > 0) {
      let hashKey: any

      // If true is passed as first parameter, will automatically use every argument, passed to string
      if (hashFunction === true) {
        hashKey = args.map(a => a.toString()).join('!')
      } else if (hashFunction) {
        hashKey = hashFunction.apply(this, args)
      } else {
        hashKey = args[0]
      }

      const timestampKey = `${hashKey}__timestamp`
      let isExpired: boolean = false
      if (duration > 0) {
        if (!myMap.has(timestampKey)) {
          // "Expired" since it was never called before
          isExpired = true
        } else {
          const timestamp = myMap.get(timestampKey)
          isExpired = Date.now() - timestamp > duration
        }
      }

      if (myMap.has(hashKey) && !isExpired) {
        returnedValue = myMap.get(hashKey)
      } else {
        returnedValue = originalMethod.apply(this, args as any)
        myMap.set(hashKey, returnedValue)
        if (duration > 0) {
          myMap.set(timestampKey, Date.now())
        }
      }
    } else {
      if (myMap.has(this)) {
        returnedValue = myMap.get(this)
      } else {
        returnedValue = originalMethod.apply(this, args as any)
        myMap.set(this, returnedValue)
      }
    }

    return returnedValue
  }
}
