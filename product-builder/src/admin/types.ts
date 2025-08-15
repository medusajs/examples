export type ProductBuilderBase = {
  id: string
  product_id: string
  created_at: string
  updated_at: string
}

export type CustomFieldBase = {
  id: string
  name: string
  type: "text" | "number"
  description?: string
  is_required: boolean
}

export type ComplementaryProductBase = {
  id: string
  product_id: string
  product?: {
    id: string
    title: string
  }
}

export type AddonProductBase = {
  id: string
  product_id: string
  product?: {
    id: string
    title: string
  }
}

// Product Builder API Response Types
export type ProductBuilderResponse = {
  product_builder: ProductBuilderBase & {
    custom_fields: CustomFieldBase[]
    complementary_products: ComplementaryProductBase[]
    addons: AddonProductBase[]
  }
}

// Form Data Types (for creating/updating)
export type CustomField = {
  id?: string
  name: string
  type: "text" | "number"
  description?: string
  is_required: boolean
}

export type ComplementaryProduct = {
  id?: string
  product_id: string
  product?: {
    id: string
    title: string
  }
}

export type AddonProduct = {
  id?: string
  product_id: string
  product?: {
    id: string
    title: string
  }
}
