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
      resolve: "./src/modules/contentful",
      options: {
        management_access_token: process.env.CONTENTFUL_MANAGEMNT_ACCESS_TOKEN,
        delivery_token: process.env.CONTENTFUL_DELIVERY_TOKEN,
        space_id: process.env.CONTENTFUL_SPACE_ID,
        environment: process.env.CONTENTFUL_ENVIRONMENT,
        default_locale: "en-US",
        webhook_secret: process.env.CONTENTFUL_WEBHOOK_SECRET,
      }
    }
  ]
})
