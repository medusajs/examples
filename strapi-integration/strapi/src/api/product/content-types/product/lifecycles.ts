export default {
  async beforeDelete(event) {
    const { where } = event.params;
    
    // Find the product with its relations
    const product = await strapi.db.query("api::product.product").findOne({
      where: {
        id: where.id,
      },
      populate: {
        variants: true,
        options: true,
      },
    })

    if (product) {
      // Delete all variants
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await strapi.documents("api::product-variant.product-variant").delete({
            documentId: variant.documentId,
          })
        }
      }

      // Delete all options (their values will be cascade deleted by the option lifecycle)
      if (product.options && product.options.length > 0) {
        for (const option of product.options) {
          await strapi.documents("api::product-option.product-option").delete({
            documentId: option.documentId,
          })
        }
      }
    }
  }
}

