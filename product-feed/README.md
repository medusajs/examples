# Medusa v2 Example: Product Feed

This directory holds the code for the [Product Feed Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/product-feed).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `product-feed` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/product-feed
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

Then, go to `http://localhost:9000/product-feed`. You'll get an XML feed of your products.

Make sure to set the `admin.storefrontUrl` configuration in `medusa-config.ts` or the `STOREFRONT_URL` environment variable to ensure the product links are correct in the feed.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api/product-feed`
- `src/api/middlewares.ts`
- `src/workflows`

Then, start the Medusa application:

```bash
yarn dev # or npm run dev
```

Next, go to `http://localhost:9000/product-feed`. You'll get an XML feed of your products.

Make sure to set the `admin.storefrontUrl` configuration in `medusa-config.ts` or the `STOREFRONT_URL` environment variable to ensure the product links are correct in the feed.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1756719230/OpenApi/Product_Feed_qdma7g.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
