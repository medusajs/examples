# Medusa v2 Example: Migrate Data from Magento to Medusa

This directory holds the code for the [Migrate Magento to Medusa Guide](https://docs.medusajs.com/resources/examples/guides/custom-item-price).

You can either:

- [install and use it as a plugin in the Medusa application](#installation);
- or [copy its source files into an existing Medusa application, without using them as a plugin](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- Magento server with admin credentials.

## Installation

> Learn more about building and developing with plugins in [this documentation](https://docs.medusajs.com/learn/fundamentals/plugins/create).

1. Clone the repository and change to the `migrate-from-magento` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/migrate-from-magento
```

2\. Install dependencies:

```bash
yarn install # or npm install
```

3\. Publish to local registry:

```bash
npx medusa plugin:publish
```

4\. Build plugin:

```bash
npx medusa plugin:build
```

5\. In a Medusa application, install the plugin from the local registry:

```bash
npx medusa plugin:add migrate-from-magento
```

6\. Add the plugin to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "migrate-from-magento",
      options: {
        baseUrl: process.env.MAGENTO_BASE_URL,
        username: process.env.MAGENTO_USERNAME,
        password: process.env.MAGENTO_PASSWORD,
        migrationOptions: {
          imageBaseUrl: process.env.MAGENTO_IMAGE_BASE_URL,
        }
      },
    },
  ],
})
```

7\. Set the following environment variables:

```bash
MAGENTO_BASE_URL=https://magento.example.com
MAGENTO_USERNAME=admin
MAGENTO_PASSWORD=password
MAGENTO_IMAGE_BASE_URL=https://magento.example.com/pub/media/catalog/product
```

Where:

- `MAGENTO_BASE_URL`: The base URL of the Magento server. It can also be a local URL, such as `http://localhost:8080`.
- `MAGENTO_USERNAME`: The username of a Magento admin user to authenticate with the Magento server.
- `MAGENTO_PASSWORD`: The password of the Magento admin user.
- `MAGENTO_IMAGE_BASE_URL`: The base URL to use for product images. Magento stores product images in the `pub/media/catalog/product` directory, so you can reference them directly or use a CDN URL. If the URLs of product images in the Medusa server already have a different base URL, you can omit this option.

## Copy into Existing Medusa Application

You can also copy the source files into an existing Medusa application, which will add them not as a plugin, but as standard Medusa customizations.

1. Copy the content of the following directories:

- `src/admin`
- `src/api/admin` and `src/api/middlewares.ts`
- `src/jobs`
- `src/modules/magento`
- `src/modules/subscribers`
- `src/workflows`

2. Add the Magento Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/magento",
      options: {
        baseUrl: process.env.MAGENTO_BASE_URL,
        username: process.env.MAGENTO_USERNAME,
        password: process.env.MAGENTO_PASSWORD,
        migrationOptions: {
          imageBaseUrl: process.env.MAGENTO_IMAGE_BASE_URL,
        }
      }
    },
  ]
})
```

3. Set the following environment variables:

```bash
MAGENTO_BASE_URL=https://magento.example.com
MAGENTO_USERNAME=admin
MAGENTO_PASSWORD=password
MAGENTO_IMAGE_BASE_URL=https://magento.example.com/pub/media/catalog/product
```

Where:

- `MAGENTO_BASE_URL`: The base URL of the Magento server. It can also be a local URL, such as `http://localhost:8080`.
- `MAGENTO_USERNAME`: The username of a Magento admin user to authenticate with the Magento server.
- `MAGENTO_PASSWORD`: The password of the Magento admin user.
- `MAGENTO_IMAGE_BASE_URL`: The base URL to use for product images. Magento stores product images in the `pub/media/catalog/product` directory, so you can reference them directly or use a CDN URL. If the URLs of product images in the Medusa server already have a different base URL, you can omit this option.

## Test it Out

To test out that the customizations are working, open the Medusa Admin at `http://localhost:9000/app`. You'll find a "Migrate Magento" sidebar item. Click on it, and you can trigger a migration of products and categories.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
