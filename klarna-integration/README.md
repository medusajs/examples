# Medusa v2 Example: Klarna Payment Integration

This directory holds the code for the [Klarna Payment Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/klarna).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Klarna](https://www.klarna.com/) merchant or [playground](https://portal.playground.klarna.com/) account.

## Installation

1. Clone the repository and change to the `klarna-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/klarna-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Klarna environment variables:

```bash
KLARNA_USERNAME=
KLARNA_PASSWORD=
KLARNA_BASE_URL=
KLARNA_AUTHORIZATION_CALLBACK=
```

Where:

- `KLARNA_USERNAME` and `KLARNA_PASSWORD` are the Klarna API credentials
- `KLARNA_BASE_URL` is the [Klarna API URL](https://docs.klarna.com/api/api-urls/)
- `KLARNA_AUTHORIZATION_CALLBACK` is the webhook endpoint that Klarna will call on successful authentication. It's of the format `{public_url}/hooks/payment/klarna_klarna`.
  - In development, you can use tools like [ngrok](https://ngrok.com/) to get a public URL.
  - In production, replace `{public_url}` with the URL of the deployed Medusa server.
- You can optionally enable the `KLARNA_AUTO_CAPTURE` to automatically capture payments when the order is placed.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/klarna#p-add-environment-variables)

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

Refer to the [Next Steps](#next-steps) on what you should do after integrating Klarna.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the `src/modules/klarna` directory to your application.

Then, add the Klarna Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/klarna",
            id: "klarna",
            options: {
              baseUrl: process.env.KLARNA_BASE_URL,
              username: process.env.KLARNA_USERNAME,
              password: process.env.KLARNA_PASSWORD,
              auto_capture: process.env.KLARNA_AUTO_CAPTURE === "true",
              merchant_urls: {
                authorization: process.env.KLARNA_AUTHORIZATION_CALLBACK,
                push: process.env.KLARNA_AUTHORIZATION_CALLBACK,
                notification: process.env.KLARNA_AUTHORIZATION_CALLBACK,
              },
            }
          }
        ]
      }
    }
  ]
})
```

Next, add the following environment variables:

```bash
KLARNA_USERNAME=
KLARNA_PASSWORD=
KLARNA_BASE_URL=
KLARNA_AUTHORIZATION_CALLBACK=
```

Where:

- `KLARNA_USERNAME` and `KLARNA_PASSWORD` are the Klarna API credentials
- `KLARNA_BASE_URL` is the [Klarna API URL](https://docs.klarna.com/api/api-urls/)
- `KLARNA_AUTHORIZATION_CALLBACK` is the webhook endpoint that Klarna will call on successful authentication. It's of the format `{public_url}/hooks/payment/klarna_klarna`.
  - In development, you can use tools like [ngrok](https://ngrok.com/) to get a public URL.
  - In production, replace `{public_url}` with the URL of the deployed Medusa server.
- You can optionally enable the `KLARNA_AUTO_CAPTURE` to automatically capture payments when the order is placed.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/klarna#p-add-environment-variables)

## Next Steps

- Make sure to enable Klarna as a payment provider in a region using the [Medusa Admin dashboard](https://docs.medusajs.com/user-guide/settings/regions#edit-region-details).
- Customize the [Next.js Starter Storefront](https://docs.medusajs.com/resources/nextjs-starter) as explained in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/klarna#step-4-customize-nextjs-storefront-for-klarna) to support Klarna payments

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Klarna Documentation](https://docs.klarna.com)
