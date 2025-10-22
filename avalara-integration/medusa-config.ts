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
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "./src/modules/avalara",
            id: "avalara",
            options: {
              username: process.env.AVALARA_USERNAME,
              password: process.env.AVALARA_PASSWORD,
              appName: process.env.AVALARA_APP_NAME,
              appVersion: process.env.AVALARA_APP_VERSION,
              appEnvironment: process.env.AVALARA_APP_ENVIRONMENT,
              machineName: process.env.AVALARA_MACHINE_NAME,
              timeout: process.env.AVALARA_TIMEOUT,
              companyCode: process.env.AVALARA_COMPANY_CODE,
              companyId: process.env.AVALARA_COMPANY_ID,
            },
          },
        ],
      },
    },
  ],
})
