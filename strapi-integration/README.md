# Medusa v2 Example: Strapi Integration

This directory holds the code for the [Strapi Integration example](https://docs.medusajs.com/resources/integrations/guides/strapi).

There are two directories:

- `medusa` for the Medusa Application code. You can [install and use it](#installation), or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).
- `strapi` for the Strapi application code. You can [install and use it](#installation-strapi), or [copy its source files into an existing Medusa application](#copy-into-existing-strapi-application).

> Note: This integration was built with Strapi v5.30.1. If you face any issues with newer versions, please open an issue.

## Prerequisites

- [Node.js v20 or v22 (as required by Strapi)](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/docs/getting-started/installation/)

## Strapi

### Installation (Strapi)

To setup and run the Strapi application:

1. Change to the `strapi-integration/strapi` directory.
2. Copy `.env.template` to `.env`.

3\. Install the dependencies:

```bash
yarn install # or npm install
```

4\. Start the Strapi application:

```bash
yarn dev # or npm dev
```

The Strapi admin panel is available at `http://localhost:1337/admin`. If you create products in Medusa, they'll be created in Strapi.

### Copy into Existing Strapi Application

The content types for product and related data are defined in `strapi-integration/strapi/src/api`. So, copy these content types into your Strapi application to ensure a smooth integration with Medusa.

### Setup Webhook

To set up syncing from Strapi to Medusa, after you set up the integration in Medusa, [create a secret API key](https://docs.medusajs.com/user-guide/settings/developer/secret-api-keys) in Medusa. Then, create a webhook in Strapi:

1. Open the Strapi Admin dashboard.
2. Go to Settings -> Webhooks.
3. Click on the "Create new webhook" button at the top right.
4. In the webhook creation form:
   - **Name**: Enter a name for the webhook. For example, "Medusa".
   - **URL**: Enter the URL of the Medusa webhook API route. It should be `http://localhost:9000/webhooks/strapi` if you're running Medusa locally.
   - **Headers**: Add a new header with the key `Authorization` and the value `Bearer YOUR_SECRET_API_KEY`. Replace `YOUR_SECRET_API_KEY` with the API key you created in Medusa.
   - **Events**: Select the "Update" event for "Entry". This ensures that the webhook is triggered whenever an entry is updated in Strapi.
5. Click on the "Save" button to create the webhook.

Whenever you update product in Strapi, it will be updated in Medusa.

## Medusa Application

Strapi must be installed and running before using the integration.

### Installation

1. After cloning the repository, change to the `strapi-integration/medusa` directory:

```bash
cd examples/strapi-integration/medusa
```

2\. Rename the `.env.template` file to `.env`, and set the following environment variables:

```bash
STRAPI_API_TOKEN=
STRAPI_API_URL=http://localhost:1337/api
```

Where:

- `STRAPI_API_TOKEN`: API token from Strapi with privileges to manage product content types and media.
- `STRAPI_API_URL`: Strapi's API URL. Locally it should be `http://localhost:1337/api`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Install dependencies:

```bash
yarn # or npm install
```

5\. Setup and seed the database:

```bash
npx medusa db:setup
yarn seed # or npm run seed
```

6\. Start the Medusa application (while the Strapi server is running):

```bash
yarn dev # or npm run dev
```

Then, try creating a product in Medusa. It will also be created in Strapi.

### Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/strapi`
2. `src/workflows`
3. `src/api`
4. `src/subscribers`
5. `src/links`

Then, add the Strapi Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./modules/strapi",
      options: {
        apiUrl: process.env.STRAPI_API_URL || "http://localhost:1337",
        apiToken: process.env.STRAPI_API_TOKEN || "",
        defaultLocale: process.env.STRAPI_DEFAULT_LOCALE || "en",
      },
    },
  ]
})
```

Set the following environment variables:

```bash
STRAPI_API_TOKEN=
STRAPI_API_URL=
```

You must also enable caching in Medusa. To do that, add the following module and feature flag to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    // ...
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
              // more options...
            },
          },
        ],
      },
    },
  ],
  featureFlags: {
    caching: true,
  }
})
```

Next, while Strapi is running, start the Medusa application:

```bash
yarn dev # or npm run dev
```

Then, try creating a product in Medusa. It will also be created in Strapi.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Strapi Documentation](https://docs.strapi.io/)
