# Medusa v2 Example: Ticket Booking

This directory holds the code for the [Ticket Booking tutorial](https://docs.medusajs.com/resources/recipes/ticket-booking/example).

There are two directories:

- `medusa` for the Medusa Application code. You can [install and use it](#installation), or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).
- `storefront` for the Next.js Starter storefront with Ticket Booking customizations.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Medusa Application

### Installation

1. After cloning the repository, change to the `ticket-booking/medusa` directory:

```bash
cd examples/ticket-booking/medusa
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

In the Medusa Admin, you can create a venue and a ticket product. If you run the Next.js Starter Storefront, you can purchase a ticket and receive an order confirmation email with the generated QR code for the ticket.

### Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/ticket-booking`
2. `src/workflows`
3. `src/api`
4. `src/admin`
5. `src/subscribers`
6. `src/links`

Then, add the Ticket Booking Module to `medusa-config.js`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/ticket-booking",
    },
  ]
})
```

Next, run the database migrations to create the necessary tables for the Ticket Booking Module's data models and for the links:

```bash
npx medusa db:migrate
```

Then, start the Medusa application:

```bash
yarn dev # or npm run dev
```

In the Medusa Admin, you can create a venue and a ticket product. If you run the Next.js Starter Storefront, you can purchase a ticket and receive an order confirmation email with the generated QR code for the ticket.

## Next.js Storefront

To setup and run the Next.js Storefront:

1. Change to the `ticket-booking/storefront` directory.
2. Copy `.env.template` to `.env.local` and set the following environment variable:

```bash
# Your Medusa application's publishable API key. See - https://docs.medusajs.com/resources/storefront-development/publishable-api-keys
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test
```

3\. Install the dependencies:

```bash
yarn install # or npm install
```

4\. Start the Next.js Starter Storefront (while the Medusa application is running):

```bash
yarn dev # or npm dev
```

If you created ticket products in the Medusa application, you can browse them in the storefront, select show dates and seats to purchase, and place an order with your ticket selections.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1757423563/OpenApi/Ticket_Booking_System_iqq1k6.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
