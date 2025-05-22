# Medusa v2 Example: Phone Authentication + Twilio SMS Integration

This directory holds the code for the [Phone Authentication Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/phone-auth).

> You can use both the Phone Authentication Module Provider and Twilio SMS Notification Module Provider, or just one of them. They're not tightly coupled and there are no side effects to not using them together. However, if you don't use Twilio SMS, you need another way to send the OTP to users.

You can either:

- [install and use it as a Medusa application](#installation);
- or [copy its source files into an existing Medusa application](#copy-into-existing-medusa-application).

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download)
- [Git CLI](https://git-scm.com/downaloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- If you're using Twilio, you need:
  - [Twilio account](https://console.twilio.com/)
  - [Phone number](https://www.twilio.com/docs/phone-numbers)
  - [Account SID](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account-namer#console-dashboard-home-page)
  - [Auth token](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account-namer#console-dashboard-home-page)

## Installation

1. Clone the repository and change to the `phone-auth` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/phone-auth
```

2\. Rename the `.env.template` file to `.env`.

3\. If necessary, change the PostgreSQL username, password, and host in the `DATABASE_URL` environment variable.

4\. Set the Twilio environment variables:

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
```

Where:

- `TWILIO_ACCOUNT_SID` is the account SID
- `TWILIO_AUTH_TOKEN` is the auth token
- `TWILIO_FROM` is the phone number to send SMS from.

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

You can test out the phone authentication and Twilio SMS integration using the OpenAPI Specs/Postman collection in the [more resources](#more-resources) section.

### Use Phone Authentication Module Provider with Actor Types

This project is configured to allow only customers to authenticate with the `phone-auth` provider. To enable it for other actor types, such as admin user or vendors, change the `projectConfig.http.authMethodsPerActor` configuration in `medusa-config.ts`:

```ts
module.exports = defineConfig({
  projectConfig: {
    // ...
    http: {
      // ...
      authMethodsPerActor: {
        user: ["emailpass", "phone-auth"], // enable for admin users
        customer: ["emailpass", "phone-auth"],
      },
    },
  },
  // ...
})
```

## Copy into Existing Medusa Application

If you have an existing Medusa application, copy the following directories and files into your project:

- `src/api/middlewares.ts`
- `src/modules/phone-auth`
- `src/modules/twilio-sms`
- `src/subscribers`

Then, add the providers to `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER, Modules.EVENT_BUS],
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "./src/modules/phone-auth",
            id: "phone-auth",
            options: {
              jwtSecret: process.env.PHONE_AUTH_JWT_SECRET || "supersecret",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["feed"],
            },
          },
          {
            resolve: "./src/modules/twilio-sms",
            id: "twilio-sms",
            options: {
              channels: ["sms"],
              accountSid: process.env.TWILIO_ACCOUNT_SID,
              authToken: process.env.TWILIO_AUTH_TOKEN,
              from: process.env.TWILIO_FROM,
            },
          },
        ],
      },
    }
  ]
})
```

Next, add the following environment variables:

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
```

Where:

- `TWILIO_ACCOUNT_SID` is the account SID
- `TWILIO_AUTH_TOKEN` is the auth token
- `TWILIO_FROM` is the phone number to send SMS from.

Also, add in `projectConfig.http.authMethodsPerActor` the actor types to enable the `phone-auth` provider for customers:

```ts
module.exports = defineConfig({
  projectConfig: {
    // ...
    http: {
      // ...
      authMethodsPerActor: {
        user: ["emailpass"],
        customer: ["emailpass", "phone-auth"],
      },
    },
  },
  // ...
})
```

You can also enable it for other actor types (admin user, vendor, etc...)

After that, install the `twilio` and `jsonwebtoken` dependencies package:

```bash
yarn add twilio jsonwebtoken # or npm install twilio jsonwebtoken
yarn add @types/jsonwebtoken -D # or npm install @types/jsonwebtoken --save-dev
```

## More Resources

- [Medusa Documentatin](https://docs.medusajs.com)
- [Twilio Documentation](https://www.twilio.com/docs)
- [OpenAPI Spec file](https://res.cloudinary.com/dza7lstvk/raw/upload/v1747745832/OpenApi/Phone_Auth_g4xsqv.yaml): Can be imported into tools like Postman to view and send requests to this project's API routes.
