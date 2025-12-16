// Netlify Function: create-request
// Inserts a request into Supabase. Requires env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon with insert policy).

export default async function handler(event, context) {
    try {
        if (event.httpMethod !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return new Response("Supabase env vars missing", { status: 500 });
        }

        let payload;
        try {
            payload = JSON.parse(event.body || "{}");
        } catch (e) {
            return new Response("Invalid JSON", { status: 400 });
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
            return new Response(text, { status: resp.status });
        }

        const data = await resp.json();
        return new Response(JSON.stringify({ ok: true, data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response("Internal Server Error", { status: 500 });
    }
}