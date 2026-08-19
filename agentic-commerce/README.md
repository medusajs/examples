# Medusa v2 Example: Agentic Commerce

This directory holds the code for the [Agentic Commerce Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/agentic-commerce).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## ACP Compatibility

This example targets the published ACP `2026-04-17` Agentic Checkout and webhook schemas.

| Capability | Status | Production boundary |
|---|---|---|
| Product-feed generation | Example implementation | `sendProductFeed` only logs the generated feed. Implement authenticated transport and delivery monitoring. |
| Checkout session routes | Example implementation | Authentication is intentionally disabled in the sample middleware. Enable and test it before deployment. |
| POST idempotency | Partial | Routes pass the key to workflow context, but production deployments must enforce required, replay, in-flight, and payload-conflict behavior. |
| Delegated payment | Stripe example | Validate provider eligibility, failure recovery, reconciliation, and safe logging for your deployment. |
| Order webhooks | Schema-aligned payload example | Event names, order statuses, adjustments, and signing follow `2026-04-17`; webhook delivery remains merchant-supplied. |

This compatibility statement describes the example's implementation surface. It is not a certification or a statement that a merchant is enabled in any host product, region, or rollout cohort.

Before using this example in production:

- enable and test bearer authentication;
- enforce the ACP version and required idempotency behavior;
- implement product-feed and webhook transport, retry, and monitoring;
- store signing secrets securely and rotate them through an approved process;
- validate checkout, payment, order, refund, and fulfillment scenarios for your business;
- compare the pinned ACP release with newer releases before upgrading.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Sign up for Instant Checkout with ChatGPT](https://chatgpt.com/merchants)

## Installation

1. Clone the repository and change to the `agentic-commerce` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/agentic-commerce
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the following environment variables:

```bash
STRIPE_API_KEY=
AGENTIC_COMMERCE_SIGNATURE_KEY=
```

Where:

- `STRIPE_API_KEY` is the Secret API key from your Stripe account.
- `AGENTIC_COMMERCE_SIGNATURE_KEY` is the signature key from OpenAI.

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

You can then test out the integration with ChatGPT or other AI agents based on the details received from the agents. You'll need to update the service in `src/modules/agentic-commerce/service.ts` with the correct logic to send the product feed, and to send webhook events.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api`
- `src/jobs`
- `src/modules/agentic-commerce`
- `src/subscribers`
- `src/workflows`

Then, add the Agentic Commerce Module to `medusa-config.ts` with the Stripe Provider Module, which is the only supported method right now in ChatGPT:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/agentic-commerce",
      options: {
        signatureKey: process.env.AGENTIC_COMMERCE_SIGNATURE_KEY || "supersecret",
      }
    },
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
  ],
})
```

Next, add the following environment variables:

```bash
STRIPE_API_KEY=
AGENTIC_COMMERCE_SIGNATURE_KEY=
```

Where:

- `STRIPE_API_KEY` is the Secret API key from your Stripe account.
- `AGENTIC_COMMERCE_SIGNATURE_KEY` is the signature key from OpenAI.

Start the Medusa application:

```bash
yarn dev # or npm run dev
```

You can then test out the integration with ChatGPT or other AI agents based on the details received from the agents. You'll need to update the service in `src/modules/agentic-commerce/service.ts` with the correct logic to send the product feed, and to send webhook events.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Agentic Commerce documentation](https://developers.openai.com/commerce)
- [ACP `2026-04-17` Agentic Checkout schema](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml)
- [ACP `2026-04-17` webhook schema](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout_webhook.yaml)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1759332538/OpenApi/agentic-commerce-openapi_hvsioq.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
