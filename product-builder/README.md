# Medusa v2 Example: Product Builder

This directory holds the code for the [Product Builder Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/product-builder).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `product-builder` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/product-builder
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

You can manage the builder configurations of a product in the Medusa Admin by going to the product's details page.

Refer to the [More Resources](#more-resources) for OpenAPI Specs of custom API routes.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api/admin`
- `src/api/store`
- `src/api/middlewares.ts`
- `src/links`
- `src/modules/product-builder`
- `src/workflows`

Then, add the Product Builder Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/product-builder",
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

You can manage the builder configurations of a product in the Medusa Admin by going to the product's details page.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1755010179/OpenApi/Product-Builder_wvhqtq.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
