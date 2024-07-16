# Medusa v2 Example: Subscription

This directory holds the code for the [Subscription recipe example](https://docs.medusajs.com/v2/resources/recipes/subscriptions/examples/standard).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Installation

1. Clone the repository and change to the `subscription` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/subscription
```

2. Rename the `.env.template` file to `.env`, and set the following environment variables:

```bash
DATABASE_URL=
POSTGRES_URL=
```

3. Install dependencies:

```bash
yarn # or npm install
```

4. Run migrations and seed the database:

```bash
npx medusa migrations run
yarn seed # or npm run seed
```

5. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the content of the following directories:

1. `src/modules/subscription`
2. `src/links`
3. `src/workflows`
4. `src/api`
5. `src/jobs`
6. `src/admin`

Then, add the Subscription Module to `medusa-config.js`:

```js
module.exports = defineConfig({
  // ...
  modules: {
    subscriptionModuleService: {
      resolve: "./modules/subscription",
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

- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1721125608/OpenApi/Subscriptions_OpenApi_b371x4.yml): Can be imported into tools like Postman to view and send requests to this project's API routes.
- [Medusa v2 Documentatin](https://docs.medusajs.com/v2)
