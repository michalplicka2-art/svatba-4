import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, people, email, note } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Chybí jméno nebo e-mail." });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = `RSVP: ${name}${people ? ` (${people})` : ""}`;
    const html = `
      <h2>Nové RSVP</h2>
      <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
      <p><strong>Počet osob:</strong> ${people ? escapeHtml(String(people)) : "—"}</p>
      <p><strong>E-mail hosta:</strong> ${escapeHtml(email)}</p>
      <p><strong>Stravovací omezení / alergie / vzkaz:</strong><br>${note ? nl2br(escapeHtml(note)) : "—"}</p>
    `;

    await resend.emails.send({
      from: "Svatba <onboarding@resend.dev>",       // pro rychlý start
      to: "michal.plicka2@gmail.com",
      reply_to: email,
      subject,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("RSVP send error:", err);
    return res.status(500).json({ error: "Nepodařilo se odeslat e-mail." });
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function nl2br(str) {
  return String(str).replace(/\r?\n/g, "<br>");
}
