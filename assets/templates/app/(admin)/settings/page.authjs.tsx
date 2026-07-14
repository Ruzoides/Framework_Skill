import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and billing.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 pt-4">
          {/*
            If payments are enabled, replace this with a real lookup —
            e.g. `db.subscription.findUnique({ where: { userId: session.user.id } })`
            — and point "Manage billing" at a Stripe customer-portal session
            (https://docs.stripe.com/customer-management) instead of leaving
            it disabled. See references/payments.md.
          */}
          <p className="text-sm text-muted-foreground">
            No billing configured yet — run the payments setup to enable subscriptions.
          </p>
          <Button variant="outline" disabled>
            Manage billing
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
