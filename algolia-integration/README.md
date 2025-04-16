# Medusa v2 Example: Algolia Integration

This directory holds the code for the [Algolia Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/algolia).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Algolia](https://www.algolia.com/) account with an application, index, and API key.

## Installation

1. Clone the repository and change to the `algolia-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/algolia-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Algolia environment variables:

```bash
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_PRODUCT_INDEX_NAME=
```

Where:

- `ALGOLIA_APP_ID` is the ID of an Algolia application.
- `ALGOLIA_API_KEY` is the Algolia Admin API key.
- `ALGOLIA_PRODUCT_INDEX_NAME` is the name of the index in Algolia.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/algolia#add-environment-variables)

5\. Install dependencies:

```bash
yarn # or npm install
```

6\. Setup and seed the database:

```bash
npx medusa db:setup
yarn seed # or npm run seed
```

7\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

You'll find an "Algolia" page in the Medusa Admin's Settings sidebar.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api`
- `src/modules/algolia`
- `src/subscribers`
- `src/workflows`

Then, add the Algolia Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_API_KEY!,
        productIndexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
      }
    }
  ],
})
```

Next, add the following environment variables:

```bash
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_PRODUCT_INDEX_NAME=
```

Where:

- `ALGOLIA_APP_ID` is the ID of an Algolia application.
- `ALGOLIA_API_KEY` is the Algolia Admin API key.
- `ALGOLIA_PRODUCT_INDEX_NAME` is the name of the index in Algolia.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/algolia#add-environment-variables)

After that, install the `algoliasearch` package:

```bash
yarn add algoliasearch # or npm install algoliasearch
```

> This guide was implemented with `algoliasearch@^5.21.0`.

Finally, run migrations:

```bash
npx medusa db:migrate
```

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1742829748/OpenApi/Algolia-Search_t1zlkd.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
