const { Resend } = require("resend");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, people, email, note, ride, sleep } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Chybí jméno nebo e-mail." });
    }

    const rideAns  = (String(ride || "NE").toUpperCase() === "ANO") ? "ANO" : "NE";
    const sleepAns = (String(sleep|| "NE").toUpperCase() === "ANO") ? "ANO" : "NE";

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = `RSVP: ${name}${people ? ` (${people})` : ""}`;
    const html = `
      <h2>Nové RSVP</h2>
      <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
      <p><strong>Počet osob:</strong> ${people ? escapeHtml(String(people)) : "—"}</p>
      <p><strong>E-mail hosta:</strong> ${escapeHtml(email)}</p>
      <p><strong>Stravovací omezení / alergie / vzkaz:</strong><br>${note ? nl2br(escapeHtml(note)) : "—"}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:10px 0">
      <p><strong>Chci odvoz:</strong> ${rideAns}</p>
      <p><strong>Chci přespat:</strong> ${sleepAns}</p>
      <p><em>Fotky prosíme posílejte přes WhatsApp (odkaz je přímo v RSVP bloku na webu).</em></p>
    `;

    await resend.emails.send({
      from: "Svatba <onboarding@resend.dev>",
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
};

// helpery
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function nl2br(str) {
  return String(str).replace(/\r?\n/g, "<br>");
}
