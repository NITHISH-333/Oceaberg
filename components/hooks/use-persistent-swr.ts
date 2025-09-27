"use client"

import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import { useEffect } from "react"

export function usePersistentSWR<Data = any, Error = any>(
  key: any,
  fetcher: any,
  opts?: SWRConfiguration<Data, Error> & { localStorageKey?: string },
): SWRResponse<Data, Error> {
  const storageKey = (opts?.localStorageKey || (Array.isArray(key) ? key[0] : key) || "") as string
  const initial: Partial<SWRConfiguration<Data, Error>> = {}
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        initial.fallbackData = JSON.parse(cached)
      }
    } catch {}
  }
  const swr = useSWR<Data, Error>(key, fetcher, { revalidateOnFocus: true, ...initial, ...opts })
  useEffect(() => {
    if (swr.data !== undefined) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(swr.data))
      } catch {}
    }
  }, [swr.data, storageKey])
  return swr
}
