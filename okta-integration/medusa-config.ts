import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

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
      authMethodsPerActor: {
        user: ["emailpass", "okta"],
        customer: ["emailpass"],
      },
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      dependencies: [
        Modules.CACHE,
        ContainerRegistrationKeys.LOGGER,
      ],
      options: {
        providers: [
          // Default email/password provider
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          // Okta auth provider
          {
            resolve: "./src/modules/okta",
            id: "okta",
            options: {
              oktaDomain: process.env.OKTA_DOMAIN!,
              clientId: process.env.OKTA_CLIENT_ID!,
              clientSecret: process.env.OKTA_CLIENT_SECRET!,
              redirectUri: process.env.OKTA_REDIRECT_URI!,
            },
          },
        ],
      },
    },
  ],
})
