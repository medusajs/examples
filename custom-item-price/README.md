# Medusa v2 Example: Custom Line Item Price

This directory holds the code for the [Custom Line Item Price Guide](https://docs.medusajs.com/resources/examples/guides/custom-item-price).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [GoldAPI.io Account](https://www.goldapi.io) which is used to retrieve real-time metal prices. You can create a free account.

## Installation

1. Clone the repository and change to the `custom-item-price` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/custom-item-price
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the following environment variables:

```bash
GOLD_API_TOKEN=
```

Where `GOLD_API_TOKEN` is the access token that you can retrieve from your GoldAPI.io dashboard.

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

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api/store`
- `src/api/middlewares.ts`
- `src/modules/metal-prices`
- `src/workflows/steps`
- `src/workflows/add-custom-to-cart.ts`

Then, add the Metal Prices Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/metal-prices",
      options: {
        accessToken: process.env.GOLD_API_TOKEN,
        sandbox: process.env.GOLD_API_SANDBOX === "true"
      }
    }
  ],
})
```

Make sure to add the following environment variable:

```bash
GOLD_API_TOKEN=
```

Where `GOLD_API_TOKEN` is the access token that you can retrieve from your GoldAPI.io dashboard.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1738246728/OpenApi/Custom_Item_Price_gdfnl3.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
