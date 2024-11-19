import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { sanitySyncProductsWorkflow } from "../workflows/sanity-sync-products";

export default async function upsertSanityProduct({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sanitySyncProductsWorkflow(container).run({
    input: {
      product_ids: [data.id],
    },
  });
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
};
