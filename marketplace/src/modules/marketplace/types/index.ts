export type VendorData = {
  id: string
  name: string
  logo?: string
  handle?: string
}

export type CreateVendorData = Omit<VendorData, "id">