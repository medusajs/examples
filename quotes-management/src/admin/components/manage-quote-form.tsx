import { AdminOrder } from "@medusajs/framework/types";
import { Button, Heading, toast } from "@medusajs/ui";
import { useConfirmQuote } from "../hooks/quotes";
import { formatAmount } from "../utils/format-amount";
import { useOrderPreview } from "../hooks/order-preview";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { ManageItem } from "./manage-item";

type ReturnCreateFormProps = {
  order: AdminOrder;
};

export const ManageQuoteForm = ({ order }: ReturnCreateFormProps) => {
  const { order: preview } = useOrderPreview(order.id);
  const navigate = useNavigate()
  const { id: quoteId } = useParams()

  const { mutateAsync: confirmQuote, isPending: isRequesting } =
    useConfirmQuote(order.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await confirmQuote();
      navigate(`/quotes/${quoteId}`);

      toast.success("Successfully updated quote");
    } catch (e) {
      toast.error("Error", {
        description: (e as any).message,
      });
    }
  };
  
    const originalItemsMap = useMemo(() => {
      return new Map(order.items.map((item) => [item.id, item]));
    }, [order]);

  if (!preview) {
    return <></>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col p-4 gap-2">
      <div>
        <div className="mb-3 mt-8 flex items-center justify-between">
          <Heading level="h2">Items</Heading>
        </div>

        {preview.items.map((item) => (
          <ManageItem
            key={item.id}
            originalItem={originalItemsMap.get(item.id)!}
            item={item}
            orderId={order.id}
            currencyCode={order.currency_code}
          />
        ))}
      </div>

      <div className="mt-8 border-y border-dotted py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="txt-small text-ui-fg-subtle">
            Current Total
          </span>

          <span className="txt-small text-ui-fg-subtle">
            {formatAmount(order.total, order.currency_code)}
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="txt-small text-ui-fg-subtle">
            New Total
          </span>

          <span className="txt-small text-ui-fg-subtle">
            {formatAmount(preview.total, order.currency_code)}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-x-4">
        <div className="flex items-center justify-end gap-x-2">
          <Button
            key="submit-button"
            type="submit"
            variant="primary"
            size="small"
            disabled={isRequesting}
          >
            Confirm Edit
          </Button>
        </div>
      </div>
    </form>
  );
};
