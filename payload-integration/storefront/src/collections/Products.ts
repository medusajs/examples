import { CollectionConfig } from 'payload'
import { payloadMedusaSdk } from '../lib/payload-sdk';
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'medusa_id',
      type: 'text',
      label: 'Medusa Product ID',
      required: true,
      unique: true,
      admin: {
        description: 'The unique identifier from Medusa',
        hidden: true, // Hide this field in the admin UI
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
        description: 'The product title',
      },
    },
    {
      name: 'handle',
      type: 'text',
      label: 'Handle',
      required: true,
      admin: {
        description: 'URL-friendly unique identifier',
      },
      validate: (value: any) => {
        // validate URL-friendly handle
        if (typeof value !== 'string') {
          return 'Handle must be a string';
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Handle must be URL-friendly (lowercase letters, numbers, and hyphens only)';
        }
        return true;
      }
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      required: false,
      admin: {
        description: 'Product subtitle',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      required: false,
      admin: {
        description: 'Detailed product description',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media' as any,
      label: 'Thumbnail',
      required: false,
      admin: {
        description: 'Product thumbnail image',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product Images',
      required: false,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any,
          required: true,
        },
      ],
      admin: {
        description: 'Gallery of product images',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'meta_title',
          type: 'text',
          label: 'Meta Title',
          required: false,
        },
        {
          name: 'meta_description',
          type: 'textarea',
          label: 'Meta Description',
          required: false,
        },
        {
          name: 'meta_keywords',
          type: 'text',
          label: 'Meta Keywords',
          required: false,
        },
      ],
      admin: {
        description: 'SEO-related fields for better search visibility',
      },
    },
    {
      name: "options",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Option Title",
          required: true,
        },
        {
          name: "medusa_id",
          type: "text",
          label: "Medusa Option ID",
          required: true,
          admin: {
            description: 'The unique identifier for the option from Medusa',
            hidden: true, // Hide this field in the admin UI
          },
          access: {
            update: ({ req }) => !!req.query.is_from_medusa,
          }
        }
      ],
      validate: (value: any, { req, previousValue }) => {
        if (req.query.is_from_medusa) {
          return true; // Skip validation if the request is from Medusa
        }
        
        if (!Array.isArray(value)) {
          return 'Options must be an array';
        }

        const optionsChanged = value.length !== previousValue?.length || value.some((option) => {
          return !option.medusa_id || !previousValue?.some(
            (prevOption) => (prevOption as any).medusa_id === option.medusa_id
          );
        })

        return !optionsChanged || "Options cannot be changed in number"; // Prevent update if the number of options is changed
      },
    },
    {
      name: "variants",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Variant Title",
          required: true,
        },
        {
          name: "medusa_id",
          type: "text",
          label: "Medusa Variant ID",
          required: true,
          admin: {
            description: 'The unique identifier for the variant from Medusa',
            hidden: true, // Hide this field in the admin UI
          },
          access: {
            update: ({ req }) => !!req.query.is_from_medusa,
          }
        },
        {
          name: "option_values",
          type: "array",
          fields: [
            {
              name: "medusa_id",
              type: "text",
              label: "Medusa Option Value ID",
              required: true,
              admin: {
                description: 'The unique identifier for the option value from Medusa',
                hidden: true, // Hide this field in the admin UI
              },
              access: {
                update: ({ req }) => !!req.query.is_from_medusa,
              }
            },
            {
              name: "medusa_option_id",
              type: "text",
              label: "Medusa Option ID",
              required: true,
              admin: {
                description: 'The unique identifier for the option from Medusa',
                hidden: true, // Hide this field in the admin UI
              },
              access: {
                update: ({ req }) => !!req.query.is_from_medusa,
              }
            },
            {
              name: "value",
              type: "text",
              label: "Value",
              required: true,
            }
          ]
        }
      ],
      validate: (value: any, { req, previousValue }) => {
        if (req.query.is_from_medusa) {
          return true; // Skip validation if the request is from Medusa
        }

        if (!Array.isArray(value)) {
          return 'Variants must be an array';
        }

        const changedVariants = value.length !== previousValue?.length || value.some((variant: any) => {
          return !variant.medusa_id || !previousValue?.some(
            (prevVariant: any) => prevVariant.medusa_id === variant.medusa_id
          );
        });

        if (changedVariants) {
          // Prevent update if the number of variants is changed
          return "Variants cannot be changed in number";
        }
        
        const changedOptionValues = value.some((variant: any) => {
          if (!Array.isArray(variant.option_values)) {
            return true; // Invalid structure
          }

          const previousVariant = previousValue?.find(
            (v: any) => v.medusa_id === variant.medusa_id
          ) as Record<string, any> | undefined;

          return variant.option_values.length !== previousVariant?.option_values.length || 
            variant.option_values.some((optionValue: any) => {
              return !optionValue.medusa_id || !previousVariant?.option_values.some(
                (prevOptionValue: any) => prevOptionValue.medusa_id === optionValue.medusa_id
              );
            });
        });

        return !changedOptionValues || "Option values cannot be changed in number";
      },
    }
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (typeof data.description === "string") {
          data.description = convertMarkdownToLexical({
            editorConfig: await editorConfigFactory.default({
              config: req.payload.config
            }),
            markdown: data.description,
          })
        }

        return data
      }
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "update" || req.query.is_from_medusa) {
          return;
        }

        const optionValuesMap: Record<string, string[]> = {};
        doc.options.forEach((option: any) => {
          if (!optionValuesMap[option.title]) {
            optionValuesMap[option.title] = [];
          }

          doc.variants.forEach((variant: any) => {
            const optionValue = variant.option_values.find((ov: any) => ov.medusa_option_id === option.medusa_id);
            if (optionValue) {
              optionValuesMap[option.title].push(optionValue.value);
            }
          });
        });

        const variantOptions: Record<string, Record<string, string>> = {}

        doc.variants.forEach((variant: any) => {
          variantOptions[variant.medusa_id] = {};
          variant.option_values.forEach((ov: any) => {
            const optionTitle = doc.options.find((o: any) => o.medusa_id === ov.medusa_option_id)?.title;
            if (optionTitle) {
              variantOptions[variant.medusa_id][optionTitle] = ov.value;
            }
          });
        });

        await payloadMedusaSdk.admin.product.update(doc.medusa_id, {
          title: doc.title,
          handle: doc.handle,
          subtitle: doc.subtitle,
          description: convertLexicalToMarkdown({
            data: doc.description,
            editorConfig: await editorConfigFactory.default({
              config: req.payload.config
            }),
          }),
          options: doc.options.map((options: any) => ({
            title: options.title,
            values: optionValuesMap[options.title] || [],
          })),
          variants: doc.variants.map((variant: any) => ({
            id: variant.medusa_id,
            title: variant.title,
            options: variantOptions[variant.medusa_id] || {},
          }))
        })

        return doc
      }
    ]
  },
  access: {
    create: ({ req }) => !!req.query.is_from_medusa,
    delete: ({ req }) => !!req.query.is_from_medusa,
  }
}
