import { useParams } from "react-router-dom";
import { useQuote } from "../../../../hooks/quotes";
import { Container, Heading, Toaster } from "@medusajs/ui"
import { ManageQuoteForm } from "../../../../components/manage-quote-form";

const QuoteManage = () => {
  const { id } = useParams();
  const { quote, isLoading } = useQuote(id!, {
    fields:
      "*draft_order.customer",
  });

  if (isLoading) {
    return <></>;
  }

  if (!quote) {
    throw "quote not found";
  }

  return (
    <>
      <Container className="divide-y p-0">
        <Heading className="flex items-center justify-between px-6 py-4">
          Manage Quote
        </Heading>

        <ManageQuoteForm order={quote.draft_order} />
      </Container>
      <Toaster />
    </>
  );
};

export default QuoteManage;
