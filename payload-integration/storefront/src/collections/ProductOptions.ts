import { CollectionConfig } from 'payload'

export const ProductOptions: CollectionConfig = {
  slug: 'product-options',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      label: 'Medusa Option ID',
      required: true,
      unique: true,
      admin: {
        description: 'The unique identifier from Medusa',
        hidden: true,
      },
      access: {
        update: ({ req }) => !!req.query.is_from_medusa,
      }
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      admin: {
        description: 'The option title (e.g., Size, Color)',
      },
    },
    {
      name: 'values',
      type: 'relationship',
      relationTo: 'option-values' as any,
      hasMany: true,
      required: false,
      admin: {
        description: 'Option values (e.g., Small, Medium, Large)',
      },
    },
  ],
  access: {
    create: ({ req }) => !!req.query.is_from_medusa,
    delete: ({ req }) => !!req.query.is_from_medusa,
  }
}

