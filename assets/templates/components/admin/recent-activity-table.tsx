import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NumericText } from "@/components/numeric-text";

// Placeholder rows — replace with real invoices/clients data once the
// Prisma models for this are wired up (see references/architecture.md).
const PLACEHOLDER_ROWS = [
  { client: "Northwind Co.", amount: 1450, status: "Paid", date: "Jul 2" },
  { client: "Harbor & Finch", amount: 600, status: "Sent", date: "Jul 5" },
  { client: "Bramble Collective", amount: 2100, status: "Overdue", date: "Jun 28" },
  { client: "Studio Nine", amount: 320, status: "Paid", date: "Jul 9" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  Paid: "secondary",
  Sent: "default",
  Overdue: "destructive",
};

export function RecentActivityTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PLACEHOLDER_ROWS.map((row) => (
          <TableRow key={row.client + row.date}>
            <TableCell className="font-medium">{row.client}</TableCell>
            <TableCell>
              <NumericText>${row.amount.toLocaleString()}</NumericText>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">{row.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
