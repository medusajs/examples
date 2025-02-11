export type MagentoCategory = {
  id: number
  name: string
  parent_id: number | null
  is_active: boolean
  position: number
  level: number
  children_data?: MagentoCategory[]
}

export type MagentoProduct = {
  id: number
  sku: string
  name: string
  price: number
  status: number
  // not handling other types
  type_id: "simple" | "configurable"
  created_at: string
  updated_at: string
  extension_attributes: {
    category_links: {
      category_id: string
    }[]
    configurable_product_links?: number[] 
    configurable_product_options?: {
      id: number
      attribute_id: string
      label: string
      position: number
      values: {
        value_index: number
      }[]
    }[]
  }
  media_gallery_entries: {
    id: number
    media_type: string
    label: string
    position: number
    disabled: boolean
    types: string[]
    file: string
  }[]
  custom_attributes: {
    attribute_code: string
    value: string
  }[]
  // added by module
  children?: MagentoProduct[]
}

export type MagentoAttribute = {
  attribute_code: string
  attribute_id: number
  default_frontend_label: string
  options: {
    label: string
    value: string
  }[]
}

export type MagentoPagination = {
  search_criteria: {
    filter_groups: [],
    page_size: number
    current_page: number
  }
  total_count: number
}

export type MagentoPaginatedResponse<TData> = {
  items: TData[]
} & MagentoPagination