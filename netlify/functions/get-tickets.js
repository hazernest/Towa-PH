// Netlify Function: get-tickets
// Returns recent requests from Supabase (or mock data if env vars missing)

export default async function handler(event, context) {
    try {
        if (event.httpMethod !== 'GET') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        // If Supabase not configured, return safe mocked data for local dev
        if (!supabaseUrl || !supabaseKey) {
            const mock = [
                { id: 1, type: 'service', model: 'Molding | SN 12345', location: 'Laguna', notes: 'Motor noise', created_at: new Date().toISOString(), status: 'new' },
                { id: 2, type: 'parts', model: 'Blade Set', location: 'Cavite', notes: 'Need replacement', created_at: new Date().toISOString(), status: 'waiting_parts' },
            ];
            return new Response(JSON.stringify({ ok: true, data: mock }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Query Supabase REST
        const url = `${supabaseUrl}/rest/v1/requests?select=*&order=created_at.desc&limit=50`;
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                apiKey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
            },
        });

        if (!resp.ok) {
            const text = await resp.text();
            return new Response(JSON.stringify({ error: text }), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
        }

        const data = await resp.json();
        return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
