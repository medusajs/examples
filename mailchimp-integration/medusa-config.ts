import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/mailchimp",
            id: "mailchimp",
            options: {
              channels: ["email"],
              apiKey: process.env.MAILCHIMP_API_KEY!,
              server: process.env.MAILCHIMP_SERVER!,
              listId: process.env.MAILCHIMP_LIST_ID!,
              templates: {
                new_products: {
                  subject_line: process.env.MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE!,
                  storefront_url: process.env.MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL!,
                }
              }
            },
          },
        ],
      },
    },
  ]

})
