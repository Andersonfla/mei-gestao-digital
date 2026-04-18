// Stripe webhook handler for MEI Finanças
// Receives subscription events from Stripe and syncs plan state to profiles table.
//
// IMPORTANT:
// - verify_jwt = false (Stripe does not send a Supabase JWT)
// - Signature is validated using STRIPE_WEBHOOK_SECRET
// - Plan is decided ONLY by stripe_price_id (never by product name)
//
// Public URL (configure in Stripe Dashboard → Developers → Webhooks):
// https://ucnajqoapngtearuafkv.supabase.co/functions/v1/stripe-webhook

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_PRICE_ID_PREMIUM = Deno.env.get("STRIPE_PRICE_ID_PREMIUM");
const STRIPE_PRICE_ID_MASTER = Deno.env.get("STRIPE_PRICE_ID_MASTER");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const stripe = new Stripe(STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

type PlanKey = "free" | "premium" | "master";

function priceIdToPlan(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_ID_PREMIUM) return "premium";
  if (priceId === STRIPE_PRICE_ID_MASTER) return "master";
  return null;
}

async function logEvent(
  stripeEventId: string,
  eventType: string,
  payload: unknown,
  status: "success" | "error" | "ignored",
  errorMessage?: string,
) {
  try {
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      payload: payload as never,
      status,
      error_message: errorMessage ?? null,
    });
  } catch (err) {
    console.error("Failed to log webhook event:", err);
  }
}

async function alreadyProcessed(stripeEventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();
  if (error) {
    console.error("Idempotency check error:", error);
    return false;
  }
  return !!data;
}

async function findUserId(opts: {
  metadataUserId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  email?: string | null;
}): Promise<string | null> {
  if (opts.metadataUserId) return opts.metadataUserId;

  if (opts.subscriptionId) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", opts.subscriptionId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (opts.customerId) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", opts.customerId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (opts.email) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", opts.email)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

async function updateProfile(
  userId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) {
    console.error(`Failed to update profile ${userId}:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  // Pull subscription to know the price + status
  let priceId: string | null = null;
  let subscriptionStatus: string | null = null;
  let currentPeriodEnd: number | null = null;

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    priceId = sub.items.data[0]?.price?.id ?? null;
    subscriptionStatus = sub.status;
    currentPeriodEnd = sub.current_period_end ?? null;
  }

  const planFromMeta = (session.metadata?.plan as PlanKey | undefined) ?? null;
  const plan: PlanKey | null = priceIdToPlan(priceId) ?? planFromMeta ?? null;

  const userId = await findUserId({
    metadataUserId: session.metadata?.user_id ?? null,
    customerId,
    subscriptionId,
    email: session.customer_email ?? session.metadata?.user_email ?? null,
  });

  if (!userId) {
    console.warn("checkout.session.completed: user not found", {
      session_id: session.id,
      customerId,
      subscriptionId,
    });
    return { ignored: true, reason: "user_not_found" };
  }
  if (!plan) {
    console.warn("checkout.session.completed: plan not resolved", { priceId });
    return { ignored: true, reason: "plan_not_resolved" };
  }

  await updateProfile(userId, {
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    subscription_status: subscriptionStatus ?? "active",
    subscription_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    canceled_at: null,
  });

  return { ok: true, userId, plan };
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = priceIdToPlan(priceId);

  const userId = await findUserId({
    metadataUserId: (sub.metadata?.user_id as string | undefined) ?? null,
    customerId,
    subscriptionId: sub.id,
  });
  if (!userId) return { ignored: true, reason: "user_not_found" };

  const patch: Record<string, unknown> = {
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    subscription_status: sub.status,
    subscription_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    canceled_at: sub.canceled_at
      ? new Date(sub.canceled_at * 1000).toISOString()
      : null,
  };

  // Active plan only when subscription is in a paying state
  const payingStatuses = ["active", "trialing"];
  const terminalStatuses = ["canceled", "unpaid", "incomplete_expired"];
  if (plan && payingStatuses.includes(sub.status)) {
    patch.plan = plan;
  } else if (terminalStatuses.includes(sub.status)) {
    patch.plan = "free";
  }
  // past_due / incomplete / paused: mantém plan atual; usuário ainda pode regularizar

  await updateProfile(userId, patch);
  return { ok: true, userId, plan: patch.plan };
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const userId = await findUserId({
    metadataUserId: (sub.metadata?.user_id as string | undefined) ?? null,
    customerId,
    subscriptionId: sub.id,
  });
  if (!userId) return { ignored: true, reason: "user_not_found" };

  await updateProfile(userId, {
    plan: "free",
    subscription_status: "canceled",
    canceled_at: new Date().toISOString(),
    subscription_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : new Date().toISOString(),
  });

  return { ok: true, userId };
}

async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  if (!subscriptionId) return { ignored: true, reason: "no_subscription" };

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = priceIdToPlan(priceId);

  const userId = await findUserId({
    metadataUserId: (sub.metadata?.user_id as string | undefined) ?? null,
    customerId,
    subscriptionId,
  });
  if (!userId) return { ignored: true, reason: "user_not_found" };

  const patch: Record<string, unknown> = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    subscription_status: sub.status,
    subscription_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
  };
  if (plan && ["active", "trialing"].includes(sub.status)) {
    patch.plan = plan;
  }

  await updateProfile(userId, patch);
  return { ok: true, userId, plan: patch.plan };
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const userId = await findUserId({
    customerId,
    subscriptionId,
  });
  if (!userId) return { ignored: true, reason: "user_not_found" };

  await updateProfile(userId, {
    subscription_status: "past_due",
  });

  return { ok: true, userId };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe signature verification failed:", msg);
    return new Response(JSON.stringify({ error: `Webhook Error: ${msg}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency
  if (await alreadyProcessed(event.id)) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let result: unknown = { ignored: true, reason: "unhandled_event" };

    switch (event.type) {
      case "checkout.session.completed":
        result = await handleCheckoutCompleted(event);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        result = await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        result = await handleSubscriptionDeleted(event);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        result = await handleInvoicePaid(event);
        break;
      case "invoice.payment_failed":
        result = await handleInvoicePaymentFailed(event);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    const status =
      typeof result === "object" && result !== null && "ignored" in result
        ? "ignored"
        : "success";

    await logEvent(event.id, event.type, event.data.object, status);

    return new Response(JSON.stringify({ received: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error handling ${event.type}:`, message);
    await logEvent(event.id, event.type, event.data.object, "error", message);

    // Return 200 to avoid infinite retries when our DB-side processing
    // fails for non-recoverable reasons. Stripe will retry on 5xx.
    return new Response(
      JSON.stringify({ received: true, error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
