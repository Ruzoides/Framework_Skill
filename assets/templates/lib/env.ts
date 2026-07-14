import { z } from "zod";

// Variables required at build time — every one of these must be set for
// `next build` to succeed. Feature setup scripts insert their own fields
// just above the marker comment below.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // framework-skill:build-time-vars
});

// Variables only needed at runtime (e.g. third-party secret keys). Validated
// lazily so `next build` doesn't fail in environments where these aren't
// configured yet — call getRuntimeEnv() at the point of use instead of
// importing process.env directly.
const runtimeEnvSchema = z.object({
  // framework-skill:runtime-vars
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables — see above for details.");
  }
  return parsed.data;
}

export const env = parseEnv();

let _runtimeEnv: z.infer<typeof runtimeEnvSchema> | undefined;

export function getRuntimeEnv() {
  if (!_runtimeEnv) {
    const parsed = runtimeEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        "Invalid runtime environment variables: " +
          JSON.stringify(parsed.error.flatten().fieldErrors)
      );
    }
    _runtimeEnv = parsed.data;
  }
  return _runtimeEnv;
}
