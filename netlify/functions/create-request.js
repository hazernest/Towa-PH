// Netlify Function: create-request
// Inserts a request into Supabase. Requires env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon with insert policy).

export default async function handler(event, context) {
    try {
        if (event.httpMethod !== "POST") {
            return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { 'Content-Type': 'application/json' } });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: "Supabase env vars missing" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        if (!event.body) {
            return new Response(JSON.stringify({ error: 'Empty body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let payload;
        try {
            payload = JSON.parse(event.body);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const { type, model, location, notes } = payload;

        // Basic validation and sanitization
        const safeType = (typeof type === 'string' && type.length <= 64) ? type : 'service';
        const safeModel = (typeof model === 'string' && model.length <= 200) ? model.trim() : '';
        const safeLocation = (typeof location === 'string' && location.length <= 200) ? location.trim() : '';
        const safeNotes = (typeof notes === 'string' && notes.length <= 2000) ? notes.trim() : '';

        const insert = {
            type: safeType,
            model: safeModel,
            location: safeLocation,
            notes: safeNotes,
            created_at: new Date().toISOString(),
            source: 'netlify',
        };

        const resp = await fetch(`${supabaseUrl}/rest/v1/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apiKey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: 'return=representation',
            },
            body: JSON.stringify(insert),
        });

        if (!resp.ok) {
            const text = await resp.text();
            return new Response(JSON.stringify({ error: text }), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
        }

        const data = await resp.json();
        return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        // Prefer not to leak internals; log server-side in deployment environment
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}