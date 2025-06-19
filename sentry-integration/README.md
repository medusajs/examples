# Medusa v2 Example: Sentry Integration

This directory holds the code for the [Sentry Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/sentry).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Sentry](https://sentry.io) account with a Node.js project.

## Installation

1. Clone the repository and change to the `sentry-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/sentry-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Sentry environment variable:

```bash
SENTRY_DSN=
```

Where `SENTRY_DSN` is the Data Source Name (DSN) of your Sentry project.

Learn more about retrieving this variable in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/sentry#c-set-up-a-sentry-project)

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

You can test it out by opening the Medusa Admin dashboard or sending a request to the `/test-sentry` API route. Then, check out the Sentry dashboard to see the requests and operations traced.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the `instrumentation.ts` file into your project.

Next, add the following environment variable:

```bash
SENTRY_DSN=
```

Where `SENTRY_DSN` is the Data Source Name (DSN) of your Sentry project.

Learn more about retrieving this variable in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/sentry#c-set-up-a-sentry-project)

After that, install the necessary Sentry an OpenTelemetry packages:

```bash
yarn add @opentelemetry/sdk-node @opentelemetry/resources @opentelemetry/sdk-trace-node @opentelemetry/instrumentation-pg @sentry/node @opentelemetry/api @opentelemetry/exporter-trace-otlp-grpc @sentry/opentelemetry-node
```

You can test it out by opening the Medusa Admin dashboard. Then, check out the Sentry dashboard to see the requests and operations traced.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Sentry Documentation](https://docs.sentry.io/)
