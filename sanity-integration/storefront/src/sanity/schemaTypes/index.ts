import { SchemaPluginOptions } from 'sanity'
import productSchema from './documents/product'

export const schema: SchemaPluginOptions = {
  types: [productSchema],
  templates: (templates) => templates.filter(
    (template) => template.schemaType !== "product"
  ),
}
