// Secure backend for the "Expert Évaluateur d'Impact" agent.
// Runs as a Vercel Serverless Function at the route  /api/chat
//
// SECURITY: the Anthropic API key NEVER reaches the browser. It lives only
// in the server environment variable ANTHROPIC_API_KEY. The frontend posts
// the conversation here; this function adds the key and relays to Anthropic.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY is not set.' });
    return;
  }

  // Model is configurable via env var so you can swap it without redeploying code.
  const model = process.env.MODEL || 'claude-haiku-4-5';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) {
      res.status(400).json({ error: 'No messages provided.' });
      return;
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: model, max_tokens: 1500, messages: messages })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : 'Anthropic API error';
      res.status(anthropicRes.status).json({ error: msg });
      return;
    }

    const text = (data.content || []).map(b => (b && b.text) ? b.text : '').join('');
    res.status(200).json({ text: text });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
