# Medusa v2 Example: Gift Message

This directory holds the code for the [Add Gift Message Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/gift-messages).

The [medusa](./medusa) directory holds the codebase for the Medusa application.

The [storefront](./storefront) directory holds the codebase for the Next.js Starter Storefront.

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Medusa Application Setup

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

### Installation

1. Clone the repository and change to the `order-gift-message/medusa` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/order-gift-message/medusa
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

Then, you can set the gift card option of line items in a cart by setting the following variables in the `metadata` property of the line item:

- `is_gift` = `"true"`
- `gift_message` = the gift message

After placing an order with items having the above metadata, you can see the gift option details in the Medusa Admin's order page.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the `src/admin/wigets/order-gift-items-widget.tsx` file into your application.

Then, you can set the gift card option of line items in a cart by setting the following variables in the `metadata` property of the line item:

- `is_gift` = `"true"`
- `gift_message` = the gift message

After placing an order with items having the above metadata, you can see the gift option details in the Medusa Admin's order page.

## Storefront Setup

You can either:

- [install and use the storefront as-is](#storefront-installation);
- or [copy the file changes to your Next.js Starter Storefront](#copy-into-existing-storefront).

### Storefront Installation

If you want to use the storefront as-is, follow the installation steps in the [README](./storefront/README.md)

Then, you'll find the gift option inputs as part of the cart and checkout pages. You'll also find the gift message in the order confirmation page.

### Copy Into Existing Storefront

The following files have been changed from the original Next.js Starter Storefront:

- `src/lib/data/cart.ts`
- `src/modules/cart/components/item/index.tsx`
- `src/modules/cart/templates/preview.tsx`
- `src/modules/cart/templates/items.tsx`
- `src/modules/order/components/item/index.tsx`

Copy those files into your Next.js Starter Storefront, and you'll find the gift option inputs as part of the cart and checkout pages. You'll also find the gift message in the order confirmation page.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
