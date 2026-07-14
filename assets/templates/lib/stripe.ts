import Stripe from "stripe";
import { getRuntimeEnv } from "@/lib/env";

let _stripe: Stripe | undefined;

export function getStripe() {
  if (!_stripe) {
    const { STRIPE_SECRET_KEY } = getRuntimeEnv();
    // No explicit apiVersion: the installed SDK's bundled default keeps this
    // scaffold from needing an update every time Stripe ships a new dated
    // API version.
    _stripe = new Stripe(STRIPE_SECRET_KEY);
  }
  return _stripe;
}
