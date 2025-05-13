# Medusa v2 Example: Saved Payment Methods with Stripe

This directory holds the code for the [Saved Payment Methods with Stripe tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/saved-payment-methods).

There are two directories:

- `medusa` for the Medusa Application code. You can [install and use it](#installation), or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).
- `storefront` for the Next.js Starter storefront with changes for saved payment methods.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Stripe account](https://stripe.com/).
- [Stripe Secret and Public API Keys](https://support.stripe.com/questions/locate-api-keys-in-the-dashboard).

## Medusa Application

### Installation

1. After cloning the repository, change to the `stripe-saved-payment/medusa` directory:

```bash
cd examples/stripe-saved-payment/medusa
```

2\. Rename the `.env.template` file to `.env`, and set the following environment variable:

```bash
STRIPE_API_KEY=sk_123...
```

Where `STRIPE_API_KEY` is the secret Stripe API key.

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

### Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directory and file:

1. `src/api/store`
2. `src/api/middlewares.ts`

And make sure to register the Stripe Module Provider in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
  ]
})
```

Set the following environment variable:

```bash
STRIPE_API_KEY=sk_123...
```

Where `STRIPE_API_KEY` is the secret Stripe API key.

## Next.js Storefront

To setup and run the Next.js Storefront:

1. Change to the `stripe-saved-payment/storefront` directory.
2. Copy `.env.template` to `.env.local` and set the following environment variable:

```bash
NEXT_PUBLIC_STRIPE_KEY=pk_123
```

Where `NEXT_PUBLIC_STRIPE_KEY` is Stripe's public API key.

3\. Install the dependencies:

```bash
yarn install # or npm install
```

4\. Start the Next.js storefront (while the Medusa application is running):

```bash
yarn dev # or npm dev
```

## Test it Out

To test out the saved payment methods feature, create a customer account in the Next.js Starter Storefront, add an item to the cart, and go through the checkout flow.

In the payment method, enter the details of a credit card, such as a [test card number](https://docs.stripe.com/testing#cards) and place the order.

Next, add an item to the cart again and proceed through the checkout flow. The card you used earlier will be shown and you can use it to place the order.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Stripe Documentation](https://docs.stripe.com)
