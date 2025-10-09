# Medusa v2 Example: Memcached

This directory holds the code for the [Memcached Tutorial](https://docs.medusajs.com/resources/infrastructure-modules/caching/guides/memcached).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Memcached server](https://memcached.org/)
- Caching feature flag enabled. Set the following environment variable:

```bash
MEDUSA_FF_CACHING=true
```

## Installation

1. Clone the repository and change to the `memcached-caching` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/memcached-caching
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Memcached environment variable:

```bash
MEMCACHED_SERVERS=
```

Where `MEMCACHED_SERVERS` is a comma-separated list of Memcached servers to connect to. Locally, it should be `127.0.0.1:11211` or `localhost:11211`.

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

You'll see the following message in the terminal, indicating that Medusa connected to Memcached:

```bash
info:    Connecting to Memcached...
info:    Successfully connected to Memcached
```

You can set other options as defined in the [ModuleOptions](./src/modules/memcached/loaders/connection.ts) type.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the `src/modules/memcached` directory to your application.

Then, add the Memcached Module Provider with the Caching Module to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        in_memory: {
          enable: true
        },
        providers: [
          {
            resolve: "./src/modules/memcached",
            id: "caching-memcached",
            // Optional, makes this the default caching provider
            is_default: true,
            options: {
              serverUrls: process.env.MEMCACHED_SERVERS?.split(',') || 
                ["127.0.0.1:11211"],
              // add other optional options here...
            },
          },
          // other caching providers...
        ],
      }
    }
  ],
})
```

Next, add the following environment variable:

```bash
MEMCACHED_SERVERS=
```

Where `MEMCACHED_SERVERS` is a comma-separated list of Memcached servers to connect to. Locally, it should be `127.0.0.1:11211` or `localhost:11211`.

After that, install the `memjs` package:

```bash
yarn add memjs # or npm install memjs
```

> This guide was implemented with `algoliasearch@^5.21.0`.

Finally, start the Medusa application:

```bash
yarn dev # or npm run dev
```

You'll see the following message in the terminal, indicating that Medusa connected to Memcached:

```bash
info:    Connecting to Memcached...
info:    Successfully connected to Memcached
```

You can set other options as defined in the [ModuleOptions](./src/modules/memcached/loaders/connection.ts) type.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
