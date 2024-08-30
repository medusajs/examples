# Medusa v2 Example: Restaurant Marketplace

This directory holds the code for the [Restaurant-Delivery Marketplace recipe example](https://docs.medusajs.com/v2/resources/recipes/marketplace/examples/restaurant-delivery).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Installation

1. Clone the repository and change to the `restaurant-marketplace` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/restaurant-marketplace
```

2. Rename the `.env.template` file to `.env`, and set the following environment variable:

```bash
DATABASE_URL=
```

3. Install dependencies:

```bash
yarn # or npm install
```

4. Run migrations, sync links, and seed the database:

```bash
npx medusa db:migrate
yarn seed # or npm run seed
```

5. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/delivery` and `src/modules/restaurant`
2. `src/links`
3. `src/workflows`
4. `src/api`

Then, add the Restaurant and Delivery Modules to `medusa-config.js`:

```js
module.exports = defineConfig({
  // ...
  modules: {
    restaurantModuleService: {
      resolve: "./modules/restaurant",
    },
    deliveryModuleService: {
      resolve: "./modules/delivery"
    },
  }
})
```

Finally, run the migrations and sync links before starting the Medusa application:

```bash
npx medusa db:migrate
```

## More Resources

- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1724757329/OpenApi/Restaurant-Delivery-Marketplace_vxao2l.yml): Can be imported into tools like Postman to view and send requests to this project's API routes.
- [Medusa v2 Documentatin](https://docs.medusajs.com/v2)
