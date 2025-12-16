// Netlify Function: create-request
// Inserts a request into Supabase. Requires env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon with insert policy).

export default async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        return { statusCode: 500, body: "Supabase env vars missing" };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (e) {
        return { statusCode: 400, body: "Invalid JSON" };
    }

    const { type, model, location, notes } = payload;

    const insert = {
        type: type || "service",
        model: model || "",
        location: location || "",
        notes: notes || "",
        created_at: new Date().toISOString(),
        source: "netlify",
    };

    const resp = await fetch(`${supabaseUrl}/rest/v1/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apiKey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
        },
        body: JSON.stringify(insert),
    });

    if (!resp.ok) {
        const text = await resp.text();
        return { statusCode: resp.status, body: text };
    }

    const data = await resp.json();
    return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, data }),
        headers: { "Content-Type": "application/json" },
    };
}