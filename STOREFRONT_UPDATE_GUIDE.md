# Storefront Update Guide

This guide explains how to sync multiple example storefronts with the latest changes from [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa).

## Overview

This is a **monorepo** containing multiple example projects. Several of these projects have storefronts derived from the Next.js Starter Medusa template. When the upstream starter is updated, these storefronts need to be synced while preserving their custom integrations.

> **Note**: This is a monorepo in the sense that multiple projects share the same Git repository, but it is **NOT** a Yarn workspace or similar dependency-sharing setup. Each project is completely independent with its own `package.json`, `node_modules`, and dependencies. There is no shared dependency management across projects.

### Monorepo Structure

- **Git Repository Root**: `/Users/shahednasser/projects/examples`
- **Upstream Remote**: `https://github.com/medusajs/nextjs-starter-medusa` (configured as `upstream`)
- **Projects with Storefronts**: Each example project has its own directory with optional `/storefront` subdirectory
- **Dependency Management**: Each project manages its own dependencies independently (no workspace configuration)

## Projects to Update

The following projects are based on the Next.js Starter Medusa and should be kept in sync:

1. **`sanity-integration/storefront`** - Integrated with Sanity CMS
2. **`order-gift-message/storefront`** - Custom gift message feature
3. **`payload-integration/storefront`** - Integrated with Payload CMS (note: path is `(storefront)/[countryCode]/...`)
4. **`returns-storefront`** - Custom returns functionality
5. **`stripe-saved-payment/storefront`** - Saved payment methods feature
6. **`ticket-booking/storefront`** - Ticket booking system

### Projects with Different Structures

- **`payload-integration/storefront`**: Has `(storefront)` directory instead of direct `[countryCode]` - file paths differ slightly

## Update Workflow

### 1. Fetch Latest Changes

```bash
cd /Users/shahednasser/projects/examples
git fetch upstream
```

### 2. Compare Changes

Check what's changed in the upstream starter:

```bash
# Compare current state with upstream
git diff upstream/main -- <project-path>

# Or checkout upstream for comparison
cd sanity-integration/storefront
git checkout upstream/main
```

### 3. Identify Changes to Apply

Common types of updates:

- **Package updates**: `package.json` dependencies
- **Next.js/React version bumps**
- **New features**: variant-scoped images, URL param syncing, etc.
- **UI improvements**: cart totals, side menu, etc.
- **Bug fixes**: typo corrections, helper functions

### 4. Apply Updates

Updates should be applied to all 6 projects listed above. The process typically involves:

#### A. Package Updates

Update `package.json` in each project:
- Next.js version
- React version
- Stripe packages
- Dev script changes (e.g., adding `--turbopack`)

#### B. File Updates

Update or create files that introdue new features, UI improvements, and bug fixes.

#### C. Install Dependencies

After updating `package.json`:

```bash
cd <project>/storefront
yarn install
```

### 5. Verify Changes

Build and test each project:

```bash
cd <project>/storefront
yarn build
yarn dev
```

Check for:
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ Custom features still work
- ✅ New features work correctly

## Key Considerations

### Preserve Custom Integrations

Each project has unique features that **must be preserved**:

1. **`sanity-integration/storefront`**
   - Sanity packages: `@sanity/client`, `@sanity/image-url`, `next-sanity`
   - Custom Sanity data fetching and image handling
   - Sanity-specific components

2. **`payload-integration/storefront`**
   - Payload CMS packages and types
   - `StoreProductWithPayload` type extensions
   - Payload-specific data fetching
   - Custom `optionsAsKeymap` function with payload data

3. **`order-gift-message/storefront`**
   - Gift message custom functionality
   - Related UI components

4. **`ticket-booking/storefront`**
   - Ticket booking system
   - Custom layouts and components (e.g., `TicketLayout`)
   - Region param handling differences

5. **`stripe-saved-payment/storefront`**
   - Saved payment methods feature
   - Custom payment components

6. **`returns-storefront`**
   - Returns management functionality
   - Custom return components

## Automation Tips

### Using AI Agents

When asking an AI agent to sync storefronts:

1. **Be specific about projects**: List the 6 projects to update
2. **Mention custom integrations**: Point out what needs to be preserved
3. **Request batch operations**: AI can update multiple files in parallel
4. **Ask for verification**: Request error checks and build tests after updates

