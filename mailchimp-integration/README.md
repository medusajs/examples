# Medusa v2 Example: Mailchimp Integration

This directory holds the code for the [Mailchimp Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/mailchimp).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Mailchimp](https://mailchimp.com/) account with an API key and an audience list.

## Installation

1. Clone the repository and change to the `mailchimp-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/mailchimp-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Mailchimp environment variables:

```bash
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER=
MAILCHIMP_LIST_ID=
MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE=
MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL=
```

Where:

- `MAILCHIMP_API_KEY` is your Mailchimp API key.
- `MAILCHIMP_SERVER` is your Mailchimp server prefix. For example, `us5`.
- `MAILCHIMP_LIST_ID` is the ID of the audience list.
- `MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE` is an optional variable for the subject line of the products newsletter.
- `MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL` is an optional storefront URL to be used in the products newsletter.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/mailchimp#h-set-environment-variables)

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

You can then use the [/store/newsletter API route](./src/api/store/newsletter/route.ts) to subscribe an email.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api/store`
- `src/api/middlewares.ts`
- `src/modules/mailchimp`
- `src/subscribers`
- `src/workflows`

Then, add the Mailchimp Module Provider to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/mailchimp",
            id: "mailchimp",
            options: {
              channels: ["email"],
              apiKey: process.env.MAILCHIMP_API_KEY!,
              server: process.env.MAILCHIMP_SERVER!,
              listId: process.env.MAILCHIMP_LIST_ID!,
              templates: {
                new_products: {
                  subject_line: process.env.MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE!,
                  storefront_url: process.env.MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL!,
                }
              }
            },
          },
        ],
      },
    },
  ]
})
```

```bash
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER=
MAILCHIMP_LIST_ID=
MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE=
MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL=
```

Where:

- `MAILCHIMP_API_KEY` is your Mailchimp API key.
- `MAILCHIMP_SERVER` is your Mailchimp server prefix. For example, `us5`.
- `MAILCHIMP_LIST_ID` is the ID of the audience list.
- `MAILCHIMP_NEW_PRODUCTS_SUBJECT_LINE` is an optional variable for the subject line of the products newsletter.
- `MAILCHIMP_NEW_PRODUCTS_STOREFRONT_URL` is an optional storefront URL to be used in the products newsletter.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/mailchimp#h-set-environment-variables)

After that, install the Mailchimp SDK:

```bash
yarn add @mailchimp/mailchimp_marketing # or npm install @mailchimp/mailchimp_marketing
yarn add -D @types/mailchimp__mailchimp_marketing # or npm install @types/mailchimp__mailchimp_marketing --save-dev
```

You can then use the [/store/newsletter API route](./src/api/store/newsletter/route.ts) to subscribe an email.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Mailchimp Documentation](https://mailchimp.com/developer/)
