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
import { 
  useQuote, 
  useRejectQuote, 
  useSendQuote
} from "../../../hooks/quotes";
import { QuoteItems } from "../../../components/quote-items";
import { TotalsBreakdown } from "../../../components/totals-breakdown";
import { formatAmount } from "../../../utils/format-amount";

const QuoteDetails = () => {
  const { id } = useParams();
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

  const prompt = usePrompt();
  const { mutateAsync: rejectQuote, isPending: isRejectingQuote } =
    useRejectQuote(id!);
  const [showRejectQuote, setShowRejectQuote] = useState(false);

  const { mutateAsync: sendQuote, isPending: isSendingQuote } = useSendQuote(
    id!
  );
  const [showSendQuote, setShowSendQuote] = useState(false);

  const [showManageQuote, setShowManageQuote] = useState(false);

  useEffect(() => {
    if (["pending_merchant", "customer_rejected"].includes(quote?.status!)) {
      setShowSendQuote(true);
    } else {
      setShowSendQuote(false);
    }

    if (
      ["customer_rejected", "merchant_rejected", "accepted"].includes(
        quote?.status!
      )
    ) {
      setShowRejectQuote(false);
    } else {
      setShowRejectQuote(true);
    }

    if (![
      "pending_merchant",
      "customer_rejected",
      "merchant_rejected",
    ].includes(quote?.status!)) {
      setShowManageQuote(false);
    } else {
      setShowManageQuote(true);
    }
  }, [quote]);

  const handleRejectQuote = async () => {
    const res = await prompt({
      title: "Reject quote?",
      description:
        "You are about to reject this customer's quote. Do you want to continue?",
      confirmText: "Continue",
      cancelText: "Cancel",
      variant: "confirmation",
    });

    if (res) {
      await rejectQuote(void 0, {
        onSuccess: () =>
          toast.success("Successfully rejected customer's quote"),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleSendQuote = async () => {
    const res = await prompt({
      title: "Send quote?",
      description:
        "You are about to send this quote to the customer. Do you want to continue?",
      confirmText: "Continue",
      cancelText: "Cancel",
      variant: "confirmation",
    });

    if (res) {
      await sendQuote(
        void 0,
        {
          onSuccess: () => toast.success("Successfully sent quote to customer"),
          onError: (e) => toast.error(e.message),
        }
      );
    }
  };

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
              <span className="text-ui-fg-muted txt-compact-small">{quote.status}</span>
            </div>
            <QuoteItems order={quote.draft_order} preview={preview!} />
            <TotalsBreakdown order={quote.draft_order} />
            <div className=" flex flex-col gap-y-2 px-6 py-4">
              <div className="text-ui-fg-base flex items-center justify-between">
                <Text
                  weight="plus"
                  className="text-ui-fg-subtle"
                  size="small"
                  leading="compact"
                >
                  Original Total
                </Text>
                <Text
                  weight="plus"
                  className="text-ui-fg-subtle"
                  size="small"
                  leading="compact"
                >
                  {formatAmount(quote.draft_order.total, quote.draft_order.currency_code)}
                </Text>
              </div>
        
              <div className="text-ui-fg-base flex items-center justify-between">
                <Text
                  className="text-ui-fg-subtle text-semibold"
                  size="small"
                  leading="compact"
                  weight="plus"
                >
                  Quote Total
                </Text>
                <Text
                  className="text-ui-fg-subtle text-bold"
                  size="small"
                  leading="compact"
                  weight="plus"
                >
                  {formatAmount(preview!.summary.current_order_total, quote.draft_order.currency_code)}
                </Text>
              </div>
            </div>

            <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
              {showRejectQuote && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => handleRejectQuote()}
                  disabled={isRejectingQuote}
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

              {showManageQuote && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(`/quotes/${quote.id}/manage`)}
                >
                  Manage Quote
                </Button>
              )}
            </div>
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
          </Container>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default QuoteDetails;
