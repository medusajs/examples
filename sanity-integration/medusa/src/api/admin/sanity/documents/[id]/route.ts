import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import SanityModuleService from "src/modules/sanity/service";
import { SANITY_MODULE } from "../../../../../modules/sanity";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const sanityModule: SanityModuleService = req.scope.resolve(
    SANITY_MODULE
  );
  const sanityDocument = await sanityModule.retrieve(id)

  const url = sanityDocument ? 
    await sanityModule.getStudioLink(
      sanityDocument._type,
      sanityDocument._id,
      { explicit_type: true },
    )
    : ""

  res.json({ sanity_document: sanityDocument, studio_url: url });
};
