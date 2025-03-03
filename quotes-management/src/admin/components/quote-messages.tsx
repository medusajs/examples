import { zodResolver } from "@hookform/resolvers/zod";
import { AdminOrderPreview } from "@medusajs/framework/types";
import {
  Button,
  clx,
  Container,
  Heading,
  Hint,
  Label,
  Select,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { useCreateQuoteMessage } from "../hooks/quotes";
import { QuoteItem } from "./quote-items";
import { AdminQuote } from "../types";

export const CreateQuoteMessageForm = z.object({
  text: z.string().min(1),
  item_id: z.string().nullish(),
});

export function QuoteMessages({
  quote,
  preview,
}: {
  quote: AdminQuote;
  preview: AdminOrderPreview;
}) {
  const { id } = useParams();

  /**
   * FORM
   */
  const form = useForm<z.infer<typeof CreateQuoteMessageForm>>({
    defaultValues: () =>
      Promise.resolve({
        text: "",
        item_id: null,
      }),
    resolver: zodResolver(CreateQuoteMessageForm),
  });

  const { mutateAsync: createMessage, isPending: isCreatingMessage } =
    useCreateQuoteMessage(id!);

  const originalItemsMap = useMemo(() => {
    return new Map(quote?.draft_order?.items?.map((item) => [item.id, item]));
  }, [quote?.draft_order]);

  const previewItemsMap = useMemo(() => {
    return new Map(preview?.items?.map((item) => [item.id, item]));
  }, [preview]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await createMessage(
      {
        text: data.text,
        item_id: data.item_id || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Successfully sent message to customer");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  });

  return (
    <Container className="divide-y divide-dashed p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Messages</Heading>
      </div>

      <div>
        {quote.messages?.map((message) => (
          <div
            key={message.id}
            className={clx("px-6 py-4 text-sm flex flex-col gap-y-2", {
              "!bg-ui-bg-subtle !inset-x-5 !inset-y-3": !!message.admin_id,
            })}
          >
            <div className="font-medium font-sans txt-compact-small text-ui-fg-subtle ">
              {!!message.admin &&
                `${message.admin.first_name} ${message.admin.last_name}`}

              {!!message.customer &&
                `${message.customer.first_name} ${message.customer.last_name}`}
            </div>

            {!!message.item_id && (
              <div className="border border-dashed border-neutral-400 my-2">
                <QuoteItem
                  item={previewItemsMap.get(message.item_id)!}
                  originalItem={originalItemsMap.get(message.item_id)!}
                  currencyCode={quote.draft_order.currency_code}
                />
              </div>
            )}

            <div>{message.text}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5 pb-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
            <Controller
              control={form.control}
              name="item_id"
              render={({ field: { onChange, ref, ...field } }) => {
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-y-1">
                      <Label>Pick Quote Item</Label>
                      <Hint>
                        Select a quote item to write a message around
                      </Hint>
                    </div>
                    <div className="flex-1">
                      <Select onValueChange={onChange} value={field.value || ""} disabled={field.disabled}>
                        <Select.Trigger className="bg-ui-bg-base" ref={ref}>
                          <Select.Value placeholder="Select Item" />
                        </Select.Trigger>
                        <Select.Content>
                          {preview.items.map((l) => (
                            <Select.Item key={l.id} value={l.id}>
                              {l.variant_sku}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  </div>
                );
              }}
            />

            <Controller
              control={form.control}
              name={`text`}
              render={({ field }) => {
                return (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <Label size="small" weight="plus">
                        Message Text
                      </Label>
                    </div>
                    <Textarea {...field} />
                  </div>
                );
              }}
            />

            <Button
              size="small"
              type="submit"
              className="self-end"
              disabled={isCreatingMessage}
            >
              Send
            </Button>
          </form>
      </div>
    </Container>
  );
}
