# Medusa v2 Example: Restock Notifications

This directory holds the code for the [Restock Notifications Guide](https://docs.medusajs.com/resources/recipes/commerce-automation/examples/restock-notifications).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- Optional: [Notification Module Provider](https://docs.medusajs.com/resources/architectural-modules/notification) to send email.

## Installation

1. Clone the repository and change to the `restock-notification` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/restock-notification
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

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/api`
2. `src/jobs`
3. `src/links`
4. `src/modules/restock`
5. `src/workflows`

Then, add the Resend Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/restock"
    },
  ]
})
```

Finally, run the migrations and sync links before starting the Medusa application:

```bash
npx medusa db:migrate
```

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)