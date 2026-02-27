module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const expectedCode = String(process.env.SITE_ACCESS_CODE || "").trim();
  if (!expectedCode) {
    res.status(500).json({ ok: false, error: "Access code is not configured" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_err) {
      body = {};
    }
  }

  const providedCode = body && body.code ? String(body.code).trim() : "";
  const ok =
    providedCode.length > 0 &&
    providedCode.toLowerCase() === expectedCode.toLowerCase();

  res.status(ok ? 200 : 401).json({ ok });
};
