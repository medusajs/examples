# Product Builder Module

This module provides the data models for a product builder feature similar to configuring an iPad on Apple's website.

## Data Models

### ProductBuilder
The main configuration entity that links to a Medusa product.
- Links to custom fields, complimentary products, and add-ons
- Has configuration settings like `is_active`, `sort_order`, and `max_selections`

### AddonProduct  
Represents products that can be added as add-ons in the builder.
- Links to a Medusa product via `product_id`
- Can be managed from the admin dashboard
- Has many-to-many relationship with ProductBuilder through junction table

### ProductBuilderCustomField
Custom input fields where customers can enter values (e.g., engraving text).
- Belongs to a ProductBuilder
- Has field configuration like `field_type`, `is_required`, `sort_order`
- Links to Medusa's PriceSet via `price_set_id` for custom pricing

### ProductBuilderComplimentaryProduct
Links complimentary/included products to a builder.
- Belongs to a ProductBuilder
- References Medusa products that come included

### ProductBuilderAddon (Junction Table)
Many-to-many relationship between ProductBuilder and AddonProduct.
- Contains additional metadata like `is_required`, `sort_order`, `max_quantity`
- Allows different configurations per builder-addon combination
