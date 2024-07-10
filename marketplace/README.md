# Medusa v2 Example: Marketplace

This directory holds the code for the [Marketplace recipe example](https://docs.medusajs.com/v2/resources/recipes/marketplace/examples/vendors).

You can either:

- [install and use it as a Medusa application](#installation);
- or copy its source files into an existing Medusa application.

## Installation

1. Clone the repository and change to the `marketplace` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/marketplace
```

2. Install dependencies:

```bash
yarn # or npm install
```

3. Run migrations and seed the database:

```bash
npx medusa migrations run
yarn seed # or npm run seed
```

4. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/marketplace`
2. `src/links`
3. `src/workflows`
4. `src/api`

Then, add the Marketplace Module to `medusa-config.js`:

```js
import { MARKETPLACE_MODULE } from './src/modules/marketplace'

// ...

module.exports = defineConfig({
  // ...
  modules: {
    [MARKETPLACE_MODULE]: {
      resolve: "./modules/marketplace",
      definition: {
        isQueryable: true
      }
    }
  }
})
```

And run the migrations before starting the Medusa application:

```bash
npx medusa migrations run
```

## More Resources

- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1720603521/OpenApi/Marketplace_OpenApi_n458oh.yml): Can be imported into tools like Postman to view and send requests to this project's API routes.
- [Medusa v2 Documentatin](https://docs.medusajs.com/v2)