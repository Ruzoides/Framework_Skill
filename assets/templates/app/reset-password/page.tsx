import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

// useSearchParams() (used in the form to read ?token=&email=) requires a
// Suspense boundary in the App Router, even when the page is otherwise
// simple — omitting this fails static prerendering at build time.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
