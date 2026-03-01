const XENDIT_API_URL = "https://api.xendit.co";

type CreateInvoiceParams = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
};

type XenditInvoiceResponse = {
  id: string;
  invoice_url: string;
};

export async function createXenditInvoice(
  params: CreateInvoiceParams
): Promise<XenditInvoiceResponse> {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY is not set");

  const credentials = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "MYR",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Xendit error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return { id: data.id, invoice_url: data.invoice_url };
}
