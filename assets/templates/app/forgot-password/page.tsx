"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    // Always show the same message, whether or not the email is registered.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24">
        <p>If an account exists for that email, a reset link is on its way.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md border px-3 py-2"
        />
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white">
          Send reset link
        </button>
      </form>
    </div>
  );
}
