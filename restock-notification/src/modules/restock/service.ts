import { InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils";
import { Context } from "@medusajs/framework/types"
import RestockSubscription from "./models/restock-subscription";
import { EntityManager } from "@mikro-orm/knex";

class RestockModuleService extends MedusaService({
  RestockSubscription
}) {
  @InjectManager()
  async getUniqueSubscriptions(
    @MedusaContext() context: Context<EntityManager> = {}
  ) {
    return await context.manager?.createQueryBuilder("restock_subscription")
      .select(["variant_id", "sales_channel_id"]).distinct().execute()
  }
}

export default RestockModuleService