import { loadEnv, defineConfig } from '@medusajs/utils'
import { MARKETPLACE_MODULE } from './src/modules/marketplace'

loadEnv(process.env.NODE_ENV, process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    [MARKETPLACE_MODULE]: {
      resolve: "./modules/marketplace",
      definition: {
        isQueryable: true
      }
    }
  }
})
