# Medusa v2 Example: ShipStation Integration

This directory holds the code for the [ShipStation Integration Guide](https://docs.medusajs.com/resources/integrations/guides/shipstation).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [ShipStation account](https://www.shipstation.com/start-a-free-trial) with enabled carriers and activated shipping API, as explained [here](https://docs.medusajs.com/resources/integrations/guides/shipstation#step-2-prepare-shipstation-account).

## Installation

1. Clone the repository and change to the `shipstation-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/shipstation-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the following environment variables:

```bash
SHIPSTATION_API_KEY=
```

Where `SHIPSTATION_API_KEY` is the API key of your ShipStation account, retrieved as explained [here](https://docs.medusajs.com/resources/integrations/guides/shipstation#add-module-to-configurations).

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

If you have an existing Medusa application, copy the `src/modules/shipstation` directory into your application.

Then, add the ShipStation Integration to `medusa-config.ts` as part of the Fulfillment Module's options:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/shipstation",
            id: "shipstation",
            options: {
              api_key: process.env.SHIPSTATION_API_KEY,
            },
          },
        ],
      },
    },
  ],
})
```

Make sure to add the following environment variable:

```bash
SHIPSTATION_API_KEY=
```

Where `SHIPSTATION_API_KEY` is the API key of your ShipStation account, retrieved as explained [here](https://docs.medusajs.com/resources/integrations/guides/shipstation#add-module-to-configurations).

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [ShipStation API Documentation](https://docs.shipstation.com/getting-started)
