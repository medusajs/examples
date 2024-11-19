# Medusa v2 Example: Sanity Integration

This directory holds the code for the [Sanity Integration example](https://docs.medusajs.com/resources/integrations/guides/sanity).

There are two directories:

- `medusa` for the Medusa Application code. You can [install and use it](#installation), or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).
- `storefront` for the Next.js Starter storefront with Sanity integration.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Sanity project](https://www.sanity.io/docs/creating-projects).
- Add `http://localhost:8000` to your Sanity project's CORS options, as explained in [their docs](https://www.sanity.io/docs/cors#5a355ee47b66).

## Medusa Application

### Installation

1. After cloning the repository, change to the `sanity-integration/medusa` directory:

```bash
cd examples/sanity-integration/medusa
```

2\. Rename the `.env.template` file to `.env`, and set the following environment variables:

```bash
SANITY_API_TOKEN= # The API token of the Sanity project.
SANITY_PROJECT_ID= # The ID of the Sanity project.
```

3\. Install dependencies:

```bash
yarn # or npm install
```

4\. Setup and seed the database:

```bash
npx medusa db:setup
yarn seed # or npm run seed
```

5\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

### Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/sanity`
2. `src/workflows`
3. `src/api`
4. `src/admin`
5. `src/subscribers`

Then, add the Sanity Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./modules/sanity",
      options: {
        api_token: process.env.SANITY_API_TOKEN,
        project_id: process.env.SANITY_PROJECT_ID,
        api_version: new Date().toISOString().split("T")[0],
        dataset: "production",
        studio_url: process.env.SANITY_STUDIO_URL || 
          "http://localhost:3000/studio",
        type_map: {
          product: "product",
        },
      },
    },
  ]
})
```

Finally, run the migrations and sync links before starting the Medusa application:

```bash
npx medusa db:migrate
```

## Next.js Storefront

To setup and run the Next.js Storefront:

1. Change to the `sanity-integration/storefront` directory.
2. Copy `.env.template` to `.env.local` and set the following environment variables:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID= # The ID of the Sanity project
NEXT_PUBLIC_SANITY_DATASET= # The dataset of the Sanity project. Commonly, it's `production`.
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY= # A publishable API key in your Medusa application. Learn more: https://docs.medusajs.com/resources/storefront-development/publishable-api-keys
```

3\. Install the dependencies:

```bash
yarn install # or npm install
```

4\. Start the Next.js storefront (while the Medusa application is running):

```bash
yarn dev # or npm dev
```

The Sanity studio is available at `http://localhost:8000/studio`, and the the storefront at `http://localhost:8000`.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Sanity Documentation](https://www.sanity.io/docs/overview-introduction)
