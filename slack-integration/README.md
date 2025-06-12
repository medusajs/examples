# Medusa v2 Example: Slack Integration

This directory holds the code for the [Slack Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/slack).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Slack](https://www.slack.com/) account with an [application](https://api.slack.com/apps).

## Installation

1. Clone the repository and change to the `slack-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/slack-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Slack environment variables:

```bash
SLACK_WEBHOOK_URL=
SLACK_ADMIN_URL=http://localhost:9000/app
```

Where:

- `SLACK_WEBHOOK_URL` is the webhook URL to send notifications to.
- `SLACK_ADMIN_URL` is the URL prefix of the Medusa Admin. By default, it's `http://localhost:9000/app` in development.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/slack#h-set-options-as-environment-variables)

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

Finally, place an order and a notification will be sent to the configured Slack channel in the Slack app. You can use the [Next.js Starter Storefront](https://docs.medusajs.com/resources/nextjs-starter) to place an order.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/modules/slack`
- `src/subscribers`
- `src/workflows`

Then, add the Slack Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/slack",
            id: "slack",
            options: {
              channels: ["slack"],
              webhook_url: process.env.SLACK_WEBHOOK_URL,
              admin_url: process.env.SLACK_ADMIN_URL,
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
SLACK_WEBHOOK_URL=
SLACK_ADMIN_URL=http://localhost:9000/app
```

Where:

- `SLACK_WEBHOOK_URL` is the webhook URL to send notifications to.
- `SLACK_ADMIN_URL` is the URL prefix of the Medusa Admin. By default, it's `http://localhost:9000/app` in development.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/slack#h-set-options-as-environment-variables)

After that, install the `axios` package:

```bash
yarn add axios # or npm install axios
```

Finally, place an order and a notification will be sent to the configured Slack channel in the Slack app. You can use the [Next.js Starter Storefront](https://docs.medusajs.com/resources/nextjs-starter) to place an order.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Slack Documentation](https://docs.slack.dev/)
