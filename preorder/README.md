# Medusa v2 Example: Pre-Orders

This directory holds the code for the [Pre-Orders Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/preorder).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `preorder` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/preorder
```

2\. Rename the `.env.template` file to `.env`.

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

You can manage the pre-order configurations of variants in their page on the Medusa Admin dashboard. Once you place an order that has a pre-order item, you can view it in the order's page on the Medusa Admin dashboard.

Refer to the [More Resources](#more-resources) for OpenAPI Specs of custom API routes.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api/admin`
- `src/api/store`
- `src/api/middlewares.ts`
- `src/jobs`
- `src/links`
- `src/modules/preorder`
- `src/subscribers`
- `src/workflows`

Then, add the Preorder Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/preorder",
    }
  ],
})
```

After that, run migrations to create the necessary tables:

```bash
npx medusa db:migrate
```

Finally, start the Medusa application:

```bash
yarn dev # or npm run dev
```

You can manage the pre-order configurations of variants in their page on the Medusa Admin dashboard. Once you place an order that has a pre-order item, you can view it in the order's page on the Medusa Admin dashboard.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1746455730/OpenApi/preorder_ddorcq.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.

## Capturing Payment when Fulfilling Order

The automated fulfillment workflow, defined in [src/workflows/fulfill-preorder.ts](./src/workflows/fulfill-preorder.ts), doesn't capture payments by default.

To include payment capturing, uncomment the lines in the file.
