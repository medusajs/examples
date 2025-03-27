"use client"

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState,
} from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "../lib/sdk"

type RegionContextType = {
  region?: HttpTypes.StoreRegion
  regions: HttpTypes.StoreRegion[]
  setRegion: React.Dispatch<
    React.SetStateAction<HttpTypes.StoreRegion | undefined>
  >
}

const RegionContext = createContext<RegionContextType | null>(null)

type RegionProviderProps = {
  children: React.ReactNode
}

export const RegionProvider = (
  { children }: RegionProviderProps
) => {
  const [regions, setRegions] = useState<
    HttpTypes.StoreRegion[]
  >([])
  const [region, setRegion] = useState<
    HttpTypes.StoreRegion
  >()

  useEffect(() => {
    if (regions.length) {
      return
    }

    sdk.store.region.list()
      .then(({ regions }) => {
        setRegions(regions)
      })
  }, [])

  useEffect(() => {
    if (region) {
      // set its ID in the local storage in
      // case it changed
      localStorage.setItem("region_id", region.id)
      return
    }

    const regionId = localStorage.getItem("region_id")
    if (!regionId) {
      if (regions.length) {
        setRegion(regions[0])
      }
    } else {
      // retrieve selected region
      sdk.store.region.retrieve(regionId)
      .then(({ region: dataRegion }) => {
        setRegion(dataRegion)
      })
    }
  }, [region, regions])

  return (
    <RegionContext.Provider value={{
      region,
      regions,
      setRegion,
    }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)

  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider")
  }

  return context
}