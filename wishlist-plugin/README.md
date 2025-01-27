# Medusa v2 Example: Wishlist Plugin

This directory holds the code for the [Wishlist Plugin Guide](https://docs.medusajs.com/resources/plugins/guides/wishlist).

You can either:

- [install and use it as a plugin in the Medusa application](#installation);
- or [copy its source files into an existing Medusa application, without using them as a plugin](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. In your Medusa application, run the following command to install the wishlist plugin:

```bash
yarn add medusa-plugin-wishlist # or npm install medusa-plugin-wishlist
```

2. Add the plugin to the `plugins` array in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "medusa-wishlist-plugin",
      options: {}
    }
  ]
})
```

3. Add the following `admin` configuration in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  admin: {
    vite: () => {
      return {
        optimizeDeps: {
          include: ["qs"],
        },
      };
    },
  },
})

```

4. Run the `db:migrate` command to run migrations and sync links:

```bash
npx medusa db:migrate
```

## Copy into Existing Medusa Application

You can also copy the source files into an existing Medusa application, which will add them not as a plugin, but as standard Medusa customizations.

1. Copy the content of the following directories:

- `src/api/store` and `src/api/middlewares.ts`
- `src/link`
- `src/modules/wishlist`
- `src/workflows`

2. Add the Wishlist Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/wishlist"
    },
  ]
})
```

3. Run the `db:migrate` command to run migrations and sync links:

```bash
npx medusa db:migrate
```

## Test it Out

To test out that the plugin is working, you can go to any product page on the Medusa Admin and see a Wishlist section at the top of the page. You can also try importing the [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1737459635/OpenApi/Wishlist_Postman_gjk7mn.yml) and using the API routes added by this plugin.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1737459635/OpenApi/Wishlist_Postman_gjk7mn.yml): Can be imported into tools like Postman to view and send requests to this project's API routes.
