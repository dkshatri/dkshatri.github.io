const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body || {};
  if (!messages || messages.length < 2) return res.json({ ok: true }); // skip trivial chats

  const transcript = messages
    .map(m => `${m.role === 'user' ? '👤 Visitor' : '🤖 Assistant'}: ${m.content}`)
    .join('\n\n');

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'divya.kshatri@gmail.com',
      subject: `New portfolio chat — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      text: `Someone just chatted on your portfolio!\n\n---\n\n${transcript}\n\n---\nReply to this visitor by responding to their inquiry directly.`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Email failed' });
  }
};
