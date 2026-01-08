# Medusa v2 Example: PayPal Integration

This directory holds the code for the [PayPal Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/paypal).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [PayPal Developer Account](https://developer.paypal.com/dashboard) account with an application.

## Installation

1. Clone the repository and change to the `paypal-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/paypal-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the PayPal environment variables:

```bash
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_AUTO_CAPTURE=
```

Where:

- `PAYPAL_CLIENT_ID` is the client ID of your PayPal application.
- `PAYPAL_CLIENT_SECRET` is the client secret of your PayPal application.
- `PAYPAL_WEBHOOK_ID` is the ID of the webhook you've set up in your PayPal application. This will only work if your application is deployed with a publically accessible URL, or you're using a service like [ngrok](https://ngrok.com/)
- `PAYPAL_AUTO_CAPTURE`: set to `true` if you want payments to be captured immediately when an order is placed. By default, payments are authorized and captured later by an admin user through the Medusa Admin dashboard.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/paypal#f-set-options-as-environment-variables)

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

Then, open the Medusa Admin at `localhost:9000/app` and log in. You must enable the PayPal Payment Module Provider in at least one region to use PayPal during checkout. Learn more in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/paypal#step-3-enable-paypal-module-provider).

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the `src/modules/paypal` directory to your project.

Then, add the PayPal Payment Module Provider to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/paypal",
            id: "paypal",
            options: {
              client_id: process.env.PAYPAL_CLIENT_ID!,
              client_secret: process.env.PAYPAL_CLIENT_SECRET!,
              environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
              autoCapture: process.env.PAYPAL_AUTO_CAPTURE === "true",
              webhook_id: process.env.PAYPAL_WEBHOOK_ID,
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
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_AUTO_CAPTURE=
```

Where:

- `PAYPAL_CLIENT_ID` is the client ID of your PayPal application.
- `PAYPAL_CLIENT_SECRET` is the client secret of your PayPal application.
- `PAYPAL_WEBHOOK_ID` is the ID of the webhook you've set up in your PayPal application. This will only work if your application is deployed with a publically accessible URL, or you're using a service like [ngrok](https://ngrok.com/)
- `PAYPAL_AUTO_CAPTURE`: set to `true` if you want payments to be captured immediately when an order is placed. By default, payments are authorized and captured later by an admin user through the Medusa Admin dashboard.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/paypal#f-set-options-as-environment-variables)

After that, install the `@paypal/paypal-server-sdk` package:

```bash
yarn add @paypal/paypal-server-sdk # or npm install @paypal/paypal-server-sdk
```

> This guide was implemented with `@paypal/paypal-server-sdk@^2.1.0`.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [PayPal Documentation](https://developer.paypal.com)
