export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    // Webhook configuration following Strapi documentation
    // @see https://docs.strapi.io/cms/backend-customization/webhooks
    // @see https://docs.strapi.io/cms/backend-customization/webhooks#securing-your-webhooks
    
    // Add Bearer token to all webhook requests for authentication
    // This token should match a Medusa API key created in the admin dashboard
    defaultHeaders: {
      Authorization: `Bearer ${env('STRAPI_WEBHOOK_TOKEN')}`,
    },
    
    // Performance optimization - don't populate relations in webhook payloads
    populateRelations: false,
  },
});
