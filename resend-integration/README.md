# Medusa v2 Example: Resend Integration

This directory holds the code for the [Resend Integration Guide](https://docs.medusajs.com/resources/integrations/guides/resend).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Resend Account](https://resend.com) with API key.

## Installation

1. Clone the repository and change to the `resend-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/resend-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. Set the following environment variables:

```bash
RESEND_API_KEY= # Resend API key
RESEND_FROM_EMAIL= # Resend from email. Use onboarding@resend.dev if you don't have a verified domain.
```

4\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

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

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/resend`
2. `src/workflows`
3. `src/subscribers`

Then, add the Resend Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
  ]
})
```

Set the following environment variables:

```bash
RESEND_API_KEY= # Resend API key
RESEND_FROM_EMAIL= # Resend from email. Use onboarding@resend.dev if you don't have a verified domain.
```

And install the following dependencies:

```bash
yarn add resend # or npm install resend
yarn add @react-email/components -E # or npm install @react-email/components -E
```

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Resend Documentation](https://resend.com/docs/introduction)
