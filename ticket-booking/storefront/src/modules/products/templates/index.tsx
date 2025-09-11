import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import TicketLayout from "../components/ticket-product-layout"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:flex-row small:items-start gap-y-6">
          <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
            <ProductInfo product={product} />
          </div>
          <div className="flex flex-col w-full relative">
            <div className="block w-full relative">
              <ImageGallery images={product?.images || []} />
            </div>
          </div>
          <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
            <TicketLayout product={product} />
          </div>
        </div>
      </div>
      
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
