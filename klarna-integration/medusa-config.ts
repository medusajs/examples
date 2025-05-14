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
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/klarna",
            id: "klarna",
            options: {
              baseUrl: process.env.KLARNA_BASE_URL,
              username: process.env.KLARNA_USERNAME,
              password: process.env.KLARNA_PASSWORD,
              auto_capture: process.env.KLARNA_AUTO_CAPTURE === "true",
              merchant_urls: {
                authorization: process.env.KLARNA_AUTHORIZATION_CALLBACK,
                push: process.env.KLARNA_AUTHORIZATION_CALLBACK,
                notification: process.env.KLARNA_AUTHORIZATION_CALLBACK,
              },
            }
          }
        ]
      }
    }
  ]
})
