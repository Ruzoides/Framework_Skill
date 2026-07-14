export default function LandingPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Ship your next idea faster
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        This landing page, the admin dashboard behind it, and everything
        wiring them together (auth, payments, email, security) was generated
        by the website-scaffold skill. Replace this copy with your own.
      </p>
      <a
        href="/dashboard"
        className="mt-8 inline-block rounded-md bg-black px-6 py-3 text-white"
      >
        Go to dashboard
      </a>
    </section>
  );
}
