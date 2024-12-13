import { sdk } from "../../lib/config"

type Params = {
  params: Promise<{ handle: string }>
}

export default async function ExpressCheckoutPage ({
  params
}: Params) {
  const handle = (await params).handle
  const { products: [product] } = await sdk.store.product.list({
    handle
  })

  return <div>{product.title}</div>
}