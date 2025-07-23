# Medusa v2 Example: Personalized Products

This directory holds the code for the [Personalized Products Recipe Tutorial](https://docs.medusajs.com/resources/recipes/personalized-products/example).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation

1. Clone the repository and change to the `personalized-products` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/personalized-products
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

Check the [Features](#features) section for more details on how to create and use personalized products.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api`
- `src/workflows`

## Features

### Create Personalized Product

This implementation of personalized products assume a product is personalized if it has the following `metadata` key-value:

```json
{
  "metadata": {
    "is_personalized": true
  }
}
```

You can set the metadata of any product from the Medusa Admin, as explained in the [Edit Product user guide](https://docs.medusajs.com/user-guide/products/edit#manage-product-metadata).

### Get Custom Price of Personalized Product

This example assumes the personalized product can have a custom `height` and `width` properties. Using the `/store/variants/:id/price` API route, you can retrieve the custom price of a personalized product.

### Add Personalized Product to the Cart

To add a personalized product to the cart with a custom price, use the `/store/carts/:id/line-items-custom`.

The item added to the cart will have the personalized data (`height` and `width`) stored in its `metadata` property. The `metadata` is copied to the order's line items' `metadata` once the customer places the order.

### View Personalized Items in Order

If an order has personalized items, you can view their details in the order's details page on the Medusa Admin dashboard.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1753106919/OpenApi/Personalized-Products_ynzrmj.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
