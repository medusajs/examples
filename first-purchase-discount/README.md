# Medusa v2 Example: First-Purchase Discount

This directory holds the code for the [First-Purchase Discount Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/first-purchase-discounts).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Algolia](https://www.algolia.com/) account with an application, index, and API key.

## Installation

1. Clone the repository and change to the `first-purchase-discount` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/first-purchase-discount
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

Then, open the Medusa Admin at `localhost:9000/app` and [Create a Promotion](https://docs.medusajs.com/user-guide/promotions/create) with the code `FIRST_PURCHASE`. It can be a 10% off promotion or any other kind.

> If you want to use a different promo code, change the promo code in [constants.ts](./src/constants.ts).

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/subscribers`
- `src/workflows`
- `src/constants.ts`

Then, open the Medusa Admin at `localhost:9000/app` and [Create a Promotion](https://docs.medusajs.com/user-guide/promotions/create) with the code `FIRST_PURCHASE`. It can be a 10% off promotion or any other kind.

> If you want to use a different promo code, change the promo code in [constants.ts](./src/constants.ts).

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
