# Medusa v2 Example: Avalara Integration

This directory holds the code for the [Avalara Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/avalara).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Avalara](https://www.avalara.com/) sandbox or production account.

## Installation

1. Clone the repository and change to the `avalara-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/avalara-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Avalara environment variables:

```bash
AVALARA_USERNAME=
AVALARA_PASSWORD=
AVALARA_APP_ENVIRONMENT=
AVALARA_COMPANY_ID=
# Optional
AVALARA_APP_NAME=
AVALARA_APP_VERSION=
AVALARA_MACHINE_NAME=
AVALARA_TIMEOUT=
AVALARA_COMPANY_CODE=
```

Where only the following are required:

- `AVALARA_USERNAME` is your Avalara account ID.
- `AVALARA_PASSWORD` is your Avalara license key.
- `AVALARA_APP_ENVIRONMENT` is either `sandbox` or `production`, depending on your Avalara account type.
- `AVALARA_COMPANY_ID` is the company ID to create Avalara items in.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/avalara#g-set-environment-variables)

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

Refer to the [Set Up and Testing](#set-up-and-testing) section for next steps.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/modules/avalara`
- `src/subscribers`
- `src/workflows`

Then, add the Avalara Tax Module Provider to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          // other providers...
          {
            resolve: "./src/modules/avalara",
            id: "avalara",
            options: {
              username: process.env.AVALARA_USERNAME,
              password: process.env.AVALARA_PASSWORD,
              appName: process.env.AVALARA_APP_NAME,
              appVersion: process.env.AVALARA_APP_VERSION,
              appEnvironment: process.env.AVALARA_APP_ENVIRONMENT,
              machineName: process.env.AVALARA_MACHINE_NAME,
              timeout: process.env.AVALARA_TIMEOUT,
              companyCode: process.env.AVALARA_COMPANY_CODE,
              companyId: process.env.AVALARA_COMPANY_ID,
            },
          },
        ],
      },
    },
  ],
})
```

Next, add the following environment variables:

```bash
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_PRODUCT_INDEX_NAME=
```

Where only the following are required:

- `AVALARA_USERNAME` is your Avalara account ID.
- `AVALARA_PASSWORD` is your Avalara license key.
- `AVALARA_APP_ENVIRONMENT` is either `sandbox` or `production`, depending on your Avalara account type.
- `AVALARA_COMPANY_ID` is the company ID to create Avalara items in.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/avalara#i-set-environment-variables)

After that, install the `avatax` package:

```bash
yarn add avatax # or npm install avatax
```

> This guide was implemented with `avatax@^25.9.0`.

## Set Up and Testing

### Set Avalara as Tax Provider of Region

Before you can use Avalara for tax calculation, you must set it as the default provider of regions in your store. To do that:

1. Start the Medusa application with `yarn dev` or `npm run dev`.
2. Go to `http://localhost:9000/admin` and log in to the Medusa Admin dashboard.
3. Go to "Settings" → "Tax Regions."
4. Select the country you want to configure Avalara for. You can repeat these steps for multiple countries.
5. In the first section, click on the three-dots icon at the top right and choose "Edit."
6. In the "Tax Provider" dropdown, select "Avalara (AVALARA)."
7. Click on "Save."

If you proceed through checkout now, the taxes will be calculated when you set the shipping address and method.

### Testing Transaction Creation

When you place an order, a transaction will be created in Avalara, which you can view in your Avalara dashboard.

### Testing Avalara Items Management

This integration is also set up to create and manage items in Avalara for your Medusa product variants.

You can test this by creating a product or a single product variant in Medusa, you can then view the associated item in Avalara by going to Settings -> "What you sell and buy."

You can also update or delete a product variant, and its item in Avalara will be updated or deleted, respectively. If you delete a product, the item of each variant is deleted as well from Avalara.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Avalara Documentation](https://developer.avalara.com/)
