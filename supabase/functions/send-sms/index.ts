import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type SendSmsPayload = {
  user: { id: string; phone: string };
  sms: { otp: string };
};

const NETGSM_API_URL = Deno.env.get("NETGSM_API_URL") ?? "https://api.netgsm.com.tr/sms/rest/v2/send";
const NETGSM_USERCODE = Deno.env.get("NETGSM_USERCODE") ?? "";
const NETGSM_PASSWORD = Deno.env.get("NETGSM_PASSWORD") ?? "";
const NETGSM_MSGHEADER = Deno.env.get("NETGSM_MSGHEADER") ?? "";
const HOOK_SECRET = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace(/^v1,whsec_/, "");
const APP_NAME = Deno.env.get("SMS_APP_NAME") ?? "Yuk Bulma";

function hookError(status: number, message: string) {
  return new Response(JSON.stringify({ error: { http_code: status, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function toNetgsmNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^905\d{9}$/.test(digits)) return digits;
  if (/^05\d{9}$/.test(digits)) return `9${digits}`;
  if (/^5\d{9}$/.test(digits)) return `90${digits}`;
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return hookError(405, "Method not allowed");
  if (!HOOK_SECRET || !NETGSM_USERCODE || !NETGSM_PASSWORD || !NETGSM_MSGHEADER) {
    return hookError(500, "SMS hook is not configured");
  }

  const body = await req.text();
  let payload: SendSmsPayload;
  try {
    const wh = new Webhook(HOOK_SECRET);
    payload = wh.verify(body, Object.fromEntries(req.headers)) as SendSmsPayload;
  } catch {
    return hookError(401, "Invalid webhook signature");
  }

  const number = toNetgsmNumber(payload.user.phone);
  if (!number) return hookError(400, "Only Turkish mobile numbers are supported");

  const message = `${APP_NAME} dogrulama kodunuz: ${payload.sms.otp}. Bu kodu kimseyle paylasmayin.`;

  const res = await fetch(NETGSM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${NETGSM_USERCODE}:${NETGSM_PASSWORD}`)}`,
    },
    body: JSON.stringify({
      msgheader: NETGSM_MSGHEADER,
      encoding: "TR",
      iysfilter: "0",
      messages: [{ msg: message, no: number }],
    }),
  });

  const text = await res.text();
  let code: string | undefined;
  try {
    code = (JSON.parse(text) as { code?: string }).code;
  } catch {
    code = undefined;
  }

  if (!res.ok || code !== "00") {
    console.error("netgsm_error", res.status, text);
    return hookError(502, "SMS provider error");
  }

  return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
});
