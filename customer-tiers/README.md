# Medusa v2 Example: Customer Tiers

This directory holds the code for the [Customer Tiers Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/customer-tiers).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `customer-tiers` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/customer-tiers
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

You'll find a "Customer Tiers" item in the sidebar of the Medusa Admin where you can manage the customer tiers.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api`
- `src/links`
- `src/modules/tier`
- `src/subscribers`
- `src/workflows`

Then, add the Tier Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/tier",
    }
  ],
})
```

After that, install the Index Module

```bash
yarn add @medusajs/index # or npm install @medusajs/index
```

And add it to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/index",
    }
  ],
})
```

Finally, run migrations:

```bash
npx medusa db:migrate
```

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1764080003/OpenApi/openapi_bzizgg.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
