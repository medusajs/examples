# Medusa v2 Example: Segment Integration

This directory holds the code for the [Segment Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/segment).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Segment](https://segment.com/) account with a Node.js source.

## Installation

1. Clone the repository and change to the `segment-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/segment-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Segment environment variable:

```bash
SEGMENT_WRITE_KEY=
```

Where its value is the Write API key of the Node.js source in segment.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/segment#i-set-option-as-environment-variable)

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

You can test the integration out by placing an order or sending a `POST` request to the `/store/products/:id/viewed` API route.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api/store`
- `src/api/middlewares.ts`
- `src/modules/segment`
- `src/subscribers`
- `src/workflows`

Then, add the Segment Module Provider to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "./src/modules/segment",
            id: "segment",
            options: {
              writeKey: process.env.SEGMENT_WRITE_KEY || "",
            },
          },
        ],
      },
    },
  ]
})
```

Next, add the following environment variable:

```bash
SEGMENT_WRITE_KEY=
```

Where its value is the Write API key of the Node.js source in segment.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/segment#i-set-option-as-environment-variable)

After that, install the `@segment/analytics-node` package:

```bash
yarn add @segment/analytics-node # or npm install @segment/analytics-node
```

> This guide was implemented with `@segment/analytics-node@^2.2.1`.

You can test the integration out by placing an order or sending a `POST` request to the `/store/products/:id/viewed` API route.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Segment Documentation](https://segment.com/docs/)
