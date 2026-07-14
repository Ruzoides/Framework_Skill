import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Can I import clients I already have?",
    answer: "Yes — add clients manually or import them from a CSV export of your existing records.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "You can export all your time entries, invoices, and client data at any point, including after cancelling.",
  },
  {
    question: "Is there a limit on invoices?",
    answer: "The Solo plan includes 5 invoices a month; Team and Business plans include unlimited invoicing.",
  },
  {
    question: "How is my payment data handled?",
    answer: "Billing is processed by Stripe — Ledger never stores your card details directly.",
  },
  {
    question: "Can I add teammates later?",
    answer: "Yes, upgrade to the Team plan any time and invite teammates from Settings without losing your history.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="font-display text-3xl font-bold">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="mt-8">
        {FAQS.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
