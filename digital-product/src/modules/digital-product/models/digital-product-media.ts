import { model } from "@medusajs/framework/utils"
import { MediaType } from "../types"
import DigitalProduct from "./digital-product"

const DigitalProductMedia = model.define("digital_product_media", {
  id: model.id().primaryKey(),
  type: model.enum(MediaType),
  fileId: model.text(),
  mimeType: model.text(),
  digitalProduct: model.belongsTo(() => DigitalProduct, {
    mappedBy: "medias"
  })
})

export default DigitalProductMedia