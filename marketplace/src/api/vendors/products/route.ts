import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { createProductsWorkflow } from "@medusajs/core-flows"
import { 
  CreateProductWorkflowInputDTO,
  IProductModuleService,
  ISalesChannelModuleService
} from "@medusajs/types"
import { 
  Modules, 
  ContainerRegistrationKeys,
  ModuleRegistrationName
} from "@medusajs/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceModuleService: MarketplaceModuleService = 
    req.scope.resolve(MARKETPLACE_MODULE)

  const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
    req.auth_context.actor_id,
    {
      relations: ["vendor"]
    }
  )

  const { data: [vendor] } = await query.graph({
    entryPoint: "vendor",
    fields: ["products.*"],
    variables: {
      filters: {
        id: [vendorAdmin.vendor.id],
      },
    },
  })

  res.json({
    products: vendor.products
  })
}

type RequestType = CreateProductWorkflowInputDTO

export const POST = async (
  req: AuthenticatedMedusaRequest<RequestType>,
  res: MedusaResponse
) => {
  const remoteLink = req.scope.resolve("remoteLink")
  const marketplaceModuleService: MarketplaceModuleService = 
    req.scope.resolve(MARKETPLACE_MODULE)
  const productModuleService: IProductModuleService = req.scope
    .resolve(ModuleRegistrationName.PRODUCT)
  const salesChannelModuleService: ISalesChannelModuleService = req.scope
    .resolve(ModuleRegistrationName.SALES_CHANNEL)
  // Retrieve default sales channel to make the product available in.
  // Alternatively, you can link sales channels to vendors and allow vendors
  // to manage sales channels
  const salesChannels = await salesChannelModuleService.listSalesChannels()
  const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
    req.auth_context.actor_id,
    {
      relations: ["vendor"]
    }
  )
  
  const { result } = await createProductsWorkflow(req.scope)
    .run({
      input: {
        products: [{
          ...req.body,
          sales_channels: salesChannels
        }]
      }
    })

  // link product to vendor
  await remoteLink.create({
    [MARKETPLACE_MODULE]: {
      vendor_id: vendorAdmin.vendor.id
    },
    [Modules.PRODUCT]: {
      product_id: result[0].id
    }
  })

  // retrieve product again
  const product = await productModuleService.retrieveProduct(
    result[0].id
  )

  res.json({
    product
  })
}