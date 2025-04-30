# Medusa v2 Example: Algolia Integration

This directory holds the code for the [Localization with Contentful Tutorial](https://docs.medusajs.com/resources/integrations/guides/contentful).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Contentful](https://www.contentful.com/) account with tokens for Management and Delivery APIs, space ID, and optionally a webhook secret.

## Installation

1. Clone the repository and change to the `localization-contentful` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/localization-contentful
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Contentful environment variables:

```bash
CONTENTFUL_MANAGEMNT_ACCESS_TOKEN=
CONTENTFUL_DELIVERY_TOKEN=
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_WEBHOOK_SECRET= #optional
```

Where:

- `CONTENTFUL_MANAGEMNT_ACCESS_TOKEN` is the token for the Management API.
- `CONTENTFUL_DELIVERY_TOKEN` is the token for the Delivery API.
- `CONTENTFUL_SPACE_ID` is the ID of the Contentful space.
- `CONTENTFUL_ENVIRONMENT` is the environment to use, which is `master` typically.
- `CONTENTFUL_WEBHOOK_SECRET` is the secret used to verify webhooks. This is optional.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/contentful#add-environment-variables)

5\. If the default locale in your Contentful space is different than `en-US`, change it in `medusa-config.ts`.

6\. Install dependencies:

```bash
yarn # or npm install
```

7\. Setup and seed the database:

```bash
npx medusa db:setup
yarn seed # or npm run seed
```

8\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

To test it out, go to the [Test it Out](#test-it-out) section.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api`
- `src/modules/contentful`
- `src/subscribers`
- `src/workflows`

Then, add the Contentful Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/contentful",
      options: {
        management_access_token: process.env.CONTENTFUL_MANAGEMNT_ACCESS_TOKEN,
        delivery_token: process.env.CONTENTFUL_DELIVERY_TOKEN,
        space_id: process.env.CONTENTFUL_SPACE_ID,
        environment: process.env.CONTENTFUL_ENVIRONMENT,
        default_locale: "en-US", // change if that's not the default locale
        webhook_secret: process.env.CONTENTFUL_WEBHOOK_SECRET,
      }
    }
  ],
})
```

Next, add the following environment variables:

```bash
CONTENTFUL_MANAGEMNT_ACCESS_TOKEN=
CONTENTFUL_DELIVERY_TOKEN=
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_WEBHOOK_SECRET= #optional
```

Where:

- `CONTENTFUL_MANAGEMNT_ACCESS_TOKEN` is the token for the Management API.
- `CONTENTFUL_DELIVERY_TOKEN` is the token for the Delivery API.
- `CONTENTFUL_SPACE_ID` is the ID of the Contentful space.
- `CONTENTFUL_ENVIRONMENT` is the environment to use, which is `master` typically.
- `CONTENTFUL_WEBHOOK_SECRET` is the secret used to verify webhooks. This is optional.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/contentful#add-environment-variables)

After that, install the necessary Contentful packages:

```bash
yarn add @contentful/node-apps-toolkit contentful contentful-management # or npm install @contentful/node-apps-toolkit contentful contentful-management
```

> This guide was implemented with `@contentful/node-apps-toolkit@^3.13.0`, `contentful@^11.5.13`, and `contentful-management@^11.52.1`.

## Test it Out

You can validate that everything is working successfully by running the Medusa application:

```bash
yarn dev # or npm run dev
```

Then, go to `localhost:9000/app` and log in. If you don't have user credentials, create them with the [CLI tool](https://docs.medusajs.com/resources/medusa-cli/commands/user).

After you log in, you'll find a "Contentful" sidebar item in the admin. You can click on it, then click the button in the page to sync products into Contentful.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1744790451/OpenApi/Contentful_jysc07.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
