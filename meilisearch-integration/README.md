# Meilisearch Integration

This example demonstrates how to integrate Meilisearch with Medusa for product search functionality.

## Features

- **Product Indexing**: Automatically sync products to Meilisearch when they are created or updated
- **Product Deletion**: Remove products from Meilisearch when they are deleted
- **Search API**: Store API endpoint for searching products using Meilisearch
- **Admin Interface**: Admin panel to manually trigger data sync
- **Event-driven Sync**: Automatic synchronization based on product events

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_meilisearch_api_key
MEILISEARCH_PRODUCT_INDEX_NAME=products
```

### 3. Start Meilisearch

Make sure you have Meilisearch running locally or have access to a Meilisearch instance.

```bash
# Using Docker
docker run -it --rm -p 7700:7700 getmeili/meilisearch:latest

# Or install locally
curl -L https://install.meilisearch.com | sh
./meilisearch
```

### 4. Start Medusa

```bash
yarn dev
```

## Usage

### Automatic Sync

Products are automatically synced to Meilisearch when:
- A product is created
- A product is updated
- A product is deleted

### Manual Sync

You can manually trigger a full sync from the admin panel:
1. Go to Settings → Meilisearch
2. Click "Sync Data to Meilisearch"

### Search API

Use the search endpoint to query products:

```bash
POST /store/products/search
Content-Type: application/json

{
  "query": "your search query"
}
```

## Architecture

### Module Structure

- **Module**: `src/modules/meilisearch/` - Core Meilisearch integration
- **Workflows**: `src/workflows/` - Business logic for syncing and deleting products
- **Subscribers**: `src/subscribers/` - Event handlers for product changes
- **API Routes**: `src/api/` - REST endpoints for search and admin operations
- **Admin Interface**: `src/admin/` - Admin panel for managing the integration

### Key Components

1. **MeilisearchModuleService**: Handles all Meilisearch operations
2. **syncProductsWorkflow**: Syncs products to Meilisearch
3. **deleteProductsFromMeilisearchWorkflow**: Removes products from Meilisearch
4. **Event Subscribers**: Listen for product events and trigger appropriate workflows

## Configuration

The integration is configured in `medusa-config.ts`:

```typescript
modules: [
  {
    resolve: "./src/modules/meilisearch",
    options: {
      host: process.env.MEILISEARCH_HOST!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
      productIndexName: process.env.MEILISEARCH_PRODUCT_INDEX_NAME!,
    }
  }
]
```

## Testing

Run the integration tests:

```bash
yarn test:integration:http
yarn test:integration:modules
yarn test:unit
```