import { CollectionConfig } from 'payload'

export const OptionValues: CollectionConfig = {
  slug: 'option-values',
  admin: {
    useAsTitle: 'value',
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      label: 'Medusa Option Value ID',
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
      name: 'value',
      type: 'text',
      label: 'Value',
      required: true,
      admin: {
        description: 'The option value (e.g., Small, Red)',
      },
    },
    {
      name: 'option',
      type: 'relationship',
      relationTo: 'product-options' as any,
      required: true,
      admin: {
        description: 'The product option this value belongs to',
      },
    },
  ],
  access: {
    create: ({ req }) => !!req.query.is_from_medusa,
    delete: ({ req }) => !!req.query.is_from_medusa,
  }
}

