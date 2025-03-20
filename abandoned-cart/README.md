# Medusa v2 Example: Abandoned Cart

This directory holds the code for the [Abandoned Cart Guide](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/abandoned-cart).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [SendGrid account](https://sendgrid.com) or other equivalent notification service.

## Installation

1. Clone the repository and change to the `product-review` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/product-review
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

6\. Set SendGrid environment variables (or the whichever Notification Provider you'll use):

```bash
SENDGRID_API_KEY=
SENDGRID_FROM=
ABANDONED_CART_TEMPLATE_ID=
```

7\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

Once a day, the abandoned-cart scheduled job will run to send the notifications for the abandoned cart. You can also update the scheduled in the job at `src/jobs/abandoned-cart.ts` to test it out every minute.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/scheduled-jobs`
- `src/workflows`

Then, configure the SendGrid Notification Module Provider (or whichever Notification Module Provider you're using) in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-sendgrid",
            options: {
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
              channels: ["email"],
            },
          },
        ],
      },
    },
  ],
})
```

Finally, start the Medusa application:

```bash
yarn dev # or npm run dev
```

Once a day, the abandoned-cart scheduled job will run to send the notifications for the abandoned cart. You can also update the scheduled in the job at `src/jobs/abandoned-cart.ts` to test it out every minute.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
