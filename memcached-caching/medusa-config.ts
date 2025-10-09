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
      resolve: "@medusajs/medusa/caching",
      options: {
        in_memory: {
          enable: true
        },
        providers: [
          {
            resolve: "./src/modules/memcached",
            id: "caching-memcached",
            // Optional, makes this the default caching provider
            is_default: true,
            options: {
              serverUrls: process.env.MEMCACHED_SERVERS?.split(',') || 
                ["127.0.0.1:11211"],
              // add other optional options here...
            },
          },
          // other caching providers...
        ],
      }
    }
  ]
})
