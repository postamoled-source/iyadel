export default async function(req) {
  try {
    // open.er-api.com: free, no API key, ECB-sourced rates, ~170 currencies, daily updates.
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error("Rates service returned status " + res.status);
    const data = await res.json();
    if (!data || data.result !== "success" || !data.rates) {
      throw new Error("Invalid rates response from provider");
    }
    return Response.json({ rates: data.rates, updated: data.time_last_update_utc });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}