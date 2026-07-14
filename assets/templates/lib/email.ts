import { Resend } from "resend";
import { getRuntimeEnv } from "@/lib/env";
import WelcomeEmail from "@/emails/welcome";
import ResetPasswordEmail from "@/emails/reset-password";
import ReceiptEmail from "@/emails/receipt";

let _resend: Resend | undefined;

function getResend() {
  if (!_resend) {
    const { RESEND_API_KEY } = getRuntimeEnv();
    _resend = new Resend(RESEND_API_KEY);
  }
  return _resend;
}

// Resend's sandbox sender works before a domain is verified — swap in your
// own verified sending address once one exists (see references/email.md).
const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendWelcomeEmail(to: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Welcome!",
    react: WelcomeEmail(),
  });
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Reset your password",
    react: ResetPasswordEmail({ resetUrl }),
  });
}

export async function sendReceiptEmail(to: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Payment received",
    react: ReceiptEmail(),
  });
}
