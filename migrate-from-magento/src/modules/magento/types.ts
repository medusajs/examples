export type MagentoCategory = {
  id: string
  name: string
  parent_id: string | null
  is_active: boolean
  position: number
  level: number
  children_data?: MagentoCategory[]
}
