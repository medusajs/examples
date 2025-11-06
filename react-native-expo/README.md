# Medusa v2 Example: React Native / Expo App

This directory holds the code for the [Implement Mobile App with React Native, Expo, and Medusa](https://docs.medusajs.com/resources/storefront-development/guides/react-native-expo) guide.

This codebase only includes the express checkout storefront and doesn't include the Medusa application. You can learn how to install it by following [this guide](https://docs.medusajs.com/learn/installation).

## Installation

1. Clone the repository and change to the `react-native-expo` directory:

```bash
git clone https://github.com/medusajs/examples.git
cd examples/react-native-expo
```

2\. Rename the `.env.template` file to `.env` and set the following variables:

```bash
EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY=
EXPO_PUBLIC_MEDUSA_URL=
```

Where:

- `EXPO_PUBLIC_MEDUSA_URL` is the URL to your Medusa application server. If the Medusa application is running locally, it should be a local IP. For example `http://192.168.1.100:9000`.
- `EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY` is the publishable key for your Medusa application. You can retrieve it from the Medusa Admin by going to Settings > Publishable API Keys.

3\. Install dependencies:

```bash
npm install
```

4\. While the Medusa application is running, start the Expo server:

```bash
npm run start
```

You can then test the app on a simulator or with [Expo Go](https://expo.dev/go).

## Testing in a Browser

If you're testing the app on the web, make sure to add `localhost:8081` (default Expo server URL) to the Medusa application's `STORE_CORS` and `AUTH_CORS` environment variables:

```bash
STORE_CORS=previous_values...,http://localhost:8081
AUTH_CORS=previous_values...,http://localhost:8081
```

## More Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)