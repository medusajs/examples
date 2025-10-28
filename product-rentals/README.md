# Medusa v2 Example: Product Rentals

This directory holds the code for the [Product Rentals Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/product-rentals).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `product-rentals` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/product-rentals
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

You can manage the product rental configurations from a product's details page on the Medusa Admin. You can also manage rentals in orders on their details page.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api/admin`
- `src/api/store`
- `src/api/middlewares.ts`
- `src/jobs`
- `src/links`
- `src/modules/rentals`
- `src/subscribers`
- `src/utils`
- `src/workflows`

Then, add the Rentals Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/rentals",
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

You can manage the product rental configurations from a product's details page on the Medusa Admin. You can also manage rentals in orders on their details page.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1761669774/OpenApi/product-rentals_z0csl5.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
