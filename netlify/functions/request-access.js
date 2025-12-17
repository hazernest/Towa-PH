const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

export default async function handler(event) {
    try {
        if (event.httpMethod === "OPTIONS") {
            return new Response("", { status: 200, headers: corsHeaders() });
        }

        if (event.httpMethod !== "POST") {
            return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return new Response("Supabase env vars missing", { status: 500, headers: corsHeaders() });
        }

        let payload;
        try {
            payload = JSON.parse(event.body || "{}");
        } catch (e) {
            return new Response("Invalid JSON", { status: 400, headers: corsHeaders() });
        }

        const email = (payload.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
            return new Response("Valid email is required", { status: 400, headers: corsHeaders() });
        }

        const role = (payload.role || "customer").trim().toLowerCase();
        const message = (payload.message || "").trim();
        const table = process.env.SUPABASE_ACCESS_TABLE || "access_requests";
        const insert = {
            email,
            role,
            message,
            status: "pending",
            approved: false,
            created_at: new Date().toISOString(),
            source: "netlify",
        };

        const resp = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
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
            return new Response(text, { status: resp.status, headers: corsHeaders() });
        }

        const created = await resp.json();
        const notifyAddress = process.env.ACCESS_NOTIFY_EMAIL || "hazernestmilet@gmail.com";
        const fromAddress = process.env.ACCESS_NOTIFY_FROM || "no-reply@towa.ph";
        await sendNotification({
            to: notifyAddress,
            from: fromAddress,
            subject: `New access request from ${email}`,
            body: `Email: ${email}\nRole: ${role}\nMessage: ${message || "(no message)"}\nTimestamp: ${insert.created_at}`,
        });

        return new Response(JSON.stringify({ ok: true, request: created }), {
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

async function sendNotification({ to, from, subject, body }) {
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
        await fetch(SENDGRID_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sendgridKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: from },
                subject,
                content: [{ type: "text/plain", value: body }],
            }),
        });
        return;
    }

    const mailgunApiKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;
    if (mailgunApiKey && mailgunDomain) {
        const encoded = Buffer.from(`api:${mailgunApiKey}`).toString("base64");
        const form = new URLSearchParams();
        form.append("from", from);
        form.append("to", to);
        form.append("subject", subject);
        form.append("text", body);
        await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${encoded}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
        });
        return;
    }

    console.info("Notification skipped (no provider configured).", { to, subject });
}