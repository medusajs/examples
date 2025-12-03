# Medusa v2 Example: Okta Integration

This directory holds the code for the [Okta Integration Tutorial](https://docs.medusajs.com/resources/integrations/guides/okta).

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Okta](https://www.okta.com/) account with an application. Can be a developer account.

## Installation

1. Clone the repository and change to the `okta-integration` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/okta-integration
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Okta environment variables:

```bash
OKTA_DOMAIN=
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=
OKTA_REDIRECT_URI=
```

Where:

- `OKTA_DOMAIN`: The Okta domain of your organization. You can find it by going to Security -> API -> Authorization Servers in your Okta dashboard. It's the URL before `/oauth2/default`.
- `OKTA_CLIENT_ID`: The Client ID of your Okta application.
- `OKTA_CLIENT_SECRET`: The Client Secret of your Okta application.
- `OKTA_REDIRECT_URI`: The URL where Okta will redirect users after authentication. It's the same URL you set in the application's Sign-in redirect URIs.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/okta#f-set-up-environment-variables)

5\. Install dependencies:

```bash
yarn # or npm install
```

6\. Setup and seed the database:

```bash
createdb medusa-okta-integration
npx medusa db:setup
yarn seed # or npm run seed
```

7\. Start the Medusa application:

```bash
yarn dev # or npm run dev
```

Open `http://localhost:9000/app`. You'll find a new "Login with Okta" button on the homepage where you can authenticate with Okta.

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/admin`
- `src/api`
- `src/modules/okta`
- `src/workflows`

Then, add the Okta Auth Module Provider to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      dependencies: [
        Modules.CACHE,
        ContainerRegistrationKeys.LOGGER,
      ],
      options: {
        providers: [
          // Default email/password provider
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          // other providers...
          // Okta auth provider
          {
            resolve: "./src/modules/okta",
            id: "okta",
            options: {
              oktaDomain: process.env.OKTA_DOMAIN!,
              clientId: process.env.OKTA_CLIENT_ID!,
              clientSecret: process.env.OKTA_CLIENT_SECRET!,
              redirectUri: process.env.OKTA_REDIRECT_URI!,
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
OKTA_DOMAIN=
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=
OKTA_REDIRECT_URI=
```

Where:

- `OKTA_DOMAIN`: The Okta domain of your organization. You can find it by going to Security -> API -> Authorization Servers in your Okta dashboard. It's the URL before `/oauth2/default`.
- `OKTA_CLIENT_ID`: The Client ID of your Okta application.
- `OKTA_CLIENT_SECRET`: The Client Secret of your Okta application.
- `OKTA_REDIRECT_URI`: The URL where Okta will redirect users after authentication. It's the same URL you set in the application's Sign-in redirect URIs.

Learn more about retrieving these variables in the [tutorial](https://docs.medusajs.com/resources/integrations/guides/okta#f-set-up-environment-variables)

Finally, start the Medusa application:

```bash
yarn dev # or npm run dev
```

Open `http://localhost:9000/app`. You'll find a new "Login with Okta" button on the homepage where you can authenticate with Okta.

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Okta Developer Documentation](https://developer.okta.com/)