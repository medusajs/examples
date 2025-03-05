import { AdminOrder, AdminOrderPreview } from "@medusajs/framework/types";
import {
  Badge,
  CurrencyInput,
  Hint,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui";
import { useMemo } from "react";
import {
  useUpdateQuoteItem,
} from "../hooks/quotes";
import { Amount } from "./amount";

type ManageItemProps = {
  originalItem: AdminOrder["items"][0];
  item: AdminOrderPreview["items"][0];
  currencyCode: string;
  orderId: string;
};

export function ManageItem({
  originalItem,
  item,
  currencyCode,
  orderId,
}: ManageItemProps) {
  const { mutateAsync: updateItem } = useUpdateQuoteItem(orderId);

  const isItemUpdated = useMemo(
    () => !!item.actions?.find((a) => a.action === "ITEM_UPDATE"),
    [item]
  );

  const onUpdate = async ({
    quantity,
    unit_price,
  }: {
    quantity?: number;
    unit_price?: number;
  }) => {
    if (
      typeof quantity === "number" &&
      quantity <= item.detail.fulfilled_quantity
    ) {
      toast.error("Quantity should be greater than the fulfilled quantity");
      return;
    }

    try {
      await updateItem({
        quantity,
        unit_price,
        itemId: item.id,
      });
    } catch (e) {
      toast.error((e as any).message);
    }
  };

  return (
    <div
      key={item.quantity}
      className="bg-ui-bg-subtle shadow-elevation-card-rest my-2 rounded-xl "
    >
      <div className="flex flex-col items-center gap-x-2 gap-y-2 p-3 text-sm md:flex-row">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-row items-center gap-x-3">

            <div className="flex flex-col">
              <div>
                <Text className="txt-small" as="span" weight="plus">
                  {item.title}{" "}
                </Text>

                {item.variant_sku && <span>({item.variant_sku})</span>}
              </div>
              <Text as="div" className="text-ui-fg-subtle txt-small">
                {item.product_title}
              </Text>
            </div>
          </div>

          {isItemUpdated && (
              <Badge
                size="2xsmall"
                rounded="full"
                color="orange"
                className="mr-1"
              >
                Modified
              </Badge>
          )}
        </div>

        <div className="flex flex-1 justify-between">
          <div className="flex flex-grow items-center gap-2">
            <Input
              className="bg-ui-bg-base txt-small w-[67px] rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type="number"
              disabled={item.detail.fulfilled_quantity === item.quantity}
              min={item.detail.fulfilled_quantity}
              defaultValue={item.quantity}
              onBlur={(e) => {
                const val = e.target.value;
                const quantity = val === "" ? null : Number(val);

                if (quantity) {
                  onUpdate({ quantity });
                }
              }}
            />
            <Text className="txt-small text-ui-fg-subtle">
              Quantity
            </Text>
          </div>

          <div className="text-ui-fg-subtle txt-small mr-2 flex flex-shrink-0">
            <Amount
              currencyCode={currencyCode}
              amount={item.total}
              originalAmount={originalItem?.total}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
        <div className="flex flex-col gap-y-1">
          <Label>Price</Label>
          <Hint className="!mt-1">
            Override the unit price of this product
          </Hint>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex-grow">
            <CurrencyInput
              symbol={currencyCode}
              code={currencyCode}
              defaultValue={item.unit_price}
              type="numeric"
              min={0}
              onBlur={(e) => {
                onUpdate({
                  unit_price: parseFloat(e.target.value),
                  quantity: item.quantity,
                });
              }}
              className="bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
