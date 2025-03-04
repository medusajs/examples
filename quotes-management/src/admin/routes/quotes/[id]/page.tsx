import { CheckCircleSolid } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Text,
  toast,
  Toaster,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useOrderPreview } from "../../../hooks/order-preview";
import { useQuote, useRejectQuote, useSendQuote } from "../../../hooks/quotes";
import { QuoteDetailsHeader } from "../../../components/quote-details-header";
import { QuoteItems } from "../../../components/quote-items";
import { CostBreakdown } from "../../../components/cost-breakdown";
import { QuoteTotal } from "../../../components/quote-total";

const QuoteDetails = () => {
  const { id } = useParams();
  // const [showSendQuote, setShowSendQuote] = useState(false);
  // const [showRejectQuote, setShowRejectQuote] = useState(false);
  // const prompt = usePrompt();
  const navigate = useNavigate();
  const { quote, isLoading } = useQuote(id!, {
    fields:
      "*draft_order.customer",
  });

  const { order: preview, isLoading: isPreviewLoading } = useOrderPreview(
    quote?.draft_order_id!,
    {},
    { enabled: !!quote?.draft_order_id }
  );

  // const { mutateAsync: sendQuote, isPending: isSendingQuote } = useSendQuote(
  //   id!
  // );

  // const { mutateAsync: rejectQuote, isPending: isRejectingQuote } =
  //   useRejectQuote(id!);

  // useEffect(() => {
  //   if (["pending_merchant", "customer_rejected"].includes(quote?.status!)) {
  //     setShowSendQuote(true);
  //   } else {
  //     setShowSendQuote(false);
  //   }

  //   if (
  //     ["customer_rejected", "merchant_rejected", "accepted"].includes(
  //       quote?.status!
  //     )
  //   ) {
  //     setShowRejectQuote(false);
  //   } else {
  //     setShowRejectQuote(true);
  //   }
  // }, [quote]);

  // const handleSendQuote = async () => {
  //   const res = await prompt({
  //     title: "Send quote?",
  //     description:
  //       "You are about to send this quote to the customer. Do you want to continue?",
  //     confirmText: "Continue",
  //     cancelText: "Cancel",
  //     variant: "confirmation",
  //   });

  //   if (res) {
  //     await sendQuote(
  //       void 0,
  //       {
  //         onSuccess: () => toast.success("Successfully sent quote to customer"),
  //         onError: (e) => toast.error(e.message),
  //       }
  //     );
  //   }
  // };

  // const handleRejectQuote = async () => {
  //   const res = await prompt({
  //     title: "Reject quote?",
  //     description:
  //       "You are about to reject this customer's quote. Do you want to continue?",
  //     confirmText: "Continue",
  //     cancelText: "Cancel",
  //     variant: "confirmation",
  //   });

  //   if (res) {
  //     await rejectQuote(void 0, {
  //       onSuccess: () =>
  //         toast.success("Successfully rejected customer's quote"),
  //       onError: (e) => toast.error(e.message),
  //     });
  //   }
  // };

  if (isLoading || !quote) {
    return <></>;
  }

  if (isPreviewLoading) {
    return <></>;
  }

  if (!isPreviewLoading && !preview) {
    throw "preview not found";
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-x-4 lg:flex-row xl:items-start">
        <div className="flex w-full flex-col gap-y-3">
          {quote.status === "accepted" && (
            <Container className="divide-y divide-dashed p-0">
              <div className="flex items-center justify-between px-6 py-4">
                <Text className="txt-compact-small">
                  <CheckCircleSolid className="inline-block mr-2 text-green-500 text-lg" />
                  Quote accepted by customer. Order is ready for processing.
                </Text>

                <Button
                  size="small"
                  onClick={() => navigate(`/orders/${quote.draft_order_id}`)}
                >
                  View Order
                </Button>
              </div>
            </Container>
          )}

          <Container className="divide-y divide-dashed p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Quote Summary</Heading>
            </div>
            <QuoteItems order={quote.draft_order} preview={preview!} />
            <CostBreakdown order={quote.draft_order} />
            <QuoteTotal order={quote.draft_order} preview={preview!} />

            {/* {(showRejectQuote || showSendQuote) && (
              <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
                {showRejectQuote && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleRejectQuote()}
                    disabled={isSendingQuote || isRejectingQuote}
                  >
                    Reject Quote
                  </Button>
                )}

                {showSendQuote && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleSendQuote()}
                    disabled={isSendingQuote || isRejectingQuote}
                  >
                    Send Quote
                  </Button>
                )}
              </div>
            )} */}
          </Container>

        </div>

        <div className="mt-2 flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[400px]">
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Customer</Heading>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Email
              </Text>

              <Link
                className="text-sm text-pretty text-blue-500"
                to={`/customers/${quote.draft_order?.customer?.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {quote.draft_order?.customer?.email}
              </Link>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Phone
              </Text>

              <Text size="small" leading="compact" className="text-pretty">
                {quote.draft_order?.customer?.phone}
              </Text>
            </div>
          </Container>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default QuoteDetails;
