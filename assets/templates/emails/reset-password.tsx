export default function ResetPasswordEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480 }}>
      <h1>Reset your password</h1>
      <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
      <p>
        <a href={resetUrl}>{resetUrl}</a>
      </p>
      <p>If you didn&apos;t request this, you can safely ignore this email.</p>
    </div>
  );
}