### Example Prompt

```
I need to sync the following storefront projects with the latest changes from 
upstream (medusajs/nextjs-starter-medusa):

1. sanity-integration/storefront (preserve Sanity packages & integration)
2. order-gift-message/storefront (preserve gift message feature)
3. payload-integration/storefront (preserve Payload CMS integration)
4. returns-storefront (preserve returns functionality)
5. stripe-saved-payment/storefront (preserve saved payment feature)
6. ticket-booking/storefront (preserve ticket booking system)

The upstream remote is configured at the parent directory level 
(/Users/shahednasser/projects/examples). Please:

1. Fetch latest changes from upstream
2. Compare with current state
3. Apply all necessary updates while preserving custom features
4. Install dependencies
5. Verify no errors
```

## Update History

### Recent Updates Applied (December 2025)

- ✅ Next.js upgraded from 15.0.3 to 15.3.8
- ✅ React upgraded from 19.0.0-rc to 19.0.3 (stable)
- ✅ Medusa SDK packages updated to latest
- ✅ Stripe packages updated: `@stripe/react-stripe-js` ^5.3.0, `@stripe/stripe-js` ^8.2.0
- ✅ Added Turbopack support (`--turbopack` flag in dev script)
- ✅ Implemented variant-scoped images
- ✅ Added URL param synchronization for variant selection
- ✅ Enhanced cart totals with discount display (strikethrough pricing)
- ✅ Improved side menu UX (backdrop overlay, z-index fix)
- ✅ Fixed typo: `get-precentage-diff.ts` → `get-percentage-diff.ts`
- ✅ Added `isStripeLike()` helper function
- ✅ Updated payment wrapper for Medusa Payments support
- ✅ Created `variants.ts` data layer file

## Troubleshooting

### Common Issues

**Issue**: Git merge conflicts due to "unrelated histories"
- **Solution**: Don't use `git merge`. Apply changes manually file-by-file.

**Issue**: Files created at wrong directory level
- **Solution**: Remember git root is at parent level. Use absolute paths.

**Issue**: Different project structures (e.g., payload-integration)
- **Solution**: Check file paths first. Use `file_search` to locate files.

**Issue**: TypeScript errors after updates
- **Solution**: Check for missing imports, type mismatches. Verify custom types are preserved.

**Issue**: Build fails after dependency updates
- **Solution**: Delete `node_modules` and `.next`, run `yarn install`, rebuild.

### Testing Checklist

After applying updates to all projects:

- [ ] All `package.json` files updated
- [ ] Dependencies installed (`yarn install` in each project)
- [ ] No TypeScript errors (`get_errors` check)
- [ ] Builds succeed (`yarn build` in each project)
- [ ] Custom features preserved (Sanity, Payload, gift messages, etc.)
- [ ] New features work (variant images, cart discounts, etc.)
- [ ] No duplicate imports or merge artifacts

## Reference Files

For comparison when updating, use these fully-updated projects as reference:

1. **`sanity-integration/storefront`** - Complete implementation with custom Sanity integration
2. **`order-gift-message/storefront`** - Complete implementation with custom gift message feature

These two were fully updated first and can serve as templates for the others.

## Notes

- **Package Manager**: Projects use Yarn (versions 1.22.19 or 3.2.3)
- **Node Version**: Ensure Node.js 18+ is installed
- **Environment Variables**: Check `.env.local` files for project-specific configuration
- **Build Output**: Next.js 15+ generates optimized builds; verify all routes work
- **Development Mode**: Use `yarn dev` for hot reloading during testing

## Useful Commands

```bash
# Check git remotes
git remote -v

# Fetch upstream changes
git fetch upstream

# Compare files
git diff upstream/main -- path/to/file

# Find all package.json files
find . -name "package.json" -path "*/storefront/*"

# Find specific file across projects
find . -name "page.tsx" -path "*/products/[handle]/*"

# Build all storefronts (run from examples root)
for dir in sanity-integration order-gift-message returns-storefront stripe-saved-payment ticket-booking; do
  cd $dir/storefront && yarn build && cd ../..
done
cd payload-integration/storefront && yarn build && cd ../..
```

---

**Last Updated**: December 12, 2025  
**Maintained By**: Development Team  
**Upstream Repository**: https://github.com/medusajs/nextjs-starter-medusa
