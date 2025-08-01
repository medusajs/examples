# Medusa v2 Example: Invoice Generator

This directory holds the code for the [Generate Invoices Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/invoice-generator).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `invoice-generator` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/invoice-generator
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

1. `src/admin`
2. `src/api`
3. `src/modules/invoice-generator`
4. `src/subscribers`
5. `src/workflows`

Then, add the module to your `medusa-config.ts` file:

```typescript
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  modules: [
    {
      resolve: "./src/modules/invoice-generator",
    },
  ],
})
```

## Features

- **Automatic Invoice Generation**: PDF invoices are automatically generated when orders are placed
- **Email Delivery**: Invoices are automatically emailed to customers (If a [Notification Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/notification#what-is-a-notification-module-provider) is installed for emails).
- **Admin Dashboard**: Manage invoice configurations, and download invoices.
- **Store Customizations**: API routes to download invoices from the storefront.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1753801608/OpenApi/Invoice-Generator_wtft9v.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.