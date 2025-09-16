# Medusa v2 Example: Create Returns from Storefront

This directory holds the code for the [Create Returns from Storefront tutorial](https://docs.medusajs.com/resources/nextjs-starter/guides/storefront-returns).

## Prerequisites

This codebase only includes the storefront and doesn't include the Medusa application. Refer to the [documentation](https://docs.medusajs.com/learn/installation) to learn how to install Medusa.

## Installation

1. Clone the repository and change to the `returns-storefront` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/returns-storefront
```

2\. Rename the `.env.template` file to `.env` and set the following variables:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
```

Where:

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is the URL to your Medusa application server.
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is the publishable key for your Medusa application. You can retrieve it form the Medusa Admin by going to Settings > Publishable API Keys.

3\. Install dependencies:

```bash
yarn # or npm install
```

4\. While the Medusa application is running, start the Next.js server:

```bash
yarn dev # or npm run dev
```

The storefront will run at `http://localhost:8000`.

## Tip: Add Next.js Starter Storefront as Upstream

This storefront is cloned from the [Next.js Starter Storefront's repository](https://github.com/medusajs/nextjs-starter-medusa). To make sure your storefront always has the necessary updates that the Medusa team pushes to the starter's repository, it's recommended that you add the repo as an upstream:

```bash
git remote add upstream https://github.com/medusajs/nextjs-starter-medusa.git
```

You can then pull updates from the Next.js Starter Storefront's repository.

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
