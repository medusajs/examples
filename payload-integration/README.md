# Medusa v2 Example: Payload Integration

This directory holds the code for the [Payload Integration example](https://docs.medusajs.com/resources/integrations/guides/payload).

There are two directories:

- `medusa` for the Medusa Application code. You can [install and use it](#installation), or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).
- `storefront` for the Next.js Starter storefront with Payload integration.

> Note: This integration was built with Payload v3.54.0. If you face any issues with newer versions, please open an issue.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Medusa Application

### Installation

1. After cloning the repository, change to the `payload-integration/medusa` directory:

```bash
cd examples/payload-integration/medusa
```

2\. Rename the `.env.template` file to `.env`, and set the following environment variables:

```bash
PAYLOAD_SERVER_URL=http://localhost:8000
PAYLOAD_API_KEY= # Payload User API key
PAYLOAD_USER_COLLECTION=users
```

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

6\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

Then, start the Next.js Starter Storefront with the `dev` command. Try to create a product in Medusa. The product will be synced to Payload.

### Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/payload`
2. `src/workflows`
3. `src/api`
4. `src/admin`
5. `src/subscribers`
6. `src/links`

Then, add the Payload Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/payload",
      options: {
        serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:8000",
        apiKey: process.env.PAYLOAD_API_KEY,
        userCollection: process.env.PAYLOAD_USER_COLLECTION || "users",
      },
    },
  ]
})
```

Set the following environment variables:

```bash
PAYLOAD_SERVER_URL=http://localhost:8000
PAYLOAD_API_KEY= # Payload User API key
PAYLOAD_USER_COLLECTION=users
```

Then, start the Medusa application:

```bash
yarn dev # or npm run dev
```

Then, start the Next.js Starter Storefront with the `dev` command. Try to create a product in Medusa. The product will be synced to Payload.

## Next.js Storefront

To setup and run the Next.js Storefront:

1. Change to the `payload-integration/storefront` directory.
2. Copy `.env.template` to `.env.local` and set the following environment variables:

```bash
# URL to connect to your Payload PostgreSQL database.
# See – https://payloadcms.com/docs/nextjs/installation#database-connection
PAYLOAD_DATABASE_URL=postgres://postgres:@localhost:5432/payload
# Your Payload secret, used for signing cookies and JWTs.
# See – https://payloadcms.com/docs/nextjs/installation#payload-secret
PAYLOAD_SECRET=supersecret
# See - https://docs.medusajs.com/user-guide/settings/developer/secret-api-keys
MEDUSA_PAYLOAD_API_KEY=
```

3\. Install the dependencies:

```bash
yarn install # or npm install
```

4\. Start the Next.js Starter Storefront (while the Medusa application is running):

```bash
yarn dev # or npm dev
```

The Payload admin panel is available at `http://localhost:8000/admin`. If you create products in Medusa, they'll be created in Payload. If you manage the product details in Payload, they'll be synced to Medusa.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Payload Documentation](https://payloadcms.com/docs/getting-started/what-is-payload)
