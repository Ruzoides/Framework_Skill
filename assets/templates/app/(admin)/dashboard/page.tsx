import { StatCard } from "@/components/admin/stat-card";
import { RecentActivityTable } from "@/components/admin/recent-activity-table";

// Stat figures below are placeholders — wire these to real Prisma queries
// (invoice totals, active clients, logged hours) once those models exist.
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          An overview of your billable activity this month.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding invoices" value="$4,220" trend="3 unpaid" />
        <StatCard label="Revenue this month" value="$8,910" trend="+12% vs last month" />
        <StatCard label="Active clients" value="14" />
        <StatCard label="Hours logged this week" value="31.5" />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Recent activity</h2>
        <div className="mt-4 rounded-lg border border-border">
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}
