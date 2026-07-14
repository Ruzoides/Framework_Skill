export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        This route is only reachable when signed in — middleware.ts redirects
        anonymous visitors to the sign-in page before this component ever
        renders.
      </p>
    </div>
  );
}
