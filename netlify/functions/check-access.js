export default async function handler(event) {
    try {
        if (event.httpMethod === "OPTIONS") {
            return new Response("", { status: 200, headers: corsHeaders() });
        }

        if (event.httpMethod !== "GET") {
            return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
        }

        const email = (event.queryStringParameters ? .email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
            return new Response("Valid email query parameter is required", { status: 400, headers: corsHeaders() });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return new Response("Supabase env vars missing", { status: 500, headers: corsHeaders() });
        }

        const table = process.env.SUPABASE_PORTAL_TABLE || "portal_users";
        const resp = await fetch(`${supabaseUrl}/rest/v1/${table}?email=eq.${encodeURIComponent(email)}&select=email,role,approved`, {
            headers: {
                "Content-Type": "application/json",
                apiKey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=representation",
            },
        });

        if (!resp.ok) {
            const text = await resp.text();
            return new Response(text, { status: resp.status, headers: corsHeaders() });
        }

        const [user] = await resp.json();
        return new Response(JSON.stringify({ ok: true, user: user || null }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
    } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500, headers: corsHeaders() });
    }
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}