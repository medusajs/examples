import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { FilterableProductProps } from "@medusajs/framework/types"
import { isDefined, Modules, promiseAll } from "@medusajs/framework/utils";
import SanityModuleService from "../../../modules/sanity/service";
import { SANITY_MODULE } from "../../../modules/sanity";

export type SyncStepInput = {
  product_ids?: string[];
}

export const syncStep = createStep(
  { name: "sync-step", async: true},
  async (input: SyncStepInput, { container }) => {
    const productModule = container.resolve(Modules.PRODUCT);
    const sanityModule: SanityModuleService = container.resolve(SANITY_MODULE);

    let total = 0;
    const upsertMap: {
      before: any
      after: any
    }[] = []

    const batchSize = 200;
    let hasMore = true;
    let offset = 0;
    let filter: FilterableProductProps = {};
    if (isDefined(input.product_ids)) {
      filter.id = input.product_ids;
    }

    while (hasMore) {
      const [products, count] = await productModule.listAndCountProducts(
        filter,
        {
          select: ["id", "title"],
          skip: offset,
          take: batchSize,
          order: { id: "ASC" },
        },
      );

      await promiseAll(
        products.map(async (prod) => {
          const before = await sanityModule.retrieve(prod.id)
          const after = await sanityModule.upsertSyncDocument("product", prod);

          upsertMap.push({
            before,
            after
          })

          return after
        }),
      );

      offset += batchSize;
      hasMore = offset < count;
      total += products.length;
    }

    return new StepResponse({ total }, upsertMap);
  },
  async (upsertMap, { container }) => {
    if (!upsertMap) {
      return
    }

    const sanityModule: SanityModuleService = container.resolve(SANITY_MODULE);

    await promiseAll(
      upsertMap.map(({ before, after }) => {
        if (!before) {
          // delete the document
          return sanityModule.delete(after._id)
        }

        const { _id: id, ...oldData } = before

        return sanityModule.update(
          id,
          oldData
        )
      })
    )
  }
);