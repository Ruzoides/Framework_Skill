import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NumericText } from "@/components/numeric-text";

export function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <NumericText className="text-2xl font-semibold">{value}</NumericText>
        {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  );
}
