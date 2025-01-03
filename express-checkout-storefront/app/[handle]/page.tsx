import { Router } from "../../components/Router"

type Params = {
  params: Promise<{ handle: string }>
}

export default async function ExpressCheckoutPage ({
  params
}: Params) {
  const handle = (await params).handle

  return <Router handle={handle} />
}